export default class RollPbtA extends Roll {
	static CHAT_TEMPLATE = "systems/armour-astir/templates/chat/chat-move.html";

	static EVALUATION_TEMPLATE = "systems/armour-astir/templates/chat/roll-dialog.html";

	getAdvDis() {
		const { advDisadv } = this.options;
		return advDisadv || 0;
	}

	/** @override */
	async render({ flavor, template=this.constructor.CHAT_TEMPLATE, isPrivate=false }={}) {
		if (!this._evaluated) await this.evaluate();

		const resultRanges = game.pbta.sheetConfig.rollResults;
		let resultType = null;
		if (!this.options.descriptionOnly) {
			// Iterate through each result range until we find a match.
			for (let [resultKey, resultRange] of Object.entries(resultRanges)) {
				let { start, end } = resultRange;
				if ((!start || this.total >= start) && (!end || this.total <= end)) {
					resultType = resultKey;
					break;
				}
			}
		}

		const resultDetails = this.options?.moveResults?.[resultType]?.value;

		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : flavor ?? this.options.flavor,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,

			conditionsConsumed: this.options.conditionsConsumed,
			conditions: this.options.conditions,
			choices: await TextEditor.enrichHTML(this.options.choices),
			details: await TextEditor.enrichHTML(this.options.details),
			originalMod: this.options.originalMod,
			result: resultType,
			resultDetails: await TextEditor.enrichHTML(resultDetails),
			resultLabel: resultRanges[resultType]?.label ?? resultType,
			resultRanges,
			stat: this.options.stat,
			title: this.options.title
		};
		return renderTemplate(template, chatData);
	}

	/**
	 * Apply optional modifiers which customize the behavior of the d20term
	 * @private
	 */
	configureModifiers() {
		const r = this.terms[0];

		// Handle Advantage or Disadvantage
		let advDisadv = this.getAdvDis();
		if (advDisadv > 0) {
			r.modifiers.push(`kh2`);
			r.number += advDisadv;
			r.options.advantage = true;
			this.options.conditions.push(game.i18n.localize("PBTA.Advantage") + `: ${advDisadv}`);
		} else if (advDisadv < 0) {
			r.modifiers.push(`kl2`);
			r.number += -advDisadv;
			r.options.disadvantage = true;
			this.options.conditions.push(game.i18n.localize("PBTA.Disadvantage") + `: ${-advDisadv}`);
		}

		if (this.options.rollMode == "conf") {
			this.options.conditions.push(game.i18n.localize("PBTA.Confidence"));
		} else if(this.options.rollMode == "desp") {
			this.options.conditions.push(game.i18n.localize("PBTA.Desperation"));
		}

		// Re-compile the underlying formula
		this._formula = this.constructor.getFormula(this.terms);

		let { minMod, maxMod } = game.pbta.sheetConfig;
		if (minMod || maxMod) {
			minMod ??= -Infinity;
			maxMod ??= Infinity;
			let [baseFormula, modifierString = "0"] = this.formula.split(/([+-].*)/s);
			// This should be a string of integers joined with + and -. This should be safe to eval.
			let originalMod = Roll.safeEval(modifierString);
			if (originalMod < minMod || originalMod > maxMod) {
				let totalMod = Math.clamp(originalMod, minMod, maxMod);
				const newFormula = `${baseFormula}+${totalMod}`.replace(/\+\s*-/g, "-");
				const newTerms = new Roll(newFormula).terms;
				this.terms = newTerms;
				this.options.originalMod = originalMod;
				this._formula = this.constructor.getFormula(this.terms);
			}
		}

		// Mark configuration as complete
		this.options.configured = true;
	}

	/**
	 * Create a Dialog prompt used to configure evaluation of an existing Roll instance.
	 * @param {object} data                     Dialog configuration data
	 * @param {string} [data.template]            A custom path to an HTML template to use instead of the default
	 * @param {string} [data.title]               The title of the shown dialog window
	 * @param {object} options                  Additional Dialog customization options
	 * @returns {Promise<Roll|null>}         A resulting Roll object constructed with the dialog, or null if the
	 *                                          dialog was closed
	 */
	async configureDialog({ template, templateData = {}, title } = {}, options = {}) {
		const { conditionGroups, resources, rollType, stats } = this.data;
		this.options.title = title;
		this.options.conditions = [];
		this.options.conditionsConsumed = [];
		const hasSituationalMods = resources
			? resources.forward.value !== 0
				|| resources.ongoing.value !== 0
				|| resources.hold.value > 0
			: false;

			/*
		const needsDialog =
			["ask", "prompt"].includes(rollType)
			|| hasSituationalMods
			|| conditionGroups.length > 0
			|| (templateData.isStatToken && templateData.numOfToken);
			*/
		const needsDialog = true;

		if (needsDialog) {
			templateData = foundry.utils.mergeObject(templateData, {
				conditionGroups,
				hasPrompt: rollType === "prompt",
				hasSituationalMods,
				resources,
				advDisadv: 0,
				rollMode: "def",
				config: CONFIG.PBTA 
			});

			// Render and apply listeners to our content
			let content = await renderTemplate(template ?? this.constructor.EVALUATION_TEMPLATE, templateData);
			console.log(content);

			return new Promise((resolve) => {
				title = title ? game.i18n.format("PBTA.RollLabel", { label: title }) : game.i18n.localize("PBTA.RollMove");
				let buttons = {
					submit: {
						label: game.i18n.localize("PBTA.Roll"),
						callback: (html) => {
							resolve(this._onDialogSubmit(html));
						}
					}
				};
				if (rollType === "ask") {
					title = game.i18n.format("PBTA.AskTitle", { name: templateData.title });
					buttons = Object.entries(stats)
						.filter((stat) => {
							return !["ask", "prompt", "formula"].includes(stat[0])
								&& !(game.pbta.sheetConfig.statToken && stat[0] === "token");
						})
						.map((stat) => {
							return {
								label: stat[1].label,
								callback: (html) => {
									resolve(this._onDialogSubmit(html, stat[0]));
								}
							};
						});
				} else if (rollType === "prompt") {
					title = game.i18n.format("PBTA.PromptTitle", { name: templateData.title });
				}

				new Dialog(
					{
						title,
						content,
						default: "submit",
						buttons
					},
					options
				).render(true);
			});
		}
		this.configureModifiers();
		return true;
	}

	/**
	 * Handle submission of the Roll evaluation configuration Dialog
	 * @param {jQuery} html            The submitted dialog content
	 * @param {number} stat   The chosen advantage mode
	 * @returns {Roll}              This damage roll.
	 * @private
	 */
	_onDialogSubmit(html, stat) {
		const form = html[0].querySelector("form");

		const addToFormula = (val) => {
			const statBonus = new Roll(val, this.data);
			if (!(statBonus.terms[0] instanceof foundry.dice.terms.OperatorTerm)) {
				this.terms.push(new foundry.dice.terms.OperatorTerm({ operator: "+" }));
			}
			this.terms = this.terms.concat(statBonus.terms);
		};

		// Append a situational bonus term
		if (stat) {
			const { label, value } = this.data.stats[stat];
			this.options.stat = { key: stat, label, value };
			addToFormula(`@stats.${stat}.value`);
		}

		// Customize the modifier
		if (form?.advDisadv?.value) {
			this.options.advDisadv = Number.parseInt(form.advDisadv.value || 0);
		}
		if (form?.rollMode?.value) {
			this.options.rollMode = form.rollMode.value;
		}
		if (form?.prompt?.value) {
			addToFormula(`${form.prompt.value}`);
		}

		// Apply advantage or disadvantage
		this.configureModifiers();
		return this;
	}

	// Override for confidence
	async evaluate(options={}) {
		let result = await super.evaluate(options);

		// Fixup confidence / desperation
		if(this.options.rollMode == "conf") {
			// First fix terms
			for(let result of this.terms[0].results) {
				if (result.result == 1) {
					result.rerolled = true; // close enough
					this.terms[0].results.push({
						result: 6,
					});
				}
			}
		} else if(this.options.rollMode == "desp") {
			// First fix terms
			for(let result of this.terms[0].results) {
				if (result.result == 6) {
					result.rerolled = true;
					this.terms[0].results.push({
						result: 1,
					});
				}
			}
		}

		// Then re-compute active/inactive
		if(this.terms[0]?.results && this.getAdvDis()) {
			let firstResults = [...this.terms[0].results];
			firstResults.forEach(result => {
				result.active = false
				result.discarded = true;
			}); // Set all inactive
			firstResults = firstResults.filter(r => !r.rerolled);
			if(this.getAdvDis() > 0) {
				firstResults.sort((a, b) => b.result - a.result);
			} else if(this.getAdvDis() < 0) {
				firstResults.sort((a, b) => a.result - b.result);
			}
			[firstResults[0], firstResults[1]].forEach(r => {
				r.active = true;
				delete r["discarded"];
			});
			this.terms[0]._total = firstResults[0].result + firstResults[1].result;
		}

		// Fix total
		this._total = Roll.safeEval(this.result);

		return result;
	}
}

// Hackjob
Hooks.on("renderDialog", (_dialog, html, data) => {
	$(html).find(".resource-control").on("click", (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		let input = $(evt.target).siblings("input")[0];
		let value = Number.parseInt(input.value || "0") || 0;
		let action = evt.target.dataset.action;
		if(action == "decrease") {
			input.value = Math.max(-2, value - 1);
		} else if(action == "increase") {
			input.value = Math.min(2, value + 1);
		}
	});
});