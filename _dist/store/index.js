import { isIterable } from '@typhonjs-fvtt/svelte/util';
import { derived, get, writable as writable$2 } from 'svelte/store';
import { noop, run_all, is_function } from 'svelte/internal';
import { hasPrototype, isObject, uuidv4, isPlainObject, getUUIDFromDataTransfer } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a readable store to track keys actively pressed. KeyStore is designed to be used with the {@link keyforward}
 * action.
 */
class KeyStore
{
   #keySet;

   /**
    * @type {Map<string, number>}
    */
   #keyMap = new Map();

   /**
    * @type {KeyStoreOptions}
    */
   #options = { preventDefault: true, useCode: true, stopPropagation: true };

   /**
    * Stores the subscribers.
    *
    * @type {(function(KeyStore): void)[]}
    */
   #subscriptions = [];

   /**
    * @param {Iterable<string>}  [keyNames] -
    *
    * @param {KeyStoreOptions}   [options] - Optional parameters
    */
   constructor(keyNames, options)
   {
      if (!isIterable(keyNames))
      {
         throw new TypeError(`'keyNames' is not an iterable list.`);
      }

      this.setOptions(options);

      this.#keySet = new Set(keyNames);
   }

   /**
    * Add given key to the tracking key set.
    *
    * @param {string}   key - Key to add.
    */
   addKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      this.#keySet.add(key);
   }

   /**
    * @returns {boolean} True if any keys in the key set are pressed.
    */

   /**
    * Returns true if any of given keys are pressed. If `keys` is undefined then the result is true if any keys being
    * tracked are pressed.
    *
    * @param {string|Iterable<string>|undefined} keys - Zero or more key strings or list to verify if any pressed.
    *
    * @returns {boolean} True if any keys set are pressed.
    */
   anyPressed(keys)
   {
      // When no keys given then check if any key is pressed.
      if (keys === void 0) { return this.#keyMap.size > 0; }

      const isList = isIterable(keys);

      if (typeof keys !== 'string' && !isList)
      {
         throw new TypeError(`'keys' is not a string or iterable list of strings.`);
      }

      let result = false;

      if (isList)
      {
         for (const key of keys)
         {
            if (this.#keyMap.has(key))
            {
               result = true;
               break;
            }
         }
      }
      else
      {
         if (this.#keyMap.has(keys)) { result = true; }
      }

      return result;
   }

   /**
    * Is the given key in the tracking key set.
    *
    * @param {string}   key - Key to check.
    */
   hasKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      this.#keySet.has(key);
   }

   /**
    * Returns true if all given keys are pressed.
    *
    * @param {string|Iterable<string>} keys - One or more key strings to verify if pressed.
    *
    * @returns {boolean} Are all keys pressed.
    */
   isPressed(keys)
   {
      const isList = isIterable(keys);

      if (typeof keys !== 'string' && !isList)
      {
         throw new TypeError(`'keys' is not a string or iterable list of strings.`);
      }

      let result = true;

      if (isList)
      {
         for (const key of keys)
         {
            if (!this.#keyMap.has(key))
            {
               result = false;
               break;
            }
         }
      }
      else
      {
         if (!this.#keyMap.has(keys)) { result = false; }
      }

      return result;
   }

   /**
    * Handle keydown event adding any key from the tracked key set.
    *
    * @param {KeyboardEvent}  event - KeyboardEvent.
    */
   keydown(event)
   {
      const key = this.#options.useCode ? event.code : event.key;

      if (this.#keySet.has(key))
      {
         if (!this.#keyMap.has(key))
         {
            this.#keyMap.set(key, 1);
            this._updateSubscribers();
         }

         if (this.#options.preventDefault) { event.preventDefault(); }
         if (this.#options.stopPropagation) { event.stopPropagation(); }
      }
   }

   /**
    * @returns {IterableIterator<string>} Returns current pressed keys iterator.
    */
   keysPressed()
   {
      return this.#keyMap.keys();
   }

   /**
    * @returns {IterableIterator<string>} Returns currently tracked keys iterator.
    */
   keysTracked()
   {
      return this.#keySet.keys();
   }

   /**
    * Handle keyup event removing any key from the tracked key set.
    *
    * @param {KeyboardEvent}  event - KeyboardEvent.
    */
   keyup(event)
   {
      const key = this.#options.useCode ? event.code : event.key;

      if (this.#keySet.has(key))
      {
         if (this.#keyMap.has(key))
         {
            this.#keyMap.delete(key);
            this._updateSubscribers();
         }

         if (this.#options.preventDefault) { event.preventDefault(); }
         if (this.#options.stopPropagation) { event.stopPropagation(); }
      }
   }

   /**
    * Remove the given key from the tracking key set.
    *
    * @param {string}   key - Key to remove.
    */
   removeKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      if (this.#keySet.has(key))
      {
         this.#keySet.delete(key);

         if (this.#keyMap.has(key))
         {
            this.#keyMap.delete(key);
            this._updateSubscribers();
         }
      }
   }

   /**
    * Update options.
    *
    * @param {KeyStoreOptions}   options - Options to set.
    */
   setOptions(options)
   {
      if (typeof options?.preventDefault === 'boolean') { this.#options.preventDefault = options.preventDefault; }
      if (typeof options?.useCode === 'boolean') { this.#options.useCode = options.useCode; }
      if (typeof options?.stopPropagation === 'boolean') { this.#options.stopPropagation = options.stopPropagation; }
   }

   /**
    * @param {string}   key - key or key code to lookup.
    *
    * @returns {number} 1 if currently pressed and 0 if not pressed.
    */
   value(key)
   {
      return this.#keyMap.has(key) ? 1 : 0;
   }

   // Store subscriber implementation --------------------------------------------------------------------------------

   /**
    * @param {function(KeyStore): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers.
    *
    * @protected
    */
   _updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](this); }
   }
}

/**
 * @typedef {object} KeyStoreOptions
 *
 * @property {boolean}  [preventDefault=true] - Invoke `preventDefault` on key events.
 *
 * @property {boolean}  [useCode=true] - When true use `event.code` otherwise use `event.key` to get active key.
 *
 * @property {boolean}  [stopPropagation=true] - Invoke `stopPropagation` on key events.
 */

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

/**
 * Provides a basic test for a given variable to test if it has the shape of a readable store by having a `subscribe`
 * function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isReadableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function';
   }

   return false;
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * function and an `update` function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isUpdatableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function' && typeof store.update === 'function';
   }

   return false;
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * `set`, and `update` functions.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ `subscribe` & `set` functions.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isWritableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function' && typeof store.set === 'function';
   }

   return false;
}

/**
 * Wraps a writable stores set method invoking a callback after the store is set. This allows hard coupled parent /
 * child relationships between stores to update directly without having to subscribe to the child store. This is a
 * particular powerful pattern when the `setCallback` is a debounced function that syncs a parent store and / or
 * serializes data.
 *
 * Note: Do consider carefully if this is an optimum solution; this is a quick implementation helper, but a better
 * solution is properly managing store relationships through subscription.
 *
 * @template T
 *
 * @param {import('#svelte/store').Writable<T>} store - A store to wrap.
 *
 * @param {(store?: import('#svelte/store').Writable<T>, value?: T) => void} setCallback - A callback to invoke after
 *        store set.
 *
 * @returns {import('#svelte/store').Writable<T>} Wrapped store.
 */
function storeCallback(store, setCallback)
{
   if (!isWritableStore(store)) { throw new TypeError(`'store' is not a writable store.`); }
   if (typeof setCallback !== 'function') { throw new TypeError(`'setCallback' is not a function.`); }

   /** @type {import('#svelte/store').Writable<T>} */
   return {
      set: (value) =>
      {
         store.set(value);
         setCallback(store, value);
      },

      subscribe: store.subscribe,

      update: typeof store.update === 'function' ? store.update : void 0
   };
}

/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
function subscribeIgnoreFirst(store, update)
{
   let firedFirst = false;

   return store.subscribe((value) =>
   {
      if (!firedFirst)
      {
         firedFirst = true;
      }
      else
      {
         update(value);
      }
   });
}

/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('#svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
function subscribeFirstRest(store, first, update)
{
   let firedFirst = false;

   return store.subscribe((value) =>
   {
      if (!firedFirst)
      {
         firedFirst = true;
         first(value);
      }
      else
      {
         update(value);
      }
   });
}

/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract)
 */

/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#run-time-svelte-store-writable),
 * but which has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 * 
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 2nd parameter.
 * @param {!Function} reflect Called when the derived store gets a new value via its `set` or
 * `update` methods, and determines new values for the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 3rd parameter.
 * 
 * @returns {Store} A writable store.
 */
function writableDerived(origins, derive, reflect, initial) {
	var childDerivedSetter, originValues, blockNextDerive = false;
	var reflectOldValues = reflect.length >= 2;
	var wrappedDerive = (got, set) => {
		childDerivedSetter = set;
		if (reflectOldValues) {
			originValues = got;
		}
		if (!blockNextDerive) {
			let returned = derive(got, set);
			if (derive.length < 2) {
				set(returned);
			} else {
				return returned;
			}
		}
		blockNextDerive = false;
	};
	var childDerived = derived(origins, wrappedDerive, initial);
	
	var singleOrigin = !Array.isArray(origins);
	function doReflect(reflecting) {
		var setWith = reflect(reflecting, originValues);
		if (singleOrigin) {
			blockNextDerive = true;
			origins.set(setWith);
		} else {
			setWith.forEach( (value, i) => {
				blockNextDerive = true;
				origins[i].set(value);
			} );
		}
		blockNextDerive = false;
	}
	
	var tryingSet = false;
	function update(fn) {
		var isUpdated, mutatedBySubscriptions, oldValue, newValue;
		if (tryingSet) {
			newValue = fn( get(childDerived) );
			childDerivedSetter(newValue);
			return;
		}
		var unsubscribe = childDerived.subscribe( (value) => {
			if (!tryingSet) {
				oldValue = value;
			} else if (!isUpdated) {
				isUpdated = true;
			} else {
				mutatedBySubscriptions = true;
			}
		} );
		newValue = fn(oldValue);
		tryingSet = true;
		childDerivedSetter(newValue);
		unsubscribe();
		tryingSet = false;
		if (mutatedBySubscriptions) {
			newValue = get(childDerived);
		}
		if (isUpdated) {
			doReflect(newValue);
		}
	}
	return {
		subscribe: childDerived.subscribe,
		set(value) { update( () => value ); },
		update,
	};
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
function propertyStore(origin, propName) {
	if (!Array.isArray(propName)) {
		return writableDerived(
			origin,
			(object) => object[propName],
			(reflecting, object) => {
				object[propName] = reflecting;
				return object;
			},
		);
	} else {
		let props = propName.concat();
		return writableDerived(
			origin,
			(value) => {
				for (let i = 0; i < props.length; ++i) {
					value = value[ props[i] ];
				}
				return value;
			},
			(reflecting, object) => {
				let target = object;
				for (let i = 0; i < props.length - 1; ++i) {
					target = target[ props[i] ];
				}
				target[ props[props.length - 1] ] = reflecting;
				return object;
			},
		);
	}
}

class DynReducerUtils {
    /**
     * Checks for array equality between two arrays of numbers.
     *
     * @param a - Array A
     *
     * @param b - Array B
     *
     * @returns Arrays are equal.
     */
    static arrayEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        /* c8 ignore next */
        if (a.length !== b.length) {
            return false;
        }
        for (let cntr = a.length; --cntr >= 0;) {
            /* c8 ignore next */
            if (a[cntr] !== b[cntr]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Provides a solid string hashing algorithm.
     *
     * Sourced from: https://stackoverflow.com/a/52171480
     *
     * @param str - String to hash.
     *
     * @param seed - A seed value altering the hash.
     *
     * @returns Hash code.
     */
    static hashString(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let ch, i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }
    /**
     * Converts an unknown value for hashing purposes in {@link AdapterIndexer.calcHashUpdate}.
     *
     * Currently objects / Map w/ object keys is not supported. Potentially can include `object-hash` to handle this
     * case, but it is not common to use objects as keys in Maps.
     *
     * @param value - An unknown value to convert to a number.
     */
    static hashUnknown(value) {
        if (value === null || value === void 0) {
            return 0;
        }
        let result = 0;
        switch (typeof value) {
            case 'boolean':
                result = value ? 1 : 0;
                break;
            case 'bigint':
                result = Number(BigInt.asIntN(64, value));
                break;
            case 'function':
                result = this.hashString(value.name);
                break;
            case 'number':
                result = Number.isFinite(value) ? value : 0;
                break;
            case 'object':
                // TODO: consider hashing an object IE `object-hash` and convert to number.
                break;
            case 'string':
                result = this.hashString(value);
                break;
            case 'symbol':
                result = this.hashString(Symbol.keyFor(value));
                break;
        }
        return result;
    }
    /**
     * @param target -
     *
     * @param Prototype -
     *
     * @returns target constructor function has Prototype.
     */
    static hasPrototype(target, Prototype) {
        /* c8 ignore next */
        if (typeof target !== 'function') {
            return false;
        }
        if (target === Prototype) {
            return true;
        }
        // Walk parent prototype chain. Check for descriptor at each prototype level.
        for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto)) {
            if (proto === Prototype) {
                return true;
            }
        }
        return false;
    }
    /**
     * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
     *
     * @param data - Data to verify as iterable.
     *
     * @returns Is data iterable.
     */
    static isIterable(data) {
        return data !== null && data !== void 0 && typeof data === 'object' &&
            typeof data[Symbol.iterator] === 'function';
    }
}

/**
 * Provides the `derived` API for all dynamic reducers.
 */
class AdapterDerived {
    #hostData;
    #DerivedReducerCtor;
    #parentIndex;
    #derived = new Map();
    #destroyed = false;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param parentIndex - Any associated parent index API.
     *
     * @param DerivedReducerCtor - The default derived reducer constructor function.
     */
    constructor(hostData, parentIndex, DerivedReducerCtor) {
        this.#hostData = hostData;
        this.#parentIndex = parentIndex;
        this.#DerivedReducerCtor = DerivedReducerCtor;
        Object.freeze(this);
    }
    /**
     * Creates a new derived reducer.
     *
     * @param options - Options defining the new derived reducer.
     *
     * @returns Newly created derived reducer.
     */
    create(options) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.create error: this instance has been destroyed.`);
        }
        let name;
        let rest = {};
        let ctor;
        const DerivedReducerCtor = this.#DerivedReducerCtor;
        if (typeof options === 'string') {
            name = options;
            ctor = DerivedReducerCtor;
        }
        else if (typeof options === 'function' && DynReducerUtils.hasPrototype(options, DerivedReducerCtor)) {
            ctor = options;
        }
        else if (typeof options === 'object' && options !== null) {
            ({ name, ctor = DerivedReducerCtor, ...rest } = options);
        }
        else {
            throw new TypeError(`AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
        }
        if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor)) {
            throw new TypeError(`AdapterDerived.create error: 'ctor' is not a '${DerivedReducerCtor?.name}'.`);
        }
        name = name ?? ctor?.name;
        if (typeof name !== 'string') {
            throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`);
        }
        const derivedReducer = new ctor(this.#hostData, this.#parentIndex, rest);
        this.#derived.set(name, derivedReducer);
        return derivedReducer;
    }
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear() {
        if (this.#destroyed) {
            return;
        }
        for (const reducer of this.#derived.values()) {
            reducer.destroy();
        }
        this.#derived.clear();
    }
    /**
     * Deletes and destroys a derived reducer by name.
     *
     * @param name - Name of the derived reducer.
     */
    delete(name) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.delete error: this instance has been destroyed.`);
        }
        const reducer = this.#derived.get(name);
        if (reducer) {
            reducer.destroy();
        }
        return this.#derived.delete(name);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.clear();
        this.#hostData = [null];
        this.#parentIndex = null;
        this.#destroyed = true;
    }
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get(name) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.get error: this instance has been destroyed.`);
        }
        return this.#derived.get(name);
    }
    /**
     * Updates all managed derived reducer indexes.
     *
     * @param [force] - Force an update to subscribers.
     */
    update(force = false) {
        if (this.#destroyed) {
            return;
        }
        for (const reducer of this.#derived.values()) {
            reducer.index.update(force);
        }
    }
}

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DynDataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 */
class AdapterFilters {
    #filtersData;
    #indexUpdate;
    #mapUnsubscribe = new Map();
    /**
     * @param indexUpdate - update function for the indexer.
     *
     * @param filtersAdapter - Stores the filter function data.
     */
    constructor(indexUpdate, filtersAdapter) {
        this.#indexUpdate = indexUpdate;
        this.#filtersData = filtersAdapter;
        Object.freeze(this);
    }
    /**
     * @returns Returns the length of the filter data.
     */
    get length() { return this.#filtersData.filters.length; }
    /**
     * Provides an iterator for filters.
     *
     * @yields {DataFilter<T>}
     */
    *[Symbol.iterator]() {
        if (this.#filtersData.filters.length === 0) {
            return;
        }
        for (const entry of this.#filtersData.filters) {
            yield { ...entry };
        }
    }
    /**
     * @param filters -
     */
    add(...filters) {
        /**
         * Tracks the number of filters added that have subscriber functionality.
         */
        let subscribeCount = 0;
        for (const filter of filters) {
            const filterType = typeof filter;
            if (filterType !== 'function' && (filterType !== 'object' || filter === null)) {
                throw new TypeError(`AdapterFilters error: 'filter' is not a function or object.`);
            }
            let data = void 0;
            let subscribeFn = void 0;
            if (filterType === 'function') {
                data = {
                    id: void 0,
                    filter,
                    weight: 1
                };
                subscribeFn = filter.subscribe;
            }
            else if (filterType === 'object') {
                if ('filter' in filter) {
                    if (typeof filter.filter !== 'function') {
                        throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
                    }
                    if (filter.weight !== void 0 && typeof filter.weight !== 'number' ||
                        (filter.weight < 0 || filter.weight > 1)) {
                        throw new TypeError(`AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
                    }
                    data = {
                        id: filter.id !== void 0 ? filter.id : void 0,
                        filter: filter.filter,
                        weight: filter.weight || 1
                    };
                    subscribeFn = filter.filter.subscribe ?? filter.subscribe;
                }
                else {
                    throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
                }
            }
            // Find the index to insert where data.weight is less than existing values weight.
            const index = this.#filtersData.filters.findIndex((value) => {
                return data.weight < value.weight;
            });
            // If an index was found insert at that location.
            if (index >= 0) {
                this.#filtersData.filters.splice(index, 0, data);
            }
            else // push to end of filters.
             {
                this.#filtersData.filters.push(data);
            }
            if (typeof subscribeFn === 'function') {
                const unsubscribe = subscribeFn(this.#indexUpdate);
                // Ensure that unsubscribe is a function.
                if (typeof unsubscribe !== 'function') {
                    throw new TypeError('AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.');
                }
                // Ensure that the same filter is not subscribed to multiple times.
                if (this.#mapUnsubscribe.has(data.filter)) {
                    throw new Error('AdapterFilters error: Filter added already has an unsubscribe function registered.');
                }
                this.#mapUnsubscribe.set(data.filter, unsubscribe);
                subscribeCount++;
            }
        }
        // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
        // subscriber count is less than the amount of filters added then automatically trigger an index update manually.
        if (subscribeCount < filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * Clears and removes all filters.
     */
    clear() {
        this.#filtersData.filters.length = 0;
        // Unsubscribe from all filters with subscription support.
        for (const unsubscribe of this.#mapUnsubscribe.values()) {
            unsubscribe();
        }
        this.#mapUnsubscribe.clear();
        this.#indexUpdate();
    }
    /**
     * @param filters -
     */
    remove(...filters) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        for (const data of filters) {
            // Handle the case that the filter may either be a function or a filter entry / object.
            const actualFilter = typeof data === 'function' ? data : data !== null && typeof data === 'object' ?
                data.filter : void 0;
            if (!actualFilter) {
                continue;
            }
            for (let cntr = this.#filtersData.filters.length; --cntr >= 0;) {
                if (this.#filtersData.filters[cntr].filter === actualFilter) {
                    this.#filtersData.filters.splice(cntr, 1);
                    // Invoke any unsubscribe function for given filter then remove from tracking.
                    let unsubscribe = void 0;
                    if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === 'function') {
                        unsubscribe();
                        this.#mapUnsubscribe.delete(actualFilter);
                    }
                }
            }
        }
        // Update the index a filter was removed.
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        if (typeof callback !== 'function') {
            throw new TypeError(`AdapterFilters error: 'callback' is not a function.`);
        }
        this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
            const remove = callback.call(callback, { ...data });
            if (remove) {
                let unsubscribe;
                if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function') {
                    unsubscribe();
                    this.#mapUnsubscribe.delete(data.filter);
                }
            }
            // Reverse remove boolean to properly filter / remove this filter.
            return !remove;
        });
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * @param ids - Removes filters by ID.
     */
    removeById(...ids) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
            let remove = 0;
            for (const id of ids) {
                remove |= (data.id === id ? 1 : 0);
            }
            // If not keeping invoke any unsubscribe function for given filter then remove from tracking.
            if (!!remove) {
                let unsubscribe;
                if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function') {
                    unsubscribe();
                    this.#mapUnsubscribe.delete(data.filter);
                }
            }
            return !remove; // Swap here to actually remove the item via array filter method.
        });
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
}

