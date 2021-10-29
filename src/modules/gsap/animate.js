import { gsap } from 'gsap';

/**
 * @param {HTMLElement} node -
 *
 * @param {object}      options -
 *
 * @param {string}      options.type -
 *
 * @returns {*} GSAP method.
 */
export function animate(node, { type, ...args })
{
   const method = gsap[type];
   return method(node, args);
}