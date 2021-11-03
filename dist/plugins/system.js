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
    return {set, update, subscribe};
  }
  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (storage && storage.getItem(key)) {
      initial_value = JSON.parse(storage.getItem(key));
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
var storage$3 = typeof window !== "undefined" ? window.localStorage : void 0;
var g$1 = generator(storage$3);
var writable$1 = g$1.writable;

class LocalStorage
{
   /**
    * @type {*}
    */
   #stores = new Map();

   getItem(itemId, defaultValue)
   {
      let value;

      const storageValue = localStorage.getItem(itemId);

      if (storageValue !== void 0)
      {
         value = JSON.parse(storageValue);
      }

      return value;
   }

   getStore(itemId, defaultValue)
   {
      return s_GET_STORE$1(this.#stores, itemId, defaultValue);
   }

   setItem(itemId, value)
   {
      const store = s_GET_STORE$1(this.#stores, itemId);
      store.set(value);
   }

   swapItemBoolean(itemId, defaultValue)
   {
      const store = s_GET_STORE$1(this.#stores, itemId, defaultValue);
      const value = store.get();
      const newValue = typeof value === 'boolean' ? !value : false;

      store.set(newValue);
      return newValue;
   }
}

function s_GET_STORE$1(stores, itemId, defaultValue = void 0)
{
   let store = stores.get(itemId);
   if (store === void 0)
   {
      store = s_CREATE_STORE$1(itemId, defaultValue);
      stores.set(itemId, store);
   }

   return store;
}

function s_CREATE_STORE$1(itemId, defaultValue = void 0)
{
   try
   {
      if (localStorage.getItem(itemId))
      {
         defaultValue = JSON.parse(localStorage.getItem(itemId));
      }
   }
   catch (err) { /**/ }

   const store = writable$1(itemId, defaultValue);
   store.get = () => get(store);

   return store;
}

const storage$2 = new LocalStorage();

class LocalStoragePlugin
{
   static onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:local:item:get`, storage$2.getItem, storage$2, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:boolean:swap`, storage$2.swapItemBoolean, storage$2, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:set`, storage$2.setItem, storage$2, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:store:get`, storage$2.getStore, storage$2, { guard: true });
   }
}

// src/session.ts
var storage$1 = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g = generator(storage$1);
var writable = g.writable;

class SessionStorage
{
   /**
    * @type {*}
    */
   #stores = new Map();

   getItem(itemId)
   {
      let value;

      const storageValue = sessionStorage.getItem(itemId);

      if (storageValue !== void 0)
      {
         value = JSON.parse(storageValue);
      }

      return value;
   }

   getStore(itemId, defaultValue)
   {
      return s_GET_STORE(this.#stores, itemId, defaultValue);
   }

   setItem(itemId, value)
   {
      const store = s_GET_STORE(this.#stores, itemId);
      store.set(value);
   }

   swapItemBoolean(itemId, defaultValue)
   {
      const store = s_GET_STORE(this.#stores, itemId, defaultValue);
      const value = store.get();
      const newValue = typeof value === 'boolean' ? !value : false;

      store.set(newValue);
      return newValue;
   }
}

function s_GET_STORE(stores, itemId, defaultValue = void 0)
{
   let store = stores.get(itemId);
   if (store === void 0)
   {
      store = s_CREATE_STORE(itemId, defaultValue);
      stores.set(itemId, store);
   }

   return store;
}

function s_CREATE_STORE(itemId, defaultValue = void 0)
{
   try
   {
      if (sessionStorage.getItem(itemId))
      {
         defaultValue = JSON.parse(sessionStorage.getItem(itemId));
      }
   }
   catch (err) { /**/ }

   const store = writable(itemId, defaultValue);
   store.get = () => get(store);

   return store;
}

const storage = new SessionStorage();

class SessionStoragePlugin
{
   static onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:session:item:get`, storage.getItem, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:boolean:swap`, storage.swapItemBoolean, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:set`, storage.setItem, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:store:get`, storage.getStore, storage, { guard: true });
   }
}

export { LocalStoragePlugin as LocalStorage, SessionStoragePlugin as SessionStorage };
//# sourceMappingURL=system.js.map