/**
 * Provides construction and management of indexed data when there are parent indexes or filter / sort functions
 * applied.
 */
class AdapterIndexer {
    derivedAdapter;
    filtersData;
    hostData;
    hostUpdate;
    indexData;
    sortData;
    sortFn;
    destroyed = false;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param hostUpdate - Host update function invoked on index updates.
     *
     * @param [parentIndexer] - Any associated parent index API.
     *
     * @returns Indexer adapter instance.
     */
    constructor(hostData, hostUpdate, parentIndexer) {
        this.hostData = hostData;
        this.hostUpdate = hostUpdate;
        this.indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };
    }
    /**
     * @returns Returns whether the index is active.
     */
    get active() {
        return this.filtersData.filters.length > 0 || this.sortData.compareFn !== null ||
            this.indexData.parent?.active === true;
    }
    /**
     * @returns Returns length of reduced index.
     */
    get length() {
        return this.indexData.index ? this.indexData.index.length : 0;
    }
    /* c8 ignore start */
    /**
     * @returns Returns reversed state.
     */
    get reversed() { return this.indexData.reversed; }
    /* c8 ignore end */
    /**
     * @param reversed - New reversed state.
     */
    set reversed(reversed) { this.indexData.reversed = reversed; }
    // -------------------------------------------------------------------------------------------------------------------
    /**
     * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
     * is set to null. Set calculated new hash value to the index adapter hash value.
     *
     * After hash generation compare old and new hash values and perform an update if they are different. If they are
     * equal check for array equality between the old and new index array and perform an update if they are not equal.
     *
     * @param oldIndex - Old index array.
     *
     * @param oldHash - Old index hash value.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    calcHashUpdate(oldIndex, oldHash, force = false) {
        // Use force if a boolean otherwise default to false.
        const actualForce = typeof force === 'boolean' ? force : /* c8 ignore next */ false;
        let newHash = null;
        const newIndex = this.indexData.index;
        if (newIndex) {
            for (let cntr = newIndex.length; --cntr >= 0;) {
                newHash ^= DynReducerUtils.hashUnknown(newIndex[cntr]) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
            }
        }
        this.indexData.hash = newHash;
        if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true)) {
            this.hostUpdate();
        }
    }
    /**
     * Destroys all resources.
     */
    destroy() {
        if (this.destroyed) {
            return;
        }
        this.indexData.index = null;
        this.indexData.hash = null;
        this.indexData.reversed = null;
        this.indexData.parent = null;
        this.destroyed = true;
    }
    /**
     * Store associated filter and sort data that are constructed after the indexer.
     *
     * @param filtersData - Associated AdapterFilters instance.
     *
     * @param sortData - Associated AdapterSort instance.
     *
     * @param derivedAdapter - Associated AdapterDerived instance.
     */
    initAdapters(filtersData, sortData, derivedAdapter) {
        this.filtersData = filtersData;
        this.sortData = sortData;
        this.derivedAdapter = derivedAdapter;
        this.sortFn = this.createSortFn();
    }
}

