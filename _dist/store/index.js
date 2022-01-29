import { get, derived, writable as writable$2 } from 'svelte/store';
import { noop, run_all, is_function } from 'svelte/internal';
import { isIterable } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a basic test for a given variable to test if it has the shape of a store by having a `subscribe` function.
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isStore(store) {
  if (store === null || store === void 0) {
    return false;
  }

  switch (typeof store) {
    case 'function':
    case 'object':
      return typeof store.subscribe === 'function';
  }

  return false;
}
/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */

function subscribeIgnoreFirst(store, update) {
  let firedFirst = false;
  return store.subscribe(value => {
    if (!firedFirst) {
      firedFirst = true;
    } else {
      update(value);
    }
  });
}
/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */

function subscribeFirstRest(store, first, update) {
  let firedFirst = false;
  return store.subscribe(value => {
    if (!firedFirst) {
      firedFirst = true;
      first(value);
    } else {
      update(value);
    }
  });
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

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
      if (storage.getItem(key)) {
        value = JSON.parse(storage.getItem(key));
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

    return {
      set,
      update,
      subscribe
    };
  }

  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;

    if (storage && storage.getItem(key)) {
      initial_value = JSON.parse(storage.getItem(key));
    }

    return readable(key, initial_value, set => {
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

      const unsubscribers = stores_array.map((store, i) => store.subscribe(value => {
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

var storage$1 = typeof window !== "undefined" ? window.localStorage : void 0;
var g$1 = generator(storage$1);
var writable$1 = g$1.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} LSStore - The backing Svelte store; a writable w/ get method attached.
 */

var _stores$1 = /*#__PURE__*/new WeakMap();

class LocalStorage {
  constructor() {
    _classPrivateFieldInitSpec(this, _stores$1, {
      writable: true,
      value: new Map()
    });
  }

  /**
   * Get value from the localstorage.
   *
   * @param {string}   key - Key to lookup in localstorage.
   *
   * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
   *
   * @returns {*} Value from local storage or if not defined any default value provided.
   */
  getItem(key, defaultValue) {
    let value = defaultValue;
    const storageValue = localStorage.getItem(key);

    if (storageValue !== void 0) {
      value = JSON.parse(storageValue);
    }

    return value;
  }
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


  getStore(key, defaultValue) {
    return s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key, defaultValue);
  }
  /**
   * Sets the value for the given key in localstorage.
   *
   * @param {string}   key - Key to lookup in localstorage.
   *
   * @param {*}        value - A value to set for this key.
   */


  setItem(key, value) {
    const store = s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key);
    store.set(value);
  }
  /**
   * Convenience method to swap a boolean value stored in local storage.
   *
   * @param {string}   key - Key to lookup in localstorage.
   *
   * @param {boolean}  [defaultValue] - A default value to return if key not present in local storage.
   *
   * @returns {boolean} The boolean swap for the given key.
   */


  swapItemBoolean(key, defaultValue) {
    const store = s_GET_STORE$1(_classPrivateFieldGet(this, _stores$1), key, defaultValue);
    const value = store.get();
    const newValue = typeof value === 'boolean' ? !value : false;
    store.set(newValue);
    return newValue;
  }

}
/**
 * Gets a store from the LSStore Map or creates a new store for the key and a given default value.
 *
 * @param {Map<string, LSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {boolean}              [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The store for the given key.
 */

function s_GET_STORE$1(stores, key, defaultValue = void 0) {
  let store = stores.get(key);

  if (store === void 0) {
    store = s_CREATE_STORE$1(key, defaultValue);
    stores.set(key, store);
  }

  return store;
}
/**
 * Creates a new LSStore for the given key.
 *
 * @param {string}   key - Key to lookup in stores map.
 *
 * @param {boolean}  [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The new LSStore.
 */


function s_CREATE_STORE$1(key, defaultValue = void 0) {
  try {
    if (localStorage.getItem(key)) {
      defaultValue = JSON.parse(localStorage.getItem(key));
    }
  } catch (err) {
    /**/
  }

  const store = writable$1(key, defaultValue);

  store.get = () => get(store);

  return store;
}

var storage = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage);
var writable = g.writable;

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} SSStore - The backing Svelte store; a writable w/ get method attached.
 */

var _stores = /*#__PURE__*/new WeakMap();

class SessionStorage {
  constructor() {
    _classPrivateFieldInitSpec(this, _stores, {
      writable: true,
      value: new Map()
    });
  }

  /**
   * Get value from the sessionstorage.
   *
   * @param {string}   key - Key to lookup in sessionstorage.
   *
   * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
   *
   * @returns {*} Value from session storage or if not defined any default value provided.
   */
  getItem(key, defaultValue) {
    let value = defaultValue;
    const storageValue = sessionStorage.getItem(key);

    if (storageValue !== void 0) {
      value = JSON.parse(storageValue);
    }

    return value;
  }
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


  getStore(key, defaultValue) {
    return s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key, defaultValue);
  }
  /**
   * Sets the value for the given key in sessionstorage.
   *
   * @param {string}   key - Key to lookup in sessionstorage.
   *
   * @param {*}        value - A value to set for this key.
   */


  setItem(key, value) {
    const store = s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key);
    store.set(value);
  }
  /**
   * Convenience method to swap a boolean value stored in session storage.
   *
   * @param {string}   key - Key to lookup in sessionstorage.
   *
   * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
   *
   * @returns {boolean} The boolean swap for the given key.
   */


  swapItemBoolean(key, defaultValue) {
    const store = s_GET_STORE$2(_classPrivateFieldGet(this, _stores), key, defaultValue);
    const value = store.get();
    const newValue = typeof value === 'boolean' ? !value : false;
    store.set(newValue);
    return newValue;
  }

}
/**
 * Gets a store from the SSStore Map or creates a new store for the key and a given default value.
 *
 * @param {Map<string, LSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {boolean}              [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The store for the given key.
 */

