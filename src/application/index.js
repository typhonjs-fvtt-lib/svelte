import { SvelteApplication } from './SvelteApplication.js';

export * from './SvelteApplication.js';
export * from './TJSDialog.js';

// TODO: temporary
export * from './position/Position.js';

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
 * @typedef {ApplicationShell} ApplicationShellExt
 *
 * @property {SvelteReactive} reactive -
 *
 * @property {object} options -
 *
 * @property {Position} position -
 */

/**
 * @typedef {object} StoreAppOptions - Provides a custom readable Svelte store for Application options state.
 *
 * @property {import('svelte/store').Readable<object>} subscribe - Subscribe to all app options updates.
 *
 * @property {import('svelte/store').Writable<boolean>} draggable - Derived store for `draggable` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} focusAuto - Derived store for `focusAuto` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} focusKeep - Derived store for `focusKeep` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} focusTrap - Derived store for `focusTrap` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} headerButtonNoClose - Derived store for `headerButtonNoClose`
 *                                                                            updates.
 *
 * @property {import('svelte/store').Writable<boolean>} headerButtonNoLabel - Derived store for `headerButtonNoLabel`
 *                                                                            updates.
 *
 * @property {import('svelte/store').Writable<string>} headerIcon - Derived store for `headerIcon` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} headerNoTitleMinimized - Derived store for
 *                                                                               `headerNoTitleMinimized` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} minimizable - Derived store for `minimizable` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} popOut - Derived store for `popOut` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} positionable - Derived store for `positionable` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} resizable - Derived store for `resizable` updates.
 *
 * @property {import('svelte/store').Writable<string>} title - Derived store for `title` updates.
 */

/**
 * @typedef {object} StoreUIOptions - Provides a custom readable Svelte store for UI options state.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Subscribe to all UI options updates.
 *
 * @property {import('svelte/store').Writable<boolean>} dragging - Derived store for `dragging` updates.
 *
 * @property {import('svelte/store').Readable<ApplicationHeaderButton[]>} headerButtons - Derived store for
 *                                                                                        `headerButtons` updates.
 *
 * @property {import('svelte/store').Readable<boolean>} minimized - Derived store for `minimized` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} resizing - Derived store for `resizing` updates.
 */

/**
 * @typedef {object} TransformData
 *
 * @property {Function} transition - A transition applying to both in & out.
 *
 * @property {Function} inTransition - A transition applying to in.
 *
 * @property {Function} outTransition - A transition applying to out.
 *
 * @property {object}   transitionOptions - The options config object for in & out transitions.
 *
 * @property {object}   inTransitionOptions - The options config object for in transitions.
 *
 * @property {object}   outTransitionOptions - The options config object for out transitions.
 */
