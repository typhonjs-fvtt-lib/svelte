import * as _svelte_store from 'svelte/store';

declare class TJSLocalStorage {
    /**
     * Creates a new writable store for the given key.
     *
     * @param {string}   key - Key to lookup in stores map.
     *
     * @param {boolean}  [defaultValue] - A default value to set for the store.
     *
     * @returns {import('#svelte/store').Writable} The new store.
     */
    static "__#296260@#createStore"(key: string, defaultValue?: boolean): _svelte_store.Writable<any>;
    /**
     * Get value from the localStorage.
     *
     * @param {string}   key - Key to lookup in localStorage.
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
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {import('#svelte/store').Writable} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): _svelte_store.Writable<any>;
    /**
     * Sets the value for the given key in localStorage.
     *
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
    #private;
}

declare class TJSSessionStorage {
    /**
     * Creates a new store for the given key.
     *
     * @param {string}   key - Key to lookup in stores map.
     *
     * @param {boolean}  [defaultValue] - A default value to set for the store.
     *
     * @returns {import('#svelte/store').Writable} The new store.
     */
    static "__#296261@#createStore"(key: string, defaultValue?: boolean): _svelte_store.Writable<any>;
    /**
     * Get value from the sessionStorage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
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
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {import('#svelte/store').Writable} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): _svelte_store.Writable<any>;
    /**
     * Sets the value for the given key in sessionStorage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
    #private;
}

export { TJSLocalStorage, TJSSessionStorage };
