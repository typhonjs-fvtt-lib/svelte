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
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `position.set` on given Positionable
 * object provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Positionable}      params.positionable - A positionable object.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function draggable(node: HTMLElement, { positionable, active, storeDragging }: {
    positionable: any;
    active?: boolean;
    storeDragging?: any;
}): {
    update: Function;
    destroy: Function;
};

export { applyStyles, draggable };
