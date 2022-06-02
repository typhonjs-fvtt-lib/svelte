export * from '@typhonjs-svelte/lib/animate';

// TODO: MOVE LOCATION to final API spot.
/**
 * @typedef {object} TJSBasicAnimation - Defines a type for basic animation control.
 *
 * @property {boolean} isActive - True if animation is active; note: delayed animations are not active until start.
 *
 * @property {boolean} isFinished - True if animation is completely finished.
 *
 * @property {Promise<void>} finished - A Promise that is resolved when animation is finished.
 *
 * @property {Function} cancel - A function that cancels animation.
 */
