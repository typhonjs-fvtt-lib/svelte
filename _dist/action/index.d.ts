import * as svelte_store from 'svelte/store';

/**
 * Provides an action to apply style properties provided as an object.
 *
 * @param {HTMLElement} node - Target element
 *
 * @param {object}      properties - Key / value object of properties to set.
 *
 * @returns {Function} Update function.
 */
declare function applyStyles(node: HTMLElement, properties: object): Function;
/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `setPosition` on given Positionable
 * object provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Positionable}      params.positionable - A positionable object.
 *
 * @param {Readable<boolean>} params.booleanStore - A Svelte store that contains a boolean.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function draggable(node: HTMLElement, { positionable, booleanStore }: {
    positionable: any;
    booleanStore: any;
}): {
    update: Function;
    destroy: Function;
};
/**
 * Provides a toggle action for `details` HTML elements.
 *
 * @param {HTMLDetailsElement} details - The details element.
 *
 * @param {import('svelte/store').writable<boolean>} booleanStore - A boolean store.
 *
 * @returns {object} Destroy callback.
 */
declare function toggleDetails(details: HTMLDetailsElement, booleanStore: typeof svelte_store.writable): object;

export { applyStyles, draggable, toggleDetails };
