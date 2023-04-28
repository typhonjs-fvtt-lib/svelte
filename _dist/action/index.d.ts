import * as _svelte_store from 'svelte/store';

/**
 * Provides an action to always blur the element when any pointer up event occurs on the element.
 *
 * @param {HTMLElement}   node - The node to handle always blur on pointer up.
 *
 * @returns {{destroy: Function}} Lifecycle functions.
 */
declare function alwaysBlur(node: HTMLElement): {
    destroy: Function;
};

/**
 * Provides an action to save `scrollTop` of an element with a vertical scrollbar. This action should be used on the
 * scrollable element and must include a writable store that holds the active store for the current `scrollTop` value.
 * You may switch the stores externally and this action will set the `scrollTop` based on the newly set store. This is
 * useful for instance providing a select box that controls the scrollable container.
 *
 * @param {HTMLElement} element - The target scrollable HTML element.
 *
 * @param {import('#svelte/store').Writable<number>}   store - A writable store that stores the element scrollTop.
 *
 * @returns {{destroy: Function, update: Function}} Lifecycle functions.
 */
declare function applyScrolltop(element: HTMLElement, store: _svelte_store.Writable<number>): {
    destroy: Function;
    update: Function;
};

/**
 * Provides an action to blur the element when any pointer down event occurs outside the element. This can be useful
 * for input elements including select to blur / unfocus the element when any pointer down occurs outside the element.
 *
 * @param {HTMLElement}   node - The node to handle automatic blur on focus loss.
 *
 * @returns {{destroy: Function}} Lifecycle functions.
 */
declare function autoBlur(node: HTMLElement): {
    destroy: Function;
};

/**
 * Provides an action to monitor focus state of a given element and set an associated store with current focus state.
 *
 * This action is usable with any writable store.
 *
 * @param {HTMLElement} node - Target element.
 *
 * @param {import('#svelte/store').Writable<boolean>}  storeFocused - Update store for focus changes.
 *
 * @returns {{update: (function(object): void), destroy: (function(): void)}} Action lifecycle methods.
 */
declare function isFocused(node: HTMLElement, storeFocused: _svelte_store.Writable<boolean>): {
    update: ((arg0: object) => void);
    destroy: (() => void);
};

type ResizeObserverTarget = object | Function;
/**
 * Provides an action to monitor the given HTMLElement node with `ResizeObserver` posting width / height changes
 * to the target in various ways depending on the shape of the target. The target can be one of the following and the
 * precedence order is listed from top to bottom:
 *
 * - has a `resizeObserved` function as attribute; offset then content width / height are passed as parameters.
 * - has a `setContentBounds` function as attribute; content width / height are passed as parameters.
 * - has a `setDimension` function as attribute; offset width / height are passed as parameters.
 * - target is an object; offset and content width / height attributes are directly set on target.
 * - target is a function; the function is invoked with offset then content width / height parameters.
 * - has a writable store `resizeObserved` as an attribute; updated with offset & content width / height.
 * - has an object 'stores' that has a writable store `resizeObserved` as an attribute; updated with offset &
 *   content width / height.
 *
 * Note: Svelte currently uses an archaic IFrame based workaround to monitor offset / client width & height changes.
 * A more up to date way to do this is with ResizeObserver. To track when Svelte receives ResizeObserver support
 * monitor this issue: {@link https://github.com/sveltejs/svelte/issues/4233}
 *
 * Can-I-Use: {@link https://caniuse.com/resizeobserver}
 *
 * @param {HTMLElement}          node - The node associated with the action.
 *
 * @param {ResizeObserverTarget} target - An object or function to update with observed width & height changes.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 * @see {@link https://github.com/sveltejs/svelte/issues/4233}
 */
declare function resizeObserver(node: HTMLElement, target: ResizeObserverTarget): {
    update: Function;
    destroy: Function;
};
declare namespace resizeObserver {
    /**
     * Provides a function that when invoked with an element updates the cached styles for each subscriber of the element.
     *
     * The style attributes cached to calculate offset height / width include border & padding dimensions. You only need
     * to update the cache if you change border or padding attributes of the element.
     *
     * @param {HTMLElement} el - An HTML element.
     */
    function updateCache(el: HTMLElement): void;
}

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

export { ResizeObserverTarget, alwaysBlur, applyScrolltop, applyStyles, autoBlur, isFocused, resizeObserver };
