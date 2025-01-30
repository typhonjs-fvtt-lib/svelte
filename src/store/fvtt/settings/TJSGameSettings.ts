import { writable }              from 'svelte/store';

import {
   isMinimalWritableStore,
   subscribeIgnoreFirst }        from '#runtime/svelte/store/util';

import { CrossWindow }           from '#runtime/util/browser';

import {
   isIterable,
   isObject }                    from '#runtime/util/object';

import type {
   Readable,
   Writable }                    from 'svelte/store';

import type { MinimalWritable }  from '#runtime/svelte/store/util';

import type {
   GameSetting,
   GameSettingData,
   CoreSettingOptions }          from './types';

/**
 * Registers game settings and creates a backing Svelte store for each setting. The Svelte store will update the
 * Foundry game settings and vice versa when changes occur to the Foundry game settings the updated data is set to the
 * store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * @privateRemarks
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
export class TJSGameSettings
{
   /**
    */
   readonly #namespace: string;

   /**
    */
   #settings: GameSettingData[] = [];

   /**
    */
   #stores: Map<string, MinimalWritable<any>> = new Map();

   /**
    * Creates the TJSGameSettings instance.
    *
    * @param namespace - The namespace for all settings.
    */
   constructor(namespace: string)
   {
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      this.#namespace = namespace;
   }

   /**
    * Creates a new writable for the given key.
    *
    * @param initialValue - An initial value to set to new stores.
    *
    * @returns The new writable.
    */
   static #createStore<T>(initialValue: any): Writable<T>
   {
      return writable(initialValue);
   }

   /**
    * @returns Returns namespace set in constructor.
    */
   get namespace(): string
   {
      return this.#namespace;
   }

   /**
    * Gets a store from the `stores` Map or creates a new store for the key.
    *
    * @param key - Key to lookup in stores map.
    *
    * @param [initialValue] - An initial value to set to new stores.
    *
    * @returns The store for the given key.
    */
   #getStore<T>(key: string, initialValue?: any): MinimalWritable<T>
   {
      let store: MinimalWritable<T> | undefined = this.#stores.get(key);
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
    * @param key - Game setting key.
    *
    * @returns The associated store for the given game setting key.
    */
   getReadableStore<T>(key: string): Readable<T> | undefined
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getReadableStore: '${key}' is not a registered setting.`);
         return;
      }

      const store: MinimalWritable<any> = this.#getStore(key);

      return { subscribe: store.subscribe };
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param key - Game setting key.
    *
    * @returns The associated store for the given game setting key.
    */
   getStore<T>(key: string): MinimalWritable<T> | undefined
   {
      return this.getWritableStore<T>(key);
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param key - Game setting key.
    *
    * @returns The associated store for the given game setting key.
    */
   getWritableStore<T>(key: string): MinimalWritable<T> | undefined
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
    * @param setting - A GameSetting instance to set to Foundry game settings.
    *
    * @param coreConfig - When false this overrides the `setting.options.config` parameter when registering the setting
    *        with Foundry. This allows the settings to be displayed in the app itself, but removed from the standard
    *        Foundry configuration location.
    */
   register(setting: GameSetting, coreConfig: boolean = true): void
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

      const namespace: string = setting.namespace ?? this.#namespace;
      const key: string = setting.key;
      const folder: string | undefined = setting.folder;

      // The `config` parameter passed to Foundry core.
      const foundryConfig: boolean = coreConfig ? setting.options.config ?? true : false;

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

      const store: MinimalWritable<any> | undefined = setting.store;

      const options: CoreSettingOptions = setting.options;

      const onchangeFunctions: Function[] = [];

      // When true prevents local store subscription from a loop when values are object data.
      let gateSet: boolean = false;

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value: any): void =>
      {
         const callbackStore: MinimalWritable<any> = this.#getStore(key);
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
      const onChange: (value: unknown) => void = (value: any): void =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      // @ts-expect-error PF2E types do not have partial aspects for `name`.
      globalThis.game.settings.register(namespace, key, { ...options, config: foundryConfig, onChange });

      // Set new store value with existing setting or default value.
      const targetStore: MinimalWritable<any> = store ? store : this.#getStore(key,
       globalThis.game.settings.get(namespace, key));

      // If a store instance is passed into register then initialize it with game settings data.
      if (store)
      {
         this.#stores.set(key, targetStore);
         store.set(globalThis.game.settings.get(namespace, key));
      }

      const storeHandler: (value: any) => Promise<void> = async (value: any): Promise<void> =>
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

      const gameSettingData: GameSettingData = {
         namespace,
         key,
         folder,
         options
      };

      Object.freeze(gameSettingData);

      this.#settings.push(gameSettingData);
   }

   /**
    * Registers multiple settings.
    *
    * Please refer to the note in {@link TJSGameSettings.register} about the returned object of store subscriber handler
    * functions.
    *
    * @param settings - An iterable list of game setting configurations to register.
    *
    * @param coreConfig - When false this overrides the `setting.options.config` parameter when registering the setting
    *        with Foundry. This allows the settings to be displayed in the app itself, but removed from the standard
    *        Foundry configuration location.
    *
    * @returns An object containing all TJSGameSetting store subscriber handlers for each setting `key` added.
    */
   registerAll(settings: Iterable<GameSetting>, coreConfig?: boolean): void
   {
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

         this.register(entry, coreConfig);
      }
   }

   // Iterators ------------------------------------------------------------------------------------------------------

   /**
    * Returns an iterable for the game setting data; {@link GameSettingData}.
    *
    * @param [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns Iterable iterator of GameSettingData.
    */
   *data(regex: RegExp | undefined = void 0): IterableIterator<GameSettingData>
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
    * Returns an iterable for the game setting keys and stores.
    *
    * @param [regex] - Optional regular expression to filter by game setting keys.
    *
    * @typeParam T - Store data type.
    *
    * @returns Iterable iterator of keys and stores.
    */
   *entries<T>(regex: RegExp | undefined = void 0): IterableIterator<[string, MinimalWritable<T>]>
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#stores.size) { return void 0; }

      if (regex)
      {
         for (const key of this.#stores.keys())
         {
            if (regex.test(key)) { yield [key, this.getStore<T>(key) as MinimalWritable<T>]; }
         }
      }
      else
      {
         for (const key of this.#stores.keys()) { yield [key, this.getStore<T>(key) as MinimalWritable<T>]; }
      }
   }

   /**
    * Returns an iterable for the game setting keys from existing stores.
    *
    * @param [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns Iterable iterator of game setting keys.
    */
   *keys(regex: RegExp | undefined = void 0): IterableIterator<string>
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
    * Returns an iterable for the game setting stores.
    *
    * @param [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns Iterable iterator of stores.
    */
   *stores<T>(regex: RegExp | undefined = void 0): IterableIterator<MinimalWritable<T>>
   {
      if (regex !== void 0 && !CrossWindow.isRegExp(regex)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#stores.size) { return void 0; }

      if (regex)
      {
         for (const key of this.#stores.keys())
         {
            if (regex.test(key)) { yield this.getStore(key) as MinimalWritable<T>; }
         }
      }
      else
      {
         for (const key of this.#stores.keys()) { yield this.getStore(key) as MinimalWritable<T>; }
      }
   }
}