function s_GET_STORE$2(stores, key, defaultValue = void 0) {
  let store = stores.get(key);

  if (store === void 0) {
    store = s_CREATE_STORE$2(key, defaultValue);
    stores.set(key, store);
  }

  return store;
}
/**
 * Creates a new SSStore for the given key.
 *
 * @param {string}   key - Key to lookup in stores map.
 *
 * @param {boolean}  [defaultValue] - A default value to set for the store.
 *
 * @returns {LSStore} The new LSStore.
 */


function s_CREATE_STORE$2(key, defaultValue = void 0) {
  try {
    if (sessionStorage.getItem(key)) {
      defaultValue = JSON.parse(sessionStorage.getItem(key));
    }
  } catch (err) {
    /**/
  }

  const store = writable(key, defaultValue);

  store.get = () => get(store);

  return store;
}

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

function writableDerived(origins, derive, reflect, initial) {
  var childDerivedSetter,
      originValues,
      allowDerive = true;
  var reflectOldValues = ("withOld" in reflect);

  var wrappedDerive = (got, set) => {
    childDerivedSetter = set;

    if (reflectOldValues) {
      originValues = got;
    }

    if (allowDerive) {
      let returned = derive(got, set);

      if (derive.length < 2) {
        set(returned);
      } else {
        return returned;
      }
    }
  };

  var childDerived = derived(origins, wrappedDerive, initial);
  var singleOrigin = !Array.isArray(origins);

  var sendUpstream = setWith => {
    allowDerive = false;

    if (singleOrigin) {
      origins.set(setWith);
    } else {
      setWith.forEach((value, i) => {
        origins[i].set(value);
      });
    }

    allowDerive = true;
  };

  if (reflectOldValues) {
    reflect = reflect.withOld;
  }

  var reflectIsAsync = reflect.length >= (reflectOldValues ? 3 : 2);
  var cleanup = null;

  function doReflect(reflecting) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    if (reflectOldValues) {
      var returned = reflect(reflecting, originValues, sendUpstream);
    } else {
      var returned = reflect(reflecting, sendUpstream);
    }

    if (reflectIsAsync) {
      if (typeof returned == "function") {
        cleanup = returned;
      }
    } else {
      sendUpstream(returned);
    }
  }

  var tryingSet = false;

  function update(fn) {
    var isUpdated, mutatedBySubscriptions, oldValue, newValue;

    if (tryingSet) {
      newValue = fn(get(childDerived));
      childDerivedSetter(newValue);
      return;
    }

    var unsubscribe = childDerived.subscribe(value => {
      if (!tryingSet) {
        oldValue = value;
      } else if (!isUpdated) {
        isUpdated = true;
      } else {
        mutatedBySubscriptions = true;
      }
    });
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

    set(value) {
      update(() => value);
    },

    update
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
    return writableDerived(origin, object => object[propName], {
      withOld(reflecting, object) {
        object[propName] = reflecting;
        return object;
      }

    });
  } else {
    let props = propName.concat();
    return writableDerived(origin, value => {
      for (let i = 0; i < props.length; ++i) {
        value = value[props[i]];
      }

      return value;
    }, {
      withOld(reflecting, object) {
        let target = object;

        for (let i = 0; i < props.length - 1; ++i) {
          target = target[props[i]];
        }

        target[props[props.length - 1]] = reflecting;
        return object;
      }

    });
  }
}

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

