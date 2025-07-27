import { CrossWindow }        from '#runtime/util/browser';
import { StyleSheetResolve }  from '#runtime/util/dom/style';

/**
 * Provides runtime-parsed styles for the core Foundry stylesheet and an extended merged version with all game system
 * and module overrides. Both, {@link FoundryStyles.core} and {@link FoundryStyles.ext} return an instance of
 * {@link #runtime/util/dom/style!StyleSheetResolve} that has a reduced amount of parsed style information relevant to
 * configuring essential styling. `StyleSheetResolve` allows access to discrete CSS selectors and associated properties
 * including resolving CSS variables across selectors / elements.
 *
 * `FoundryStyles` is used internally by TRL to construct the flattened CSS variables generated at runtime to match
 * the platform theming. The core Foundry styles are not flat with many CSS variables having extended element scoping.
 *
 * The following CSS layers are parsed from Foundry core styles:
 * ```
 * - `variables.base`
 * - `variables.themes.*`
 * - `elements.*`
 * ```
 */
export class FoundryStyles
{
   /**
    * Parsed Foundry core stylesheet.
    *
    * @type {StyleSheetResolve}
    */
   static #core;

   /**
    * Parsed Foundry core stylesheet with extended game system / module overrides.
    *
    * @type {StyleSheetResolve}
    */
   static #ext;

   static #initialized = false;

   /**
    * @hideconstructor
    */
   constructor()
   {
      throw new Error('FoundryStyles constructor: This is a static class and should not be constructed.');
   }

   /**
    * @returns {StyleSheetResolve} Core parsed styles.
    */
   static get core()
   {
      if (!this.#initialized) { this.#initialize(); }

      return this.#core;
   }

   /**
    * @returns {StyleSheetResolve} Core parsed styles with extended game system / module overrides.
    */
   static get ext()
   {
      if (!this.#initialized) { this.#initialize(); }

      return this.#ext;
   }

   // Internal Implementation ----------------------------------------------------------------------------------------

   /**
    * Find the core Foundry CSSStyleSheet instance and any 3rd party game system / module stylesheets.
    *
    * Resolve the core sheet and then create the extended resolved style sheet merging the core with all system / module
    * sheets.
    */
   static #initialize()
   {
      this.#initialized = true;

      const styleSheets = Array.from(document.styleSheets);

      let foundryStyleSheet;

      const moduleSheets = [];
      const systemSheets = [];

      // Find the core Foundry stylesheet.
      for (const sheet of styleSheets)
      {
         if (typeof sheet?.href === 'string' && sheet.href.endsWith('/css/foundry2.css'))
         {
            foundryStyleSheet = sheet;
         }
         else
         {
            // Only capture `@import` referenced system / module style sheets.
            if (sheet?.cssRules?.length)
            {
               for (const rule of sheet.cssRules)
               {
                  if (!CrossWindow.isCSSImportRule(rule) || !CrossWindow.isCSSStyleSheet(rule?.styleSheet))
                  {
                     continue;
                  }

                  if (rule.layerName === 'modules') { moduleSheets.push(rule.styleSheet); }
                  if (rule.layerName === 'system') { systemSheets.push(rule.styleSheet); }
               }
            }
         }
      }

      // Quit now if the Foundry style sheet was not found.
      if (!foundryStyleSheet)
      {
         console.error(`[TyphonJS Runtime] error: FoundryStyles could not load core stylesheet.`);
         return;
      }

      // Resolve Foundry core stylesheet.
      this.#resolveCore(foundryStyleSheet);

      // Resolve and merge all 3rd party package stylesheets.
      this.#resolveExt(moduleSheets, systemSheets);

      // Prevent future modification.
      this.#core.freeze();
      this.#ext.freeze();
   }

   /**
    * @param {CSSStyleSheet}  sheet - Foundry core style sheet.
    */
   static #resolveCore(sheet)
   {
      this.#core = StyleSheetResolve.parse(sheet, {
         // Exclude any selector parts that match the following.
         excludeSelectorParts: [
            />\s*[^ ]+/,            // Direct child selectors
            /(^|\s)\*/,             // Universal selectors
            /(^|\s)\.app(?![\w-])/, // AppV1 class
            /^\.application\.theme/,
            /^body\.auth/,
            /^body(?:\.[\w-]+)*\.application\b/,  // Remove unnecessary `body.<theme>.application` pairing.
            /code-?mirror/i,
            /#camera-views/,
            /\.chat-message/,
            /\.combat-tracker/,
            /\.compendium-directory/,
            /(^|[^a-zA-Z0-9_-])#(?!context-menu\b)[\w-]+|[^ \t>+~]#context-menu\b/,
            /(^|\s)kbd\b/,
            /^input.placeholder-fa-solid\b/,
            /(^|\s)label\b/,
            /\.placeable-hud/,
            /prose-?mirror/i,
            /(^|\s)section\b/,
            /\.ui-control/,
            /\.window-app/
         ],

         // Only parse CSS layers matching the following regexes.
         includeCSSLayers: [
            /^variables\.base$/,
            /^variables\.themes/,
            /^elements/
         ]
      });
   }

   /**
    * @param {CSSStyleSheet[]}   moduleSheets - Module stylesheet data.
    *
    * @param {CSSStyleSheet[]}   systemSheets - System stylesheet data.
    */
   static #resolveExt(moduleSheets, systemSheets)
   {
      const resolvedSheets = [];

      // Only parse and include selector part names that are in the core Foundry styles.
      const options = { includeSelectorPartSet: new Set([...this.#core.keys()]) };

      for (const sheet of systemSheets) { resolvedSheets.push(StyleSheetResolve.parse(sheet, options)); }
      for (const sheet of moduleSheets) { resolvedSheets.push(StyleSheetResolve.parse(sheet, options)); }

      // Create a clone of core styles.
      this.#ext = this.#core.clone();

      // Merge all system / module styles into the extended resolved styles.
      for (const sheet of resolvedSheets) { this.#ext.merge(sheet); }
   }
}
