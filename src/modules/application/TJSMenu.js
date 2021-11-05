import { outroAndDestroy } from '@typhonjs-fvtt/svelte/util';

import TJSContextMenu      from '../components/contextmenu/TJSContextMenu.svelte';

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
    * Stores the current active async state which is used when async is true.
    *
    * @type {{x: number, active: boolean, y: number}}
    */
   static #contextMenuData = { active: false, x: 0, y: 0 };

   /**
    * Creates and manages a game wide context menu.
    *
    * @param {object}   opts - Optional parameters.
    *
    * @param {boolean}  [opts.async=false] - Awaits the outro transition of an existing menu before displaying next.
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
    *
    * @returns {Promise<void>}
    */
   static async createContext({ async = false, id = '', x = 0, y = 0, items = [], ...transitionOptions } = {})
   {
      // Always set the last context menu click point. When async is enabled this allows the last click to be the
      // position where the new context menu will display if multiple context clicks occur before the existing menu
      // outro transition is completed.
      this.#contextMenuData.x = x;
      this.#contextMenuData.y = y;

      // A latch to return if a previous menu is being destroyed and outro transition is still playing when async is
      // enabled.
      if (this.#contextMenuData.active) { return; }

      // Set the active state to true. This provides the latch above when async is enabled.
      this.#contextMenuData.active = true;

      // Destroy the existing menu an play the outro transition.
      if (this.#contextMenu !== void 0)
      {
         const menu = this.#contextMenu;
         this.#contextMenu = void 0;

         // Await on outroAndDestroy when async is enabled otherwise immediately continue.
         if (async) { await outroAndDestroy(menu); }
         else { outroAndDestroy(menu); }
      }

      // Create the new context menu with the last click x / y point.
      this.#contextMenu = new TJSContextMenu({
         target: document.body,
         intro: true,
         props: { id, x: this.#contextMenuData.x, y: this.#contextMenuData.y, items, transitionOptions }
      });

      // Register an event listener to remove any active context menu if closed from a menu selection, etc.
      this.#contextMenu.$on('close', () =>
      {
         if (this.#contextMenu !== void 0)
         {
            const menu = this.#contextMenu;
            this.#contextMenu = void 0;
            outroAndDestroy(menu);
         }
      });

      this.#contextMenuData.active = false;
   }
}