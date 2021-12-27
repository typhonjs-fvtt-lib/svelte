import * as svelte_store from 'svelte/store';
import { noop } from 'svelte/types/runtime/internal/utils';
import { get } from 'svelte/types/runtime/store';

/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type LSStore = ((key: any, value: any, start?: typeof noop) => {
    set: (new_value: any) => void;
    update: (fn: any) => void;
    subscribe: (run: any, invalidate?: typeof noop) => svelte_store.Unsubscriber;
}) & typeof get;
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type SSStore = ((key: any, value: any, start?: typeof noop) => {
    set: (new_value: any) => void;
    update: (fn: any) => void;
    subscribe: (run: any, invalidate?: typeof noop) => svelte_store.Unsubscriber;
}) & typeof get;
/**
 * - Defines a game setting.
 */
type GameSetting = {
    /**
     * - The ID of the module / system.
     */
    moduleId: string;
    /**
     * - The setting key to register.
     */
    key: string;
    /**
     * - Configuration for setting data.
     */
    options: object;
};
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type GSStore = ((key: any, value: any, start?: typeof noop) => {
    set: (new_value: any) => void;
    update: (fn: any) => void;
    subscribe: (run: any, invalidate?: typeof noop) => svelte_store.Unsubscriber;
}) & typeof get;
declare class LocalStorage {
    /**
     * Get value from the localstorage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {*} Value from local storage or if not defined any default value provided.
     */
    getItem(key: string, defaultValue?: any): any;
    /**
     * Returns the backing Svelte store for the given key; potentially sets a default value if the key
     * is not already set.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {LSStore} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): LSStore;
    /**
     * Sets the value for the given key in localstorage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in local storage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
}
declare class SessionStorage {
    /**
     * Get value from the sessionstorage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {*} Value from session storage or if not defined any default value provided.
     */
    getItem(key: string, defaultValue?: any): any;
    /**
     * Returns the backing Svelte store for the given key; potentially sets a default value if the key
     * is not already set.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {LSStore} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): LSStore;
    /**
     * Sets the value for the given key in sessionstorage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
}
/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {object} options - Configuration for setting data.
 */
/**
 * @typedef {writable & get} GSStore - The backing Svelte store; a writable w/ get method attached.
 */
/**
 * Registers game settings and creates a backing Svelte store for each setting. It is possible to add multiple
 * `onChange` callbacks on registration.
 */
declare class TJSGameSettings {
    getStore(key: any): GSStore;
    register(moduleId: any, key: any, options?: {}): void;
    /**
     * Registers multiple settings.
     *
     * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
     */
    registerAll(settings: Iterable<GameSetting>): void;
    #private;
}
/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 *
 * @param {Store} origin The store containing the object to get/set from.
 * @param {string|number|symbol|Array<string|number|symbol>} propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns {Store} A writable store.
 */
declare function propertyStore(origin: any, propName: string | number | symbol | Array<string | number | symbol>): any;
/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {function} update - function to receive future updates.
 *
 * @returns {function} Store unsubscribe function.
 */
declare function subscribeIgnoreFirst(store: svelte_store.Readable<any> | svelte_store.Writable<any>, update: Function): Function;
/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#Store_contract)
 */
/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#derived), but which
 * has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 *
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 2nd parameter.
 * @param {!Function|{withOld: !Function}} reflect Called when the
 * derived store gets a new value via its `set` or `update` methods, and determines new values for
 * the origin stores. [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 3rd parameter.
 *
 * @returns {Store} A writable store.
 */
declare function writableDerived(origins: any | any[], derive: Function, reflect: Function | {
    withOld: Function;
}, initial?: any): any;

export { GSStore, GameSetting, LSStore, LocalStorage, SSStore, SessionStorage, TJSGameSettings, propertyStore, subscribeIgnoreFirst, writableDerived };
