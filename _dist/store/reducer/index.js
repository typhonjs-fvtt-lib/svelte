import { DynArrayReducer } from '@typhonjs-svelte/runtime-base/data/struct/store/reducer';
import { Hashing, Timing, Strings } from '@typhonjs-svelte/runtime-base/util';
import { isObject, klona, isIterable } from '@typhonjs-svelte/runtime-base/util/object';
import { isWritableStore, subscribeIgnoreFirst } from '@typhonjs-svelte/runtime-base/util/store';
import { writable, get } from 'svelte/store';

/**
 * Provides a base implementation for store entries in {@link ArrayObjectStore}.
 *
 * In particular providing the required getting / accessor for the 'id' property.
 */
class ObjectEntryStore
{
   /**
    * @type {object}
    */
   #data;

   /**
    * Stores the subscribers.
    *
    * @type {(function(object): void)[]}
    */
   #subscriptions = [];

   /**
    * @param {object}   data -
    */
   constructor(data = {})
   {
      if (!isObject(data)) { throw new TypeError(`'data' is not an object.`); }

      this.#data = data;

      // If an id is missing then add it.
      if (typeof data.id !== 'string') { this.#data.id = Hashing.uuidv4(); }

      if (!Hashing.isUuidv4(data.id)) { throw new Error(`'data.id' (${data.id}) is not a valid UUIDv4 string.`); }
   }

   /**
    * Invoked by ArrayObjectStore to provide custom duplication. Override this static method in your entry store.
    *
    * @param {object}   data - A copy of local data w/ new ID already set.
    *
    * @param {import('./ArrayObjectStore.js').ArrayObjectStore} arrayStore - The source ArrayObjectStore instance.
    */
   static duplicate(data, arrayStore) {}  // eslint-disable-line no-unused-vars

   /**
    * @returns {object} The object data tracked by this store.
    * @protected
    */
   get _data() { return this.#data; }

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * @returns {string} The ID attribute in object data tracked by this store.
    */
   get id() { return this.#data.id; }

   toJSON()
   {
      return this.#data;
   }

   /**
    * @param {function(object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);  // add handler to the array of subscribers

      handler(this.#data);                // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * @protected
    */
   _updateSubscribers()
   {
      const subscriptions = this.#subscriptions;

      const data = this.#data;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](data); }
   }
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 */
class ArrayObjectStore
{
   /** @type {T[]} */
   #data = [];

   /**
    * @type {Map<string, { store: T, unsubscribe: Function}>}
    */
   #dataMap = new Map();

   /**
    * @type {DynArrayReducer<T>}
    */
   #dataReducer;

   /**
    * @type {boolean}
    */
   #manualUpdate;

   /**
    * @type {T}
    */
   #StoreClass;

   /**
    * Stores the subscribers.
    *
    * @type {(function(T[]): void)[]}
    */
   #subscriptions = [];

   /**
    * @type {Function}
    */
   #updateSubscribersBound;

   /**
    * @returns {ObjectEntryStore} The default object entry store constructor.
    */
   static get EntryStore() { return ObjectEntryStore; }

   /**
    * @param {import('./index.js').ArrayObjectStoreParams} params -
    */
   constructor({ StoreClass, defaultData = [], childDebounce = 250, dataReducer = false, manualUpdate = false } = {})
   {
      if (!Number.isInteger(childDebounce) || childDebounce < 0 || childDebounce > 1000)
      {
         throw new TypeError(`'childDebounce' must be an integer between and including 0 - 1000.`);
      }

      if (typeof manualUpdate !== 'boolean') { throw new TypeError(`'manualUpdate' is not a boolean.`); }

      if (!isWritableStore(StoreClass.prototype))
      {
         throw new TypeError(`'StoreClass' is not a writable store constructor.`);
      }

      let hasIDGetter = false;

      // Walk parent prototype chain. Check for descriptor at each prototype level.
      for (let o = StoreClass.prototype; o; o = Object.getPrototypeOf(o))
      {
         const descriptor = Object.getOwnPropertyDescriptor(o, 'id');
         if (descriptor !== void 0 && descriptor.get !== void 0)
         {
            hasIDGetter = true;
            break;
         }
      }

      if (!hasIDGetter)
      {
         throw new TypeError(`'StoreClass' does not have a getter accessor for 'id' property.`);
      }

      if (!Array.isArray(defaultData)) { throw new TypeError(`'defaultData' is not an array.`); }

      this.#manualUpdate = manualUpdate;

      this.#StoreClass = StoreClass;

      if (dataReducer) { this.#dataReducer = new DynArrayReducer({ data: this.#data }); }

      // Prepare a debounced callback that is used for all child store entry subscriptions.
      this.#updateSubscribersBound = childDebounce === 0 ? this.updateSubscribers.bind(this) :
       Timing.debounce((data) => this.updateSubscribers(data), childDebounce);
   }

   /**
    * Provide an iterator for public access to entry stores.
    *
    * @yields {T | void}
    */
   *[Symbol.iterator]()
   {
      if (this.#data.length === 0) { return; }

      for (const entryStore of this.#data) { yield entryStore; }
   }

   /**
    * @returns {T[]} The internal data array tracked allowing child classes direct access.
    * @protected
    */
   get _data() { return this.#data; }

   /**
    * @returns {DynArrayReducer<T>} The data reducer.
    */
   get dataReducer()
   {
      if (!this.#dataReducer)
      {
         throw new Error(
          `'dataReducer' is not initialized; did you forget to specify 'dataReducer' as true in constructor options?`);
      }

      return this.#dataReducer;
   }

   /**
    * @returns {number} The length of all data.
    */
   get length() { return this.#data.length; }

   /**
    * Removes all child store entries.
    */
   clearEntries()
   {
      for (const storeEntryData of this.#dataMap.values()) { storeEntryData.unsubscribe(); }

      this.#dataMap.clear();
      this.#data.length = 0;

      this.updateSubscribers();
   }

   /**
    * Creates a new store from given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} The store
    */
   createEntry(entryData = {})
   {
      if (!isObject(entryData)) { throw new TypeError(`'entryData' is not an object.`); }

      if (typeof entryData.id !== 'string') { entryData.id = Hashing.uuidv4(); }

      if (this.#data.findIndex((entry) => entry.id === entryData.id) >= 0)
      {
         throw new Error(`'entryData.id' (${entryData.id}) already in this ArrayObjectStore instance.`);
      }

      const store = this.#createStore(entryData);

      this.updateSubscribers();

      return store;
   }

   /**
    * Add a new store entry from the given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} New store entry instance.
    */
   #createStore(entryData)
   {
      const store = new this.#StoreClass(entryData, this);

      if (!Hashing.isUuidv4(store.id))
      {
         throw new Error(`'store.id' (${store.id}) is not a UUIDv4 compliant string.`);
      }

      const unsubscribe = subscribeIgnoreFirst(store, this.#updateSubscribersBound);

      this.#data.push(store);
      this.#dataMap.set(entryData.id, { store, unsubscribe });

      return store;
   }

   /**
    * Deletes a given entry store by ID from this world setting array store instance.
    *
    * @param {string}  id - ID of entry to delete.
    *
    * @returns {boolean} Delete operation successful.
    */
   deleteEntry(id)
   {
      const result = this.#deleteStore(id);

      if (result) { this.updateSubscribers(); }

      return result;
   }

   #deleteStore(id)
   {
      if (typeof id !== 'string') { throw new TypeError(`'id' is not a string.`); }

      const storeEntryData = this.#dataMap.get(id);
      if (storeEntryData)
      {
         storeEntryData.unsubscribe();

         this.#dataMap.delete(id);

         const index = this.#data.findIndex((entry) => entry.id === id);
         if (index >= 0) { this.#data.splice(index, 1); }

         return true;
      }

      return false;
   }

   /**
    * Duplicates an entry store by the given ID.
    *
    * @param {string}   id - UUIDv4 string.
    *
    * @returns {*} Instance of StoreClass.
    */
   duplicateEntry(id)
   {
      if (typeof id !== 'string') { throw new TypeError(`'id' is not a string.`); }

      const storeEntryData = this.#dataMap.get(id);

      if (storeEntryData)
      {
         const data = klona(storeEntryData.store.toJSON());
         data.id = Hashing.uuidv4();

         // Allow StoreClass to statically perform any specialized duplication.
         this.#StoreClass?.duplicate?.(data, this);

         return this.createEntry(data);
      }

      return void 0;
   }

   /**
    * Find an entry in the backing child store array.
    *
    * @param {function(T): T|void}  predicate - A predicate function
    *
    * @returns {T|void} Found entry in array or undefined.
    */
   findEntry(predicate)
   {
      return this.#data.find(predicate);
   }

   /**
    * Finds an entry store instance by 'id' / UUIDv4.
    *
    * @param {string}   id - A UUIDv4 string.
    *
    * @returns {T|void} Entry store instance.
    */
   getEntry(id)
   {
      const storeEntryData = this.#dataMap.get(id);
      return storeEntryData ? storeEntryData.store : void 0;
   }

   /**
    * Sets the children store data by 'id', adds new entry store instances, or removes entries that are no longer in the
    * update list.
    *
    * @param {T[]}   updateList -
    */
   set(updateList)
   {
      if (!Array.isArray(updateList))
      {
         console.warn(`ArrayObjectStore.set warning: aborting set operation as 'updateList' is not an array.`);
         return;
      }

      const data = this.#data;
      const dataMap = this.#dataMap;

      // Create a set of all current entry IDs.
      const removeIDSet = new Set(dataMap.keys());

      let rebuildIndex = false;

      for (let updateIndex = 0; updateIndex < updateList.length; updateIndex++)
      {
         const updateData = updateList[updateIndex];

         const id = updateData.id;

         if (typeof id !== 'string') { throw new Error(`'updateData.id' is not a string.`); }

         const localIndex = data.findIndex((entry) => entry.id === id);

         if (localIndex >= 0)
         {
            const localEntry = data[localIndex];

            // Update the entry data.
            localEntry.set(updateData);

            // Must move to correct position
            if (localIndex !== updateIndex)
            {
               // Remove from current location.
               data.splice(localIndex, 1);

               if (updateIndex < data.length)
               {
                  // Insert at new location.
                  data.splice(updateIndex, 0, localEntry);
               }
               else
               {
                  // Local data length is less than update data index; rebuild index.
                  rebuildIndex = true;
               }
            }

            // Delete from removeIDSet as entry is still in local data.
            removeIDSet.delete(id);
         }
         else
         {
            this.#createStore(updateData);
         }
      }

      if (rebuildIndex)
      {
         // Must invoke unsubscribe for all child stores.
         for (const storeEntryData of dataMap.values()) { storeEntryData.unsubscribe(); }

         data.length = 0;
         dataMap.clear();

         for (const updateData of updateList) { this.#createStore(updateData); }
      }
      else
      {
         // Remove entries that are no longer in data.
         for (const id of removeIDSet) { this.#deleteStore(id); }
      }

      this.updateSubscribers();
   }

   toJSON()
   {
      return this.#data;
   }

// -------------------------------------------------------------------------------------------------------------------

   /**
    * @param {function(T[]): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this.#data);                     // call handler with current value

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
    * @param {import('./index.js').ArrayObjectUpdateData}  [update] -
    */
   updateSubscribers(update)
   {
      const updateGate = typeof update === 'boolean' ? update : !this.#manualUpdate;

      if (updateGate)
      {
         const subscriptions = this.#subscriptions;

         const data = this.#data;

         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](data); }
      }

      // This will update the filtered data and `dataReducer` store and forces an update to subscribers.
      if (this.#dataReducer) { this.#dataReducer.index.update(true); }
   }
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 * @augments {ArrayObjectStore<T>}
 */
class CrudArrayObjectStore extends ArrayObjectStore
{
   /** @type {CrudDispatch} */
   #crudDispatch;

   /** @type {object} */
   #extraData;

   /**
    * @param {object}                  [opts] - Optional parameters.
    *
    * @param {CrudDispatch}            [opts.crudDispatch] -
    *
    * @param {object}                  [opts.extraData] -
    *
    * @param {import('./index.js').ArrayObjectStoreParams}  [opts.rest] - Rest of ArrayObjectStore parameters.
    */
   constructor({ crudDispatch, extraData, ...rest })
   {
      // 'manualUpdate' is set to true if 'crudUpdate' is defined, but can be overridden by `...rest`.
      super({
         manualUpdate: typeof crudDispatch === 'function',
         ...rest,
      });

      if (crudDispatch !== void 0 && typeof crudDispatch !== 'function')
      {
         throw new TypeError(`'crudDispatch' is not a function.`);
      }

      if (extraData !== void 0 && !isObject(extraData))
      {
         throw new TypeError(`'extraData' is not an object.`);
      }

      this.#crudDispatch = crudDispatch;
      this.#extraData = extraData ?? {};
   }

   /**
    * Removes all child store entries.
    */
   clearEntries()
   {
      super.clearEntries();

      if (this.#crudDispatch)
      {
         this.#crudDispatch({ action: 'clear', ...this.#extraData });
      }
   }

   /**
    * Creates a new store from given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} Associated store with entry data.
    */
   createEntry(entryData = {})
   {
      const store = super.createEntry(entryData);

      if (store && this.#crudDispatch)
      {
         this.#crudDispatch({
            action: 'create',
            ...this.#extraData,
            id: store.id,
            data: store.toJSON()
         });
      }

      return store;
   }

   /**
    * Deletes a given entry store by ID from this world setting array store instance.
    *
    * @param {string}  id - ID of entry to delete.
    *
    * @returns {boolean} Delete operation successful.
    */
   deleteEntry(id)
   {
      const result = super.deleteEntry(id);

      if (result && this.#crudDispatch)
      {
         this.#crudDispatch({ action: 'delete', ...this.#extraData, id });
      }

      return result;
   }

   /**
    * Updates subscribers, but provides special handling when WorldSettingArrayStore has an `crudDispatch` function
    * attached. When the update is an object with a valid UUIDv4 string as the id property the `crudDispatch`
    * function is invoked with  along with the data payload
    *
    * @param {import('./index.js').ArrayObjectUpdateData} [update] -
    */
   updateSubscribers(update)
   {
      if (this.#crudDispatch && isObject(update) && Hashing.isUuidv4(update.id))
      {
         const result = this.#crudDispatch({
            action: 'update',
            ...this.#extraData,
            id: update.id,
            data: update  // TODO: Consider using klona to clone data.
         });

         // If the crudDispatch function returns a boolean then invoke 'ArrayObjectStore.updateSubscribers' with it.
         super.updateSubscribers(typeof result === 'boolean' ? result : update);
      }
      else
      {
         super.updateSubscribers(update);
      }
   }
}

/**
 * @typedef {import('./index.js').ArrayObjectStoreParams & CrudArrayObjectStoreParamProps} CrudArrayObjectStoreParams
 */

/**
 * @typedef {object} CrudArrayObjectStoreParamProps
 *
 * @property {CrudDispatch}   [crudDispatch] -
 *
 * @property {object}         [extraData] -
 *
 * @internal
 */

/**
 * @typedef {(data: { action: string, id?: string, data?: object }) => boolean} CrudDispatch
 *
 * A function that accepts an object w/ 'action', 'moduleId', 'key' properties and optional 'id' / UUIDv4 string and
 * 'data' property.
 */

/**
 * Creates a filter function to compare objects by a give property key against a regex test. The returned function
 * is also a writable Svelte store that builds a regex from the stores value.
 *
 * This filter function can be used w/ a dynamic reducer and bound as a store to input elements.
 *
 * @param {string|Iterable<string>}   properties - Property key to compare.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {boolean}  [opts.caseSensitive=false] - When true regex test is case-sensitive.
 *
 * @param {import('#svelte/store').Writable<string>}  [opts.store] - Use the provided store to instead of creating
 *        a default writable store.
 *
 * @returns {((data: object) => boolean) & import('#svelte/store').Writable<string>} The query string filter.
 */
function regexObjectQuery(properties, { caseSensitive = false, store } = {})
{
   let keyword = '';
   let regex;

   if (store !== void 0 && !isWritableStore(store))
   {
      throw new TypeError(`createObjectQuery error: 'store' is not a writable store.`);
   }

   const storeKeyword = store ? store : writable(keyword);

   // If an existing store is provided then set initial values.
   if (store)
   {
      const current = get(store);

      if (typeof current === 'string')
      {
         keyword = Strings.normalize(current);
         regex = new RegExp(Strings.escape(keyword), caseSensitive ? '' : 'i');
      }
      else
      {
         store.set(keyword);
      }
   }

   /**
    * If there is no filter keyword / regex then do not filter otherwise filter based on the regex
    * created from the search input element.
    *
    * @param {object} data - Data object to test against regex.
    *
    * @returns {boolean} AnimationStore filter state.
    */
   function filterQuery(data)
   {
      if (keyword === '' || !regex) { return true; }

      if (isIterable(properties))
      {
         for (const property of properties)
         {
            if (regex.test(Strings.normalize(data?.[property]))) { return true; }
         }

         return false;
      }
      else
      {
         return regex.test(Strings.normalize(data?.[properties]));
      }
   }

   /**
    * Create a custom store that changes when the search keyword changes.
    *
    * @param {(string) => void} handler - A callback function that accepts strings.
    *
    * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
    */
   filterQuery.subscribe = (handler) =>
   {
      return storeKeyword.subscribe(handler);
   };

   /**
    * Set
    *
    * @param {string}   value - A new value for the keyword / regex test.
    */
   filterQuery.set = (value) =>
   {
      if (typeof value === 'string')
      {
         keyword = Strings.normalize(value);
         regex = new RegExp(Strings.escape(keyword), caseSensitive ? '' : 'i');
         storeKeyword.set(keyword);
      }
   };

   return filterQuery;
}

const filters = /*#__PURE__*/Object.freeze({
   __proto__: null,
   regexObjectQuery: regexObjectQuery
});

/**
 * Provides helper functions to create dynamic store driven filters and sort functions for dynamic reducers. The
 * returned functions are also Svelte stores and can be added to a reducer as well as used as a store.
 */
class DynReducerHelper
{
   /**
    * Returns the following filter functions:
    * - regexObjectQuery(property, options); suitable for object reducers matching one or more properties against
    *   the store value as a regex. Optional parameters to set case sensitivity and passing in an existing store.
    *
    * @returns {{
    *    regexObjectQuery: (properties: string|Iterable<string>, options?: {caseSensitive?: boolean, store?: import('#svelte/store').Writable<string>}) => (((data: {}) => boolean) & import('#svelte/store').Writable<string>)
    * }} All available filters.
    */
   static get filters() { return filters; }
}

export { ArrayObjectStore, CrudArrayObjectStore, DynReducerHelper, ObjectEntryStore };
//# sourceMappingURL=index.js.map
