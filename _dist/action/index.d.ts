/**
 * Provides an action to apply a Position instance to a HTMLElement and invoke `position.parent`
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {Position}          position - A position instance.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function applyPosition(node: HTMLElement, position: any): {
    update: Function;
    destroy: Function;
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
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `position.set` on a given {@link Position}
 * instance provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Position}          params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @param {boolean}           [params.ease=true] - When true easing is enabled.
 *
 * @param {object}            [params.easeOptions] - Gsap `to / `quickTo` vars object.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function draggable(node: HTMLElement, { position, active, storeDragging, ease, easeOptions }: {
    position: any;
    active?: boolean;
    storeDragging?: any;
    ease?: boolean;
    easeOptions?: object;
}): {
    update: Function;
    destroy: Function;
};
declare namespace draggable {
    /**
     * Define a function to get a DraggableOptions instance.
     *
     * @returns {DraggableOptions} A new options instance.
     */
    function options(): DraggableOptions;
}
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
declare function resizeObserver(node: HTMLElement, target: any): {
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
declare class DraggableOptions {
    /**
     * @param {number}   duration - Set ease duration.
     */
    set easeDuration(arg: number);
    /**
     * @returns {number} Get ease duration
     */
    get easeDuration(): number;
    /**
     * @param {string|Function} value - Get easing function value.
     */
    set easeValue(arg: string | Function);
    /**
     * @returns {string|Function} Get easing function value.
     */
    get easeValue(): string | Function;
    /**
     * Resets all options data to default values.
     */
    reset(): void;
    /**
     * Resets easing options to default values.
     */
    resetEase(): void;
    /**
     *
     * @param {function(DraggableOptions): void} handler - Callback function that is invoked on update / changes.
     *                                                 Receives the DraggableOptions object / instance.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DraggableOptions) => void): (() => void);
    #private;
}

export { applyPosition, applyStyles, draggable, resizeObserver };
