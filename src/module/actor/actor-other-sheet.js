import { PbtaActorSheet } from './actor-sheet.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PbtaActorOtherSheet extends PbtaActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["pbta", "sheet", "actor"],
      width: 840,
      height: 780,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }],
    });
  }

  static unsupportedItemTypes = new Set(["tag"]);

  /** @override */
  get template() {
    const path = "systems/pbta/templates/sheet";
    return `${path}/${this.actor.baseType}-sheet.html`;
  }

  /** @override */
  constructor(...args) {
    super(...args);

    if (this.actor.baseType == 'npc') {
      this.options.classes.push('npc');
      this.options.tabs[0].contentSelector = '.sheet-tabs-content';

      this.options.width = 720;
      this.options.height = 640;

      this.position.width = 720;
      this.position.height = 640;
    } else {
      this.options.classes.push('character');
    }
  }

}