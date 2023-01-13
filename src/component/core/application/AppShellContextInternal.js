import { writable } from 'svelte/store';

/**
 * Provides the internal context to all application shells.
 */
export class AppShellContextInternal
{
   /** @type {InternalAppStores} */
   #stores;

   constructor()
   {
      this.#stores = {
         autoFocus: writable(true),
         elementContent: writable(void 0),
         elementRoot: writable(void 0)
      };
   }

   /**
    * @returns {InternalAppStores} The internal context stores for elementContent / elementRoot
    */
   get stores()
   {
      return this.#stores;
   }
}

/**
 * @typedef {object} InternalAppStores
 *
 * @property {import('svelte/store').Writable<boolean>} autoFocus - When true pointer down on app header will focus the
 *  app and / or the window content area. An example of turning this off is useful for modal dialogs.
 *
 * @property {import('svelte/store').Writable<HTMLElement>} elementContent - The window content element.
 *
 * @property {import('svelte/store').Writable<HTMLElement>} elementRoot - The window root element.
 */
