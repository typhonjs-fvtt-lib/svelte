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
 * - `applications`
 * - `blocks.ui`
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
    * Dummy / no-op instance when parsing or CORS / SecurityException occurs.
    *
    * @type {StyleSheetResolve}
    */
   static #dummy = new StyleSheetResolve().freeze();

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

      return this.#core ?? this.#dummy;
   }

   /**
    * @returns {StyleSheetResolve} Core parsed styles with extended game system / module overrides.
    */
   static get ext()
   {
      if (!this.#initialized) { this.#initialize(); }

      return this.#ext ?? this.#dummy;
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

      /** @type {{ href: string, core: boolean, layer?: string }[]} */
      const failedSheets = [];

      // Find the core Foundry stylesheet.
      for (let i = 0; i < styleSheets.length; i++)
      {
         const sheet = styleSheets[i];

         // Detect link stylesheets for the main Foundry stylesheet that have an `HREF`.
         if (typeof sheet?.href === 'string')
         {
            try
            {
               // `sheet?.cssRules?.length` tests for a CORS / SecurityException.
               if (sheet.href.endsWith('/css/foundry2.css') && sheet?.cssRules?.length)
               {
                  foundryStyleSheet = sheet;
               }
            }
            catch (err)
            {
               if (CrossWindow.isDOMException(err, 'SecurityException'))
               {
                  failedSheets.push({ href: sheet.href, core: true });
               }
            }
         }
         else // Process inline style elements without links.
         {
            try
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

                     try
                     {
                        switch (rule?.layerName)
                        {
                           case 'modules':
                              if (rule.styleSheet?.cssRules?.length) { moduleSheets.push(rule.styleSheet); }
                              break;
                           case 'system':
                              if (rule.styleSheet?.cssRules?.length) { systemSheets.push(rule.styleSheet); }
                              break;
                        }
                     }
                     catch (err)
                     {
                        if (CrossWindow.isDOMException(err, 'SecurityException'))
                        {
                           failedSheets.push({ href: rule.styleSheet.href, core: false, layer: rule.layerName });
                        }
                     }
                  }
               }
            }
            catch (err)
            {
               if (CrossWindow.isDOMException(err, 'SecurityException'))
               {
                  failedSheets.push({ href: '', core: false, layer: 'inline-stylesheet' });
               }
            }
         }
      }

      if (failedSheets.length)
      {
         console.warn(`[TyphonJS Runtime] CORS / SecurityException error: FoundryStyles could not load style sheets: ${
          JSON.stringify(failedSheets, null, 2)}`);
      }

      // Quit now if the Foundry style sheet was not found.
      if (!foundryStyleSheet)
      {
         console.warn(`[TyphonJS Runtime] error: FoundryStyles could not load core style sheet.`);
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
            /^\.application\.[a-z]/, // All `.application.theme` / any specific core application.
            /^body\.auth/,
            /^body(?:\.[\w-]+)*\.application\b/,  // Remove unnecessary `body.<theme>.application` pairing.
            /^\.\u037c\d/i, // Code-mirror `.ͼ1`
            /code-?mirror/i,
            /(^|[^a-zA-Z0-9_-])#(?!context-menu\b)[\w-]+|[^ \t>+~]#context-menu\b/,
            /^\.faded-ui/,
            /(^|\s)kbd\b/,
            /^input.placeholder-fa-solid\b/,
            /(^|\s)label\b/,
            /^\.mixin-theme/,       // Remove all mixin related styles left in by core.
            /prose-?mirror/i,
            /(^|\s)section\b/,
            /\.window-app/,

            // Exclude various core applications.
            /^\.active-effect-config/,
            /^\.adventure-importer/,
            /^\.camera-view/,
            /#camera-views/,
            /^\.card-config/,
            /^\.cards-config/,
            /^\.category-browser/,
            /^\.chat-message/,
            /^\.chat-sidebar/,
            /\.combat-sidebar/,
            /\.compendium-directory/,
            /\.compendium-sidebar/,
            /^\.document-ownership/,
            /^\.effects-tooltip/,
            /^\.journal-category-config/,
            /\.journal-entry-page/,
            /^\.macro-config/,
            /^\.package-list/,
            /^\.playlists-sidebar/,
            /\.placeable-hud/,
            /^\.region-config/,
            /^\.roll-table-sheet/,
            /^\.scene-config/,
            /^\.scenes-sidebar/,
            /\.settings-sidebar/,
            /^\.sheet.journal-entry/,
            /^\.template-config/,
            /^\.token-config/,
            /^\.tour/,
            /\.ui-control/,
            /^\.wall-config/,
         ],

         // Only parse CSS layers matching the following regexes.
         includeCSSLayers: [
            /^applications$/,
            /^blocks.ui$/,
            /^elements/,
            /^variables\.base$/,
            /^variables\.themes/
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

      // Enable relative URL resolution / only include selector part names that are in the core Foundry styles.
      const options = { includeSelectorPartSet: new Set([...this.#core.keys()]) };

      for (const sheet of systemSheets) { resolvedSheets.push(StyleSheetResolve.parse(sheet, options)); }
      for (const sheet of moduleSheets) { resolvedSheets.push(StyleSheetResolve.parse(sheet, options)); }

      // Create a clone of core styles.
      this.#ext = this.#core.clone();

      // Merge all system / module styles into the extended resolved styles.
      for (const sheet of resolvedSheets) { this.#ext.merge(sheet); }
   }
}
