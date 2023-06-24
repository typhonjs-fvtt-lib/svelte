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
 * @typedef {object} MountedAppShell - Application shell contract for Svelte components.
 *
 * @property {HTMLElement} elementRoot - The root element / exported prop.
 *
 * @property {HTMLElement} [elementContent] - The content element / exported prop.
 *
 * @property {HTMLElement} [elementTarget] - The target element / exported prop.
 */

/**
 * @typedef {object} SvelteApplicationOptions
 *
 * @property {boolean}  [defaultCloseAnimation=true] - If false the default slide close animation is not run.
 *
 * @property {boolean}  [draggable=true] - If true then application shells are draggable.
 *
 * @property {boolean}  [focusAuto=true] - When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusKeep=false] - When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {import('@typhonjs-svelte/lib/util').A11yFocusSource}   [focusSource] - Defines A11yHelper focus source to
 *           apply when application closes.
 *
 * @property {boolean}  [headerButtonNoClose=false] - If true then the close header button is removed.
 *
 * @property {boolean}  [headerButtonNoLabel=false] - If true then header button labels are removed.
 *
 * @property {boolean}  [headerNoTitleMinimized=false] - If true then header title is hidden when minimized.
 *
 * @property {number}   [minHeight=globalThis.MIN_WINDOW_HEIGHT] - Assigned to position. Number specifying minimum
 *           window height.
 *
 * @property {number}   [minWidth=globalThis.MIN_WINDOW_WIDTH] - Assigned to position. Number specifying minimum
 *           window width.
 *
 * @property {boolean}  [positionable=true] - If false then `position.set` does not take effect.
 *
 * @property {import('@typhonjs-svelte/lib/store/position').TJSPositionInitialHelper}   [positionInitial] - A helper
 *           for initial position placement.
 *
 * @property {boolean}  [positionOrtho=true] - When true TJSPosition is optimized for orthographic use.
 *
 * @property {import('@typhonjs-svelte/lib/store/position').TJSPositionValidatorOptions}   [positionValidator] - A
 *           validator function or data or list of validators.
 *
 * @property {import('@typhonjs-svelte/lib/store/storage/web').TJSSessionStorage}   [sessionStorage] - An instance of
 *           TJSSessionStorage to share across SvelteApplications.
 *
 * @property {import('@typhonjs-svelte/lib/util').TJSSvelteConfig}   [svelte] - A Svelte configuration object defining
 *           the main component.
 *
 * @property {import('@typhonjs-svelte/lib/store/position').TJSTransformOrigin}   [transformOrigin='top left'] - By
 *           default, 'top / left' respects rotation when minimizing.
 */

/**
 * @typedef {object} SvelteData
 *
 * @property {object}                           config -
 *
 * @property {import('svelte').SvelteComponent} component -
 *
 * @property {HTMLElement}                      element -
 *
 * @property {boolean}                          injectHTML -
 */

/**
 * @typedef {object} SvelteStores
 *
 * @property {import('svelte/store').Writable.update} appOptionsUpdate - Update function for app options store.
 *
 * @property {Function} subscribe - Subscribes to local stores.
 *
 * @property {import('svelte/store').Writable.update} uiOptionsUpdate - Update function for UI options store.
 *
 * @property {Function} unsubscribe - Unsubscribes from local stores.
 */

// From: TJSDialog.js ------------------------------------------------------------------------------------------------

/**
 * @typedef {object} TJSDialogOptions - Defines the common dialog configuration data.
 *
 * @property {Record<string, TJSDialogButtonData>}  [buttons={}] - Provides configuration of the dialog button bar.
 *
 * @property {object|string}  content - A Svelte configuration object or HTML string content.
 *
 * @property {string}   [default] - The default button ID to focus initially.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {boolean}  [focusAuto=true] - When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [focusKeep=false] - When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {boolean}  [focusTrap=true] - When true focus trapping / wrapping is enabled keeping focus inside app.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [notifyError=true] - When true and an error is raised in dialog callback functions post a UI
 *           error notification.
 *
 * @property {string|((application: import('./').TJSDialog) => any)} [onClose] - Callback invoked when dialog is closed; no button
 *           option selected. When defined as a string any matching function by name exported from content Svelte
 *           component is invoked.
 *
 * @property {boolean}  [rejectClose=false] - When true and a Promise has been created by {@link TJSDialog.wait} and
 *           the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
 *           function is invoked and any result that is undefined will cause the Promise to then be rejected.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
 *
 * @property {boolean}  [resolveId=false] - When true and resolving any Promises and there are undefined results from
 *           any button callbacks the button ID is resolved.
 *
 * @property {string}   [title] - The dialog window title.
 *
 * @property {object}   [transition] - Transition options for the dialog.
 *
 * @property {number|null} [zIndex] - A specific z-index for the dialog. Pass null for the dialog to act like other
 *           applications in regard bringing to top when activated.
 */

/**
 * @typedef {object} TJSDialogButtonData - TJSDialog button data.
 *
 * @property {boolean} [autoClose=true] - When false the dialog does not automatically close when button selected.
 *
 * @property {boolean|(() => boolean)} [condition] - Determines if the button is accessible providing a truthy value.
 *
 * @property {string} [label] - Button label; will be localized.
 *
 * @property {string} [icon] - Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
 *
 * @property {string|((application: import('./').TJSDialog) => any)} [onPress] - Callback for button press. When
 *           defined as a string any matching function by name exported from content Svelte component is invoked.
 *
 * @property {Record<string, string>} [styles] - Inline styles to apply to the button.
 */
