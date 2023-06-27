export * from './gsap.js';

export * from './action/index.js';
export * from './compose/GsapCompose.js';
export * from './util/index.js';

// Typedefs from GsapCompose -----------------------------------------------------------------------------------------

/**
 * @typedef {Iterable<object>|Function} GsapData
 */

/**
 * @typedef {object} GsapPositionOptions
 *
 * @property {Function} [filter] An optional filter function to adjust position data in `onUpdate` callbacks. This is
 * useful if you need to transform any data from GSAP / plugins into data TJSPosition can utilize.
 *
 * @property {Iterable<string>} [initialProps] Provides an iterable of property keys to assign to initial position
 * data. This is useful when you are using GSAP plugins that manipulate data automatically; Ex. MotionPathPlugin
 */

/**
 * @typedef {(
 *    string |
 *    object |
 *    import('#svelte-fvtt/store/position').TJSPosition |
 *    Iterable<import('#svelte-fvtt/store/position').TJSPosition> |
 *    Array<HTMLElement | object>
 * )} GSAPTarget
 */

// Typedefs from GsapPosition ----------------------------------------------------------------------------------------

/**
 * @typedef {object} PositionInfo
 *
 * @property {import('#svelte-fvtt/store/position').TJSPosition[]}    position -
 *
 * @property {import('#svelte-fvtt/store/position').TJSPositionDataExtended[]}   positionData -
 *
 * @property {object[]}                data - Contains the full data object when a list of object w/ position is used.
 *
 * @property {HTMLElement[]}           elements -
 *
 * @property {Array<object[]>}         gsapData -
 */
