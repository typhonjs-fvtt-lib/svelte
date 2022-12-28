import { writable } from 'svelte/store';

/**
 * Provides the internal context to all application shells.
 */
export class AppShellContextInternal
{
   #stores;

   constructor()
   {
      this.#stores = {
         elementContent: writable(void 0),
         elementRoot: writable(void 0)
      };
   }

   /**
    * @returns {{ elementContent: import('svelte/store').Writable<HTMLElement>, elementRoot: import('svelte/store').Writable<HTMLElement> }}
    * The internal context stores for elementContent / elementRoot
    */
   get stores()
   {
      return this.#stores;
   }
}
