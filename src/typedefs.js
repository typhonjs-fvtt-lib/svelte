/**
 * @typedef {object} ApplicationShell - Application shell contract for Svelte components.
 *
 * @property {HTMLElement} elementRoot - The root element / exported prop.
 *
 * @property {HTMLElement} [elementContent] - The content element / exported prop.
 *
 * @property {HTMLElement} [elementTarget] - The target element / exported prop.
 */

/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {object} options - Configuration for setting data.
 */

/**
 * @typedef PositionData - Defines the position data for a positionable element.
 *
 * @property {number|null}          left - The left offset position in pixels.
 *
 * @property {number|null}          top - The top offset position in pixels.
 *
 * @property {number|'auto'|null}   width - The element width in pixels.
 *
 * @property {number|'auto'|null}   height - The element height in pixels.
 *
 * @property {number|null}          rotate - The element rotation as a numeric factor in degrees where 0 is default.
 *
 * @property {number|null}          scale - The element scale as a numeric factor where 1.0 is default.
 *
 * @property {number|null}          zIndex - The element z-index.
 */

/**
 * @typedef {object} StorePosition - Provides individual writable stores for {@link Position}.
 *
 * @property {import('svelte/store').Writable<number|null>} left - Derived store for `left` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} top - Derived store for `top` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} width - Derived store for `width` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} height - Derived store for `height` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotate - Derived store for `rotate` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} scale - Derived store for `scale` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} zIndex - Derived store for `zIndex` updates.
 */

/**
 * @typedef {object} StoreAppOptions - Provides a custom readable Svelte store for Application options state.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Subscribe to all app options updates.
 *
 * @property {import('svelte/store').Writable<boolean>} draggable - Derived store for `draggable` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} headerButtonNoClose - Derived store for `headerButtonNoClose`
 *                                                                            updates.
 *
 * @property {import('svelte/store').Writable<boolean>} headerButtonNoLabel - Derived store for `headerButtonNoLabel`
 *                                                                            updates.
 *
 * @property {import('svelte/store').Writable<boolean>} minimizable - Derived store for `minimizable` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} popOut - Derived store for `popOut` updates.
 *
 * @property {import('svelte/store').Writable<boolean>} resizable - Derived store for `resizable` updates.
 *
 * @property {import('svelte/store').Writable<string>} title - Derived store for `title` updates.
 *
 * @property {import('svelte/store').Writable<number>} zIndex - Derived store for `zIndex` updates.
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
