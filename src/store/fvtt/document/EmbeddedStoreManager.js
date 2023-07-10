import { DynMapReducer }   from '#runtime/svelte/store/reducer';

import {
   hasPrototype,
   isObject }              from '#runtime/util/object';

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
   static #renderContextRegex = /(?<action>create|delete|update)(?<sep>\.?)(?<name>\w+)/;

   /**
    * @type {Map<string, EmbeddedCollectionData<any>>}
    */
   #name = new Map();

   /**
    * @type {foundry.abstract.Document[]}
    */
   #document;

   /**
    * @type {Map<string, string>}
    */
   #collectionToDocName = new Map();

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
    * @template [T=import('./types').NamedDocumentConstructor]
    *
    * @param {T} FoundryDoc - A Foundry document class / constructor.
    *
    * @param {import('#runtime/svelte/store/reducer').DynOptionsMapCreate<string, T>} options - DynMapReducer
    *        creation options.
    *
    * @returns {import('#runtime/svelte/store/reducer').DynMapReducer<string, T>} DynMapReducer instance.
    */
   create(FoundryDoc, options)
   {
      const docName = FoundryDoc?.documentName;

      if (typeof docName !== 'string')
      {
         throw new TypeError(
          `EmbeddedStoreManager.create error: 'FoundryDoc' does not have a valid 'documentName' property.`);
      }

      /** @type {foundry.abstract.Document} */
      const doc = this.#document[0];

      let collection = null;

      if (doc)
      {
         try
         {
            collection = doc.getEmbeddedCollection(docName);
         }
         catch (err)
         {
            console.warn(`EmbeddedStoreManager.create error: No valid embedded collection for: ${docName}`);
         }
      }

      let embeddedData;

      if (!this.#name.has(docName))
      {
         embeddedData = {
            collection,
            stores: new Map()
         };

         this.#name.set(docName, embeddedData);
      }
      else
      {
         embeddedData = this.#name.get(docName);
      }

      /** @type {string} */
      let name;

      /** @type {import('#runtime/svelte/store/reducer').DynDataOptions<T>} */
      let rest = {};

      /** @type {import('#runtime/svelte/store/reducer').IDynMapReducerCtor<string, T>} */
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

      if (typeof name !== 'string')
      {
         throw new TypeError(`EmbeddedStoreManager.create error: 'name' is not a string.`);
      }

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
    * @template [T=import('./types').NamedDocumentConstructor]
    *
    * Destroys and removes embedded collection stores. Invoking this method with no parameters destroys all stores.
    * Invoking with an embedded name destroys all stores for that particular collection. If you provide an embedded and
    * store name just that particular store is destroyed and removed.
    *
    * @param {T}   [FoundryDoc] - A Foundry document class / constructor.
    *
    * @param {string}   [storeName] - Specific store name.
    *
    * @returns {boolean} One or more stores destroyed?
    */
   destroy(FoundryDoc, storeName)
   {
      let count = 0;

      // Destroy all embedded stores
      if (FoundryDoc === void 0)
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
      else
      {
         const docName = FoundryDoc?.documentName;

         if (typeof docName !== 'string')
         {
            throw new TypeError(
             `EmbeddedStoreManager.delete error: 'FoundryDoc' does not have a valid 'documentName' property.`);
         }

         if (storeName === void 0)
         {
            const embeddedData = this.#name.get(docName);
            if (embeddedData)
            {
               embeddedData.collection = null;
               for (const store of embeddedData.stores.values())
               {
                  store.destroy();
                  count++;
               }
            }

            this.#name.delete(docName);
         }
         else if (storeName === 'string')
         {
            const embeddedData = this.#name.get(docName);
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
      }

      return count > 0;
   }

   /**
    * @template [T=import('./types').NamedDocumentConstructor]
    *
    * @param {T} FoundryDoc - A Foundry document class / constructor.
    *
    * @param {string} storeName - Name of the embedded collection to retrieve.
    *
    * @returns {import('#runtime/svelte/store/reducer').DynMapReducer<string, InstanceType<T>>} DynMapReducer
    *          instance.
    */
   get(FoundryDoc, storeName)
   {
      const docName = FoundryDoc?.documentName;

      if (typeof docName !== 'string')
      {
         throw new TypeError(
          `EmbeddedStoreManager.get error: 'FoundryDoc' does not have a valid 'documentName' property.`);
      }

      if (!this.#name.has(docName)) { return void 0; }

      return this.#name.get(docName).stores.get(storeName);
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

         /** @type {[string, string][]} */
         const embeddedNames = Object.entries(doc.constructor?.metadata?.embedded ?? []);

         this.#collectionToDocName.clear();

         // Remove all previously stored embedded name CRUD keys.
         this.#embeddedNames.clear();

         for (const [docName, collectionName] of embeddedNames)
         {
            // Remove processed embedded doc name from existingEmbeddedNames set.
            existingEmbeddedNames.delete(docName);

            // Update CRUD keys for v10.
            this.#embeddedNames.add(`create${docName}`);
            this.#embeddedNames.add(`delete${docName}`);
            this.#embeddedNames.add(`update${docName}`);

            // Update CRUD keys for v11.
            this.#embeddedNames.add(`create.${collectionName}`);
            this.#embeddedNames.add(`delete.${collectionName}`);
            this.#embeddedNames.add(`update.${collectionName}`);

            // v10 collection to doc name lookup.
            this.#collectionToDocName.set(docName, docName);
            this.#collectionToDocName.set(collectionName, docName);

            let collection = null;

            try
            {
               // Update any existing stores with the actual collection.
               collection = doc.getEmbeddedCollection(docName);
            }
            catch (err)
            {
               console.warn(`EmbeddedStoreManager.handleDocUpdate error: No valid embedded collection for: ${docName}`);
            }

            // Update EmbeddedData for new collection.
            const embeddedData = this.#name.get(docName);
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
         this.#collectionToDocName.clear();
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
         const docOrCollectionName = match.groups.name;
         const embeddedName = this.#collectionToDocName.get(docOrCollectionName);

         if (!this.#name.has(embeddedName)) { return; }

         for (const store of this.#name.get(embeddedName).stores.values())
         {
            store.index.update(true);
         }
      }
   }
}

/**
 * @template T
 *
 * @typedef {object} EmbeddedCollectionData
 *
 * @property {foundry.abstract.Collection} collection -
 *
 * @property {Map<string, import('#runtime/svelte/store/reducer').DynMapReducer<string, T>>} stores -
 */
