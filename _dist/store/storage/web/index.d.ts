import * as _runtime_svelte_store_web_storage from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';

declare class TJSWebStorage {
    /**
     * @param {object} options - Options.
     *
     * @param {Storage}  options.storage -
     *
     * @param {import('#runtime/svelte/store/web-storage').StorageWritable} options.writable -
     *
     * @param {(value: any) => string}  options.serialize -
     *
     * @param {(value: string) => any}  options.deserialize -
     */
    constructor({ storage, writable, serialize, deserialize }: {
        storage: Storage;
        writable: _runtime_svelte_store_web_storage.StorageWritable;
        serialize: (value: any) => string;
        deserialize: (value: string) => any;
    });
    /**
     * Get value from the storage API.
     *
     * @param {string}   key - Key to lookup in storage API.
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
     * @param {string}   key - Key to lookup in storage API.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {import('#svelte/store').Writable} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): any;
    /**
     * Sets the value for the given key in storage API.
     *
     * @param {string}   key - Key to lookup in storage API.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in storage API.
     *
     * @param {string}   key - Key to lookup in storage API.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
    #private;
}

declare class TJSLocalStorage extends TJSWebStorage {
    constructor();
}

declare class TJSSessionStorage extends TJSWebStorage {
    constructor();
}

export { TJSLocalStorage, TJSSessionStorage, TJSWebStorage };