/**
 * Registers game settings and creates a backing Svelte store for each setting. It is possible to add multiple
 * `onChange` callbacks on registration.
 */
class TJSGameSettings
{
   /**
    * @type {Map<string, GSStore>}
    */
   #stores = new Map();

   /**
    * Returns the Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {GSStore|undefined} The associated store for the given game setting key.
    */
   getStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getStore: '${key}' is not a registered setting.`);
         return;
      }

      return s_GET_STORE(this.#stores, key);
   }

   /**
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    */
   register(setting)
   {
      if (typeof setting !== 'object') { throw new TypeError(`TJSGameSettings - register: setting is not an object.`); }

      if (typeof setting.options !== 'object')
      {
         throw new TypeError(`TJSGameSettings - register: options is not an object.`);
      }

      const moduleId = setting.moduleId;
      const key = setting.key;

      /**
       * @type {GameSettingOptions}
       */
      const options = setting.options;

      const onchangeFunctions = [];

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

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value) =>
      {
         const store = s_GET_STORE(this.#stores, key);
         if (store) { store.set(value); }
      });

      // Provides the final onChange callback that iterates over all the stored onChange callbacks.
      const onChange = (value) =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      game.settings.register(moduleId, key, { ...options, onChange });

      // Set new store value with existing setting or default value.
      const newStore = s_GET_STORE(this.#stores, key, game.settings.get(moduleId, key));

      // Subscribe to self to set associated game setting on updates after verifying that the new value does not match
      // existing game setting.
      newStore.subscribe((value) =>
      {
         if (game.settings.get(moduleId, key) !== value) { game.settings.set(moduleId, key, value); }
      });
   }

   /**
    * Registers multiple settings.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    */
   registerAll(settings)
   {
      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings)
      {
         if (typeof entry !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
         }

         if (typeof entry.moduleId !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'moduleId' attribute.`);
         }

         if (typeof entry.key !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
         }

         if (typeof entry.options !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'options' attribute.`);
         }

         this.register(entry);
      }
   }
}

/**
 * Gets a store from the GSStore Map or creates a new store for the key.
 *
 * @param {Map<string, GSStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {string}               [initialValue] - An initial value to set to new stores.
 *
 * @returns {GSStore} The store for the given key.
 */
function s_GET_STORE(stores, key, initialValue)
{
   let store = stores.get(key);
   if (store === void 0)
   {
      store = s_CREATE_STORE(initialValue);
      stores.set(key, store);
   }

   return store;
}

/**
 * Creates a new GSStore for the given key.
 *
 * @param {string}   initialValue - An initial value to set to new stores.
 *
 * @returns {GSStore} The new GSStore.
 */
function s_CREATE_STORE(initialValue)
{
   const store = writable$2(initialValue);
   store.get = () => get(store);

   return store;
}

/**
 * @typedef {object} GameSettingOptions
 *
 * @property {object} [choices] - If choices are defined, the resulting setting will be a select menu.
 *
 * @property {boolean} [config=true] - Specifies that the setting appears in the configuration view.
 *
 * @property {string} [hint] - A description of the registered setting and its behavior.
 *
 * @property {string} name - The displayed name of the setting.
 *
 * @property {Function} [onChange] - An onChange callback to directly receive callbacks from Foundry on setting change.
 *
 * @property {object} [range] - If range is specified, the resulting setting will be a range slider.
 *
 * @property {('client' | 'world')} [scope='client'] - Scope for setting.
 *
 * @property {Object|Function} type - A constructable object or function.
 */

/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {GameSettingOptions} options - Configuration for setting data.
 */

/**
 * @typedef {import('svelte/store').Writable & import('svelte/store').get} GSStore - The backing Svelte store; a writable w/ get method attached.
 */

export { LocalStorage, SessionStorage, TJSGameSettings, gameState, isStore, propertyStore, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
//# sourceMappingURL=index.js.map
