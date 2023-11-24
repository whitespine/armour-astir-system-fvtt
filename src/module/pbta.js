/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { PbtaActorNpcSheet } from "./actor/actor-npc-sheet.js";
import { PbtaActorOtherSheet } from "./actor/actor-other-sheet.js";
import { PbtaActorSheet } from "./actor/actor-sheet.js";
import { ActorPbta } from "./actor/actor.js";
import { CombatSidebarPbta } from "./combat/combat.js";
import { PBTA, PbtaPlaybooks } from "./config.js";
import { PbtaRegisterHelpers } from "./handlebars.js";
import { PbtaItemSheet } from "./item/item-sheet.js";
import { ItemPbta } from "./item/item.js";
import { PbtaPlaybookItemSheet } from "./item/playbook-item-sheet.js";
import { MigratePbta } from "./migrate/migrate.js";
import { PbtaActorTemplates } from "./pbta/pbta-actors.js";
import { PbtaRolls } from "./rolls.js";
import { PbtaSettingsConfigDialog } from "./settings/settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { PbtaUtility } from "./utility.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  game.pbta = {
    ActorPbta,
    ItemPbta,
    rollItemMacro,
    PbtaUtility,
    PbtaActorTemplates,
    MigratePbta,
    PbtaSettingsConfigDialog,
    PbtaRolls
  };

  // TODO: Extend the combat class.
  // CONFIG.Combat.documentClass = CombatPbta;

  CONFIG.PBTA = PBTA;
  CONFIG.Actor.documentClass = ActorPbta;
  CONFIG.Item.documentClass = ItemPbta;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("pbta", PbtaActorSheet, {
    types: ['character'],
    makeDefault: true,
    label: "PBTA.SheetClassCharacter"
  });
  Actors.registerSheet("pbta", PbtaActorOtherSheet, {
    types: ['other'],
    makeDefault: true,
    label: "PBTA.SheetClassOther"
  });
  Actors.registerSheet("pbta", PbtaActorNpcSheet, {
    types: ['npc'],
    makeDefault: true,
    label: "PBTA.SheetClassNPC"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("pbta", PbtaItemSheet, { makeDefault: false });
  Items.registerSheet("pbta", PbtaPlaybookItemSheet, {
    types: ['playbook'],
    makeDefault: true,
    label: "PBTA.SheetClassItem"
  });

  PbtaRegisterHelpers.init();

  // Combat tracker.
  let combatPbta = new CombatSidebarPbta();
  combatPbta.startup();

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("pbta", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("pbta", "advForward", {
    name: game.i18n.localize("PBTA.Settings.advForward.name"),
    hint: game.i18n.localize("PBTA.Settings.advForward.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("pbta", "hideRollFormula", {
    name: game.i18n.localize("PBTA.Settings.hideRollFormula.name"),
    hint: game.i18n.localize("PBTA.Settings.hideRollFormula.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("pbta", "hideForward", {
    name: game.i18n.localize("PBTA.Settings.hideForward.name"),
    hint: game.i18n.localize("PBTA.Settings.hideForward.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("pbta", "hideOngoing", {
    name: game.i18n.localize("PBTA.Settings.hideOngoing.name"),
    hint: game.i18n.localize("PBTA.Settings.hideOngoing.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("pbta", "hideRollMode", {
    name: game.i18n.localize("PBTA.Settings.hideRollMode.name"),
    hint: game.i18n.localize("PBTA.Settings.hideRollMode.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("pbta", "hideUses", {
    name: game.i18n.localize("PBTA.Settings.hideUses.name"),
    hint: game.i18n.localize("PBTA.Settings.hideUses.hint"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.registerMenu("pbta", "sheetConfigMenu", {
    name: game.i18n.localize("PBTA.Settings.sheetConfig.name"),
    label: game.i18n.localize("PBTA.Settings.sheetConfig.label"),
    hint: game.i18n.localize("PBTA.Settings.sheetConfig.hint"),
    icon: "fas fa-file-alt",               // A Font Awesome icon used in the submenu button
    type: PbtaSettingsConfigDialog,   // A FormApplication subclass which should be created
    restricted: true,                   // Restrict this submenu to gamemaster only?
    scope: 'world'
  });

  game.settings.register("pbta", "sheetConfig", {
    name: "PBTA Sheet Config",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  game.settings.register("pbta", "sheetConfigOverride", {
    name: "Override PBTA Sheet Config",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  // Build out character data structures.
  const pbtaSettings = game.settings.get('pbta', 'sheetConfig');

  // Retrieve overridden config, if enabled.
  if (pbtaSettings?.overridden && game.settings.get('pbta', 'sheetConfigOverride')) {
    game.pbta.sheetConfig = pbtaSettings.overridden;
  }
  // Otherwise, retrieve computed config.
  else if (pbtaSettings?.computed) {
    game.pbta.sheetConfig = PbtaUtility.convertSheetConfig(pbtaSettings.computed);
  }
  // Fallback to empty config.
  else {
    game.pbta.sheetConfig = pbtaSettings;
  }

  // Preload template partials.
  preloadHandlebarsTemplates();
});

Hooks.once("ready", async function() {
  // Override sheet config.
  if (game.user.isGM) {
    // Store default actor types for later.
    game.pbta.defaultModel = game.system.model;

    // Force sheet config override off, unless a module changes it.
    await game.settings.set('pbta', 'sheetConfigOverride', false);

    // Allow modules to override the sheet config.
    Hooks.callAll('pbtaSheetConfig');

    // @todo find something better than this timeout hack.
    const timeout = 1000;
    setTimeout(() => {
      // Retrieve the previous configuration.
      let existingConfig = game.settings.get('pbta', 'sheetConfig') ?? {};
      // @todo hack to fix the old the default value. Remove in a future update.
      if (typeof existingConfig !== 'object') existingConfig = {};
      // If a module enabled the override, assign it to the config so that player
      // clients can use it without the GM being logged in.
      if (game.settings.get('pbta', 'sheetConfigOverride')) {
        existingConfig.overridden = game.pbta.sheetConfig;
        game.settings.set('pbta', 'sheetConfig', existingConfig);
      }
      // Otherwise, delete the override config.
      else if (existingConfig?.overridden) {
        ui.notifications.warn('Removed PbtA module sheet overrides.');
        // If not tomlString exists, delete the config outright to prevent
        // it from being malformed.
        if (!existingConfig?.tomlString) {
          existingConfig = null;
        }
        // Otherwise, restore the previous config.
        else {
          // Delete overrides.
          delete existingConfig.overridden;
          delete existingConfig.computed;
          // Restore computed config and reapply.
          existingConfig.computed = PbtaUtility.parseTomlString(existingConfig.tomlString);
          game.pbta.sheetConfig = PbtaUtility.convertSheetConfig(existingConfig.computed);
          PbtaUtility.applyActorTemplates(true);
          ui.notifications.info('Restored previous PbtA sheet settings.');
        }
        game.settings.set('pbta', 'sheetConfig', existingConfig);
      }
    }, timeout);
  }

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createPbtaMacro(data, slot));

  PBTA.playbooks = await PbtaPlaybooks.getPlaybooks();
  CONFIG.PBTA = PBTA;

  // Apply structure to actor types.
  PbtaUtility.applyActorTemplates();

  // Add a lang class to the body.
  const lang = game.settings.get('core', 'language');
  $('html').addClass(`lang-${lang}`);

  // Run migrations.
  if ( !game.user.isGM ) return;
  const cv = game.settings.get("pbta", "systemMigrationVersion");
  const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
  if ( !cv && totalDocuments === 0 ) return game.settings.set("pbta", "systemMigrationVersion", game.system.version);

  // Perform the migration
  await MigratePbta.runMigration();
});

Hooks.on('renderChatMessage', (data, html, options) => {
  // Determine visibility.
  // @todo v10
  let chatData = data;
  const whisper = chatData.whisper || [];
  const isBlind = whisper.length && chatData.blind;
  const isVisible = (whisper.length) ? game.user.isGM || whisper.includes(game.user.id) || (!isBlind) : true;
  if (!isVisible) {
    html.find('.dice-formula').text('???');
    html.find('.dice-total').text('?');
    html.find('.dice-tooltip').remove();
  }
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * This function runs after game data has been requested and loaded from the servers, so documents exist
 */
Hooks.once("setup", function() {
  // Localize CONFIG objects once up-front
  const toLocalize = [];
  for (let o of toLocalize) {
    CONFIG.PBTA[o] = Object.entries(CONFIG.PBTA[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

/* -------------------------------------------- */
/*  Help Button                                 */
/* -------------------------------------------- */

Hooks.on("renderSettings", (app, html) => {
  let settingsButton = $(`<button id="pbta-settings-btn" data-action="pbta-settings"><i class="fas fa-file-alt"></i> ${game.i18n.localize("PBTA.Settings.sheetConfig.label")}</button>`);
  html.find('button[data-action="configure"]').before(settingsButton);

  let helpButton = $(`<button id="pbta-help-btn" data-action="pbta-help"><i class="fas fa-question-circle"></i> ${game.i18n.localize("PBTA.Settings.button.help")}</button>`);
  html.find('button[data-action="controls"]').after(helpButton);

  settingsButton.on('click', ev => {
    ev.preventDefault();
    let menu = game.settings.menus.get('pbta.sheetConfigMenu');
    let app = new menu.type();
    app.render(true);
  });

  helpButton.on('click', ev => {
    ev.preventDefault();
    window.open('https://asacolips.gitbook.io/pbta-system/', 'pbtaHelp', 'width=1032,height=720');
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createPbtaMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command
  // @todo refactor this to use uuids and folders.
  const command = `game.pbta.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: {
        "pbta.itemMacro": true,
        "pbta.itemUuid": data.uuid
      }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemData
 * @return {Promise}
 */
function rollItemMacro(itemData) {
  // Reconstruct the drop data so that we can load the item.
  // @todo this section isn't currently used, the name section below is used.
  if (itemData.includes('Actor.') || itemData.includes('Token.')) {
    const dropData = {
      type: 'Item',
      uuid: itemData
    };
    Item.fromDropData(dropData).then(item => {
      // Determine if the item loaded and if it's an owned item.
      if (!item || !item.parent) {
        const itemName = item?.name ?? itemData;
        return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
      }

      // Trigger the item roll
      item.roll();
    });
  }
  else {
    const speaker = ChatMessage.getSpeaker();
    const itemName = itemData;
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find(i => i.name === itemData) : null;
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemData}`);

    // Trigger the item roll
    return item.roll();
  }
}