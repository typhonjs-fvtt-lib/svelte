import { DynMapReducer }   from '@typhonjs-svelte/lib/store';

import {
   hasPrototype,
   isObject }              from '@typhonjs-svelte/lib/util';

/**
 * Provides management of reactive embedded collections.
 *
 * TODO: Consider subscribing to TJSDocument rather than exposing {@link EmbeddedStoreManager.handleDocChange} and
 * {@link EmbeddedStoreManager.handleUpdate}
 */
export class EmbeddedStoreManager
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
   }

   /**
    * @template T
    *
    * @param {string} embeddedName -
    *
    * @param {import('@typhonjs-fvtt/svelte/store').OptionsDynMapCreate<string, T>} options -
    *
    * @returns {import('@typhonjs-fvtt/svelte/store').DynMapReducer<string, T>} DynMapReducer instance
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

      /** @type {import('@typhonjs-fvtt/svelte/store').DataOptions<T>} */
      let rest = {};

      /** @type {import('@typhonjs-fvtt/svelte/store').IDynMapReducerCtor<string, T>} */
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
    * @returns {import('@typhonjs-fvtt/svelte/store').DynMapReducer<string, T>} DynMapReducer instance.
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
