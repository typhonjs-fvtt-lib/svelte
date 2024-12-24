/**
 * Provides an index of all visible rendered {@link SvelteApp} instances in a given Svelte runtime. This allows
 * bulk operations to be performed across all apps.
 */
export class TJSAppIndex
{
   /**
    * Stores all visible / rendered apps.
    *
    * @type {Map<string, import('#svelte-fvtt/application').SvelteApp>}
    */
   static #visibleApps = new Map();

   /**
    * Adds a SvelteApp to all visible apps tracked.
    *
    * @param {import('#svelte-fvtt/application').SvelteApp} app - A SvelteApp
    *
    * @package
    */
   static add(app)
   {
      this.#visibleApps.set(app.id, app);
   }

   /**
    * Removes a SvelteApp from all visible apps tracked.
    *
    * @param {import('#svelte-fvtt/application').SvelteApp} app - A SvelteApp
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
    * @returns {import('#svelte-fvtt/application').SvelteApp} Associated app.
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
    * @returns {IterableIterator<import('#svelte-fvtt/application').SvelteApp>} All visible apps.
    */
   static values()
   {
      return this.#visibleApps.values();
   }
}
