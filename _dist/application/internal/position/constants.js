/**
 * Defines the keys of PositionData that are transform keys.
 *
 * @type {string[]}
 */
const transformKeys = ['rotateX', 'rotateY', 'rotateZ', 'scale'];

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

export { transformKeys, transformOriginDefault, transformOrigins };
