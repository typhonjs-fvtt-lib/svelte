import * as svelte_store from 'svelte/store';

/**
 * Defines an `Element.animate` animation from provided keyframes and options.
 *
 * @param {object}         [opts] - Optional parameters.
 *
 * @param {number}         [opts.duration=600] - Duration in milliseconds.
 *
 * @param {Array|object}   opts.keyframes - An array of keyframe objects or a keyframe object whose properties are
 *                                          arrays of values to iterate over.
 *
 * @param {object}         [opts.options] - An object containing one or more timing properties. When defined it is used
 *                                          instead of duration.
 *
 * @param {string}         [opts.event='click'] - DOM event to bind element to respond with the ripple effect.
 *
 * @param {number}         [opts.debounce=undefined] - Add a debounce to incoming events in milliseconds.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
 *
 * @returns Function - Actual action.
 */
declare function animate({ duration, keyframes, options, event, debounce: debounce$1 }?: {
    duration?: number;
    keyframes: any[] | object;
    options?: object;
    event?: string;
    debounce?: number;
}): (element: any) => {
    destroy: () => any;
};
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
 * Combines multiple composable actions.
 *
 * Note: The update function passes the same variable to all update functions of each action.
 *
 * @param {...Function} actions - One or more composable action functions to combine.
 *
 * @returns {Function} Composed action.
 */
declare function composable(...actions: Function[]): Function;
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
 * Defines the classic Material Design ripple effect as an action. `ripple` is a wrapper around the returned action.
 * This allows it to be easily used as a prop.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {number}   [opts.duration=600] - Duration in milliseconds.
 *
 * @param {string}   [opts.color='rgba(255, 255, 255, 0.7)'] - A valid CSS color.
 *
 * @param {string}   [opts.event='click'] - DOM event to bind element to respond with the ripple effect.
 *
 * @param {number}   [opts.debounce=undefined] - Add a debounce to incoming events in milliseconds.
 *
 * @returns Function - Actual action.
 */
declare function ripple({ duration, color, event, debounce: debounce$1 }?: {
    duration?: number;
    color?: string;
    event?: string;
    debounce?: number;
}): (element: any) => {
    destroy: () => any;
};
/**
 * Provides a toggle action for `details` HTML elements. The boolean store provided controls animation.
 *
 * It is not necessary to bind the store to the `open` attribute of the associated details element.
 *
 * When the action is triggered to close the details element a data attribute `closing` is set to `true`. This allows
 * any associated closing transitions to start immediately.
 *
 * @param {HTMLDetailsElement} details - The details element.
 *
 * @param {import('svelte/store').Writable<boolean>} booleanStore - A boolean store.
 *
 * @returns {object} Destroy callback.
 */
declare function toggleDetails(details: HTMLDetailsElement, booleanStore: svelte_store.Writable<boolean>): object;

export { animate, applyStyles, composable, draggable, ripple, toggleDetails };
