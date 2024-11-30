import { writable } from 'svelte/store';
import { isMinimalWritableStore, subscribeIgnoreFirst } from '@typhonjs-svelte/runtime-base/svelte/store/util';
import { CrossWindow } from '@typhonjs-svelte/runtime-base/util/browser';
import { isObject, isIterable } from '@typhonjs-svelte/runtime-base/util/object';

/**
 * Registers game settings and creates a backing Svelte store for each setting. The Svelte store will update the
 * Foundry game settings and vice versa when changes occur to the Foundry game settings the updated data is set to the
 * store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
class TJSGameSettings
{
   /** @type {string} */
   #namespace;

   /** @type {GameSettingData[]} */
   #settings = [];

   /**
    * @type {Map<string, import('svelte/store').Writable>}
    */
   #stores = new Map();

   /**
    * Creates the TJSGameSettings instance.
    *
    * @param {string}   namespace - The namespace for all settings.
    */
   constructor(namespace)
   {
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      this.#namespace = namespace;
   }

   /**
    * Creates a new writable for the given key.
    *
    * @param {*}  initialValue - An initial value to set to new stores.
    *
    * @returns {import('svelte/store').Writable} The new writable.
    */
   static #createStore(initialValue)
   {
      return writable(initialValue);
   }

   /**
    * @returns {string} Returns namespace set in constructor.
    */
   get namespace()
   {
      return this.#namespace;
   }

   /**
    * Gets a store from the `stores` Map or creates a new store for the key.
    *
    * @param {string}   key - Key to lookup in stores map.
    *
    * @param {string}   [initialValue] - An initial value to set to new stores.
    *
    * @returns {import('svelte/store').Writable} The store for the given key.
    */
   #getStore(key, initialValue)
   {
      let store = this.#stores.get(key);
      if (store === void 0)
      {
         store = TJSGameSettings.#createStore(initialValue);
         this.#stores.set(key, store);
      }

      return store;
   }

   /**
    * Returns a readable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Readable | undefined} The associated store for the given game setting key.
    */
   getReadableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getReadableStore: '${key}' is not a registered setting.`);
         return;
      }

      const store = this.#getStore(key);

      return { subscribe: store.subscribe };
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Writable | undefined} The associated store for the given game setting key.
    */
   getStore(key)
   {
      return this.getWritableStore(key);
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Writable | undefined} The associated store for the given game setting key.
    */
   getWritableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getWritableStore: '${key}' is not a registered setting.`);
         return;
      }

      return this.#getStore(key);
   }

   /**
    * Registers a setting with TJSGameSettings and Foundry core.
    *
    * Note: The specific store subscription handler assigned to the passed in store or store created for the setting
    * internally is returned from this function. In some cases when setting up custom stores particularly of object
    * types with several child property stores (`propertyStore`) it is necessary to only update the setting store and
    * not all subscribers to the custom store as the `propertyStore` instances are also subscribers to the custom store.
    *
    * This allows the custom store in the `set` implementation to mainly only trigger the TJSGameSettings subscriber
    * handler on updates and not all the connected `propertyStore` instances.
    *
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    *
    * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
    *                                   registering the setting with Foundry. This allows the settings to be displayed
    *                                   in the app itself, but removed from the standard Foundry configuration location.
    *
    * @returns {Function} The specific store subscription handler assigned to the passed in store.
    */
   register(setting, coreConfig = true)
   {
      if (!isObject(setting))
      {
         throw new TypeError(`TJSGameSettings - register: setting is not an object.`);
      }

      if (!isObject(setting.options))
      {
         throw new TypeError(`TJSGameSettings - register: 'setting.options' attribute is not an object.`);
      }

      if (typeof coreConfig !== 'boolean')
      {
         throw new TypeError(`TJSGameSettings - register: 'coreConfig' is not an boolean.`);
      }

      if (setting.store !== void 0 && !isMinimalWritableStore(setting.store))
      {
         throw new TypeError(
          `TJSGameSettings - register: 'setting.store' attribute is not a minimal writable store.`);
      }

      const namespace = setting.namespace;
      const key = setting.key;
      const folder = setting.folder;

      // The `config` parameter passed to Foundry core.
      const foundryConfig = coreConfig ? setting.options.config : false;

      if (typeof namespace !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'namespace' attribute is not a string.`);
      }

      if (typeof key !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'key' attribute is not a string.`);
      }

      if (folder !== void 0 && typeof folder !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'folder' attribute is not a string.`);
      }

      const store = setting.store;

      /**
       * @type {GameSettingOptions}
       */
      const options = setting.options;

      const onchangeFunctions = [];

      // When true prevents local store subscription from a loop when values are object data.
      let gateSet = false;

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value) =>
      {
         const callbackStore = this.#getStore(key);
         if (callbackStore && !gateSet)
         {
            gateSet = true;
            callbackStore.set(value);
            gateSet = false;
         }
      });

      // Handle loading any existing `onChange` callbacks.
      if (isIterable(options?.onChange))
      {
         for (const entry of options.onChange)
         {
            if (typeof entry === 'function') { onchangeFunctions.push(entry); }
         }
      }
      else if (typeof options.onChange === 'function')
      {
         onchangeFunctions.push(options.onChange);
      }

      // Provides the final onChange callback that iterates over all the stored onChange callbacks.
      const onChange = (value) =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      globalThis.game.settings.register(namespace, key, { ...options, config: foundryConfig, onChange });

      // Set new store value with existing setting or default value.
      const targetStore = store ? store : this.#getStore(key, globalThis.game.settings.get(namespace, key));

      // If a store instance is passed into register then initialize it with game settings data.
      if (store)
      {
         this.#stores.set(key, targetStore);
         store.set(globalThis.game.settings.get(namespace, key));
      }

      const storeHandler = async (value) =>
      {
         if (!gateSet)
         {
            gateSet = true;
            await globalThis.game.settings.set(namespace, key, value);
         }

         gateSet = false;
      };

      // Subscribe to self to set associated game setting on updates after verifying that the new value does not match
      // existing game setting.
      subscribeIgnoreFirst(targetStore, storeHandler);

      const gameSettingData = {
         namespace,
         key,
         folder,
         ...options
      };

      Object.freeze(gameSettingData);

      this.#settings.push(gameSettingData);

      return storeHandler;
   }

   /**
    * Registers multiple settings.
    *
    * Please refer to the note in {@link TJSGameSettings.register} about the returned object of store subscriber handler
    * functions.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    *
    * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
    *                                   registering the setting with Foundry. This allows the settings to be displayed
    *                                   in the app itself, but removed from the standard Foundry configuration location.
    *
    * @returns { {[key: string]: Function} } An object containing all TJSGameSetting store subscriber handlers for each
    *          setting `key` added.
    */
   registerAll(settings, coreConfig)
   {
      /** @type { {[key: string]: Function} } */
      const storeHandlers = {};

      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings)
      {
         if (!isObject(entry))
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
         }

         if (typeof entry.namespace !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'namespace' attribute.`);
         }

         if (typeof entry.key !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
         }

         if (!isObject(entry.options))
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'options' attribute.`);
         }

         storeHandlers[entry.key] = this.register(entry, coreConfig);
      }

      return storeHandlers;
   }

   // Iterators ------------------------------------------------------------------------------------------------------

   /**
    * Returns an iterable for the game setting data; {@link GameSettingData}.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns {IterableIterator<GameSettingData>} Iterable iterator of GameSettingData.
    * @yields {GameSettingData}
    */
   *data(regex = void 0)
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#settings.length) { return void 0; }

      if (regex)
      {
         for (const setting of this.#settings)
         {
            if (regex.test(setting.key)) { yield setting; }
         }
      }
      else
      {
         for (const setting of this.#settings) { yield setting; }
      }
   }

   /**
    * @template T
    *
    * Returns an iterable for the game setting keys and stores.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns {IterableIterator<[string, import('svelte/store').Writable<T>]>} Iterable iterator of keys and stores.
    * @yields {import('svelte/store').Writable<T>}
    */
   *entries(regex = void 0)
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#stores.size) { return void 0; }

      if (regex)
      {
         for (const key of this.#stores.keys())
         {
            if (regex.test(key)) { yield [key, this.getStore(key)]; }
         }
      }
      else
      {
         for (const key of this.#stores.keys()) { yield [key, this.getStore(key)]; }
      }
   }

   /**
    * Returns an iterable for the game setting keys from existing stores.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns {IterableIterator<string>} Iterable iterator of game setting keys.
    * @yields {string}
    */
   *keys(regex = void 0)
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#stores.size) { return void 0; }

      if (regex)
      {
         for (const key of this.#stores.keys())
         {
            if (regex.test(key)) { yield key; }
         }
      }
      else
      {
         for (const key of this.#stores.keys()) { yield key; }
      }
   }

   /**
    * @template T
    *
    * Returns an iterable for the game setting stores.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns {IterableIterator<import('svelte/store').Writable<T>>} Iterable iterator of stores.
    * @yields {import('svelte/store').Writable<T>}
    */
   *stores(regex = void 0)
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#stores.size) { return void 0; }

      if (regex)
      {
         for (const key of this.#stores.keys())
         {
            if (regex.test(key)) { yield this.getStore(key); }
         }
      }
      else
      {
         for (const key of this.#stores.keys()) { yield this.getStore(key); }
      }
   }
}

/**
 * @typedef {object} GameSettingOptions
 *
 * @property {object} [choices] If choices are defined, the resulting setting will be a select menu.
 *
 * @property {boolean} [config=true] Specifies that the setting appears in the configuration view.
 *
 * @property {*} [default] A default value for the setting.
 *
 * @property {string} [hint] A description of the registered setting and its behavior.
 *
 * @property {string} [name] The displayed name of the setting.
 *
 * @property {Function|Iterable<Function>} [onChange] An onChange callback function or iterable list of callbacks to
 * directly receive callbacks from Foundry on setting change.
 *
 * @property {{min: number, max: number, step: number}} [range] If range is specified, the resulting setting will be
 * a range slider.
 *
 * @property {boolean} [requiresReload=false] If true then a prompt to reload after changes occurs.
 *
 * @property {('client' | 'world')} [scope='client'] Scope for setting.
 *
 * @property {object|Function} type A constructable object or function.
 */

/**
 * @typedef {object} GameSetting Defines a game setting.
 *
 * @property {string} namespace The setting namespace; usually the ID of the module / system.
 *
 * @property {string} key The setting key to register.
 *
 * @property {string} [folder] The name of the TJSSvgFolder to put this setting in to group them.
 *
 * @property {import('svelte/store').Writable} [store] An existing store instance to use.
 *
 * @property {GameSettingOptions} options Configuration for setting data.
 */

/**
 * @typedef {GameSettingOptions} GameSettingData Stores the primary TJS game setting keys w/ GameSettingOptions.
 *
 * @property {string} namespace The setting namespace; usually the ID of the module / system.
 *
 * @property {string} key The setting key to register.
 *
 * @property {string} [folder] The name of the TJSSvgFolder to put this setting in to group them.
 */

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
class TJSLiveGameSettings
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

      if (include !== void 0 && !CrossWindow.isSet(include)) { throw new TypeError(`'options.include' is not a Set.`); }
      if (exclude !== void 0 && !CrossWindow.isSet(exclude)) { throw new TypeError(`'options.exclude' is not a Set.`); }

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

export { TJSGameSettings, TJSLiveGameSettings };
//# sourceMappingURL=index.js.map
