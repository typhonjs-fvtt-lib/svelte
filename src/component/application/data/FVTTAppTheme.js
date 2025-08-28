/**
 * Provides shared logic to automatically set a SvelteApp / AppV1 theme from app options / `classes`.
 */
export class FVTTAppTheme
{
   /**
    * Generate all app classes with applied core or explicitly set theme.
    *
    * @param {import('#svelte-fvtt/application').SvelteApp} application - Application
    *
    * @param {string} coreTheme - Current core theme value.
    *
    * @param {string} appTheme - Any explicitly set app theme override.
    *
    * @returns {string} All app classes.
    */
   static appClasses(application, coreTheme, appTheme)
   {
      const classes = new Set([
         ...Array.isArray(application?.options?.classes) ? application.options.classes : [],
      ]);

      // In AppV1 `theme-light` is always applied. Remove any theme classes.
      for (const entry of classes)
      {
         if (entry.startsWith('theme-')) { classes.delete(entry); }
      }

      classes.add('themed');
      classes.add(appTheme ? `theme-${appTheme}` : coreTheme);

      return Array.from(classes).join(' ');
   }
}
