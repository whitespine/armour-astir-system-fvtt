Hooks.once('pbtaSheetConfig', () => {
  // Disable the sheet config form.
  game.settings.set('pbta', 'sheetConfigOverride', true);
  // Define custom tags.
  game.pbta.tagConfigOverride = {
    // Tags available to any actor and item
    general: '[{"value":"fire"},{"value":"water"},{"value":"earth"},{"value":"air"}]',
    actor: {
      // Tags available to all actors
      all: '[{"value":"person"}]',
      // Tags available to a specific actor type set up on game.pbta.sheetConfig.actorTypes (e.g. "character", "npc")
      character: '[{"value":"mook"}]'
    },
    item: {
      // Tags available to all actors
      all: '[{"value":"consumable"}]',
      // Tags available to a specific item type (e.g. "equipment", "move")
      move: '[{"value":"sword"}]'
    }
  }
  // Replace the game.pbta.sheetConfig with your own version.
  game.pbta.sheetConfig = {
    "rollFormula": "2d6",
    "rollResults": {
      "failure": {
        "start": null,
        "end": 6,
        "label": "Complications..."
      },
      "partial": {
        "start": 7,
        "end": 9,
        "label": "Partial success"
      },
      "success": {
        "start": 10,
        "end": 12,
        "label": "Success!"
      }
    },
    "actorTypes": {
      "character": {
        "stats": {
          "defy": {
            "label": "Defy",
            "value": 0
          },
          "sense": {
            "label": "Sense",
            "value": 0
          },
          "clash": {
            "label": "Clash",
            "value": 0
          },
          "talk": {
            "label": "Talk",
            "value": 0
          },
          "know": {
            "label": "Know",
            "value": 0
          },
          "crew": {
            "label": "Crew",
            "value": 0
          },
          "channel": {
            "label": "Channel",
            "value": 0
          }
        },
        "attrTop": {
          "harm": {
            "label": "Harm",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Clock",
            "value": 0,
            "max": 6,
            "steps": [
              false,
              false,
              false,
              false,
              false,
              false
            ]
          },
          "armor": {
            "label": "Armor",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Number",
            "value": 0
          },
          "hold": {
            "label": "Hold",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Resource",
            "value": 0,
            "max": 0
          },
          "xp": {
            "label": "Xp",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Xp",
            "value": 0,
            "max": 5,
            "steps": [
              false,
              false,
              false,
              false,
              false
            ]
          }
        },
        "attrLeft": {
          "harmConditions": {
            "label": "Harm Conditions",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "ListMany",
            "condition": false,
            "options": {
              "0": {
                "label": "Stabilized",
                "value": false
              },
              "1": {
                "label": "Shattered (-1COOL)",
                "value": false
              },
              "2": {
                "label": "Crippled (-1HARD)",
                "value": false
              },
              "3": {
                "label": "Disfigured (-1HOT)",
                "value": false
              },
              "4": {
                "label": "Broken (-1SHARP)",
                "value": false
              }
            }
          },
          "improvement": {
            "label": "Improvement",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          },
          "hx": {
            "label": "HX",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          },
          "look": {
            "label": "Look",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          },
          "special": {
            "label": "Playbook Special",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          }
        },
        "moveTypes": {
          "basic": {
            "label": "Basic Moves",
            "moves": []
          },
          "playbook": {
            "label": "Playbook Moves",
            "moves": []
          }
        },
        "equipmentTypes": {
          "gear": {
            "label": "Gear",
            "moves": []
          },
          "barter": {
            "label": "Barter",
            "moves": []
          }
        }
      },
      "npc": {
        "attrTop": {
          "harm": {
            "label": "Harm",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Resource",
            "value": 0,
            "max": 0
          },
          "gender": {
            "label": "Gender",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Text",
            "value": ""
          },
          "age": {
            "label": "Age",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "Text",
            "value": ""
          }
        },
        "attrLeft": {
          "look": {
            "label": "Look",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          },
          "drive": {
            "label": "Drive",
            "description": null,
            "customLabel": false,
            "userLabel": false,
            "type": "LongText",
            "value": ""
          }
        },
        "moveTypes": {
          "mc": {
            "label": "MC Moves",
            "moves": []
          }
        }
      }
    }
  };
});