/**
 * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function or a
 * {@link DynDataSort} object containing an `compare`, and `subscribe` attributes; `compare` is the only required
 * attribute.
 *
 * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
 * If a subscribe function is provided the sort function can notify any updates that may change sort order and this
 * triggers an index update.
 *
 * This class forms the public API which is accessible from the `.sort` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.sort.clear();
 * dynArray.sort.set(...);
 * ```
 */
class AdapterSort {
    #sortData;
    #indexUpdate;
    #unsubscribe;
    /**
     * @param indexUpdate - Function to update indexer.
     *
     * @param sortData - Storage for compare function.
     */
    constructor(indexUpdate, sortData) {
        this.#indexUpdate = indexUpdate;
        this.#sortData = sortData;
        Object.freeze(this);
    }
    /**
     * Clears & removes any assigned sort function and triggers an index update.
     */
    clear() {
        const oldCompareFn = this.#sortData.compareFn;
        this.#sortData.compareFn = null;
        if (typeof this.#unsubscribe === 'function') {
            this.#unsubscribe();
            this.#unsubscribe = void 0;
        }
        // Only update index if an old compare function is set.
        if (typeof oldCompareFn === 'function') {
            this.#indexUpdate();
        }
    }
    /**
     * @param data - A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data) {
        if (typeof this.#unsubscribe === 'function') {
            this.#unsubscribe();
            this.#unsubscribe = void 0;
        }
        let compareFn = void 0;
        let subscribeFn = void 0;
        switch (typeof data) {
            case 'function':
                compareFn = data;
                subscribeFn = data.subscribe;
                break;
            case 'object':
                // Early out if data is null / noop.
                if (data === null) {
                    break;
                }
                if (typeof data.compare !== 'function') {
                    throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
                }
                compareFn = data.compare;
                subscribeFn = data.compare.subscribe ?? data.subscribe;
                break;
        }
        if (typeof compareFn === 'function') {
            this.#sortData.compareFn = compareFn;
        }
        else {
            const oldCompareFn = this.#sortData.compareFn;
            this.#sortData.compareFn = null;
            // Update index if the old compare function exists.
            if (typeof oldCompareFn === 'function') {
                this.#indexUpdate();
            }
            return;
        }
        if (typeof subscribeFn === 'function') {
            this.#unsubscribe = subscribeFn(this.#indexUpdate);
            // Ensure that unsubscribe is a function.
            if (typeof this.#unsubscribe !== 'function') {
                throw new Error(`AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
            }
        }
        else {
            // A sort function with subscriber functionality are assumed to immediately invoke the `subscribe` callback.
            // Only manually update the index if there is no subscriber functionality.
            this.#indexUpdate();
        }
    }
}

/**
 * Provides the public API for accessing the index API.
 *
 * This class forms the public API which is accessible from the `.index` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.index.active;
 * dynArray.index.hash;
 * dynArray.index.length;
 * dynArray.index.update(...);
 * ```
 */
class IndexerAPI {
    #indexData;
    /**
     * Provides a getter to determine if the index is active.
     */
    active;
    /**
     * Provides length of reduced / indexed elements.
     */
    length;
    /**
     * Manually invoke an update of the index.
     *
     * @param force - Force update to any subscribers.
     */
    update;
    constructor(adapterIndexer) {
        this.#indexData = adapterIndexer.indexData;
        this.update = adapterIndexer.update.bind(adapterIndexer);
        // Defines getters on the public API to get the index hash, active state, and index length.
        Object.defineProperties(this, {
            active: { get: () => adapterIndexer.active },
            length: { get: () => adapterIndexer.length }
        });
        Object.freeze(this);
    }
    /**
     * - Current hash value of the index.
     */
    get hash() {
        return this.#indexData.hash;
    }
    /**
     * Provides an iterator over the index array.
     *
     * @yields {K}
     */
    *[Symbol.iterator]() {
        const indexData = this.#indexData;
        if (!indexData.index) {
            return;
        }
        const reversed = indexData.reversed;
        const length = indexData.index.length;
        if (reversed) {
            for (let cntr = length; --cntr >= 0;) {
                yield indexData.index[cntr];
            }
        }
        else {
            for (let cntr = 0; cntr < length; cntr++) {
                yield indexData.index[cntr];
            }
        }
    }
}

/**
 * Provides the public API for derived reducers. There are several ways to create a derived reducer from utilizing the
 * default implementation or passing in a constructor function / class for a custom derived reducer.
 *
 * This class forms the public API which is accessible from the `.derived` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.derived.clear();
 * dynArray.derived.create(...);
 * dynArray.derived.delete(...);
 * dynArray.derived.destroy();
 * dynArray.derived.get(...);
 * ```
 */
class DerivedAPI {
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear;
    /**
     * @param options - Options for creating a reducer.
     *
     * @returns Newly created derived reducer.
     */
    create;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete;
    /**
     * Removes all derived reducers, associated subscriptions, and cleans up all resources.
     */
    destroy;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get;
    constructor(adapterDerived) {
        this.clear = adapterDerived.clear.bind(adapterDerived);
        this.create = adapterDerived.create.bind(adapterDerived);
        this.delete = adapterDerived.delete.bind(adapterDerived);
        this.destroy = adapterDerived.destroy.bind(adapterDerived);
        this.get = adapterDerived.get.bind(adapterDerived);
        Object.freeze(this);
    }
}

/**
 */
class Indexer extends AdapterIndexer {
    /**
     * @inheritDoc
     */
    createSortFn() {
        return (a, b) => this.sortData.compareFn(this.hostData[0].get(a), this.hostData[0].get(b));
    }
    /**
     * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
     *
     * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
     * but the maintenance factor is not worth the extra complication.
     *
     * @returns New filtered index array.
     */
    reduceImpl() {
        const data = [];
        const map = this.hostData[0];
        if (!map) {
            return data;
        }
        const filters = this.filtersData.filters;
        let include = true;
        const parentIndex = this.indexData.parent;
        // Source index data is coming from an active parent index.
        if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active) {
            for (const key of parentIndex) {
                const value = map.get(key);
                include = true;
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(value)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(key);
                }
            }
        }
        else {
            for (const key of map.keys()) {
                include = true;
                const value = map.get(key);
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(value)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(key);
                }
            }
        }
        return data;
    }
    /**
     * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
     * pass in true to force an update to subscribers.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    update(force = false) {
        if (this.destroyed) {
            return;
        }
        const oldIndex = this.indexData.index;
        const oldHash = this.indexData.hash;
        const map = this.hostData[0];
        const parentIndex = this.indexData.parent;
        // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
        if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
            (this.indexData.index && map?.size !== this.indexData.index.length)) {
            this.indexData.index = null;
        }
        // If there are filters build new index.
        if (this.filtersData.filters.length > 0) {
            this.indexData.index = this.reduceImpl();
        }
        // If the index isn't built yet and there is an active parent index then create it from the parent.
        if (!this.indexData.index && parentIndex?.active) {
            this.indexData.index = [...parentIndex];
        }
        if (this.sortData.compareFn && map instanceof Map) {
            // If there is no index then create one with keys matching host item length.
            if (!this.indexData.index) {
                this.indexData.index = this.indexData.index = [...map.keys()];
            }
            this.indexData.index.sort(this.sortFn);
        }
        this.calcHashUpdate(oldIndex, oldHash, force);
        // Update all derived reducers.
        this.derivedAdapter?.update(force);
    }
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
class DynMapReducerDerived {
    #map;
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * @param map - Data host Map.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(map, parentIndex, options) {
        this.#map = map;
        this.#index = new Indexer(this.#map, this.#updateSubscribers.bind(this), parentIndex);
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        let filters = void 0;
        let sort = void 0;
        if (options !== void 0 && ('filters' in options || 'sort' in options)) {
            if (options.filters !== void 0) {
                if (DynReducerUtils.isIterable(options.filters)) {
                    filters = options.filters;
                }
                else {
                    throw new TypeError(`DerivedMapReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
                }
            }
            if (options.sort !== void 0) {
                if (typeof options.sort === 'function') {
                    sort = options.sort;
                }
                else if (typeof options.sort === 'object' && options.sort !== null) {
                    sort = options.sort;
                }
                else {
                    throw new TypeError(`DerivedMapReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // Add any filters and sort function defined by DataDynArray.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: The returned map is the same map set by the main reducer. If any changes are performed to the data
     * externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#map[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * @returns Main data / items length or indexed length.
     */
    get length() {
        const map = this.#map[0];
        return this.#index.active ? this.index.length :
            map ? map.size : 0;
    }
    /**
     * @returns Gets current reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DerivedMapReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        this.#destroyed = true;
        // Remove any external data reference and perform a final update.
        this.#map = [null];
        this.#index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#derived.destroy();
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Provides an iterator for data stored in DerivedMapReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const map = this.#map[0];
        if (this.#destroyed || map === null || map?.size === 0) {
            return;
        }
        if (this.#index.active) {
            for (const key of this.index) {
                yield map.get(key);
            }
        }
        else {
            if (this.reversed) {
                // TODO: Not efficient due to creating temporary values array.
                const values = [...map.values()];
                for (let cntr = values.length; --cntr >= 0;) {
                    yield values[cntr];
                }
            }
            else {
                for (const value of map.values()) {
                    yield value;
                }
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------
    /**
     * Subscribe to this DerivedMapReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
}

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
class DynMapReducer {
    #map = [null];
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data) {
        let dataMap = void 0;
        let filters = void 0;
        let sort = void 0;
        if (data === null) {
            throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
        }
        if (data !== void 0 && typeof data !== 'object' && !(data instanceof Map)) {
            throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
        }
        if (data !== void 0 && data instanceof Map) {
            dataMap = data;
        }
        else if (data !== void 0 && ('data' in data || 'filters' in data || 'sort' in data)) {
            if (data.data !== void 0 && !(data.data instanceof Map)) {
                throw new TypeError(`DynMapReducer error (DataDynMap): 'data' attribute is not a Map.`);
            }
            dataMap = data.data;
            if (data.filters !== void 0) {
                if (DynReducerUtils.isIterable(data.filters)) {
                    filters = data.filters;
                }
                else {
                    throw new TypeError(`DynMapReducer error (DataDynMap): 'filters' attribute is not iterable.`);
                }
            }
            if (data.sort !== void 0) {
                if (typeof data.sort === 'function') {
                    sort = data.sort;
                }
                else if (typeof data.sort === 'object' && data.sort !== null) {
                    sort = data.sort;
                }
                else {
                    throw new TypeError(`DynMapReducer error (DataDynMap): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // In the case of the main data being an array directly use the array otherwise create a copy.
        if (dataMap) {
            this.#map[0] = dataMap;
        }
        this.#index = new Indexer(this.#map, this.#updateSubscribers.bind(this));
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        // Add any filters and sort function defined by DataDynMap.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: When a map is set as data then that map is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#map[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * @returns Returns the Indexer public API.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length() {
        const map = this.#map[0];
        return this.#index.active ? this.#indexPublicAPI.length :
            map ? map.size : 0;
    }
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DynMapReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#derived.destroy();
        // Set the backing data to null and provide a final update.
        this.#map = [null];
        this.index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data, replace = false) {
        if (data !== null && !(data instanceof Map)) {
            throw new TypeError(`DynMapReducer.setData error: 'data' is not iterable.`);
        }
        if (typeof replace !== 'boolean') {
            throw new TypeError(`DynMapReducer.setData error: 'replace' is not a boolean.`);
        }
        const map = this.#map[0];
        // If the array isn't defined or 'replace' is true then replace internal data with new array or create an array
        // from an iterable.
        if (!(map instanceof Map) || replace) {
            this.#map[0] = data instanceof Map ? data : null;
        }
        else if (data instanceof Map && map instanceof Map) {
            // Create a set of all current entry IDs.
            const removeKeySet = new Set(map.keys());
            for (const key of data.keys()) {
                map.set(key, data.get(key));
                if (removeKeySet.has(key)) {
                    removeKeySet.delete(key);
                }
            }
            // Remove entries that are no longer in data.
            for (const key of removeKeySet) {
                map.delete(key);
            }
        }
        else if (data === null) {
            this.#map[0] = null;
        }
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Add a subscriber to this DynMapReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
    /**
     * Provides an iterator for data stored in DynMapReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const map = this.#map[0];
        if (this.#destroyed || map === null || map?.size === 0) {
            return;
        }
        if (this.#index.active) {
            for (const key of this.index) {
                yield map.get(key);
            }
        }
        else {
            if (this.reversed) {
                // TODO: Not efficient due to creating temporary values array.
                const values = [...map.values()];
                for (let cntr = values.length; --cntr >= 0;) {
                    yield values[cntr];
                }
            }
            else {
                for (const value of map.values()) {
                    yield value;
                }
            }
        }
    }
}

/**
 * Provides management of reactive embedded collections.
 *
 * TODO: Consider subscribing to TJSDocument rather than exposing {@link EmbeddedStoreManager.handleDocChange} and
 * {@link EmbeddedStoreManager.handleUpdate}
 */
