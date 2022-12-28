/**
 * A helper to create a set of radio checkbox input elements in a named set.
 * The provided keys are the possible radio values while the provided values are human readable labels.
 *
 * @param {string} name         The radio checkbox field name
 *
 * @param {object} choices      A mapping of radio checkbox values to human readable labels
 *
 * @param {object} options      Options which customize the radio boxes creation
 *
 * @param {string} options.checked    Which key is currently checked?
 *
 * @param {boolean} options.localize  Pass each label through string localization?
 *
 * @returns {string} HTML for radio boxes.
 *
 * @example <caption>The provided input data</caption>
 * let groupName = "importantChoice";
 * let choices = {a: "Choice A", b: "Choice B"};
 * let chosen = "a";
 *
 * @example <caption>The template HTML structure</caption>
 * <div class="form-group">
 *   <label>Radio Group Label</label>
 *   <div class="form-fields">
 *     {@html radioBoxes(groupName, choices, { checked: chosen, localize: true})}
 *   </div>
 * </div>
 */
export function radioBoxes(name, choices, options)
{
   const checked = options['checked'] || null;

   const localize = options['localize'] || false;

   let html = '';

   for (let [key, label] of Object.entries(choices)) // eslint-disable-line prefer-const
   {
      if (localize) { label = globalThis.game.i18n.localize(label); }
      const isChecked = checked === key;
      html += `<label class="checkbox"><input type="radio" name="${name}" value="${key}" ${isChecked ? "checked" : ""}> ${label}</label>`;
   }

   return new globalThis.Handlebars.SafeString(html);
}
