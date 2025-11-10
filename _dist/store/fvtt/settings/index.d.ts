import { Readable, Unsubscriber } from 'svelte/store';
import { MinimalWritable } from '@typhonjs-svelte/runtime-base/svelte/store/util';

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
declare class TJSGameSettings<ExtraProps extends Record<string, any> = {}> {
  #private;
  /**
   * Creates the TJSGameSettings instance.
   *
   * @param namespace - The namespace for all settings.
   *
   * @param options - TJSGameSetting options.
   */
  constructor(namespace: string, { strictUserScoping }?: TJSGameSettings.Options.Ctor);
  /**
   * @returns Returns namespace set in constructor.
   */
  get namespace(): string;
  /**
   * @returns Number of stores managed.
   */
  get size(): number;
  /**
   * Returns a readable Game Settings store for the associated key.
   *
   * @param key - Game setting key.
   *
   * @returns The associated store for the given game setting key.
   */
  getReadableStore<T>(key: string): Readable<T> | undefined;
  /**
   * Returns a writable Game Settings store for the associated key.
   *
   * @param key - Game setting key.
   *
   * @returns The associated store for the given game setting key.
   */
  getStore<T>(key: string): MinimalWritable<T> | undefined;
  /**
   * Returns a writable Game Settings store for the associated key.
   *
   * @param key - Game setting key.
   *
   * @returns The associated store for the given game setting key.
   */
  getWritableStore<T>(key: string): MinimalWritable<T> | undefined;
  /**
   * Returns whether a Game Settings store exist for the given key.
   *
   * @param key - Setting key to test.
   */
  hasStore(key: string): boolean;
  /**
   * Registers a setting with TJSGameSettings and Foundry core.
   *
   * @param setting - A GameSetting instance to set to Foundry game settings.
   *
   * @param coreConfig - When false this overrides the `setting.options.config` parameter when registering the setting
   *        with Foundry. This allows the settings to be displayed in the app itself, but removed from the standard
   *        Foundry configuration location.
   */
  register(setting: TJSGameSettings.Options.GameSetting<ExtraProps>, coreConfig?: boolean): void;
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
  registerAll(settings: Iterable<TJSGameSettings.Options.GameSetting<ExtraProps>>, coreConfig?: boolean): void;
  /**
   * Returns an iterable for the game setting data; {@link TJSGameSettings.Data.GameSetting}.
   *
   * @param [regex] - Optional regular expression to filter by game setting keys.
   *
   * @returns Iterable iterator of `TJSGameSettings.Data.GameSetting`.
   */
  data(regex?: RegExp | undefined): IterableIterator<TJSGameSettings.Data.GameSetting<ExtraProps>>;
  /**
   * Returns an iterable for the game setting keys and stores.
   *
   * @param [regex] - Optional regular expression to filter by game setting keys.
   *
   * @typeParam T - Store data type.
   *
   * @returns Iterable iterator of keys and stores.
   */
  entries<T>(regex?: RegExp | undefined): IterableIterator<[string, MinimalWritable<T>]>;
  /**
   * Returns an iterable for the game setting keys from existing stores.
   *
   * @param [regex] - Optional regular expression to filter by game setting keys.
   *
   * @returns Iterable iterator of game setting keys.
   */
  keys(regex?: RegExp | undefined): IterableIterator<string>;
  /**
   * Returns an iterable for the game setting stores.
   *
   * @param [regex] - Optional regular expression to filter by game setting keys.
   *
   * @returns Iterable iterator of stores.
   */
  stores<T>(regex?: RegExp | undefined): IterableIterator<MinimalWritable<T>>;
}
declare namespace TJSGameSettings {
  namespace Data {
    /**
     * Stores the primary TJS game setting keys w/ GameSettingOptions.
     */
    interface GameSettingBase {
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
    type GameSetting<ExtraProps extends Record<string, any> = {}> = GameSettingBase & ExtraProps;
  }
  namespace Options {
    /**
     * Defines constructor options for TJSGameSettings.
     */
    interface Ctor {
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
    interface CoreSetting {
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
      onChange?: (
        value: any,
        options?: {
          [key: string]: any;
        },
        userId?: string,
      ) => void | Iterable<
        (
          value: any,
          options?: {
            [key: string]: any;
          },
          userId?: string,
        ) => void
      >;
      /**
       * If range is specified, the resulting setting will be a range slider.
       */
      range?: {
        min: number;
        max: number;
        step?: number;
      };
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
      type:
        | NumberConstructor
        | StringConstructor
        | BooleanConstructor
        | ObjectConstructor
        | ArrayConstructor
        | (new (...args: any[]) => fvtt.DataModel)
        | ((data: unknown) => unknown);
    }
    /**
     * Defines a game setting.
     */
    interface GameSettingBase {
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
    type GameSetting<ExtraProps extends Record<string, any> = {}> = GameSettingBase & ExtraProps;
  }
}

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
declare class TJSLiveGameSettings {
  #private;
  [key: string]: any;
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
  constructor(
    gameSettings: TJSGameSettings,
    {
      include,
      exclude,
    }?: {
      include?: Set<string>;
      exclude?: Set<string>;
    },
  );
  /**
   * @returns Last updated setting key.
   */
  get lastKey(): string | undefined;
  /**
   * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
   */
  destroy(): void;
  /**
   * Returns an iterator / generator of all setting entries.
   *
   * @returns An iterator returning setting entries.
   */
  entries(): IterableIterator<[key: string, value: any]>;
  /**
   * Returns an iterator / generator of all setting keys.
   *
   * @returns An iterator returning setting keys.
   */
  keys(): IterableIterator<string>;
  /**
   * Returns a string / JSON stringify of the current setting data.
   *
   * @returns Tracked setting data.
   */
  toString(): string;
  /**
   * Override to respond to setting update.
   *
   * @param key - The setting / local key that updated.
   */
  protected _update(key: string): void;
  /**
   * Returns an iterator / generator of all values.
   *
   * @returns An iterator returning setting values.
   */
  values(): IterableIterator<any>;
  /**
   * @param handler - Callback function that is invoked on update / changes.
   *
   * @returns Unsubscribe function.
   */
  subscribe(handler: (value: TJSLiveGameSettings, key?: string) => void): Unsubscriber;
}

export { TJSGameSettings, TJSLiveGameSettings };
