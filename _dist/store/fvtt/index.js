import { writable } from 'svelte/store';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';
import { hasPrototype, isObject, isPlainObject, isIterable } from '@typhonjs-svelte/runtime-base/util/object';
import { DynMapReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';
import { isWritableStore, subscribeIgnoreFirst } from '@typhonjs-svelte/runtime-base/util/store';
import { ripple, rippleFocus } from '@typhonjs-svelte/runtime-base/svelte/action/animate';
import { isSvelteComponent } from '@typhonjs-svelte/runtime-base/svelte/util';
import { TJSDialog } from '@typhonjs-fvtt/svelte/application';
import { localize } from '@typhonjs-fvtt/svelte/helper';

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

/**
 * @template [T=globalThis.foundry.abstract.Document]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
class TJSDocument
{
   /**
    * @type {T[]}
    */
   #document = [void 0];

   /**
    * @type {EmbeddedStoreManager}
    */
   #embeddedStoreManager;

   /**
    * @type {import('./types').EmbeddedAPI}
    */
   #embeddedAPI;

   /**
    * @type {string}
    */
   #uuidv4;

   /**
    * @type {TJSDocumentOptions}
    */
   #options = { delete: void 0, preDelete: void 0 };

   /**
    * @type {((value: T, updateOptions?: TJSDocumentUpdateOptions) => void)[]}
    */
   #subscriptions = [];

   /**
    * @type {TJSDocumentUpdateOptions}
    */
   #updateOptions;

   /**
    * @param {T | TJSDocumentOptions}  [document] - Document to wrap or TJSDocumentOptions.
    *
    * @param {TJSDocumentOptions}      [options] - TJSDocument options.
    */
   constructor(document, options = {})
   {
      this.#uuidv4 = `tjs-document-${Hashing.uuidv4()}`;

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
    * @returns {import('./types').EmbeddedAPI} Embedded store manager.
    */
   get embedded()
   {
      if (!this.#embeddedAPI)
      {
         this.#embeddedStoreManager = new EmbeddedStoreManager(this.#document);

         /** @type {import('./types').EmbeddedAPI} */
         this.#embeddedAPI = {
            create: (doc, options) => this.#embeddedStoreManager.create(doc, options),
            destroy: (doc, storeName) => this.#embeddedStoreManager.destroy(doc, storeName),
            get: (doc, storeName) => this.#embeddedStoreManager.get(doc, storeName)
         };
      }

      return this.#embeddedAPI;
   }

   /**
    * Returns the options passed on last update.
    *
    * @returns {TJSDocumentUpdateOptions} Last update options.
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
    * @returns {T} Current document
    */
   get() { return this.#document[0]; }

   /**
    * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
    *
    * @param {object}   data - Drop transfer data.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.actor=true] - Accept actor owned documents.
    *
    * @param {boolean}  [opts.compendium=true] - Accept compendium documents.
    *
    * @param {boolean}  [opts.world=true] - Accept world documents.
    *
    * @param {string[]|undefined}   [opts.types] - Require the `data.type` to match entry in `types`.
    *
    * @returns {string|undefined} Foundry UUID for drop data.
    */
   static getUUIDFromDataTransfer(data, { actor = true, compendium = true, world = true, types = void 0 } = {})
   {
      if (!isObject(data)) { return void 0; }
      if (Array.isArray(types) && !types.includes(data.type)) { return void 0; }

      let uuid = void 0;

      if (typeof data.uuid === 'string') // v10 and above provides a full UUID.
      {
         const isCompendium = data.uuid.startsWith('Compendium');

         if (isCompendium && compendium)
         {
            uuid = data.uuid;
         }
         else if (world)
         {
            uuid = data.uuid;
         }
      }
      else // v9 and below parsing.
      {
         if (actor && world && data.actorId && data.type)
         {
            uuid = `Actor.${data.actorId}.${data.type}.${data.data._id}`;
         }
         else if (typeof data.id === 'string') // v9 and below uses `id`
         {
            if (compendium && typeof data.pack === 'string')
            {
               uuid = `Compendium.${data.pack}.${data.id}`;
            }
            else if (world)
            {
               uuid = `${data.type}.${data.id}`;
            }
         }
      }

      return uuid;
   }


   /**
    * @param {T | undefined}  document - New document to set.
    *
    * @param {TJSDocumentUpdateOptions}   [options] - New document update options to set.
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

      if (!isObject(options))
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
    * @param {T | undefined} doc -
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
    * @param {{ actor?: boolean, compendium?: boolean, world?: boolean, types?: string[] } & TJSDocumentOptions}   [options] - Optional
    *        parameters.
    *
    * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
    */
   async setFromDataTransfer(data, options)
   {
      return this.setFromUUID(TJSDocument.getUUIDFromDataTransfer(data, options), options);
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
    * @param {(value: T, updateOptions?: TJSDocumentUpdateOptions) => void} handler - Callback function that is
    * invoked on update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
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
 * @property {(doc: globalThis.foundry.abstract.Document) => void} [delete] Optional post delete function to invoke when
 * document is deleted _after_ subscribers have been notified.
 *
 * @property {(doc: globalThis.foundry.abstract.Document) => void} [preDelete] Optional pre delete function to invoke
 * when document is deleted _before_ subscribers are notified.
 */

/**
 * @typedef TJSDocumentUpdateOptions Provides data regarding the latest document change.
 *
 * @property {string}   [action] The update action. Useful for filtering.
 *
 * @property {string}   [renderContext] The update action. Useful for filtering.
 *
 * @property {object[]|string[]} [data] Foundry data associated with document changes.
 */

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template [T=globalThis.DocumentCollection]
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

   /**
    * @type {((value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void)[]}
    */
   #subscriptions = [];

   /**
    * @type {TJSDocumentCollectionUpdateOptions<T>}
    */
   #updateOptions;

   /**
    * @param {T | TJSDocumentCollectionOptions}   [collection] - Collection to wrap or TJSDocumentCollectionOptions.
    *
    * @param {TJSDocumentCollectionOptions}     [options] - TJSDocumentCollection options.
    */
   constructor(collection, options = {})
   {
      this.#uuid = `tjs-collection-${Hashing.uuidv4()}`;

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
    * @returns {TJSDocumentCollectionUpdateOptions<T>} Last update options.
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

      if (collection instanceof globalThis.DocumentCollection)
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

      if (collection instanceof globalThis.DocumentCollection)
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
    * @returns {T} Current collection
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

      if (collection !== void 0 && !(collection instanceof globalThis.DocumentCollection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (collection instanceof globalThis.DocumentCollection)
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
    * @param {(value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void} handler - Callback function
    * that is invoked on update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
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
 * @property {(collection: globalThis.DocumentCollection) => void} [delete] Optional post delete function
 *           to invoke when document is deleted _after_ subscribers have been notified.
 *
 * @property {(collection: globalThis.DocumentCollection) => void} [preDelete] Optional pre delete function to
 *           invoke when document is deleted _before_ subscribers are notified.
 */

/**
 * @template T
 * @typedef TJSDocumentCollectionUpdateOptions Provides data regarding the latest collection change.
 *
 * @property {string}   action The update action. Useful for filtering.
 *
 * @property {string}   documentType The document name.
 *
 * @property {T[]}      documents associated documents that changed.
 *
 * @property {object[]|string[]} data Foundry data associated with document changes.
 */

/**
 * Controls preparation and processing of registered game settings w/ TJSGameSettings. Game settings are parsed
 * for UI display by TJSSettingsEdit. The store `showSettings` is utilized in TJSSettingsSwap component to provide
 * an easy way to flip between settings component or any main slotted component.
 */
class UIControl
{
   /** @type {TJSSettingsCustomSection[]} */
   #sections = [];

   /** @type {import('./').TJSGameSettings} */
   #settings;

   /** @type {boolean} */
   #showSettings = false;

   /** @type {Function} */
   #showSettingsSet;

   /** @type {{showSettings: import('svelte/store').Readable<boolean>}} */
   #stores;

   /**
    * @param {import('./').TJSGameSettings}   settings -
    */
   constructor(settings)
   {
      this.#settings = settings;

      const showSettings = writable(this.#showSettings);
      this.#showSettingsSet = showSettings.set;

      this.#stores = {
         showSettings: { subscribe: showSettings.subscribe }
      };

      Object.freeze(this.#stores);
   }

   /**
    * @returns {boolean} Current `showSettings` state.
    */
   get showSettings()
   {
      return this.#showSettings;
   }

   /**
    * @returns {{showSettings: import('svelte/store').Readable<boolean>}} Returns the managed stores.
    */
   get stores()
   {
      return this.#stores;
   }

   /**
    * Sets current `showSettings` state.
    *
    * @param {boolean}  showSettings - New `showSettings` state.
    */
   set showSettings(showSettings)
   {
      this.#showSettings = showSettings;
      this.#showSettingsSet(this.#showSettings);
   }

   /**
    * Adds a custom section / folder defined by the provided TJSSettingsCustomSection options object.
    *
    * @param {TJSSettingsCustomSection} options - The configuration object for the custom section.
    */
   addSection(options)
   {
      if (!isObject(options)) { throw new TypeError(`'options' is not an object.`); }

      if (!isSvelteComponent(options.class)) { throw new TypeError(`'options.class' is not a Svelte component.`); }

      if (options.props !== void 0 && !isObject(options.props))
      {
         throw new TypeError(`'options.props' is not an object.`);
      }

      if (options.folder !== void 0)
      {
         const folder = options.folder;

         if (typeof folder !== 'string' && !isObject(folder))
         {
            throw new TypeError(`'options.folder' is not a string or object.`);
         }

         if (isObject(folder))
         {
            if (typeof folder.label !== 'string') { throw new TypeError(`'options.folder.label' is not a string.`); }

            // Validate custom component set as folder summary end.
            if (folder.summaryEnd !== void 0)
            {
               if (!isObject(folder.summaryEnd))
               {
                  throw new TypeError(`'options.folder.summaryEnd' is not an object.`);
               }

               if (!isSvelteComponent(folder.summaryEnd.class))
               {
                  throw new TypeError(`'options.folder.summaryEnd.class' is not a Svelte component.`);
               }

               if (folder.summaryEnd.props !== void 0 && !isObject(folder.summaryEnd.props))
               {
                  throw new TypeError(`'options.folder.summaryEnd.props' is not an object.`);
               }
            }

            // Validate that folder inline styles is an object.
            if (folder.styles !== void 0 && !isObject(folder.styles))
            {
               throw new TypeError(`'options.folder.styles' is not an object.`);
            }
         }
      }

      // Validate that section inline styles is an object.
      if (options.styles !== void 0 && !isObject(options.styles))
      {
         throw new TypeError(`'options.styles' is not an object.`);
      }

      this.#sections.push(options);
   }

   /**
    * Creates the UISettingsData object by parsing stored settings in
    *
    * @param {TJSSettingsCreateOptions} [options] - Optional parameters.
    *
    * @returns {TJSSettingsUIData} Parsed UI settings data.
    */
   create(options)
   {
      const settings = this.#parseSettings(options);
      const destroy = () => this.#destroy(settings);

      return {
         ...settings,
         destroy
      };
   }

   /**
    * Destroy callback. Checks for any `requiresReload` parameter in each setting comparing against initial value
    * when `settings` is created and current value. If there is a difference then show a modal dialog asking the user
    * if they want to reload for those settings to take effect.
    *
    * @param {TJSSettingsUIData}   settings - The UI data object initiated w/ `create`.
    */
   #destroy(settings)
   {
      let requiresClientReload = false;
      let requiresWorldReload = false;

      if (Array.isArray(settings.topLevel))
      {
         for (const setting of settings.topLevel)
         {
            const current = globalThis.game.settings.get(setting.namespace, setting.key);
            if (current === setting.initialValue) { continue; }

            requiresClientReload ||= (setting.scope === 'client') && setting.requiresReload;
            requiresWorldReload ||= (setting.scope === 'world') && setting.requiresReload;
         }
      }

      if (Array.isArray(settings.folders))
      {
         for (const folder of settings.folders)
         {
            if (Array.isArray(folder.settings))
            {
               for (const setting of folder.settings)
               {
                  const current = globalThis.game.settings.get(setting.namespace, setting.key);
                  if (current === setting.initialValue) { continue; }

                  requiresClientReload ||= (setting.scope === 'client') && setting.requiresReload;
                  requiresWorldReload ||= (setting.scope === 'world') && setting.requiresReload;
               }
            }
         }
      }

      if (requiresClientReload || requiresWorldReload) { this.#reloadConfirm({ world: requiresWorldReload }); }

      this.#showSettings = false;
      this.#showSettingsSet(this.#showSettings);
   }

   /**
    * @param {TJSSettingsCreateOptions} [options] - Optional parameters.
    *
    * @returns {TJSSettingsUIData} Parsed UI settings data.
    */
   #parseSettings({ efx = 'ripple', storage } = {})
   {
      const namespace = this.#settings.namespace;

      if (storage && typeof namespace !== 'string')
      {
         console.warn(
          `TJSGameSettings warning: 'options.storage' defined, but 'namespace' not defined in TJSGameSettings.`);
      }

      const hasStorage = storage && typeof namespace === 'string';

      const uiSettings = [];

      const canConfigure = globalThis.game.user.can('SETTINGS_MODIFY');

      for (const setting of this.#settings)
      {
         if (!setting.config || (!canConfigure && (setting.scope !== 'client'))) { continue; }

         let options;

         if (isObject(setting.choices))
         {
            options = Object.entries(setting.choices).map((entry) => ({ value: entry[0], label: localize(entry[1]) }));
         }

         let range;
         if (isObject(setting.range))
         {
            range = {};

            // TODO Better error messages.
            // Verify range data.
            if (typeof setting.range.min !== 'number') { throw new TypeError(`Setting 'range.min' is not a number.`); }
            if (typeof setting.range.max !== 'number') { throw new TypeError(`Setting 'range.max' is not a number.`); }
            if (setting.range.step !== void 0 && typeof setting.range.step !== 'number')
            {
               throw new TypeError(`Setting 'range.step' is not a number.`);
            }

            range.min = setting.range.min;
            range.max = setting.range.max;
            range.step = setting.range.step ? setting.range.step : 1;
         }

         // Default to `String` if no type is provided.
         const type = setting.type instanceof Function ? setting.type.name : 'String';

         // Only configure file picker if setting type is a string.
         let filePicker;
         if (type === 'String')
         {
            filePicker = setting.filePicker === true ? 'any' : setting.filePicker;
         }

         let buttonData;
         if (filePicker)
         {
            buttonData = {
               icon: 'fas fa-file-import fa-fw',
               efx: efx === 'ripple' ? ripple() : void 0,
               title: 'FILES.BrowseTooltip',
               styles: { 'margin-left': '0.25em' }
            };
         }

         const store = this.#settings.getStore(setting.key);

         let selectData;

         /** @type {string} */
         let componentType = 'text';

         if (setting.type === Boolean)
         {
            componentType = 'checkbox';
         }
         else if (options !== void 0)
         {
            componentType = 'select';

            selectData = {
               store,
               efx: efx === 'ripple' ? rippleFocus() : void 0,
               type: componentType,
               options
            };
         }
         else if (setting.type === Number)
         {
            componentType = isObject(setting.range) ? 'range' : 'number';
         }

         let inputData;
         if (componentType === 'text' || componentType === 'number')
         {
            inputData = {
               store,
               efx: efx === 'ripple' ? rippleFocus() : void 0,
               type: componentType
            };
         }

         uiSettings.push({
            id: `${setting.namespace}.${setting.key}`,
            namespace: setting.namespace,
            folder: setting.folder,
            key: setting.key,
            name: localize(setting.name),
            hint: localize(setting.hint),
            type,
            componentType,
            filePicker,
            range,
            store,
            initialValue: globalThis.game.settings.get(setting.namespace, setting.key),
            scope: setting.scope,
            requiresReload: typeof setting.requiresReload === 'boolean' ? setting.requiresReload : false,
            buttonData,
            inputData,
            selectData
         });
      }

      // If storage is available then create a key otherwise create a dummy store, so `applyScrolltop` works.
      const storeScrollbar = hasStorage ? storage.getStore(`${namespace}-settings-scrollbar`) : writable(0);

      const topLevel = [];

      const folderData = {};

      // Sort into folders
      for (const setting of uiSettings)
      {
         if (typeof setting.folder === 'string')
         {
            const folderName = localize(setting.folder);

            // Create folder array if one doesn't exist already.
            if (!Array.isArray(folderData[folderName])) { folderData[folderName] = []; }
            folderData[folderName].push(setting);
         }
         else // Add to 'toplevel' settings
         {
            topLevel.push(setting);
         }
      }

      // Convert folderData object to array.
      const folders = Object.entries(folderData).map((entry) =>
      {
         return {
            label: entry[0],
            store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${entry[0]}`) : void 0,
            settings: entry[1],
         };
      });

      const sections = [];

      // Parse custom component sections
      for (const section of this.#sections)
      {
         const parsedSection = {
            class: section.class,
            props: section.props,
            styles: section.styles
         };

         if (typeof section.folder === 'string')
         {
            const label = localize(section.folder);

            parsedSection.folder = {
               label,
               store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${label}`) : void 0
            };
         }
         else if (isObject(section.folder))
         {
            const label = localize(section.folder.label);

            parsedSection.folder = {
               label,
               store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${label}`) : void 0,
               summaryEnd: section.folder.summaryEnd,
               styles: section.folder.styles
            };
         }

         sections.push(parsedSection);
      }

      return {
         storeScrollbar,
         topLevel,
         folders,
         sections
      };
   }

   async #reloadConfirm({ world = false } = {})
   {
      let title = localize('SETTINGS.ReloadPromptTitle');
      let label = localize('SETTINGS.ReloadPromptBody');

      // Foundry v9 doesn't have the reload lang keys, so substitute just for English translation.
      // TODO: FOUNDRY_V9 - remove when support for v9 is dropped.
      title = title !== 'SETTINGS.ReloadPromptTitle' ? title : 'Reload Application?';
      label = label !== 'SETTINGS.ReloadPromptBody' ? label :
       'Some of the changed settings require a reload of the application to take effect. Would you like to reload now?';

      const reload = await TJSDialog.confirm({
         modal: true,
         draggable: false,
         title,
         content: `<p>${label}</p>`
      });

      if (!reload) { return; }

      // Reload all connected clients. Note: Foundry v9 might not support this event.
      if (world && globalThis.game.user.isGM) { globalThis.game.socket.emit('reload'); }

      // Reload locally.
      window.location.reload();
   }

   /**
    * Convenience method to swap `showSettings`.
    *
    * @returns {boolean} New `showSettings` state.
    */
   swapShowSettings()
   {
      this.#showSettings = !this.#showSettings;
      this.#showSettingsSet(this.#showSettings);
      return this.#showSettings;
   }
}

/**
 * @typedef {object} TJSSettingsCreateOptions
 *
 * @property {string} [efx=ripple] Defines the effects added to TJS components; ripple by default.
 *
 * @property {import('#runtime/svelte/store/web-storage').TJSWebStorage} [storage] - TRL TJSWebStorage (session)
 * instance to serialize folder state and scrollbar position.
 */

/**
 * @typedef {object} TJSSettingsCustomSection
 *
 * @property {Function} class Svelte component constructor function for custom section.
 *
 * @property {Function} [props] Svelte component constructor function for custom section.
 *
 * @property {object} [styles] Inline styles for the section element.
 *
 * @property {string|TJSSettingsCustomSectionFolder} [folder] A folder label or TJSSettingsCustomSectionFolder object.
 */

/**
 * @typedef {object} TJSSettingsCustomSectionFolder
 *
 * @property {string} label The folder label.
 *
 * @property {object} [summaryEnd] A Svelte component config object defining TJSSvgFolder summary end component.
 *
 * @property {object} [styles] Inline styles for the `TJSSvgFolder`; useful for setting CSS variables.
 */

/**
 * @typedef {object} TJSSettingsUIData
 *
 * @property {{label: string, settings: object[]}[]} folders Sorted folders with associated settings and label.
 *
 * @property {object[]} topLevel Top level settings data.
 *
 * @property {object[]} sections Custom sections.
 *
 * @property {import('svelte/store').Writable<number>} storeScrollbar The store for `applyScrolltop`.
 *
 * @property {Function} [destroy] The bound destroy callback function for received of TJSSettingsUIData.
 */

/**
 * Registers game settings and creates a backing Svelte store for each setting. The Svelte store will update the
 * Foundry game settings and vice versa when changes occur to the Foundry game settings the updated data is set to the
 * store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
class TJSGameSettings
{
   /** @type {string} */
   #namespace;

   /** @type {GameSettingData[]} */
   #settings = [];

   /**
    * @type {Map<string, import('svelte/store').Writable>}
    */
   #stores = new Map();

   /** @type {UIControl} */
   #uiControl;

   /**
    * Creates the TJSGameSettings instance.
    *
    * @param {string}   namespace - The namespace for all settings.
    */
   constructor(namespace)
   {
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      this.#namespace = namespace;
      this.#uiControl = new UIControl(this);
   }

   /**
    * Creates a new writable for the given key.
    *
    * @param {*}  initialValue - An initial value to set to new stores.
    *
    * @returns {import('svelte/store').Writable} The new writable.
    */
   static #createStore(initialValue)
   {
      return writable(initialValue);
   }

   /**
    * Provides an iterator / generator to return stored settings data.
    *
    * @yields {GameSettingData}
    */
   *[Symbol.iterator]()
   {
      for (const setting of this.#settings)
      {
         yield setting;
      }
   }

   /**
    * @returns {string} Returns namespace set in constructor.
    */
   get namespace()
   {
      return this.#namespace;
   }

   /**
    * @returns {UIControl} The associated UIControl.
    */
   get uiControl()
   {
      return this.#uiControl;
   }

   /**
    * Gets a store from the `stores` Map or creates a new store for the key.
    *
    * @param {string}   key - Key to lookup in stores map.
    *
    * @param {string}   [initialValue] - An initial value to set to new stores.
    *
    * @returns {import('svelte/store').Writable} The store for the given key.
    */
   #getStore(key, initialValue)
   {
      let store = this.#stores.get(key);
      if (store === void 0)
      {
         store = TJSGameSettings.#createStore(initialValue);
         this.#stores.set(key, store);
      }

      return store;
   }

   /**
    * Returns a readable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Readable|undefined} The associated store for the given game setting key.
    */
   getReadableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getReadableStore: '${key}' is not a registered setting.`);
         return;
      }

      const store = this.#getStore(key);

      return { subscribe: store.subscribe };
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Writable|undefined} The associated store for the given game setting key.
    */
   getStore(key)
   {
      return this.getWritableStore(key);
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {import('svelte/store').Writable|undefined} The associated store for the given game setting key.
    */
   getWritableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getWritableStore: '${key}' is not a registered setting.`);
         return;
      }

      return this.#getStore(key);
   }

   /**
    * Registers a setting with TJSGameSettings and Foundry core.
    *
    * Note: The specific store subscription handler assigned to the passed in store or store created for the setting
    * internally is returned from this function. In some cases when setting up custom stores particularly of object
    * types with several child property stores (`propertyStore`) it is necessary to only update the setting store and
    * not all subscribers to the custom store as the `propertyStore` instances are also subscribers to the custom store.
    *
    * This allows the custom store in the `set` implementation to mainly only trigger the TJSGameSettings subscriber
    * handler on updates and not all the connected `propertyStore` instances.
    *
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    *
    * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
    *                                   registering the setting with Foundry. This allows the settings to be displayed
    *                                   in the app itself, but removed from the standard Foundry configuration location.
    *
    * @returns {Function} The specific store subscription handler assigned to the passed in store.
    */
   register(setting, coreConfig = true)
   {
      if (!isObject(setting))
      {
         throw new TypeError(`TJSGameSettings - register: setting is not an object.`);
      }

      if (!isObject(setting.options))
      {
         throw new TypeError(`TJSGameSettings - register: 'setting.options' attribute is not an object.`);
      }

      if (typeof coreConfig !== 'boolean')
      {
         throw new TypeError(`TJSGameSettings - register: 'coreConfig' is not an boolean.`);
      }

      if (setting.store !== void 0 && !isWritableStore(setting.store))
      {
         throw new TypeError(
          `TJSGameSettings - register: 'setting.store' attribute is not a writable store.`);
      }

      const namespace = setting.namespace;
      const key = setting.key;
      const folder = setting.folder;

      // The `config` parameter passed to Foundry core.
      const foundryConfig = coreConfig ? setting.options.config : false;

      if (typeof namespace !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'namespace' attribute is not a string.`);
      }

      if (typeof key !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'key' attribute is not a string.`);
      }

      if (folder !== void 0 && typeof folder !== 'string')
      {
         throw new TypeError(`TJSGameSettings - register: 'folder' attribute is not a string.`);
      }

      const store = setting.store;

      /**
       * @type {GameSettingOptions}
       */
      const options = setting.options;

      const onchangeFunctions = [];

      // When true prevents local store subscription from a loop when values are object data.
      let gateSet = false;

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value) =>
      {
         const callbackStore = this.#getStore(key);
         if (callbackStore && !gateSet)
         {
            gateSet = true;
            callbackStore.set(value);
            gateSet = false;
         }
      });

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

      // Provides the final onChange callback that iterates over all the stored onChange callbacks.
      const onChange = (value) =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      globalThis.game.settings.register(namespace, key, { ...options, config: foundryConfig, onChange });

      // Set new store value with existing setting or default value.
      const targetStore = store ? store : this.#getStore(key, globalThis.game.settings.get(namespace, key));

      // If a store instance is passed into register then initialize it with game settings data.
      if (store)
      {
         this.#stores.set(key, targetStore);
         store.set(globalThis.game.settings.get(namespace, key));
      }

      const storeHandler = async (value) =>
      {
         if (!gateSet && globalThis.game.settings.get(namespace, key) !== value)
         {
            gateSet = true;
            await globalThis.game.settings.set(namespace, key, value);
         }

         gateSet = false;
      };

      // Subscribe to self to set associated game setting on updates after verifying that the new value does not match
      // existing game setting.
      subscribeIgnoreFirst(targetStore, storeHandler);

      this.#settings.push({
         namespace,
         key,
         folder,
         ...options
      });

      return storeHandler;
   }

   /**
    * Registers multiple settings.
    *
    * Please refer to the note in {@link TJSGameSettings.register} about the returned object of store subscriber handler
    * functions.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    *
    * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
    *                                   registering the setting with Foundry. This allows the settings to be displayed
    *                                   in the app itself, but removed from the standard Foundry configuration location.
    *
    * @returns { {[key: string]: Function} } An object containing all TJSGameSetting store subscriber handlers for each
    *          setting `key` added.
    */
   registerAll(settings, coreConfig)
   {
      /** @type { {[key: string]: Function} } */
      const storeHandlers = {};

      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings)
      {
         if (!isObject(entry))
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
         }

         if (typeof entry.namespace !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'namespace' attribute.`);
         }

         if (typeof entry.key !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
         }

         if (!isObject(entry.options))
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'options' attribute.`);
         }

         storeHandlers[entry.key] = this.register(entry, coreConfig);
      }

      return storeHandlers;
   }
}

/**
 * @typedef {object} GameSettingOptions
 *
 * @property {object} [choices] If choices are defined, the resulting setting will be a select menu.
 *
 * @property {boolean} [config=true] Specifies that the setting appears in the configuration view.
 *
 * @property {*} [default] A default value for the setting.
 *
 * @property {string} [hint] A description of the registered setting and its behavior.
 *
 * @property {string} name The displayed name of the setting.
 *
 * @property {Function|Iterable<Function>} [onChange] An onChange callback function or iterable list of callbacks to
 * directly receive callbacks from Foundry on setting change.
 *
 * @property {{min: number, max: number, step: number}} [range] If range is specified, the resulting setting will be
 * a range slider.
 *
 * @property {boolean} [requiresReload=false] If true then a prompt to reload after changes occurs.
 *
 * @property {('client' | 'world')} [scope='client'] Scope for setting.
 *
 * @property {object|Function} type A constructable object or function.
 */

/**
 * @typedef {object} GameSetting Defines a game setting.
 *
 * @property {string} namespace The setting namespace; usually the ID of the module / system.
 *
 * @property {string} key The setting key to register.
 *
 * @property {string} folder The name of the TJSSvgFolder to put this setting in to group them.
 *
 * @property {import('svelte/store').Writable} [store] An existing store instance to use.
 *
 * @property {GameSettingOptions} options Configuration for setting data.
 */

/**
 * @typedef {GameSettingOptions} GameSettingData Stores the primary TJS game setting keys w/ GameSettingOptions.
 *
 * @property {string} namespace The setting namespace; usually the ID of the module / system.
 *
 * @property {string} key The setting key to register.
 *
 * @property {string} folder The name of the TJSSvgFolder to put this setting in to group them.
 */

/**
 * Provides an accessible JS object that is updated reactively from all or subset of TJSGameSettings stores.
 * Accessors are provided to directly get / set current setting data. Using a setter will update the setting and backing
 * store.
 *
 * Note: You can create a JSDoc / `@typedef` to apply with `@type` and achieve typing support in IDEs for the
 * customizable live settings instance. Please see the example at the end of this source file on how to accomplish this
 * task.
 *
 * TJSLiveGameSettings is also a readable Svelte store essentially providing a customizable derived store of all
 * settings tracked.
 *
 * Note: When using from JS a second subscriber function argument is the key that was updated.
 * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
 */
class TJSLiveGameSettings
{
   /**
    * Stores the current parsed game setting data.
    *
    * @type {{}}
    */
   #currentData = {};

   /**
    * Map of all game settings stores and unsubscribe functions currently subscribed.
    *
    * @type {Map<string, { unsubscribe: Function, store: import('svelte/store').Writable }>}
    */
   #gameSettings = new Map();

   /**
    * Stores readable subscribers of this instance.
    *
    * Note: When using from JS a second argument is the key that was updated.
    * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
    *
    * @type {((value: TJSLiveGameSettings, key?: string) => void)[]}
    */
   #subscriptions = [];

   /**
    * Stores the last updated key.
    *
    * @type {string}
    */
   #lastKey = void 0;

   /**
    * Creates a live binding against the setting stores. All settings are configured by default, but can also be
    * filtered by setting key with inclusive / exclusive Sets.
    *
    * @param {TJSGameSettings}   gameSettings - A game settings instance to subscribe to...
    *
    * @param {object}            [options] - TJSLiveGameSettings options.
    *
    * @param {Set<string>}       [options.include] - A Set of setting keys to include from subscribing.
    *
    * @param {Set<string>}       [options.exclude] - A Set of setting keys to exclude from subscribing.
    */
   constructor(gameSettings, { include, exclude } = {})
   {
      if (!(gameSettings instanceof TJSGameSettings))
      {
         throw new TypeError(`'gameSettings' is not a TJSGameSettings instance.`);
      }

      if (include !== void 0 && !(include instanceof Set)) { throw new TypeError(`'options.include' is not a Set.`); }
      if (exclude !== void 0 && !(exclude instanceof Set)) { throw new TypeError(`'options.exclude' is not a Set.`); }

      for (const setting of gameSettings)
      {
         const key = setting.key;

         // Skip any keys that are in the include set.
         if (include !== void 0 && !include.has(key)) { continue; }

         // Skip any keys that are in the exclude set.
         if (exclude !== void 0 && exclude.has(key)) { continue; }

         if (typeof this[key] === 'function' || key === 'lastKey')
         {
            console.warn(`TJSLiveGameSettings warning: key (${key}) shadows a function. Skipping key.`);
         }

         const store = gameSettings.getStore(key);

         // Update this instance storing setting data by key.
         this.#gameSettings.set(key, {
            store,
            unsubscribe: store.subscribe((data) =>
            {
               if (this.#currentData !== void 0) { this.#currentData[key] = data; }

               this.#lastKey = key;

               // Notify any child instance that a particular key has updated.
               this._update(key);

               // Notify any readable store subscribers.
               this.#updateSubscribers(key);
            })
         });

         // Define new accessors for setting key.
         Object.defineProperty(this, key, {
            get: () =>
            {
               if (this.#currentData === void 0)
               {
                  throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
               }
               else
               {
                  return this.#currentData[key];
               }
            },
            set: (data) =>
            {
               if (this.#currentData === void 0)
               {
                  throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`);
               }
               else
               {
                  this.#gameSettings.get(key).store.set(data);
               }
            }
         });
      }

      Object.seal(this);
   }

   /**
    * @returns {string} Last updated setting key.
    */
   get lastKey()
   {
      return this.#lastKey;
   }

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
    */
   destroy()
   {
      for (const data of this.#gameSettings)
      {
         if (typeof data.unsubscribe === 'function') { data.unsubscribe(); }
      }

      this.#gameSettings.clear();
      this.#currentData = void 0;
   }

   /**
    * Returns an iterator / generator of all setting entries.
    *
    * @yields {string}
    */
   *entries()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield [key, this.#currentData[key]];
      }
   }

   /**
    * Returns an iterator / generator of all setting keys.
    *
    * @yields {string}
    */
   *keys()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield key;
      }
   }

   /**
    * Returns a string / JSON stringify of the current setting data.
    *
    * @returns {string} Tracked setting data.
    */
   toString()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      return JSON.stringify(this.#currentData);
   }

   /**
    * Override to respond to setting update.
    *
    * @param {string} key - The setting / local key that updated.
    *
    * @protected
    */
   _update(key) {}   // eslint-disable-line no-unused-vars

   /**
    * Returns an iterator / generator of all values.
    *
    * @yields {*}
    */
   *values()
   {
      if (this.#currentData === void 0) { throw new Error(`This instance of TJSLiveGameSettings has been destroyed.`); }

      for (const key in this.#currentData)
      {
         yield this.#currentData[key];
      }
   }

   // Readable store implementation ----------------------------------------------------------------------------------

   /**
    * @param {(value: TJSLiveGameSettings, key?: string) => void} handler - Callback function that is invoked on
    * update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this, void 0);             // call handler with current value

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
    * @param {string} key - The key that was updated.
    */
   #updateSubscribers(key)
   {
      const subscriptions = this.#subscriptions;
      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](this, key); }
   }
}

// Example of creating a typedef to type your specific live game settings instance. Add all relevant `@property`
// entries.
//
// /**
//  * @typedef {TJSLiveGameSettings} MyLiveGameSettings - Extend TJSLiveGameSettings and name this anything.
//  *
//  * @property {boolean} myBooleanSetting - Add property / type entries for setting keys associated w/ accessors.
//  */
//
// /** @type {MyLiveGameSettings} */
// const liveGameSettings = new TJSLiveGameSettings(gameSettings);
// liveGameSettings.myBooleanSetting is now typed as a boolean.

const _storeGameState = writable(void 0);

/**
 * @type {import('svelte/store').Readable<globalThis.game>} Provides a Svelte store wrapping the Foundry `game` global
 * variable. It is initialized on the `ready` hook. You may use this store to access the global game state from a
 * Svelte template. It is a read only store and will receive no reactive updates during runtime.
 */
const gameState = {
   subscribe: _storeGameState.subscribe,
};

Object.freeze(gameState);

Hooks.once('ready', () => _storeGameState.set(game));

export { TJSDocument, TJSDocumentCollection, TJSGameSettings, TJSLiveGameSettings, gameState };
//# sourceMappingURL=index.js.map
