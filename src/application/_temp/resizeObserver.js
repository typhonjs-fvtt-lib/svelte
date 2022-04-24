import { ResizeObserverManager } from "./ResizeObserverManager.js";

/**
 * Provides an action to monitor the given HTMLElement node with `ResizeObserver` posting width / height changes
 * to the target in various ways depending on the shape of the target. The target can be one of the following and the
 * precedence order is listed from top to bottom:
 *
 *
 * - has a `setDimension` function as attribute; width / height are passed as parameters.
 * - has `setWidth` & `setHeight` functions as attribute; width & height are passed as parameters.
 * - has
 * - target is an object; width and height attributes are directly set on target.
 * - target is a function; the function is invoked with width & height parameters.
 *
 * Note: Svelte currently uses an archaic IFrame based workaround to monitor offset / client width & height changes.
 * A more up to date way to do this is with ResizeObserver. To track when Svelte receives ResizeObserver support
 * monitor this issue: {@link https://github.com/sveltejs/svelte/issues/4233}
 *
 * Can-I-Use: {@link https://caniuse.com/resizeobserver}
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object | Function} target - An object to update with observed width & height changes.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 * @see {@link https://github.com/sveltejs/svelte/issues/4233}
 */
export function resizeObserver(node, target)
{
   ResizeObserverManager.add(node, target);

   return {
      update: (newTarget) =>
      {
         ResizeObserverManager.remove(node, target);
         target = newTarget;
         ResizeObserverManager.add(node, target);
      },

      destroy: () =>
      {
         ResizeObserverManager.remove(node, target);
      }
   };
}
