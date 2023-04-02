/**
 * Provides an index of all visible rendered {@link SvelteApplication} instances in a given Svelte runtime. This allows
 * bulk operations to be performed across all apps.
 */
export class TJSAppIndex
{
   /**
    * Stores all visible / rendered apps.
    *
    * @type {Map<string, SvelteApplication>}
    */
   static #visibleApps = new Map();

   /**
    * Adds a SvelteApplication to all visible apps tracked.
    *
    * @param {SvelteApplication} app - A SvelteApplication
    *
    * @package
    */
   static add(app)
   {
      this.#visibleApps.set(app.id, app);
   }

   /**
    * Removes a SvelteApplication from all visible apps tracked.
    *
    * @param {SvelteApplication} app - A SvelteApplication
    *
    * @package
    */
   static delete(app)
   {
      this.#visibleApps.delete(app.id);
   }

   /**
    * Gets a particular app by ID.
    *
    * @param {string}   key - App ID.
    *
    * @returns {SvelteApplication} Associated app.
    */
   static get(key)
   {
      return this.#visibleApps.get(key);
   }

   /**
    * Returns whether an associated app by ID is being tracked.
    *
    * @param {string}   key - App ID.
    *
    * @returns {boolean} The given App ID is visible.
    */
   static has(key)
   {
      return this.#visibleApps.has(key);
   }

   /**
    * @returns {IterableIterator<string>} All visible app IDs.
    */
   static keys()
   {
      return this.#visibleApps.keys();
   }

   /**
    * @returns {IterableIterator<SvelteApplication>} All visible apps.
    */
   static values()
   {
      return this.#visibleApps.values();
   }
}
