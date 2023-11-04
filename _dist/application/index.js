import {
   FoundryHMRSupport,
   PopoutSupport }   from './external/index.js';

export * from './SvelteApplication.js';
export * from './TJSDialog.js';

// Handle `hotReload` Foundry hook when running the Vite dev server.
if (import.meta.hot) { FoundryHMRSupport.initialize(); }

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
PopoutSupport.initialize();

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
 * @property {import('@typhonjs-svelte/runtime-base/util/browser').A11yFocusSource}   [focusSource] - Defines A11yHelper focus source to
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
 * @property {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPositionInitialHelper}   [positionInitial] A helper for
 *           initial position placement.
 *
 * @property {boolean}  [positionOrtho=true] When true TJSPosition is optimized for orthographic use.
 *
 * @property {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPositionValidatorOptions}   [positionValidator] A validator
 *           function or data or list of validators.
 *
 * @property {import('@typhonjs-svelte/runtime-base/svelte/store/web-storage').TJSWebStorage}   [sessionStorage] An instance of
 *           TJSWebStorage (session) to share across SvelteApplications.
 *
 * @property {import('@typhonjs-svelte/runtime-base/svelte/util').TJSSvelteConfig}   [svelte] A Svelte configuration object defining
 *           the main component.
 *
 * @property {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSTransformOrigin}   [transformOrigin='top left'] By default,
 *           'top / left' respects rotation when minimizing.
 */
