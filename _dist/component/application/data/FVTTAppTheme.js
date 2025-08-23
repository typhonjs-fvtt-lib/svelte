import { ThemeObserver }   from '@typhonjs-svelte/runtime-base/util/dom/theme';

/**
 * Provides shared logic to automatically set a SvelteApp / AppV1 theme from app options / `classes`.
 */
export class FVTTAppTheme
{
   /**
    * Helper to apply current core theme to a given SvelteApp optional classes.
    *
    * @param {import('@typhonjs-fvtt/svelte/application').SvelteApp} application - Svelte application.
    *
    * @param {object} [options] - Options.
    *
    * @param {boolean} [options.hasThemed] - Verify that the original application default options contains the `themed`
    *        class otherwise do not add the core theme classes.
    *
    * @returns {string} App classes CSS string with current core theme applied.
    */
   static appClasses(application, { hasThemed = false } = {})
   {
      const classes = new Set([
         ...Array.isArray(application?.options?.classes) ? application.options.classes : [],
      ]);

      // In AppV1 `theme-light` is always applied. Remove it.
      classes.delete('themed');
      classes.delete('theme-light');

      const origOptions = application.constructor.defaultOptions;
      const themeExplicit = this.#hasExplicitTheme(origOptions?.classes);

      if (!hasThemed)
      {
         // Add core theme classes.
         classes.add('themed');
         classes.add(themeExplicit ?? ThemeObserver.theme);
      }
      else
      {
         // Verify original app options has `themed` class or explicit theme specified then add core theme classes.
         if (origOptions?.classes?.includes('themed') || themeExplicit)
         {
            classes.add('themed');
            classes.add(themeExplicit ?? ThemeObserver.theme);
         }
      }

      return Array.from(classes).join(' ');
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * @param {string[]} classes - Original application classes.
    *
    * @returns {undefined | string} Undefined if no explicit theme is specified otherwise the explicitly `theme-<XXX>`
    *          class string.
    */
   static #hasExplicitTheme(classes)
   {
      if (!Array.isArray(classes)) { return void 0; }

      let result = void 0;

      for (const entry of classes)
      {
         if (typeof entry !== 'string') { continue; }

         if (entry.startsWith('theme-'))
         {
            result = entry;
            break;
         }
      }

      return result;
   }
}
