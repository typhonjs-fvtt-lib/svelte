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

/**
 * Registers game settings and creates a backing Svelte store for each setting. The Svelte store will update the
 * Foundry game settings and vice versa when changes occur to the Foundry game settings the updated data is set to the
 * store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * @typeParam `ExtraProps` - Defines additional properties for game setting options / data that child implementations
 * may define.
 *
 * @privateRemarks
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
class TJSGameSettings<ExtraProps extends Record<string, any> = {}>
{
   /**
    */
   readonly #namespace: string;

   /**
    * When true, strict user scoping is verified `user` scoped settings for all game setting `onChange` callbacks.
    */
   readonly #strictUserScoping: boolean;

   /**
    */
   #settings: TJSGameSettings.Data.GameSetting<ExtraProps>[] = [];

   /**
    */
   #stores: Map<string, MinimalWritable<any>> = new Map();

   /**
    * Creates the TJSGameSettings instance.
    *
    * @param namespace - The namespace for all settings.
    *
    * @param options - TJSGameSetting options.
    */
   constructor(namespace: string, { strictUserScoping = true }: TJSGameSettings.Options.Ctor = {})
   {
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      if (typeof strictUserScoping !== 'boolean') { throw new TypeError(`'strictUserScoping' is not a boolean.`); }

      this.#namespace = namespace;
      this.#strictUserScoping = strictUserScoping;
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
    * @param setting - A GameSetting instance to set to Foundry game settings.
    *
    * @param coreConfig - When false this overrides the `setting.options.config` parameter when registering the setting
    *        with Foundry. This allows the settings to be displayed in the app itself, but removed from the standard
    *        Foundry configuration location.
    */
   register(setting: TJSGameSettings.Options.GameSetting<ExtraProps>, coreConfig: boolean = true): void
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

      const store: MinimalWritable<any> | undefined = setting.store;

      const options: TJSGameSettings.Options.CoreSetting = setting.options;

      const verifyUserScope = options.scope === 'user' && this.#strictUserScoping;

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
      const onChange: (value: unknown, options: { [key: string]: any }, userId: string) => void =
       (value: any, options: { [key: string]: any }, userId: string): void =>
      {
         if (verifyUserScope && userId !== globalThis.game.userId) { return; }

         for (const entry of onchangeFunctions) { entry(value, options, userId); }
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

      // Transfer setting options to data.
      {
         const { store, ...rest } = setting;

         const gameSettingData: TJSGameSettings.Data.GameSetting<ExtraProps> = Object.assign({}, rest,
          { namespace, key, options }) as TJSGameSettings.Data.GameSetting<ExtraProps>;

         Object.freeze(gameSettingData);

         this.#settings.push(gameSettingData);
      }
   }

   /**
    * Registers multiple settings.
    *
    * @param settings - An iterable list of game setting configurations to register.
    *
    * @param coreConfig - When false this overrides the `setting.options.config` parameter when registering the setting
    *        with Foundry. This allows the settings to be displayed in the app itself, but removed from the standard
    *        Foundry configuration location.
    *
    * @returns An object containing all TJSGameSetting store subscriber handlers for each setting `key` added.
    */
   registerAll(settings: Iterable<TJSGameSettings.Options.GameSetting<ExtraProps>>, coreConfig?: boolean): void
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
    * Returns an iterable for the game setting data; {@link TJSGameSettings.Data.GameSetting}.
    *
    * @param [regex] - Optional regular expression to filter by game setting keys.
    *
    * @returns Iterable iterator of `TJSGameSettings.Data.GameSetting`.
    */
   *data(regex: RegExp | undefined = void 0): IterableIterator<TJSGameSettings.Data.GameSetting<ExtraProps>>
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

declare namespace TJSGameSettings
{
   export namespace Data {
      /**
       * Stores the primary TJS game setting keys w/ GameSettingOptions.
       */
      export interface GameSettingBase {
         /**
          * The setting key to register.
          */
         key: string;

         /**
          * The setting namespace; usually the ID of the package. If not provided the associated namespace with the
          * instance of `TJSGameSettings` will be used.
          */
         namespace: string;

         /**
          * Core game setting configuration options.
          */
         options: Options.CoreSetting;
      }

      /**
       * Defines the parsed game setting data with potential extra props.
       */
      export type GameSetting<ExtraProps extends Record<string, any> = {}> = GameSettingBase & ExtraProps;
   }

   export namespace Options {
      /**
       * Defines constructor options for TJSGameSettings.
       */
      export interface Ctor {
         /**
          * User scoped settings strictly verify `onChange` callbacks against current game user ID.
          *
          * @defaultValue `true`.
          */
         strictUserScoping?: boolean;
      }

      /**
       * Defines the core Foundry options for a game setting.
       */
      export interface CoreSetting {
         /**
          * If choices are defined, the resulting setting will be a select menu and `type` must be a `string`.
          */
         choices?: Record<string, string>;

         /**
          * Specifies that the setting appears in the configuration view; default: `true`.
          */
         config?: boolean;

         /**
          * A default value for the setting.
          */
         default: number | string | boolean | object;

         /**
          * Setting is a file picker and `type` must be a `string`. You may use a boolean for `any` file type or
          * select a specific file type.
          */
         filePicker?: boolean | 'any' | 'audio' | 'folder' | 'font' | 'image' | 'imagevideo' | 'text' | 'video';

         /**
          * A description of the registered setting and its behavior.
          */
         hint?: string;

         /**
          * The displayed name of the setting.
          */
         name?: string;

         /**
          * An onChange callback function or iterable list of callbacks to directly receive callbacks from Foundry on
          * setting change.
          */
         onChange?: (value: any, options?: { [key: string]: any }, userId?: string) => void |
          Iterable<(value: any, options?: { [key: string]: any }, userId?: string) => void>;

         /**
          * If range is specified, the resulting setting will be a range slider.
          */
         range?: { min: number; max: number; step?: number };

         /**
          * If true then a prompt to reload after changes occurs; default: `false`.
          */
         requiresReload?: boolean;

         /**
          * Scope for setting. `client` uses local storage, `world` is saved in Foundry DB for the World / only
          * accessible by GM for modification, and `user` is also saved in the Foundry DB associated w/ the current
          * user.
          */
         scope: 'client' | 'world' | 'user';

         /**
          * A constructable object, function, or DataModel.
          */
         type: NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor |
          (new (...args: any[]) => fvtt.DataModel) | ((data: unknown) => unknown);
      }

      /**
       * Defines a game setting.
       */
      export interface GameSettingBase {
         /**
          * The setting key to register.
          */
         key: string;

         /**
          * Core game setting configuration options.
          */
         options: Options.CoreSetting;

         /**
          * The setting namespace; usually the ID of the package. If not provided the associated namespace with the
          * instance of `TJSGameSettings` will be used.
          */
         namespace?: string;

         /**
          * An existing store instance to use.
          */
         store?: MinimalWritable<any>;
      }

      /**
       * Defines the game setting options with potential extra props.
       */
      export type GameSetting<ExtraProps extends Record<string, any> = {}> = GameSettingBase & ExtraProps;
   }
}

export { TJSGameSettings };
