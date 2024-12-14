import { writable } from '#svelte/store';

/**
 * Provides the internal context to all application shells.
 *
 * @implements {import('./types').AppShell.Context.Internal}
 *
 * @internal
 */
export class AppShellContextInternal
{
   /** @type {import('./types').AppShell.Context.Internal.stores} */
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
    * @returns {import('./types').AppShell.Context.Internal.stores} The internal context stores for `elementContent` /
    *          `elementRoot`
    */
   get stores()
   {
      return this.#stores;
   }
}
