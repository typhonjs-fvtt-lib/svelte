import { SvelteApplication } from './SvelteApplication.js';
import { TJSAppIndex }       from './internal/index.js';

export * from './SvelteApplication.js';
export * from './TJSDialog.js';

// Handle `hotReload` Foundry hook when running the Vite dev server. -------------------------------------------------

if (import.meta.hot)
{
   Hooks.on('hotReload', (data) =>
   {
      // Only handle JSON hot reload presumably specified in package manifest for language translation files.
      if (data?.extension === 'json')
      {
         // Postpone until next clock tick to allow Foundry to update localization first.
         setTimeout(() =>
         {
            for (const app of TJSAppIndex.values())
            {
               const appShell = app.svelte.applicationShell;

               // Retrieve the original `svelte-hmr` instrumented HMR component / not the proxy.
               const hmrComponent = appShell?.$$?.hmr_cmp;

               if (appShell && typeof hmrComponent?.$replace === 'function')
               {
                  const svelteData = app.svelte.dataByComponent(appShell);
                  if (svelteData)
                  {
                     try
                     {
                        // Replace with self; this will invoke `on_hmr` callback in associated SvelteApplication.
                        hmrComponent.$replace(hmrComponent.constructor, {
                           target: svelteData.config.target,
                           anchor: svelteData.config.anchor,
                           preserveLocalState: true,
                           conservative: true
                        });
                     }
                     catch (error)
                     {
                        const name = hmrComponent?.constructor?.name ?? 'Unknown';
                        console.error(`TyphonJS Runtime Library error; Could not hot reload component: '${name}'`);
                        console.error(error);
                     }
                  }
               }
            }
         }, 0);
      }

      return true;
   });
}

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window -------------------------

Hooks.on('PopOut:loading', (app) =>
{
   if (app instanceof SvelteApplication) { app.position.enabled = false; }
});

Hooks.on('PopOut:popin', (app) =>
{
   if (app instanceof SvelteApplication) { app.position.enabled = true; }
});

Hooks.on('PopOut:close', (app) =>
{
   if (app instanceof SvelteApplication) { app.position.enabled = true; }
});

// From: SvelteApplication.js ----------------------------------------------------------------------------------------

/**
 * @typedef {object} SvelteApplicationOptions Options for SvelteApplication. Note: that this extends the Foundry
 * {@link ApplicationOptions}.
 *
 * @property {boolean}  [defaultCloseAnimation=true] If false the default slide close animation is not run.
 *
 * @property {boolean}  [draggable=true] If true then application shells are draggable.
 *
 * @property {boolean}  [focusAuto=true] When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusKeep=false] When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {import('#runtime/util/browser').A11yFocusSource}   [focusSource] - Defines A11yHelper focus source to
 *           apply when application closes.
 *
 * @property {boolean}  [focusTrap=true] When true focus trapping / wrapping is enabled keeping focus inside app.
 *
 * @property {boolean}  [headerButtonNoClose=false] If true then the close header button is removed.
 *
 * @property {boolean}  [headerButtonNoLabel=false] If true then header button labels are removed.
 *
 * @property {string}   [headerIcon] Sets a header icon given an image URL.
 *
 * @property {boolean}  [headerNoTitleMinimized=false] If true then header title is hidden when minimized.
 *
 * @property {number}   [minHeight=MIN_WINDOW_HEIGHT] Assigned to position. Number specifying minimum
 *           window height.
 *
 * @property {number}   [minWidth=MIN_WINDOW_WIDTH] Assigned to position. Number specifying minimum
 *           window width.
 *
 * @property {boolean}  [positionable=true] If false then `position.set` does not take effect.
 *
 * @property {import('#runtime/svelte/store/position').TJSPositionInitialHelper}   [positionInitial] A helper for
 *           initial position placement.
 *
 * @property {boolean}  [positionOrtho=true] When true TJSPosition is optimized for orthographic use.
 *
 * @property {import('#runtime/svelte/store/position').TJSPositionValidatorOptions}   [positionValidator] A validator
 *           function or data or list of validators.
 *
 * @property {import('#runtime/svelte/store/web-storage').TJSWebStorage}   [sessionStorage] An instance of
 *           TJSWebStorage (session) to share across SvelteApplications.
 *
 * @property {import('#runtime/svelte/util').TJSSvelteConfig}   [svelte] A Svelte configuration object defining
 *           the main component.
 *
 * @property {import('#runtime/svelte/store/position').TJSTransformOrigin}   [transformOrigin='top left'] By default,
 *           'top / left' respects rotation when minimizing.
 */
