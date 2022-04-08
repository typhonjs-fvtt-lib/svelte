import { hasSetter } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides an action to apply a Position instance to a HTMLElement and invoke `position.parent`
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {Position}          position - A position instance.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
export function applyPosition(node, position)
{
   if (hasSetter(position, 'parent')) { position.parent = node; }

   return {
      update: (newPosition) =>
      {
         if (hasSetter(position)) { position.parent = void 0; }

         position = newPosition;

         if (hasSetter(position, 'parent')) { position.parent = node; }
      },

      destroy: () => { if (hasSetter(position, 'parent')) { position.parent = void 0; } }
   };
}
