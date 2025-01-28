import { CrossWindow }           from '#runtime/util/browser';

import { TJSGameSettings }       from './TJSGameSettings';

import type {
   Subscriber,
   Unsubscriber }                from 'svelte/store';

import type { MinimalWritable }  from '#runtime/svelte/store/util';

/**
 * Provides an accessible JS object that is updated reactively from all or subset of TJSGameSettings stores.
 * Accessors are provided to directly get / set current setting data. Using a setter will update the setting and backing
 * store.
 *
 * TJSLiveGameSettings is also a readable Svelte store essentially providing a customizable derived store of all
 * settings tracked.
 *
 * Note: You can create a JSDoc / `@typedef` to apply with `@type` and achieve typing support in IDEs for the
 * customizable live settings instance. Please see the example at the end of this source file on how to accomplish this
 * task.
 *
 * Note: Presently `TJSLiveGameSettings` is openly typed, but there will be a TypeScript friendly way to strongly type
 * additional instance properties.
 *
 * Note: When using from JS a second subscriber function argument is the key that was updated.
 * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
 *
 * Note: In the future this class will be reworked w/ Svelte 5 state handling.
 *
 * @example
 * ```js
 * // Example of creating a typedef to type your specific live game settings instance. Add all relevant `@property`
 * // entries.
 *
 * /**
 *  * @typedef {TJSLiveGameSettings} MyLiveGameSettings - Extend TJSLiveGameSettings and name this anything.
 *  *
 *  * @property {boolean} myBooleanSetting - Add property / type entries for setting keys associated w/ accessors.
 *  *\/
 *
 * /** @type {MyLiveGameSettings} *\/
 * const liveGameSettings = new TJSLiveGameSettings(gameSettings);
 * liveGameSettings.myBooleanSetting is now typed as a boolean.
 * ```
 */
export class TJSLiveGameSettings
{
   [key: string]: any;

   /**
    * Stores the current parsed game setting data.
    */
   #currentData: { [key: string]: unknown } = {};

   /**
    * Map of all game settings stores and unsubscribe functions currently subscribed.
    */
   #gameSettings: Map<string, { unsubscribe: Function, store: MinimalWritable<unknown> }> = new Map();

   /**
    * Stores readable subscribers of this instance.
    *
    * Note: When using from JS a second argument is the key that was updated.
    * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
    */
   #subscribers: ((value: TJSLiveGameSettings, key?: string) => void)[] = [];

   /**
    * Stores the last updated key.
    */
   #lastKey: string | undefined = void 0;

   /**
    * Creates a live binding against the setting stores. All settings are configured by default, but can also be
    * filtered by setting key with inclusive / exclusive Sets.
    *
    * @param gameSettings - A game settings instance to subscribe to...
    *
    * @param [options] - TJSLiveGameSettings options.
    *
    * @param [options.include] - A Set of setting keys to include from subscribing.
    *
    * @param [options.exclude] - A Set of setting keys to exclude from subscribing.
    */
   constructor(gameSettings: TJSGameSettings, { include, exclude }:
    { include?: Set<string>, exclude?: Set<string> } = {})
   {
      if (!(gameSettings instanceof TJSGameSettings))
      {
         throw new TypeError(`'gameSettings' is not a TJSGameSettings instance.`);
      }

      if (include !== void 0 && !CrossWindow.isSet(include)) { throw new TypeError(`'options.include' is not a Set.`); }
      if (exclude !== void 0 && !CrossWindow.isSet(exclude)) { throw new TypeError(`'options.exclude' is not a Set.`); }

      for (const setting of gameSettings.data())
      {
         const key: string = setting.key;

         // Skip any keys that are in the include set.
         if (include !== void 0 && !include.has(key)) { continue; }

         // Skip any keys that are in the exclude set.
         if (exclude !== void 0 && exclude.has(key)) { continue; }

         if (typeof this[key] === 'function' || key === 'lastKey')
         {
            console.warn(`TJSLiveGameSettings warning: key (${key}) shadows a function. Skipping key.`);
         }

         const store: MinimalWritable<unknown> | undefined = gameSettings.getStore(key);

         if (!store) { continue; }

         // Update this instance storing setting data by key.
         this.#gameSettings.set(key, {
            store,
            unsubscribe: store.subscribe((data: unknown): void =>
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
            get: (): unknown =>
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
            set: (data: any): void =>
            {
               if (this.#currentData === void 0)
               {
                  throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
               }
               else
               {
                  this.#gameSettings.get(key)?.store.set(data);
               }
            }
         });
      }

      Object.seal(this);
   }

   /**
    * @returns Last updated setting key.
    */
   get lastKey(): string | undefined
   {
      return this.#lastKey;
   }

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
    */
   destroy(): void
   {
      for (const data of this.#gameSettings.values())
      {
         if (typeof data.unsubscribe === 'function') { data.unsubscribe(); }
      }

      this.#gameSettings.clear();
      this.#currentData = {};
   }

   /**
    * Returns an iterator / generator of all setting entries.
    *
    * @returns An iterator returning setting entries.
    */
   *entries(): IterableIterator<[key: string, value: any]>
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
    * @returns An iterator returning setting keys.
    */
   *keys(): IterableIterator<string>
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
    * @returns Tracked setting data.
    */
   toString(): string
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      return JSON.stringify(this.#currentData);
   }

   /**
    * Override to respond to setting update.
    *
    * @param key - The setting / local key that updated.
    */
   protected _update(key: string): void {}   // eslint-disable-line no-unused-vars

   /**
    * Returns an iterator / generator of all values.
    *
    * @returns An iterator returning setting values.
    */
   *values(): IterableIterator<any>
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield this.#currentData[key];
      }
   }

   // Readable store implementation ----------------------------------------------------------------------------------

   /**
    * @param handler - Callback function that is invoked on update / changes.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: (value: TJSLiveGameSettings, key?: string) => void): Unsubscriber
   {
      this.#subscribers.push(handler); // add handler to the array of subscribers

      handler(this, void 0);             // call handler with current value

      // Return unsubscribe function.
      return (): void =>
      {
         const index: number = this.#subscribers.findIndex((sub: Subscriber<any>): boolean => sub === handler);
         if (index >= 0) { this.#subscribers.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers.
    *
    * @param key - The key that was updated.
    */
   #updateSubscribers(key: string): void
   {
      for (let cntr: number = 0; cntr < this.#subscribers.length; cntr++) { this.#subscribers[cntr](this, key); }
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
