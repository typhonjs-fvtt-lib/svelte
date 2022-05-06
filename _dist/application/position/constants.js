/**
 * Defines the keys of PositionData that are transform keys.
 *
 * @type {string[]}
 */
const transformKeys = ['rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ'];

/**
 * Provides numeric defaults for all parameters. This is used by {@link Position.get} to optionally provide
 * numeric defaults.
 *
 * @type {{rotation: number, scale: number, minWidth: null, minHeight: null, translateZ: number, top: number, left: number, maxHeight: null, translateY: number, translateX: number, width: number, transformOrigin: null, rotateX: number, rotateY: number, height: number, maxWidth: null, zIndex: null, rotateZ: number}}
 */
const numericDefaults = {
   // Other keys
   height: 0,
   left: 0,
   maxHeight: null,
   maxWidth: null,
   minHeight: null,
   minWidth: null,
   top: 0,
   transformOrigin: null,
   width: 0,
   zIndex: null,

   rotateX: 0,
   rotateY: 0,
   rotateZ: 0,
   scale: 1,
   translateX: 0,
   translateY: 0,
   translateZ: 0,

   rotation: 0
};

Object.freeze(transformKeys);

/**
 * Defines bitwise keys for transforms used in {@link Transforms.getMat4}.
 *
 * @type {object}
 */
const transformKeysBitwise = {
   rotateX: 1,
   rotateY: 2,
   rotateZ: 4,
   scale: 8,
   translateX: 16,
   translateY: 32,
   translateZ: 64
};

Object.freeze(transformKeysBitwise);

/**
 * Defines the default transform origin.
 *
 * @type {string}
 */
const transformOriginDefault = 'top left';

/**
 * Defines the valid transform origins.
 *
 * @type {string[]}
 */
const transformOrigins = ['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left',
 'bottom center', 'bottom right'];

Object.freeze(transformOrigins);

export { numericDefaults, transformKeys, transformKeysBitwise, transformOriginDefault, transformOrigins };
