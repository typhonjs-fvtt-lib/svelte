/**
 * Provides shared logic to automatically set a SvelteApp / AppV1 theme from app options / `classes`.
 */
export class FVTTAppTheme
{
   /**
    * Generate all app classes with applied core or explicitly set theme.
    *
    * @param {Set<string>} activeClasses - Active app classes Set.
    *
    * @param {string} coreTheme - Current core theme class.
    *
    * @param {string} appThemeName - Any explicitly set app theme name override.
    *
    * @returns {string} All app classes.
    */
   static appClasses(activeClasses, coreTheme, appThemeName)
   {
      const classes = new Set(activeClasses);

      // In AppV1 `theme-light` is always applied. Remove any theme classes.
      for (const entry of classes)
      {
         if (entry.startsWith('theme-')) { classes.delete(entry); }
      }

      classes.add('themed');
      classes.add(appThemeName ? `theme-${appThemeName}` : coreTheme);

      return Array.from(classes).join(' ');
   }
}
