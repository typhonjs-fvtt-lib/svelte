import { localStores, sessionStores } from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';

class TJSWebStorage
{
   /** @type {Storage} */
   #storage;

   /** @type {(value: any) => string} */
   #serialize;

   /** @type {(value: string) => any} */
   #deserialize;

   /** @type {import('#runtime/svelte/store/web-storage').StorageWritable} */
   #writable;

   /**
    * @type {Map<string, import('#svelte/store').Writable>}
    */
   #stores = new Map();

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
   constructor({ storage, writable, serialize, deserialize })
   {
      this.#storage = storage;
      this.#writable = writable;
      this.#serialize = serialize;
      this.#deserialize = deserialize;
   }

   /**
    * Creates a new store for the given key.
    *
    * @param {string}   key - Key to lookup in stores map.
    *
    * @param {boolean}  [defaultValue] - A default value to set for the store.
    *
    * @returns {import('#svelte/store').Writable} The new store.
    */
   #createStore(key, defaultValue = void 0)
   {
      try
      {
         const value = this.#storage.getItem(key);
         if (value !== null) { defaultValue = this.#deserialize(value); }
      }
      catch (err) { /**/ }

      return this.#writable(key, defaultValue);
   }

   /**
    * Gets a store from the `stores` Map or creates a new store for the key and a given default value.
    *
    * @param {string}               key - Key to lookup in stores map.
    *
    * @param {boolean}              [defaultValue] - A default value to set for the store.
    *
    * @returns {import('#svelte/store').Writable} The store for the given key.
    */
   #getStore(key, defaultValue = void 0)
   {
      let store = this.#stores.get(key);
      if (store === void 0)
      {
         store = this.#createStore(key, defaultValue);
         this.#stores.set(key, store);
      }

      return store;
   }

   /**
    * Get value from the storage API.
    *
    * @param {string}   key - Key to lookup in storage API.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {*} Value from session storage or if not defined any default value provided.
    */
   getItem(key, defaultValue)
   {
      let value = defaultValue;

      const storageValue = this.#storage.getItem(key);

      if (storageValue !== null)
      {
         try
         {
            value = this.#deserialize(storageValue);
         }
         catch (err)
         {
            value = defaultValue;
         }
      }
      else if (defaultValue !== void 0)
      {
         try
         {
            const newValue = this.#serialize(defaultValue);

            // If there is no existing storage value and defaultValue is defined the storage value needs to be set.
            this.#storage.setItem(key, newValue);
         }
         catch (err) { /* */ }
      }

      return value;
   }

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
   getStore(key, defaultValue)
   {
      return this.#getStore(key, defaultValue);
   }

   /**
    * Sets the value for the given key in storage API.
    *
    * @param {string}   key - Key to lookup in storage API.
    *
    * @param {*}        value - A value to set for this key.
    */
   setItem(key, value)
   {
      const store = this.#getStore(key);
      store.set(value);
   }

   /**
    * Convenience method to swap a boolean value stored in storage API.
    *
    * @param {string}   key - Key to lookup in storage API.
    *
    * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {boolean} The boolean swap for the given key.
    */
   swapItemBoolean(key, defaultValue)
   {
      const store = this.#getStore(key, defaultValue);

      let currentValue = false;

      try
      {
         currentValue = !!this.#deserialize(this.#storage.getItem(key));
      }
      catch (err) { /**/ }

      const newValue = typeof currentValue === 'boolean' ? !currentValue : false;

      store.set(newValue);
      return newValue;
   }
}

class TJSLocalStorage extends TJSWebStorage
{
   constructor()
   {
      super({
         storage: globalThis?.localStorage,
         writable: localStores.writable,
         serialize: JSON.stringify,
         deserialize: JSON.parse
      });
   }
}

class TJSSessionStorage extends TJSWebStorage
{
   constructor()
   {
      super({
         storage: globalThis?.sessionStorage,
         writable: sessionStores.writable,
         serialize: JSON.stringify,
         deserialize: JSON.parse
      });
   }
}

export { TJSLocalStorage, TJSSessionStorage, TJSWebStorage };
//# sourceMappingURL=index.js.map
