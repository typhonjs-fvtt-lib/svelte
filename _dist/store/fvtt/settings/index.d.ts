import * as svelte_store from 'svelte/store';

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
declare class TJSGameSettings {
  /**
   * Creates the TJSGameSettings instance.
   *
   * @param {string}   namespace - The namespace for all settings.
   */
  constructor(namespace: string);
  /**
   * @returns {string} Returns namespace set in constructor.
   */
  get namespace(): string;
  /**
   * Returns a readable Game Settings store for the associated key.
   *
   * @param {string}   key - Game setting key.
   *
   * @returns {import('svelte/store').Readable | undefined} The associated store for the given game setting key.
   */
  getReadableStore(key: string): svelte_store.Readable<any> | undefined;
  /**
   * Returns a writable Game Settings store for the associated key.
   *
   * @param {string}   key - Game setting key.
   *
   * @returns {import('svelte/store').Writable | undefined} The associated store for the given game setting key.
   */
  getStore(key: string): svelte_store.Writable<any> | undefined;
  /**
   * Returns a writable Game Settings store for the associated key.
   *
   * @param {string}   key - Game setting key.
   *
   * @returns {import('svelte/store').Writable | undefined} The associated store for the given game setting key.
   */
  getWritableStore(key: string): svelte_store.Writable<any> | undefined;
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
  register(setting: GameSetting, coreConfig?: boolean): Function;
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
  registerAll(
    settings: Iterable<GameSetting>,
    coreConfig: boolean,
  ): {
    [key: string]: Function;
  };
  /**
   * Returns an iterable for the game setting data; {@link GameSettingData}.
   *
   * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
   *
   * @returns {IterableIterator<GameSettingData>} Iterable iterator of GameSettingData.
   * @yields {GameSettingData}
   */
  data(regex?: RegExp): IterableIterator<GameSettingData>;
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
  entries<T>(regex?: RegExp): IterableIterator<[string, svelte_store.Writable<T>]>;
  /**
   * Returns an iterable for the game setting keys from existing stores.
   *
   * @param {RegExp} [regex] - Optional regular expression to filter by game setting keys.
   *
   * @returns {IterableIterator<string>} Iterable iterator of game setting keys.
   * @yields {string}
   */
  keys(regex?: RegExp): IterableIterator<string>;
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
  stores<T>(regex?: RegExp): IterableIterator<svelte_store.Writable<T>>;
  #private;
}
type GameSettingOptions = {
  /**
   * If choices are defined, the resulting setting will be a select menu.
   */
  choices?: object;
  /**
   * Specifies that the setting appears in the configuration view.
   */
  config?: boolean;
  /**
   * A default value for the setting.
   */
  default?: any;
  /**
   * A description of the registered setting and its behavior.
   */
  hint?: string;
  /**
   * The displayed name of the setting.
   */
  name?: string;
  /**
   * An onChange callback function or iterable list of callbacks to
   * directly receive callbacks from Foundry on setting change.
   */
  onChange?: Function | Iterable<Function>;
  /**
   * If range is specified, the resulting setting will be
   * a range slider.
   */
  range?: {
    min: number;
    max: number;
    step: number;
  };
  /**
   * If true then a prompt to reload after changes occurs.
   */
  requiresReload?: boolean;
  /**
   * Scope for setting.
   */
  scope?: 'client' | 'world';
  /**
   * A constructable object or function.
   */
  type: object | Function;
};
/**
 * Defines a game setting.
 */
type GameSetting = {
  /**
   * The setting namespace; usually the ID of the module / system.
   */
  namespace: string;
  /**
   * The setting key to register.
   */
  key: string;
  /**
   * The name of the TJSSvgFolder to put this setting in to group them.
   */
  folder?: string;
  /**
   * An existing store instance to use.
   */
  store?: svelte_store.Writable<any>;
  /**
   * Configuration for setting data.
   */
  options: GameSettingOptions;
};
/**
 * Stores the primary TJS game setting keys w/ GameSettingOptions.
 */
type GameSettingData = GameSettingOptions;

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
declare class TJSLiveGameSettings {
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
   * @returns {string} Last updated setting key.
   */
  get lastKey(): string;
  /**
   * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
   */
  destroy(): void;
  /**
   * Returns an iterator / generator of all setting entries.
   *
   * @returns {IterableIterator<[key: string, value: any]>} An iterator returning setting entries.
   * @yields {[key: string, value: any]}
   */
  entries(): IterableIterator<[key: string, value: any]>;
  /**
   * Returns an iterator / generator of all setting keys.
   *
   * @returns {IterableIterator<string>} An iterator returning setting keys.
   * @yields {string}
   */
  keys(): IterableIterator<string>;
  /**
   * Returns a string / JSON stringify of the current setting data.
   *
   * @returns {string} Tracked setting data.
   */
  toString(): string;
  /**
   * Override to respond to setting update.
   *
   * @param {string} key - The setting / local key that updated.
   *
   * @protected
   */
  protected _update(key: string): void;
  /**
   * Returns an iterator / generator of all values.
   *
   * @returns {IterableIterator<any>} An iterator returning setting values.
   * @yields {any}
   */
  values(): IterableIterator<any>;
  /**
   * @param {(value: TJSLiveGameSettings, key?: string) => void} handler - Callback function that is invoked on
   * update / changes.
   *
   * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
   */
  subscribe(handler: (value: TJSLiveGameSettings, key?: string) => void): svelte_store.Unsubscriber;
  #private;
}

export { type GameSetting, type GameSettingData, type GameSettingOptions, TJSGameSettings, TJSLiveGameSettings };
