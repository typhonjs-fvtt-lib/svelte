import * as svelte_action from 'svelte/action';
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
 * @returns {import('svelte/action').Action} Actual action.
 */
declare function animate({ duration, keyframes, options, event, debounce }?: {
    duration?: number;
    keyframes: any[] | object;
    options?: object;
    event?: string;
    debounce?: number;
}): svelte_action.Action;

/**
 * Combines multiple composable actions.
 *
 * Note: The update function passes the same variable to all update functions of each action.
 *
 * @param {...import('svelte/action').Action} actions - One or more composable action functions to combine.
 *
 * @returns {import('svelte/action').Action<HTMLElement, any>} Composed action.
 */
declare function composable(...actions: svelte_action.Action[]): svelte_action.Action<HTMLElement, any>;

/**
 * Defines the classic Material Design ripple effect as an action. `ripple` is a wrapper around the returned action.
 * This allows it to be easily used as a prop.
 *
 * Note: A negative one translateZ transform is applied to the added spans allowing other content to be layered on top
 * with a positive translateZ.
 *
 * Styling: There is a single CSS variable `--tjs-action-ripple-background` that can be set to control the background.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {number}   [opts.duration=600] - Duration in milliseconds.
 *
 * @param {string}   [opts.background='rgba(255, 255, 255, 0.7)'] - A valid CSS background attribute.
 *
 * @param {Iterable<string>}  [opts.events=['click', 'keyup']] - DOM event to bind element to respond with the ripple
 *                                                                  effect.
 *
 * @param {string}   [opts.keyCode='Enter'] - Key code to trigger for any applicable key events.
 *
 * @param {number}   [opts.debounce=undefined] - Add a debounce to incoming events in milliseconds.
 *
 * @returns {import('svelte/action').Action} Actual action.
 */
declare function ripple({ duration, background, events, keyCode, debounce }?: {
    duration?: number;
    background?: string;
    events?: Iterable<string>;
    keyCode?: string;
    debounce?: number;
}): svelte_action.Action;

/**
 * Defines the classic Material Design ripple effect as an action that is attached to an elements focus and blur events.
 * `rippleFocus` is a wrapper around the returned action. This allows it to be easily used as a prop.
 *
 * Note: A negative one translateZ transform is applied to the added span allowing other content to be layered on top
 * with a positive translateZ.
 *
 * If providing the `selectors` option a target child element will be registered for the focus events otherwise the
 * first child is targeted with a final fallback of the element assigned to this action.
 *
 * Styling: There is a single CSS variable `--tjs-action-ripple-background-focus` that can be set to control the
 * background with a fallback to `--tjs-action-ripple-background`.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {number}   [opts.duration=600] - Duration in milliseconds.
 *
 * @param {string}   [opts.background='rgba(255, 255, 255, 0.7)'] - A valid CSS background attribute.
 *
 * @param {string}   [opts.selectors] - A valid CSS selectors string.
 *
 * @returns {import('svelte/action').Action} Actual action.
 */
declare function rippleFocus({ duration, background, selectors }?: {
    duration?: number;
    background?: string;
    selectors?: string;
}): svelte_action.Action;

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
 * @param {object} opts - Options parameters.
 *
 * @param {import('svelte/store').Writable<boolean>} opts.store - A boolean store.
 *
 * @param {boolean} [opts.clickActive] - When false click events are not handled.
 *
 * @returns {import('svelte/action').ActionReturn} Lifecycle functions.
 */
declare function toggleDetails(details: HTMLDetailsElement, { store, clickActive }?: {
    store: svelte_store.Writable<boolean>;
    clickActive?: boolean;
}): svelte_action.ActionReturn;

export { animate, composable, ripple, rippleFocus, toggleDetails };
