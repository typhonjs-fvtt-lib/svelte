import { writable }        from '#svelte/store';

import {
   isMinimalWritableStore,
   subscribeIgnoreFirst }  from '#runtime/svelte/store/util';

import {
   isIterable,
   isObject }              from '#runtime/util/object';

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
export class TJSGameSettings
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
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

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
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

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
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

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
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

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
