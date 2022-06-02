export * from '@typhonjs-svelte/lib/animate';

// TODO: MOVE LOCATION to final API spot.
/**
 * @typedef {object} TJSBasicAnimation - Defines a type for basic animation control.
 *
 * @property {boolean} isActive - True if animation is active.
 *
 * @property {Promise<void>} finished - A Promise that is resolved when animation is finished.
 *
 * @property {Function} cancel - A function that cancels animation.
 */
