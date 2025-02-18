export const PBTA = {};

PBTA.attrTypes = [
	"Number",
	"Clock",
	"Xp",
	"Resource",
	"Text",
	"LongText",
	"Checkbox",
	"ListMany",
	"ListOne",
	"Roll",
	"Track"
];

PBTA.sheetConfigs = [
	"maxMod",
	"minMod",
	"rollFormula",
	"rollResults",
	"rollShifting",
	"skipAttributeGrant",
	"statClock",
	"statShifting",
	"statToken"
];

PBTA.playbooks = [];

PBTA.rollModes = {
	def: "PBTA.Normal",
	conf: "PBTA.Confidence",
	desp: "PBTA.Desperation"
};

// Define custom tags.
PBTA.tagConfig = {
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
PBTA.sheetConfig = {
  "rollFormula": "2d6",
  "statClock": true,
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
        "channel": {
          "label": "Channel",
          "value": 0
        },
        "crew": {
          "label": "Crew",
          "value": 0
        },
        "special": {
          "label": "Spec",
          "value": 0
        }
      },
      "attributes": {
        "spotlight": {
          "label": "Spotlight",
          "description": "Spend to advance, or to dodge consequences",
          "position": "left",
          "customLabel": false,
          "userLabel": false,
          "type": "Xp",
          "value": 0,
          "max": 6,
          "steps": [
            false,
            false,
            false,
            false,
            false
          ]
        },
        "harmConditions": {
          "label": "Danger",
          "position": "left",
          "description": "Checkmark for peril. At three, you are defenceless",
          "customLabel": false,
          "userLabel": false,
          "type": "ListMany",
          "condition": false,
          "options": {
            "0": {
              "label": "[Text]",
              "value": false
            },
            "1": {
              "label": "[Text]",
              "value": false
            },
            "2": {
              "label": "[Text]",
              "value": false
            },
            "3": {
              "label": "Overheating",
              "value": false
            }
          }
        },
        "gravity1": {
          "position": "left",
          "customLabel": true,
          "userLabel": "Gravity 1",
          "type": "Clock",
          "max": 6,
          "value": 0
        },
        "gravity2": {
          "position": "left",
          "customLabel": true,
          "userLabel": "Gravity 2",
          "type": "Clock",
          "max": 6,
          "value": 0
        },
        "gravity3": {
          "position": "left",
          "customLabel": true,
          "userLabel": "Gravity 3",
          "type": "Clock",
          "max": 6,
          "value": 0
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