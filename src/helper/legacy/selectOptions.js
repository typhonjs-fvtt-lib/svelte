/**
 * Converts the `selectOptions` Handlebars helper to be Svelte compatible. This is useful when initially converting
 * over an app to Svelte and for essential usage to several dialogs that mirror the core Foundry experience. For
 * an example of usage see {@link TJSFolderPermissions}.
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
   const { localize = false, blank = null, sort = false, nameAttr, labelAttr, inverted } = options;
   let { selected = null } = options;

   selected = selected instanceof Array ? selected.map(String) : [String(selected)];

console.log(`!! selectOptions - 0 - choices: `, choices);
console.log(`!! selectOptions - 1 - options: `, options);

   // Prepare the choices as an array of objects
   const selectChoices = [];

   if (choices instanceof Array)
   {
      for (const choice of choices)
      {
         const name = String(choice[nameAttr]);
         let label = choice[labelAttr];
         if (localize) { label = game.i18n.localize(label); }
         selectChoices.push({ name, label });
      }
   }
   else
   {
      for (const choice of Object.entries(choices))
      {
         const [key, value] = inverted ? choice.reverse() : choice;
         const name = String(nameAttr ? value[nameAttr] : key);
         let label = labelAttr ? value[labelAttr] : value;
         if (localize) { label = game.i18n.localize(label); }
         selectChoices.push({ name, label });
      }
   }

   // Sort the array of options
   if (sort) { selectChoices.sort((a, b) => a.label.localeCompare(b.label)); }

   // Prepend a blank option
   if (blank !== null)
   {
      const label = localize ? game.i18n.localize(blank) : blank;
      selectChoices.unshift({ name: '', label });
   }

console.log(`!! selectOptions - 2 - selectChoices: `, selectChoices);

   // Create the HTML
   let html = '';
   for (const option of selectChoices)
   {
console.log(`!! selectOptions - 3 - option: `, option);
      const label = globalThis.Handlebars.escapeExpression(option.label);
      const isSelected = selected.includes(option.name);
      html += `<option value="${option.name}" ${isSelected ? "selected" : ""}>${label}</option>`;
   }

console.log(`!! selectOptions - 4 - html: `, html);

console.log(`!! selectOptions - 5 - globalThis.Handlebars.SafeString(html): `, globalThis.Handlebars.SafeString(html));

   return new globalThis.Handlebars.SafeString(html);

   // const localize = options['localize'] ?? false;
   // let selected = options['selected'] ?? null;
   // const blank = options['blank'] ?? null;
   // const nameAttr = options['nameAttr'];
   // const labelAttr = options['labelAttr'];
   // const inverted = !!options['inverted'];
   //
   // selected = selected instanceof Array ? selected.map(String) : [String(selected)];
   //
   // // Create an option
   // const option = (name, label) =>
   // {
   //    if (localize) { label = game.i18n.localize(label); }
   //    const isSelected = selected.includes(String(name));
   //
   //    html += `<option value="${name}" ${isSelected ? "selected" : ""}>${label}</option>`;
   // };
   //
   // // Create the options
   // let html = '';
   // if (blank !== null) { option('', blank); }
   //
   // // Options as an Array
   // if (choices instanceof Array)
   // {
   //    for (const choice of choices) { option(choice[nameAttr], choice[labelAttr]); }
   // }
   //
   // // Choices as an Object
   // else
   // {
   //    for (const choice of Object.entries(choices))
   //    {
   //       let [key, value] = inverted ? choice.reverse() : choice;
   //       if (nameAttr) { key = value[nameAttr]; }
   //       if (labelAttr) { value = value[labelAttr]; }
   //       option(key, value);
   //    }
   // }
   //
   // return html;
}
