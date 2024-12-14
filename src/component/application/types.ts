import type { Writable } from 'svelte/store';

/**
 * Provides the data and types for application shells.
 */
declare namespace AppShell {
   /**
    * All context data.
    */
   namespace Context {
      /**
       * The `#internal` context data.
       */
      interface Internal {
         /**
          * Returns stores holding the current `elementRoot` / `elementContent` instances.
          */
         get stores(): {
            ['elementContent']: Writable<HTMLElement>;
            ['elementRoot']: Writable<HTMLElement>;
         }
      }
   }
}

// /**
//  * @typedef {object} InternalAppStores
//  *
//  * @property {import('svelte/store').Writable<HTMLElement>} elementContent The window content element.
//  *
//  * @property {import('svelte/store').Writable<HTMLElement>} elementRoot The window root element.
//  */

export { AppShell };
