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
   /** @type {import('./types').AppShell.Context.InternalAppStores} */
   #stores;

   constructor()
   {
      this.#stores = {
         // When app shell has content resize observation enabled these stores are updated.
         contentOffsetWidth: writable(0),
         contentOffsetHeight: writable(0),
         contentWidth: writable(0),
         contentHeight: writable(0),

         cqEnabled: writable(false),

         elementContent: writable(void 0),
         elementRoot: writable(void 0),

         // Updated by `applyVisualEdgeInsets` action.
         visualEdgeInsets: writable({ top: 0, right: 0, bottom: 0, left: 0 })
      };

      Object.freeze(this.#stores);
      Object.seal(this);
   }

   /**
    * @returns {import('./types').AppShell.Context.InternalAppStores} The internal context stores:
    * - `cqEnabled` - Container query enabled state.
    * - `elementContent` - The bound elementContent element reference.
    * - `elementRoot` - The bound elementRoot element reference.
    */
   get stores()
   {
      return this.#stores;
   }
}
