import { TJSContextMenu }  from '@typhonjs-fvtt/svelte/component';

/**
 * Provides game wide menu functionality.
 */
export default class TJSMenu
{
   /**
    * Stores any active context menu.
    */
   static #contextMenu = void 0;

   /**
    * Creates and manages a game wide context menu.
    *
    * @param {object}   opts - Optional parameters.
    *
    * @param {string}   [opts.id] - A custom CSS ID to add to the menu.
    *
    * @param {number}   opts.x - X position for the top / left of the menu.
    *
    * @param {number}   opts.y - Y position for the top / left of the menu.
    *
    * @param {object[]} opts.items - Menu items to display.
    *
    * @param {...*}     [opts.transitionOptions] - The rest of opts defined the slideFade transition options.
    */
   static createContext({id = '', x = 0, y = 0, items = [], ...transitionOptions} = {})
   {
      if (this.#contextMenu !== void 0) { return; }

      // Create the new context menu with the last click x / y point.
      this.#contextMenu = new TJSContextMenu({
         target: document.body,
         intro: true,
         props: {id, x, y, items, transitionOptions}
      });

      // Register an event listener to remove any active context menu if closed from a menu selection or pointer
      // down event to `document.body`.
      this.#contextMenu.$on('close', () => { this.#contextMenu = void 0; });
   }
}