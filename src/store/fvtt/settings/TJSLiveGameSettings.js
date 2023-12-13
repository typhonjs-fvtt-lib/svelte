import { TJSGameSettings } from './TJSGameSettings.js';

/**
 * Provides an accessible JS object that is updated reactively from all or subset of TJSGameSettings stores.
 * Accessors are provided to directly get / set current setting data. Using a setter will update the setting and backing
 * store.
 *
 * Note: You can create a JSDoc / `@typedef` to apply with `@type` and achieve typing support in IDEs for the
 * customizable live settings instance. Please see the example at the end of this source file on how to accomplish this
 * task.
 *
 * TJSLiveGameSettings is also a readable Svelte store essentially providing a customizable derived store of all
 * settings tracked.
 *
 * Note: When using from JS a second subscriber function argument is the key that was updated.
 * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
 */
export class TJSLiveGameSettings
{
   /**
    * Stores the current parsed game setting data.
    *
    * @type {{}}
    */
   #currentData = {};

   /**
    * Map of all game settings stores and unsubscribe functions currently subscribed.
    *
    * @type {Map<string, { unsubscribe: Function, store: import('svelte/store').Writable }>}
    */
   #gameSettings = new Map();

   /**
    * Stores readable subscribers of this instance.
    *
    * Note: When using from JS a second argument is the key that was updated.
    * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
    *
    * @type {((value: TJSLiveGameSettings, key?: string) => void)[]}
    */
   #subscriptions = [];

   /**
    * Stores the last updated key.
    *
    * @type {string}
    */
   #lastKey = void 0;

   /**
    * Creates a live binding against the setting stores. All settings are configured by default, but can also be
    * filtered by setting key with inclusive / exclusive Sets.
    *
    * @param {TJSGameSettings}   gameSettings - A game settings instance to subscribe to...
    *
    * @param {object}            [options] - TJSLiveGameSettings options.
    *
    * @param {Set<string>}       [options.include] - A Set of setting keys to include from subscribing.
    *
    * @param {Set<string>}       [options.exclude] - A Set of setting keys to exclude from subscribing.
    */
   constructor(gameSettings, { include, exclude } = {})
   {
      if (!(gameSettings instanceof TJSGameSettings))
      {
         throw new TypeError(`'gameSettings' is not a TJSGameSettings instance.`);
      }

      if (include !== void 0 && !(include instanceof Set)) { throw new TypeError(`'options.include' is not a Set.`); }
      if (exclude !== void 0 && !(exclude instanceof Set)) { throw new TypeError(`'options.exclude' is not a Set.`); }

      for (const setting of gameSettings.data())
      {
         const key = setting.key;

         // Skip any keys that are in the include set.
         if (include !== void 0 && !include.has(key)) { continue; }

         // Skip any keys that are in the exclude set.
         if (exclude !== void 0 && exclude.has(key)) { continue; }

         if (typeof this[key] === 'function' || key === 'lastKey')
         {
            console.warn(`TJSLiveGameSettings warning: key (${key}) shadows a function. Skipping key.`);
         }

         const store = gameSettings.getStore(key);

         // Update this instance storing setting data by key.
         this.#gameSettings.set(key, {
            store,
            unsubscribe: store.subscribe((data) =>
            {
               if (this.#currentData !== void 0) { this.#currentData[key] = data; }

               this.#lastKey = key;

               // Notify any child instance that a particular key has updated.
               this._update(key);

               // Notify any readable store subscribers.
               this.#updateSubscribers(key);
            })
         });

         // Define new accessors for setting key.
         Object.defineProperty(this, key, {
            get: () =>
            {
               if (this.#currentData === void 0)
               {
                  throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
               }
               else
               {
                  return this.#currentData[key];
               }
            },
            set: (data) =>
            {
               if (this.#currentData === void 0)
               {
                  throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
               }
               else
               {
                  this.#gameSettings.get(key).store.set(data);
               }
            }
         });
      }

      Object.seal(this);
   }

   /**
    * @returns {string} Last updated setting key.
    */
   get lastKey()
   {
      return this.#lastKey;
   }

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
    */
   destroy()
   {
      for (const data of this.#gameSettings)
      {
         if (typeof data.unsubscribe === 'function') { data.unsubscribe(); }
      }

      this.#gameSettings.clear();
      this.#currentData = void 0;
   }

   /**
    * Returns an iterator / generator of all setting entries.
    *
    * @returns {IterableIterator<[key: string, value: any]>} An iterator returning setting entries.
    * @yields {[key: string, value: any]}
    */
   *entries()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield [key, this.#currentData[key]];
      }
   }

   /**
    * Returns an iterator / generator of all setting keys.
    *
    * @returns {IterableIterator<string>} An iterator returning setting keys.
    * @yields {string}
    */
   *keys()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield key;
      }
   }

   /**
    * Returns a string / JSON stringify of the current setting data.
    *
    * @returns {string} Tracked setting data.
    */
   toString()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      return JSON.stringify(this.#currentData);
   }

   /**
    * Override to respond to setting update.
    *
    * @param {string} key - The setting / local key that updated.
    *
    * @protected
    */
   _update(key) {}   // eslint-disable-line no-unused-vars

   /**
    * Returns an iterator / generator of all values.
    *
    * @returns {IterableIterator<any>} An iterator returning setting values.
    * @yields {any}
    */
   *values()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield this.#currentData[key];
      }
   }

   // Readable store implementation ----------------------------------------------------------------------------------

   /**
    * @param {(value: TJSLiveGameSettings, key?: string) => void} handler - Callback function that is invoked on
    * update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this, void 0);             // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers.
    *
    * @param {string} key - The key that was updated.
    */
   #updateSubscribers(key)
   {
      const subscriptions = this.#subscriptions;
      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](this, key); }
   }
}

// Example of creating a typedef to type your specific live game settings instance. Add all relevant `@property`
// entries.
//
// /**
//  * @typedef {TJSLiveGameSettings} MyLiveGameSettings - Extend TJSLiveGameSettings and name this anything.
//  *
//  * @property {boolean} myBooleanSetting - Add property / type entries for setting keys associated w/ accessors.
//  */
//
// /** @type {MyLiveGameSettings} */
// const liveGameSettings = new TJSLiveGameSettings(gameSettings);
// liveGameSettings.myBooleanSetting is now typed as a boolean.
