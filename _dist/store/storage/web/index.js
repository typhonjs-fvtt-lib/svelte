import { get, writable as writable$2 } from 'svelte/store';
import { noop, run_all, is_function } from 'svelte/internal';

// src/generator.ts
function isSimpleDeriver(deriver) {
  return deriver.length < 2;
}
function generator(storage) {
  function readable(key, value, start) {
    return {
      subscribe: writable(key, value, start).subscribe
    };
  }
  function writable(key, value, start = noop) {
    function wrap_start(ogSet) {
      return start(function wrap_set(new_value) {
        if (storage) {
          storage.setItem(key, JSON.stringify(new_value));
        }
        return ogSet(new_value);
      });
    }
    if (storage) {
      const storageValue = storage.getItem(key);
      try {
        if (storageValue) {
          value = JSON.parse(storageValue);
        }
      } catch (err) {
      }
      storage.setItem(key, JSON.stringify(value));
    }
    const ogStore = writable$2(value, start ? wrap_start : void 0);
    function set(new_value) {
      if (storage) {
        storage.setItem(key, JSON.stringify(new_value));
      }
      ogStore.set(new_value);
    }
    function update(fn) {
      set(fn(get(ogStore)));
    }
    function subscribe(run, invalidate = noop) {
      return ogStore.subscribe(run, invalidate);
    }
    return {set, update, subscribe};
  }
  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (storage && storage.getItem(key)) {
      try {
        initial_value = JSON.parse(storage.getItem(key));
      } catch (err) {
      }
    }
    return readable(key, initial_value, (set) => {
      let inited = false;
      const values = [];
      let pending = 0;
      let cleanup = noop;
      const sync = () => {
        if (pending) {
          return;
        }
        cleanup();
        const input = single ? values[0] : values;
        if (isSimpleDeriver(fn)) {
          set(fn(input));
        } else {
          const result = fn(input, set);
          cleanup = is_function(result) ? result : noop;
        }
      };
      const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
        values[i] = value;
        pending &= ~(1 << i);
        if (inited) {
          sync();
        }
      }, () => {
        pending |= 1 << i;
      }));
      inited = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
      };
    });
  }
  return {
    readable,
    writable,
    derived,
    get: get
  };
}

// src/local.ts
var storage$1 = typeof window !== "undefined" ? window.localStorage : void 0;
var g$1 = generator(storage$1);
var writable$1 = g$1.writable;

class TJSLocalStorage
{
   /**
    * @type {Map<string, import('#svelte/store').Writable>}
    */
   #stores = new Map();

   /**
    * Creates a new writable store for the given key.
    *
    * @param {string}   key - Key to lookup in stores map.
    *
    * @param {boolean}  [defaultValue] - A default value to set for the store.
    *
    * @returns {import('#svelte/store').Writable} The new store.
    */
   static #createStore(key, defaultValue = void 0)
   {
      try
      {
         const value = localStorage.getItem(key);
         if (value !== null) { defaultValue = value === 'undefined' ? void 0 : JSON.parse(value); }
      }
      catch (err) { /**/ }

      return writable$1(key, defaultValue);
   }

   /**
    * Gets a store from the stores Map or creates a new store for the key and a given default value.
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
         store = TJSLocalStorage.#createStore(key, defaultValue);
         this.#stores.set(key, store);
      }

      return store;
   }

   /**
    * Get value from the localStorage.
    *
    * @param {string}   key - Key to lookup in localStorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {*} Value from session storage or if not defined any default value provided.
    */
   getItem(key, defaultValue)
   {
      let value = defaultValue;

      const storageValue = localStorage.getItem(key);

      if (storageValue !== null)
      {
         try
         {
            value = storageValue === 'undefined' ? void 0 : JSON.parse(storageValue);
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
            const newValue = JSON.stringify(defaultValue);

            // If there is no existing storage value and defaultValue is defined the storage value needs to be set.
            localStorage.setItem(key, newValue === 'undefined' ? void 0 : newValue);
         }
         catch (err) { /* */ }
      }

      return value;
   }

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
   getStore(key, defaultValue)
   {
      return this.#getStore(key, defaultValue);
   }

   /**
    * Sets the value for the given key in localStorage.
    *
    * @param {string}   key - Key to lookup in localStorage.
    *
    * @param {*}        value - A value to set for this key.
    */
   setItem(key, value)
   {
      const store = this.#getStore(key);
      store.set(value);
   }

   /**
    * Convenience method to swap a boolean value stored in session storage.
    *
    * @param {string}   key - Key to lookup in localStorage.
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
         currentValue = !!JSON.parse(localStorage.getItem(key));
      }
      catch (err) { /**/ }

      const newValue = typeof currentValue === 'boolean' ? !currentValue : false;

      store.set(newValue);
      return newValue;
   }
}

// src/session.ts
var storage = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage);
var writable = g.writable;

class TJSSessionStorage
{
   /**
    * @type {Map<string, import('#svelte/store').Writable>}
    */
   #stores = new Map();

   /**
    * Creates a new store for the given key.
    *
    * @param {string}   key - Key to lookup in stores map.
    *
    * @param {boolean}  [defaultValue] - A default value to set for the store.
    *
    * @returns {import('#svelte/store').Writable} The new store.
    */
   static #createStore(key, defaultValue = void 0)
   {
      try
      {
         const value = sessionStorage.getItem(key);
         if (value !== null) { defaultValue = value === 'undefined' ? void 0 : JSON.parse(value); }
      }
      catch (err) { /**/ }

      return writable(key, defaultValue);
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
         store = TJSSessionStorage.#createStore(key, defaultValue);
         this.#stores.set(key, store);
      }

      return store;
   }

   /**
    * Get value from the sessionStorage.
    *
    * @param {string}   key - Key to lookup in sessionStorage.
    *
    * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
    *
    * @returns {*} Value from session storage or if not defined any default value provided.
    */
   getItem(key, defaultValue)
   {
      let value = defaultValue;

      const storageValue = sessionStorage.getItem(key);

      if (storageValue !== null)
      {
         try
         {
            value = storageValue === 'undefined' ? void 0 : JSON.parse(storageValue);
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
            const newValue = JSON.stringify(defaultValue);

            // If there is no existing storage value and defaultValue is defined the storage value needs to be set.
            sessionStorage.setItem(key, newValue === 'undefined' ? void 0 : newValue);
         }
         catch (err) { /* */ }
      }

      return value;
   }

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
   getStore(key, defaultValue)
   {
      return this.#getStore(key, defaultValue);
   }

   /**
    * Sets the value for the given key in sessionStorage.
    *
    * @param {string}   key - Key to lookup in sessionStorage.
    *
    * @param {*}        value - A value to set for this key.
    */
   setItem(key, value)
   {
      const store = this.#getStore(key);
      store.set(value);
   }

   /**
    * Convenience method to swap a boolean value stored in session storage.
    *
    * @param {string}   key - Key to lookup in sessionStorage.
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
         currentValue = !!JSON.parse(sessionStorage.getItem(key));
      }
      catch (err) { /**/ }

      const newValue = typeof currentValue === 'boolean' ? !currentValue : false;

      store.set(newValue);
      return newValue;
   }
}

export { TJSLocalStorage, TJSSessionStorage };
//# sourceMappingURL=index.js.map
