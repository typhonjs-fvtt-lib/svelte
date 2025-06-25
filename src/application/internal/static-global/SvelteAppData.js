/**
 * Stores global tracking data for {@link SvelteApp}.
 *
 * This static instance is stored in `globalThis.TRL_SVELTE_APP_DATA`.
 */
export class SvelteAppData
{
   static #initialized = false;

   /**
    * @returns {number} Version number for SvelteAppData.
    */
   static get VERSION() { return 1; }

   static get alwaysOnTop() { return AlwaysOnTop; }

   static initialize()
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      const currentVersion = globalThis?.TRL_SVELTE_APP_DATA?.VERSION;

      if (typeof currentVersion !== 'number' || currentVersion < this.VERSION)
      {
         globalThis.TRL_SVELTE_APP_DATA = this;
      }
   }
}

/**
 * Provides global tracking data for the `alwaysOnTop` SvelteApp option.
 */
class AlwaysOnTop
{
   /**
    * Stores the max z-index.
    *
    * @type {number}
    */
   static #max = 2 ** 31 - 1000;

   /**
    * Stores the min z-index.
    *
    * @type {number}
    */
   static #min = 2 ** 31 - 100000;

   /**
    * Stores the current z-index for the top most `alwaysOnTop` app.
    *
    * @type {number}
    */
   static #current = this.#min;


   /**
    * @returns {number} Increments the current always on top z-index and returns it.
    */
   static getAndIncrement()
   {
      this.#current = Math.min(++this.#current, this.#max);

      return this.#current;
   }

   static get current() { return this.#current; }

   static get max() { return this.#max; }

   static get min() { return this.#min; }
}
