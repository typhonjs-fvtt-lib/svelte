/**
 * Converts the `selectOptions` Handlebars helper to be Svelte compatible. This is useful when initially converting
 * over an app to Svelte and for essential usage to several dialogs that mirror the core Foundry experience. For
 * an example of usage see {@link TJSPermissionControl}.
 *
 * A helper to create a set of <option> elements in a <select> block based on a provided dictionary.
 * The provided keys are the option values while the provided values are human-readable labels.
 * This helper supports both single-select as well as multi-select input fields.
 *
 * @param {object} choices                     A mapping of radio checkbox values to human readable labels
 *
 * @param {object} options                     Helper options
 *
 * @param {string|string[]} [options.selected] Which key or array of keys that are currently selected?
 *
 * @param {boolean} [options.localize=false]   Pass each label through string localization?
 *
 * @param {string} [options.blank]             Add a blank option as the first option with this label
 *
 * @param {string} [options.nameAttr]          Look up a property in the choice object values to use as the option value
 *
 * @param {string} [options.labelAttr]         Look up a property in the choice object values to use as the option label
 *
 * @param {boolean} [options.inverted=false]   Use the choice object value as the option value, and the key as the label
 *                                             instead of vice-versa
 *
 * @returns {string} The <options> HTML element(s).
 *
 * @example <caption>The provided input data</caption>
 * let choices = {a: 'Choice A', b: 'Choice B'};
 * let value = 'a';
 *
 * @example <caption>The template HTML structure</caption>
 * <select name="importantChoice">
 *   {@html selectOptions(choices { selected: value, localize: true })}
 * </select>
 *
 * @example <caption>The resulting HTML</caption>
 * <select name="importantChoice">
 *   <option value="a" selected>Choice A</option>
 *   <option value="b">Choice B</option>
 * </select>
 *
 * @example <caption>Using inverted</caption>
 * let choices = {'Choice A': 'a', 'Choice B': 'b'};
 * let value = 'a';
 *
 * @example <caption>The template HTML structure</caption>
 * <select name="importantChoice">
 *   {@html selectOptions(choices, { selected: value, inverted: true })}
 * </select>
 *
 * @example <caption>Using nameAttr and labelAttr with objects</caption>
 * let choices = {foo: {key: 'a', label: 'Choice A'}, bar: {key: 'b', label: 'Choice B'}};
 * let value = 'b';
 *
 * @example <caption>The template HTML structure</caption>
 * <select name="importantChoice">
 *   {@html selectOptions(choices, { selected: value, nameAttr: 'key', labelAttr: 'label' })}
 * </select>
 *
 * @example <caption>Using nameAttr and labelAttr with arrays</caption>
 * let choices = [{key: 'a', label: 'Choice A'}, {key: 'b', label: 'Choice B'}];
 * let value = 'b';
 *
 * @example <caption>The template HTML structure</caption>
 * <select name="importantChoice">
 *   {@html selectOptions(choices, { selected: value, nameAttr: 'key', labelAttr: 'label' })}
 * </select>
 */
export function selectOptions(choices, options)
{
   const localize = options['localize'] ?? false;
   let selected = options['selected'] ?? null;
   const blank = options['blank'] ?? null;
   const nameAttr = options['nameAttr'];
   const labelAttr = options['labelAttr'];
   const inverted = !!options['inverted'];

   selected = selected instanceof Array ? selected.map(String) : [String(selected)];

   // Create an option
   const option = (name, label) =>
   {
      if (localize) { label = game.i18n.localize(label); }
      const isSelected = selected.includes(String(name));

      html += `<option value="${name}" ${isSelected ? "selected" : ""}>${label}</option>`;
   };

   // Create the options
   let html = '';
   if (blank !== null) { option('', blank); }

   // Options as an Array
   if (choices instanceof Array)
   {
      for (const choice of choices) { option(choice[nameAttr], choice[labelAttr]); }
   }

   // Choices as an Object
   else
   {
      for (const choice of Object.entries(choices))
      {
         let [key, value] = inverted ? choice.reverse() : choice;
         if (nameAttr) { key = value[nameAttr]; }
         if (labelAttr) { value = value[labelAttr]; }
         option(key, value);
      }
   }

   return html;
}