class EmbeddedStoreManager
{
   /**
    * RegExp for detecting CRUD updates for renderContext.
    *
    * @type {RegExp}
    */
   static #renderContextRegex = /(create|delete|update)(\w+)/;

   /**
    * @type {Map<string, EmbeddedCollectionData>}
    */
   #name = new Map();

   /**
    * @type {foundry.abstract.Document[]}
    */
   #document;

   /**
    * @type {Set<string>}
    */
   #embeddedNames = new Set();

   /**
    * @param {foundry.abstract.Document[]} document - The associated document holder.
    */
   constructor(document)
   {
      this.#document = document;

      this.handleDocChange();

      Object.seal(this);
   }

   /**
    * @template T
    *
    * @param {string} embeddedName -
    *
    * @param {import('#svelte-fvtt/store/reducer').DynOptionsMapCreate<string, T>} options -
    *
    * @returns {import('#svelte-fvtt/store/reducer').DynMapReducer<string, T>} DynMapReducer instance
    */
   create(embeddedName, options)
   {
      /** @type {foundry.abstract.Document} */
      const doc = this.#document[0];

      let collection = null;

      if (doc)
      {
         try
         {
            collection = doc.getEmbeddedCollection(embeddedName);
         }
         catch (err)
         {
            console.warn(`EmbeddedStoreManager.create error: No valid embedded collection for: ${embeddedName}`);
         }
      }

      let embeddedData;

      if (!this.#name.has(embeddedName))
      {
         embeddedData = {
            collection,
            stores: new Map()
         };

         this.#name.set(embeddedName, embeddedData);
      }
      else
      {
         embeddedData = this.#name.get(embeddedName);
      }

      /** @type {string} */
      let name;

      /** @type {import('#svelte-fvtt/store/reducer').DynDataOptions<T>} */
      let rest = {};

      /** @type {import('#svelte-fvtt/store/reducer').IDynMapReducerCtor<string, T>} */
      let ctor;

      if (typeof options === 'string')
      {
         name = options;
         ctor = DynMapReducer;
      }
      else if (typeof options === 'function' && hasPrototype(options, DynMapReducer))
      {
         ctor = options;
      }
      else if (isObject(options))
      {
         ({ name, ctor = DynMapReducer, ...rest } = options);
      }
      else
      {
         throw new TypeError(`EmbeddedStoreManager.create error: 'options' does not conform to allowed parameters.`);
      }

      if (!hasPrototype(ctor, DynMapReducer))
      {
         throw new TypeError(`EmbeddedStoreManager.create error: 'ctor' is not a 'DynMapReducer'.`);
      }

      name = name ?? ctor?.name;

      if (typeof name !== 'string') { throw new TypeError(`EmbeddedStoreManager.create error: 'name' is not a string.`); }

      if (embeddedData.stores.has(name))
      {
         return embeddedData.stores.get(name);
      }
      else
      {
         const storeOptions = collection ? { data: collection, ...rest } : { ...rest };
         const store = new ctor(storeOptions);
         embeddedData.stores.set(name, store);
         return store;
      }
   }

   /**
    * Destroys and removes embedded collection stores. Invoking this method with no parameters destroys all stores.
    * Invoking with an embedded name destroys all stores for that particular collection. If you provide an embedded and
    * store name just that particular store is destroyed and removed.
    *
    * @param {string}   [embeddedName] - Specific embedded collection name.
    *
    * @param {string}   [storeName] - Specific store name.
    *
    * @returns {boolean} One or more stores destroyed?
    */
   destroy(embeddedName, storeName)
   {
      let count = 0;

      // Destroy all embedded stores
      if (embeddedName === void 0)
      {
         for (const embeddedData of this.#name.values())
         {
            embeddedData.collection = null;
            for (const store of embeddedData.stores.values())
            {
               store.destroy();
               count++;
            }
         }

         this.#name.clear();
      }
      else if (typeof embeddedName === 'string' && storeName === void 0)
      {
         const embeddedData = this.#name.get(embeddedName);
         if (embeddedData)
         {
            embeddedData.collection = null;
            for (const store of embeddedData.stores.values())
            {
               store.destroy();
               count++;
            }
         }

         this.#name.delete(embeddedName);
      }
      else if (typeof embeddedName === 'string' && storeName === 'string')
      {
         const embeddedData = this.#name.get(embeddedName);
         if (embeddedData)
         {
            const store = embeddedData.stores.get(storeName);
            if (store)
            {
               store.destroy();
               count++;
            }
         }
      }

      return count > 0;
   }

   /**
    * @template T
    *
    * @param {string} embeddedName -
    *
    * @param {string} storeName -
    *
    * @returns {import('#svelte-fvtt/store/reducer').DynMapReducer<string, T>} DynMapReducer instance.
    */
   get(embeddedName, storeName)
   {
      if (!this.#name.has(embeddedName)) { return void 0; }

      return this.#name.get(embeddedName).stores.get(storeName);
   }

   /**
    * Updates all existing embedded collection stores with the associated embedded collection
    */
   handleDocChange()
   {
      const doc = this.#document[0];

      if (doc instanceof globalThis.foundry.abstract.Document)
      {
         const existingEmbeddedNames = new Set(this.#name.keys());

         /** @type {string[]} */
         const embeddedNames = Object.keys(doc.constructor?.metadata?.embedded ?? []);

         // Remove all previously stored embedded name CRUD keys.
         this.#embeddedNames.clear();

         for (const embeddedName of embeddedNames)
         {
            // Remove processed embedded name from existingEmbeddedNames set.
            existingEmbeddedNames.delete(embeddedName);

            // Update CRUD keys.
            this.#embeddedNames.add(`create${embeddedName}`);
            this.#embeddedNames.add(`delete${embeddedName}`);
            this.#embeddedNames.add(`update${embeddedName}`);

            let collection = null;

            try
            {
               // Update any existing stores with the actual collection.
               collection = doc.getEmbeddedCollection(embeddedName);
            }
            catch (err)
            {
               console.warn(`EmbeddedStoreManager.handleDocUpdate error: No valid embedded collection for: ${
                embeddedName}`);
            }

            // Update EmbeddedData for new collection.
            const embeddedData = this.#name.get(embeddedName);
            if (embeddedData)
            {
               embeddedData.collection = collection;

               // Update all existing stores.
               for (const store of embeddedData.stores.values()) { store.setData(collection, true); }
            }
         }

         // Update all existing embedded collections with null data that aren't processed above.
         for (const embeddedName of existingEmbeddedNames)
         {
            const embeddedData = this.#name.get(embeddedName);
            if (embeddedData)
            {
               embeddedData.collection = null;

               for (const store of embeddedData.stores.values()) { store.setData(null, true); }
            }
         }
      }
      else // Reset all embedded reducer stores to null data.
      {
         this.#embeddedNames.clear();

         for (const embeddedData of this.#name.values())
         {
            embeddedData.collection = null;

            for (const store of embeddedData.stores.values()) { store.setData(null, true); }
         }
      }
   }

   /**
    * Handles updates to embedded stores parsing the render context for valid embedded store types.
    *
    * On create, delete, update parse the type being modified then force index updates for the embedded type.
    *
    * @param {string}   renderContext - render context update from document.
    */
   handleUpdate(renderContext)
   {
      if (!this.#embeddedNames.has(renderContext)) { return; }

      const match = EmbeddedStoreManager.#renderContextRegex.exec(renderContext);

      if (match)
      {
         const embeddedName = match[2];
         if (!this.#name.has(embeddedName)) { return; }

         for (const store of this.#name.get(embeddedName).stores.values())
         {
            store.index.update(true);
         }
      }
   }
}

/**
 * @typedef {object} EmbeddedCollectionData
 *
 * @property {foundry.abstract.Collection} collection -
 *
 * @property {Map<string, import('@typhonjs-fvtt/svelte/store').DynMapReducer<string, T>>} stores -
 */

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
class TJSDocument
{
   /**
    * @type {foundry.abstract.Document[]}
    */
   #document = [void 0];

   /**
    * @type {EmbeddedStoreManager}
    */
   #embeddedStoreManager;
   #embeddedAPI;

   /**
    * @type {string}
    */
   #uuidv4;

   /**
    * @type {TJSDocumentOptions}
    */
   #options = { delete: void 0, preDelete: void 0 };

   #subscriptions = [];
   #updateOptions;

   /**
    * @param {foundry.abstract.Document | TJSDocumentOptions}  [document] - Document to wrap or TJSDocumentOptions.
    *
    * @param {TJSDocumentOptions}      [options] - TJSDocument options.
    */
   constructor(document, options = {})
   {
      this.#uuidv4 = `tjs-document-${uuidv4()}`;

      if (isPlainObject(document)) // Handle case when only options are passed into ctor.
      {
         this.setOptions(document);
      }
      else
      {
         this.setOptions(options);
         this.set(document);
      }
   }

   /**
    * @returns {EmbeddedAPI} Embedded store manager.
    */
   get embedded()
   {
      if (!this.#embeddedAPI)
      {
         this.#embeddedStoreManager = new EmbeddedStoreManager(this.#document);
         this.#embeddedAPI = {
            create: (embeddedName, options) => this.#embeddedStoreManager.create(embeddedName, options),
            destroy: (embeddedName, storeName) => this.#embeddedStoreManager.destroy(embeddedName, storeName),
            get: (embeddedName, storeName) => this.#embeddedStoreManager.get(embeddedName, storeName)
         };
      }

      return this.#embeddedAPI;
   }

   /**
    * Returns the options passed on last update.
    *
    * @returns {object} Last update options.
    */
   get updateOptions() { return this.#updateOptions ?? {}; }

   /**
    * Returns the UUID assigned to this store.
    *
    * @returns {string} UUID
    */
   get uuidv4() { return this.#uuidv4; }

   /**
    * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      const doc = this.#document[0];

      // Check to see if the document is still in the associated collection to determine if actually deleted.
      if (doc instanceof globalThis.foundry.abstract.Document && !doc?.collection?.has(doc.id))
      {
         delete doc?.apps[this.#uuidv4];
         this.#setDocument(void 0);

         if (typeof this.#options.preDelete === 'function')
         {
            await this.#options.preDelete(doc);
         }

         this.#updateSubscribers(false, { action: 'delete', data: void 0 });

         if (typeof this.#options.delete === 'function')
         {
            await this.#options.delete(doc);
         }

         this.#updateOptions = void 0;
      }
   }

   /**
    * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
    * ClientDocumentMixin `apps` tracking object.
    */
   destroy()
   {
      const doc = this.#document[0];

      if (this.#embeddedStoreManager)
      {
         this.#embeddedStoreManager.destroy();
         this.#embeddedStoreManager = void 0;
         this.#embeddedAPI = void 0;
      }

      if (doc instanceof globalThis.foundry.abstract.Document)
      {
         delete doc?.apps[this.#uuidv4];
         this.#setDocument(void 0);
      }

      this.#options.delete = void 0;
      this.#subscriptions.length = 0;
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have document update context.
    */
   #updateSubscribers(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      const doc = this.#document[0];

      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](doc, options); }

      if (this.#embeddedStoreManager)
      {
         this.#embeddedStoreManager.handleUpdate(options.renderContext);
      }
   }

   /**
    * @returns {foundry.abstract.Document | undefined} Current document
    */
   get() { return this.#document[0]; }

   /**
    * @param {foundry.abstract.Document | undefined}  document - New document to set.
    *
    * @param {object}         [options] - New document update options to set.
    */
   set(document, options = {})
   {
      if (this.#document[0])
      {
         delete this.#document[0].apps[this.#uuidv4];
      }

      if (document !== void 0 && !(document instanceof globalThis.foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined.`);
      }

      if (options === null || typeof options !== 'object')
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (document instanceof globalThis.foundry.abstract.Document)
      {
         document.apps[this.#uuidv4] = {
            close: this.#deleted.bind(this),
            render: this.#updateSubscribers.bind(this)
         };
      }

      this.#setDocument(document);
      this.#updateOptions = options;
      this.#updateSubscribers();
   }

   /**
    *
    * @param {foundry.abstract.Document | undefined} doc -
    */
   #setDocument(doc)
   {
      this.#document[0] = doc;

      if (this.#embeddedStoreManager) { this.#embeddedStoreManager.handleDocChange(); }
   }

   /**
    * Potentially sets new document from data transfer object.
    *
    * @param {object}   data - Document transfer data.
    *
    * @param {import('@typhonjs-fvtt/svelte/util').ParseDataTransferOptions & TJSDocumentOptions}   [options] - Optional
    *        parameters.
    *
    * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
    */
   async setFromDataTransfer(data, options)
   {
      return this.setFromUUID(getUUIDFromDataTransfer(data, options), options);
   }

   /**
    * Sets the document by Foundry UUID performing a lookup and setting the document if found.
    *
    * @param {string}   uuid - A Foundry UUID to lookup.
    *
    * @param {TJSDocumentOptions}   [options] - New document update options to set.
    *
    * @returns {Promise<boolean>} True if successfully set document from UUID.
    */
   async setFromUUID(uuid, options = {})
   {
      if (typeof uuid !== 'string' || uuid.length === 0) { return false; }

      try
      {
         const doc = await globalThis.fromUuid(uuid);

         if (doc)
         {
            this.set(doc, options);
            return true;
         }
      }
      catch (err) { /**/ }

      return false;
   }

   /**
    * Sets options for this document wrapper / store.
    *
    * @param {TJSDocumentOptions}   options - Options for TJSDocument.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument error: 'options' is not a plain object.`);
      }

      // Verify valid values -------------

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function.`);
      }

      if (options.preDelete !== void 0 && typeof options.preDelete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'preDelete' attribute in options is not a function.`);
      }

      // Set any valid values -------------

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
      }

      if (options.preDelete === void 0 || typeof options.preDelete === 'function')
      {
         this.#options.preDelete = options.preDelete;
      }
   }

   /**
    * @param {function(foundry.abstract.Document, object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);           // Add handler to the array of subscribers.

      const updateOptions = { action: 'subscribe', data: void 0 };

      handler(this.#document[0], updateOptions);      // Call handler with current value and update options.

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

/**
 * @typedef {object} TJSDocumentOptions
 *
 * @property {(doc: foundry.abstract.Document) => void} [delete] - Optional post delete function to invoke when
 *           document is deleted _after_ subscribers have been notified.
 *
 * @property {(doc: foundry.abstract.Document) => void} [preDelete] - Optional pre delete function to invoke when
 *           document is deleted _before_ subscribers are notified.
 */

/**
 * @template T
 * @typedef {object} EmbeddedAPI
 *
 * @property {(embeddedName: string, options: import('#svelte-fvtt/store/reducer').DynOptionsMapCreate<string, any>) => import('#svelte-fvtt/store/reducer').DynMapReducer<string, T>} create - Creates an embedded collection store.
 *
 * @property {(embeddedName?: string, storeName?: string) => boolean} destroy - Destroys one or more embedded collection stores.
 *
 * @property {(embeddedName: string, storeName: string) => import('#svelte-fvtt/store/reducer').DynMapReducer<string, T>} get - Returns a specific existing embedded collection store.
 */

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {globalThis.DocumentCollection} T
 */
class TJSDocumentCollection
{
   #collection;
   #collectionCallback;
   #uuid;

   /**
    * @type {TJSDocumentCollectionOptions}
    */
   #options = { delete: void 0, preDelete: void 0 };

   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T|TJSDocumentCollectionOptions}   [collection] - Collection to wrap or TJSDocumentCollectionOptions.
    *
    * @param {TJSDocumentCollectionOptions}     [options] - TJSDocumentCollection options.
    */
   constructor(collection, options = {})
   {
      this.#uuid = `tjs-collection-${uuidv4()}`;

      if (isPlainObject(collection)) // Handle case when only options are passed into ctor.
      {
         this.setOptions(collection);
      }
      else
      {
         this.setOptions(options);
         this.set(collection);
      }
   }

   /**
    * Returns the options passed on last update.
    *
    * @returns {object} Last update options.
    */
   get updateOptions() { return this.#updateOptions ?? {}; }

   /**
    * Returns the UUID assigned to this store.
    *
    * @returns {*} UUID
    */
   get uuid() { return this.#uuid; }

   /**
    * Handles cleanup when the collection is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      const collection = this.#collection;

      if (collection instanceof DocumentCollection)
      {
         const index = collection?.apps?.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { collection?.apps?.splice(index, 1); }

         this.#collection = void 0;
      }

      if (typeof this.#options.preDelete === 'function')
      {
         await this.#options.preDelete(collection);
      }

      this.#notify(false, { action: 'delete', documentType: collection.documentName, documents: [], data: [] });

      if (typeof this.#options.delete === 'function')
      {
         await this.#options.delete(collection);
      }

      this.#updateOptions = void 0;
   }

   /**
    * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
    * DocumentCollection `apps` tracking array.
    */
   destroy()
   {
      const collection = this.#collection;

      if (collection instanceof DocumentCollection)
      {
         const index = collection?.apps?.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { collection?.apps?.splice(index, 1); }

         this.#collection = void 0;
      }

      this.#options.delete = void 0;
      this.#subscriptions.length = 0;
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have collection update context.
    */
   #notify(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const collection = this.#collection;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](collection, options); }
   }

   /**
    * @returns {T | undefined} Current collection
    */
   get() { return this.#collection; }

   /**
    * @param {T | undefined}  collection - New collection to set.
    *
    * @param {object}         [options] - New collection update options to set.
    */
   set(collection, options = {})
   {
      if (this.#collection)
      {
         const index = this.#collection.apps.findIndex((sub) => sub === this.#collectionCallback);
         if (index >= 0) { this.#collection.apps.splice(index, 1); }

         this.#collectionCallback = void 0;
      }

      if (collection !== void 0 && !(collection instanceof DocumentCollection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (collection instanceof DocumentCollection)
      {
         this.#collectionCallback = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };

         collection?.apps?.push(this.#collectionCallback);
      }

      this.#collection = collection;
      this.#updateOptions = options;
      this.#notify();
   }

   /**
    * Sets options for this collection wrapper / store.
    *
    * @param {TJSDocumentCollectionOptions}   options - Options for TJSDocumentCollection.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocumentCollection error: 'options' is not an object.`);
      }

      // Verify valid values -------------

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function.`);
      }

      if (options.preDelete !== void 0 && typeof options.preDelete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'preDelete' attribute in options is not a function.`);
      }

      // Set any valid values -------------

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
      }

      if (options.preDelete === void 0 || typeof options.preDelete === 'function')
      {
         this.#options.preDelete = options.preDelete;
      }
   }

   /**
    * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);              // Add handler to the array of subscribers.

      const collection = this.#collection;

      const documentType = collection?.documentName ?? void 0;

      const updateOptions = { action: 'subscribe', documentType, documents: [], data: [] };

      handler(collection, updateOptions);  // Call handler with current value and update options.

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

/**
 * @typedef TJSDocumentCollectionOptions
 *
 * @property {(collection: globalThis.DocumentCollection) => void} [delete] - Optional post delete function
 *           to invoke when document is deleted _after_ subscribers have been notified.
 *
 * @property {(collection: globalThis.DocumentCollection) => void} [preDelete] - Optional pre delete function to
 *           invoke when document is deleted _before_ subscribers are notified.
 */

const storeState = writable$2(void 0);

/**
 * @type {GameState} Provides a Svelte store wrapping the Foundry runtime / global game state.
 */
const gameState = {
   subscribe: storeState.subscribe,
   get: () => game
};

Object.freeze(gameState);

Hooks.once('ready', () => storeState.set(game));

/**
 * @typedef {import('svelte/store').Readable} GameState - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Provides the Svelte store subscribe function.
 *
 * @property {Function} get - Provides a mechanism to directly access the Foundry game state without subscribing.
 */

export { KeyStore, TJSDocument, TJSDocumentCollection, TJSLocalStorage, TJSSessionStorage, gameState, isReadableStore, isUpdatableStore, isWritableStore, propertyStore, storeCallback, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
//# sourceMappingURL=index.js.map
