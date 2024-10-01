import { writable } from 'svelte/store';

/**
 * Provides the internal context to all application shells.
 *
 * @internal
 */
export class AppShellContextInternal
{
   /** @type {InternalAppStores} */
   #stores;

   constructor()
   {
      this.#stores = {
         elementContent: writable(void 0),
         elementRoot: writable(void 0)
      };

      Object.freeze(this.#stores);
      Object.seal(this);
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
 * @property {import('svelte/store').Writable<HTMLElement>} elementContent The window content element.
 *
 * @property {import('svelte/store').Writable<HTMLElement>} elementRoot The window root element.
 */
