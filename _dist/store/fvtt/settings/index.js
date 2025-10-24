import { writable } from 'svelte/store';
import { isMinimalWritableStore, subscribeIgnoreFirst } from '@typhonjs-svelte/runtime-base/svelte/store/util';
import { CrossWindow } from '@typhonjs-svelte/runtime-base/util/browser';
import { isObject, isIterable } from '@typhonjs-svelte/runtime-base/util/object';

var _a;
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
class TJSGameSettings {
    /**
     */
    #namespace;
    /**
     * When true, strict user scoping is verified `user` scoped settings for all game setting `onChange` callbacks.
     */
    #strictUserScoping;
    /**
     */
    #settings = [];
    /**
     */
    #stores = new Map();
    /**
     * Creates the TJSGameSettings instance.
     *
     * @param namespace - The namespace for all settings.
     *
     * @param [options] - Options.
     *
     * @param [options.strictUserScoping] - User scoped settings strictly verify `onChange` callbacks against current
     *        game user ID; default: `true`.
     */
    constructor(namespace, { strictUserScoping = true } = {}) {
        if (typeof namespace !== 'string') {
            throw new TypeError(`'namespace' is not a string.`);
        }
        if (typeof strictUserScoping !== 'boolean') {
            throw new TypeError(`'strictUserScoping' is not a boolean.`);
        }
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
    static #createStore(initialValue) {
        return writable(initialValue);
    }
    /**
     * @returns Returns namespace set in constructor.
     */
    get namespace() {
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
    #getStore(key, initialValue) {
        let store = this.#stores.get(key);
        if (store === void 0) {
            store = _a.#createStore(initialValue);
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
    getReadableStore(key) {
        if (!this.#stores.has(key)) {
            console.warn(`TJSGameSettings - getReadableStore: '${key}' is not a registered setting.`);
            return;
        }
        const store = this.#getStore(key);
        return { subscribe: store.subscribe };
    }
    /**
     * Returns a writable Game Settings store for the associated key.
     *
     * @param key - Game setting key.
     *
     * @returns The associated store for the given game setting key.
     */
    getStore(key) {
        return this.getWritableStore(key);
    }
    /**
     * Returns a writable Game Settings store for the associated key.
     *
     * @param key - Game setting key.
     *
     * @returns The associated store for the given game setting key.
     */
    getWritableStore(key) {
        if (!this.#stores.has(key)) {
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
    register(setting, coreConfig = true) {
        if (!isObject(setting)) {
            throw new TypeError(`TJSGameSettings - register: setting is not an object.`);
        }
        if (!isObject(setting.options)) {
            throw new TypeError(`TJSGameSettings - register: 'setting.options' attribute is not an object.`);
        }
        if (typeof coreConfig !== 'boolean') {
            throw new TypeError(`TJSGameSettings - register: 'coreConfig' is not an boolean.`);
        }
        if (setting.store !== void 0 && !isMinimalWritableStore(setting.store)) {
            throw new TypeError(`TJSGameSettings - register: 'setting.store' attribute is not a minimal writable store.`);
        }
        const namespace = setting.namespace ?? this.#namespace;
        const key = setting.key;
        // The `config` parameter passed to Foundry core.
        const foundryConfig = coreConfig ? setting.options.config ?? true : false;
        if (typeof namespace !== 'string') {
            throw new TypeError(`TJSGameSettings - register: 'namespace' attribute is not a string.`);
        }
        if (typeof key !== 'string') {
            throw new TypeError(`TJSGameSettings - register: 'key' attribute is not a string.`);
        }
        const store = setting.store;
        const options = setting.options;
        const verifyUserScope = options.scope === 'user' && this.#strictUserScoping;
        const onchangeFunctions = [];
        // When true prevents local store subscription from a loop when values are object data.
        let gateSet = false;
        // Provides an `onChange` callback to update the associated store.
        onchangeFunctions.push((value) => {
            const callbackStore = this.#getStore(key);
            if (callbackStore && !gateSet) {
                gateSet = true;
                callbackStore.set(value);
                gateSet = false;
            }
        });
        // Handle loading any existing `onChange` callbacks.
        if (isIterable(options?.onChange)) {
            for (const entry of options.onChange) {
                if (typeof entry === 'function') {
                    onchangeFunctions.push(entry);
                }
            }
        }
        else if (typeof options.onChange === 'function') {
            onchangeFunctions.push(options.onChange);
        }
        // Provides the final onChange callback that iterates over all the stored onChange callbacks.
        const onChange = (value, options, userId) => {
            if (verifyUserScope && userId !== globalThis.game.userId) {
                return;
            }
            for (const entry of onchangeFunctions) {
                entry(value, options, userId);
            }
        };
        // @ts-expect-error PF2E types do not have partial aspects for `name`.
        globalThis.game.settings.register(namespace, key, { ...options, config: foundryConfig, onChange });
        // Set new store value with existing setting or default value.
        const targetStore = store ? store : this.#getStore(key, globalThis.game.settings.get(namespace, key));
        // If a store instance is passed into register then initialize it with game settings data.
        if (store) {
            this.#stores.set(key, targetStore);
            store.set(globalThis.game.settings.get(namespace, key));
        }
        const storeHandler = async (value) => {
            if (!gateSet) {
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
            const gameSettingData = Object.assign({}, rest, { namespace, key, options });
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
    registerAll(settings, coreConfig) {
        if (!isIterable(settings)) {
            throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`);
        }
        for (const entry of settings) {
            if (!isObject(entry)) {
                throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
            }
            if (typeof entry.namespace !== 'string') {
                throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'namespace' attribute.`);
            }
            if (typeof entry.key !== 'string') {
                throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
            }
            if (!isObject(entry.options)) {
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
    *data(regex = void 0) {
        if (regex !== void 0 && !CrossWindow.isRegExp(regex)) {
            throw new TypeError(`'regex' is not a RegExp`);
        }
        if (!this.#settings.length) {
            return void 0;
        }
        if (regex) {
            for (const setting of this.#settings) {
                if (regex.test(setting.key)) {
                    yield setting;
                }
            }
        }
        else {
            for (const setting of this.#settings) {
                yield setting;
            }
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
    *entries(regex = void 0) {
        if (regex !== void 0 && !CrossWindow.isRegExp(regex)) {
            throw new TypeError(`'regex' is not a RegExp`);
        }
        if (!this.#stores.size) {
            return void 0;
        }
        if (regex) {
            for (const key of this.#stores.keys()) {
                if (regex.test(key)) {
                    yield [key, this.getStore(key)];
                }
            }
        }
        else {
            for (const key of this.#stores.keys()) {
                yield [key, this.getStore(key)];
            }
        }
    }
    /**
     * Returns an iterable for the game setting keys from existing stores.
     *
     * @param [regex] - Optional regular expression to filter by game setting keys.
     *
     * @returns Iterable iterator of game setting keys.
     */
    *keys(regex = void 0) {
        if (regex !== void 0 && !CrossWindow.isRegExp(regex)) {
            throw new TypeError(`'regex' is not a RegExp`);
        }
        if (!this.#stores.size) {
            return void 0;
        }
        if (regex) {
            for (const key of this.#stores.keys()) {
                if (regex.test(key)) {
                    yield key;
                }
            }
        }
        else {
            for (const key of this.#stores.keys()) {
                yield key;
            }
        }
    }
    /**
     * Returns an iterable for the game setting stores.
     *
     * @param [regex] - Optional regular expression to filter by game setting keys.
     *
     * @returns Iterable iterator of stores.
     */
    *stores(regex = void 0) {
        if (regex !== void 0 && !CrossWindow.isRegExp(regex)) {
            throw new TypeError(`'regex' is not a RegExp`);
        }
        if (!this.#stores.size) {
            return void 0;
        }
        if (regex) {
            for (const key of this.#stores.keys()) {
                if (regex.test(key)) {
                    yield this.getStore(key);
                }
            }
        }
        else {
            for (const key of this.#stores.keys()) {
                yield this.getStore(key);
            }
        }
    }
}
_a = TJSGameSettings;

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
class TJSLiveGameSettings {
    /**
     * Stores the current parsed game setting data.
     */
    #currentData = {};
    /**
     * Map of all game settings stores and unsubscribe functions currently subscribed.
     */
    #gameSettings = new Map();
    /**
     * Stores readable subscribers of this instance.
     *
     * Note: When using from JS a second argument is the key that was updated.
     * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
     */
    #subscribers = [];
    /**
     * Stores the last updated key.
     */
    #lastKey = void 0;
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
    constructor(gameSettings, { include, exclude } = {}) {
        if (!(gameSettings instanceof TJSGameSettings)) {
            throw new TypeError(`'gameSettings' is not a TJSGameSettings instance.`);
        }
        if (include !== void 0 && !CrossWindow.isSet(include)) {
            throw new TypeError(`'options.include' is not a Set.`);
        }
        if (exclude !== void 0 && !CrossWindow.isSet(exclude)) {
            throw new TypeError(`'options.exclude' is not a Set.`);
        }
        for (const setting of gameSettings.data()) {
            const key = setting.key;
            // Skip any keys that are in the include set.
            if (include !== void 0 && !include.has(key)) {
                continue;
            }
            // Skip any keys that are in the exclude set.
            if (exclude !== void 0 && exclude.has(key)) {
                continue;
            }
            if (typeof this[key] === 'function' || key === 'lastKey') {
                console.warn(`TJSLiveGameSettings warning: key (${key}) shadows a function. Skipping key.`);
            }
            const store = gameSettings.getStore(key);
            if (!store) {
                continue;
            }
            // Update this instance storing setting data by key.
            this.#gameSettings.set(key, {
                store,
                unsubscribe: store.subscribe((data) => {
                    if (this.#currentData !== void 0) {
                        this.#currentData[key] = data;
                    }
                    this.#lastKey = key;
                    // Notify any child instance that a particular key has updated.
                    this._update(key);
                    // Notify any readable store subscribers.
                    this.#updateSubscribers(key);
                })
            });
            // Define new accessors for setting key.
            Object.defineProperty(this, key, {
                get: () => {
                    if (this.#currentData === void 0) {
                        throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
                    }
                    else {
                        return this.#currentData[key];
                    }
                },
                set: (data) => {
                    if (this.#currentData === void 0) {
                        throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
                    }
                    else {
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
    get lastKey() {
        return this.#lastKey;
    }
    // ----------------------------------------------------------------------------------------------------------------
    /**
     * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
     */
    destroy() {
        for (const data of this.#gameSettings.values()) {
            if (typeof data.unsubscribe === 'function') {
                data.unsubscribe();
            }
        }
        this.#gameSettings.clear();
        this.#currentData = {};
    }
    /**
     * Returns an iterator / generator of all setting entries.
     *
     * @returns An iterator returning setting entries.
     */
    *entries() {
        if (this.#currentData === void 0) {
            throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
        }
        for (const key in this.#currentData) {
            yield [key, this.#currentData[key]];
        }
    }
    /**
     * Returns an iterator / generator of all setting keys.
     *
     * @returns An iterator returning setting keys.
     */
    *keys() {
        if (this.#currentData === void 0) {
            throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
        }
        for (const key in this.#currentData) {
            yield key;
        }
    }
    /**
     * Returns a string / JSON stringify of the current setting data.
     *
     * @returns Tracked setting data.
     */
    toString() {
        if (this.#currentData === void 0) {
            throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
        }
        return JSON.stringify(this.#currentData);
    }
    /**
     * Override to respond to setting update.
     *
     * @param key - The setting / local key that updated.
     */
    _update(key) { } // eslint-disable-line no-unused-vars
    /**
     * Returns an iterator / generator of all values.
     *
     * @returns An iterator returning setting values.
     */
    *values() {
        if (this.#currentData === void 0) {
            throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
        }
        for (const key in this.#currentData) {
            yield this.#currentData[key];
        }
    }
    // Readable store implementation ----------------------------------------------------------------------------------
    /**
     * @param handler - Callback function that is invoked on update / changes.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscribers.push(handler); // add handler to the array of subscribers
        handler(this, void 0); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscribers.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscribers.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers.
     *
     * @param key - The key that was updated.
     */
    #updateSubscribers(key) {
        for (let cntr = 0; cntr < this.#subscribers.length; cntr++) {
            this.#subscribers[cntr](this, key);
        }
    }
}

export { TJSGameSettings, TJSLiveGameSettings };
//# sourceMappingURL=index.js.map
