import { tick } from 'svelte';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';
import { hasPrototype, isObject, isPlainObject } from '@typhonjs-svelte/runtime-base/util/object';
import { DynMapReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';

/**
 * Provides management of reactive embedded collections.
 *
 * @privateRemarks
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
    * Create a reactive embedded collection. When no options are provided the name of the embedded collection matches
    * the document name.
    *
    * @template [D=fvtt.DocumentConstructor]
    *
    * @param {D} FoundryDoc - A Foundry document class / constructor.
    *
    * @param {import('./types').EmbeddedCreateOptions} [options] - DynMapReducer creation options.
    *
    * @returns {import('#runtime/svelte/store/reducer').DynMapReducer<string, D>} DynMapReducer instance.
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

      /** @type {import('#runtime/svelte/store/reducer').DynReducer.Options.Common<T>} */
      let rest = {};

      /** @type {typeof import('#runtime/svelte/store/reducer').DynMapReducer<string, InstanceType<T>>} */
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
         name = docName;
         ctor = DynMapReducer;
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
         const reducerOptions = collection ? { data: collection, ...rest } : { ...rest };
         const instance = new ctor(reducerOptions);
         embeddedData.stores.set(name, instance);

         if (typeof instance?.initialize === 'function') { instance.initialize(rest); }

         return instance;
      }
   }

   /**
    * @template [D=fvtt.DocumentConstructor]
    *
    * Destroys and removes embedded collection stores. Invoking this method with no parameters destroys all stores.
    * Invoking with an embedded name destroys all stores for that particular collection. If you provide an embedded and
    * store name just that particular store is destroyed and removed.
    *
    * @param {D}   [FoundryDoc] - A Foundry document class / constructor.
    *
    * @param {string}   [reducerName] - Specific store name.
    *
    * @returns {boolean} One or more stores destroyed?
    */
   destroy(FoundryDoc, reducerName)
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

         if (reducerName === void 0)
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
         else if (reducerName === 'string')
         {
            const embeddedData = this.#name.get(docName);
            if (embeddedData)
            {
               const store = embeddedData.stores.get(reducerName);
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
    * @template [D=fvtt.DocumentConstructor]
    *
    * @param {D} FoundryDoc - A Foundry document class / constructor.
    *
    * @param {string} [reducerName] - Name of the embedded collection to retrieve.
    *
    * @returns {import('#runtime/svelte/store/reducer').DynMapReducer<string, InstanceType<D>>} DynMapReducer
    *          instance.
    */
   get(FoundryDoc, reducerName)
   {
      const docName = FoundryDoc?.documentName;

      if (typeof docName !== 'string')
      {
         throw new TypeError(
          `EmbeddedStoreManager.get error: 'FoundryDoc' does not have a valid 'documentName' property.`);
      }

      if (!this.#name.has(docName)) { return void 0; }

      return this.#name.get(docName).stores.get(reducerName ?? docName);
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

            // Update CRUD keys for v12.
            this.#embeddedNames.add(`create${collectionName}`);
            this.#embeddedNames.add(`delete${collectionName}`);
            this.#embeddedNames.add(`update${collectionName}`);

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
 * @template [D=fvtt.Document]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam D `Foundry Document`.
 *
 * @implements {import('svelte/store').Readable<D>}
 */
class TJSDocument
{
   /**
    * Fake Application API that ClientDocumentMixin uses for document model callbacks.
    *
    * @type {{ close: Function, render: Function }}
    */
   #callbackAPI;

   /**
    * @type {D[]}
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
    * @type {{ delete?: Function, preDelete?: Function }}
    */
   #options = { delete: void 0, preDelete: void 0 };

   /**
    * @type {((value: D, updateOptions?: import('./types').TJSDocumentUpdateOptions) => void)[]}
    */
   #subscribers = [];

   /**
    * @type {import('./types').TJSDocumentUpdateOptions}
    */
   #updateOptions;

   /**
    * @param {D | import('./types').TJSDocumentOptions<D>}  [document] - Document to wrap or TJSDocumentOptions.
    *
    * @param {import('./types').TJSDocumentOptions<D>}      [options] - TJSDocument options.
    */
   constructor(document, options = {})
   {
      this.#uuidv4 = `tjs-document-${Hashing.uuidv4()}`;

      this.#callbackAPI = {
         close: this.#deleted.bind(this),
         render: this.#updateSubscribers.bind(this)
      };

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
    * @returns {import('./types').TJSDocumentUpdateOptions} Last update options.
    */
   get updateOptions() { return this.#updateOptions ?? {}; }

   /**
    * Returns the UUID assigned to this store.
    *
    * @returns {string} UUID
    */
   get uuidv4() { return this.#uuidv4; }

   /**
    * Register the callback API with the underlying Foundry document.
    */
   #callbackRegister()
   {
      const doc = this.#document[0];
      if (doc instanceof globalThis.foundry.abstract.Document && isObject(doc?.apps) && !doc.apps[this.#uuidv4])
      {
         doc.apps[this.#uuidv4] = this.#callbackAPI;
      }
   }

   /**
    * Unregister the callback API with the underlying Foundry document.
    */
   #callbackUnregister()
   {
      const doc = this.#document[0];
      if (doc instanceof globalThis.foundry.abstract.Document)
      {
         delete doc?.apps?.[this.#uuidv4];
      }
   }

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
         this.#setDocument(void 0);

         if (typeof this.#options.preDelete === 'function') { await this.#options.preDelete(doc); }

         this.#updateSubscribers(false, { action: 'delete' });

         if (typeof this.#options.delete === 'function') { await this.#options.delete(doc); }

         // Allow subscribers to be able to query `updateOptions` involving any reactive statements.
         await tick();

         this.#updateOptions = void 0;
      }
   }

   /**
    * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
    * ClientDocumentMixin `apps` tracking object.
    */
   destroy()
   {
      if (this.#embeddedStoreManager)
      {
         this.#embeddedStoreManager.destroy();
         this.#embeddedStoreManager = void 0;
         this.#embeddedAPI = void 0;
      }

      this.#setDocument(void 0);

      this.#options.delete = void 0;
      this.#options.preDelete = void 0;

      this.#subscribers.length = 0;
   }

   /**
    * @returns {D | undefined} Current document
    */
   get() { return this.#document[0]; }

   /**
    * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
    *
    * @param {object}   data - Drop transfer data.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.compendium=true] - Accept compendium documents.
    *
    * @param {boolean}  [opts.world=true] - Accept world documents.
    *
    * @param {string[]} [opts.types] - Require the `data.type` to match entry in `types`.
    *
    * @returns {string|undefined} Foundry UUID for drop data.
    */
   static getUUIDFromDataTransfer(data, { compendium = true, world = true, types = void 0 } = {})
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

      return uuid;
   }

   /**
    * Sets a new document target to be monitored. To unset use `undefined` or `null`.
    *
    * @param {D | undefined | null}  doc - New document to set.
    *
    * @param {import('./types').TJSDocumentUpdateOptions}   [options] - New document update options to set.
    */
   set(doc, options = {})
   {
      if (doc !== void 0 && doc !== null && !(doc instanceof globalThis.foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined / null.`);
      }

      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      // Only post an update if the document has changed.
      if (this.#setDocument(doc))
      {
         // Only add registration if there are current subscribers.
         if (doc instanceof globalThis.foundry.abstract.Document && this.#subscribers.length)
         {
            this.#callbackRegister();
         }

         this.#updateSubscribers(false, {
            ...options,
            action: `tjs-set-${doc === void 0 || doc === null ? 'undefined' : 'new'}`
         });
      }
   }

   /**
    * Internally sets the new document being tracked.
    *
    * @param {D | undefined | null} doc -
    *
    * @returns {boolean} Whether the document changed.
    */
   #setDocument(doc)
   {
      const changed = doc !== this.#document[0];

      // Unregister before setting new document state.
      if (changed) { this.#callbackUnregister(); }

      this.#document[0] = doc === void 0 || doc === null ? void 0 : doc;

      if (changed && this.#embeddedStoreManager) { this.#embeddedStoreManager.handleDocChange(); }

      return changed;
   }

   /**
    * Potentially sets new document from data transfer object.
    *
    * @param {object}   data - Document transfer data.
    *
    * @param {{ compendium?: boolean, world?: boolean, types?: string[] }}   [options] - Optional parameters for
    *        {@link TJSDocument.getUUIDFromDataTransfer}.
    *
    * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
    */
   async setFromDataTransfer(data, options)
   {
      return this.setFromUUID(TJSDocument.getUUIDFromDataTransfer(data, options));
   }

   /**
    * Sets the document by Foundry UUID performing a lookup and setting the document if found.
    *
    * @param {string}   uuid - A Foundry UUID to lookup.
    *
    * @param {import('./types').TJSDocumentUpdateOptions}   [options] - New document update options to set.
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
    * @param {import('./types').TJSDocumentOptions<D>}   options - Options for TJSDocument.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument error: 'options' is not a plain object.`);
      }

      // Verify valid values -------------

      if (options.delete !== void 0 && options.delete !== null && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function or null.`);
      }

      if (options.preDelete !== void 0 && options.preDelete !== null && typeof options.preDelete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'preDelete' attribute in options is not a function or null.`);
      }

      // Set any valid values -------------

      if (options.delete !== void 0)
      {
         this.#options.delete = typeof options.delete === 'function' ? options.delete : void 0;
      }

      if (options.preDelete !== void 0)
      {
         this.#options.preDelete = typeof options.preDelete === 'function' ? options.preDelete : void 0;
      }
   }

   /**
    * @param {(value: D, updateOptions?: import('./types').TJSDocumentUpdateOptions) => void} handler - Callback
    * function that is invoked on update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      let addedSubscriber = false;

      const currentIdx = this.#subscribers.findIndex((entry) => entry === handler);
      if (currentIdx === -1)
      {
         this.#subscribers.push(handler);
         addedSubscriber = true;
      }

      if (addedSubscriber)
      {
         // Register callback with first subscriber.
         if (this.#subscribers.length === 1) { this.#callbackRegister(); }

         const updateOptions = { action: 'tjs-subscribe', data: [] };

         handler(this.#document[0], updateOptions);      // Call handler with current value and update options.
      }

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscribers.findIndex((sub) => sub === handler);
         if (index !== -1) { this.#subscribers.splice(index, 1); }

         // Unsubscribe from document callback if there are no subscribers.
         if (this.#subscribers.length === 0) { this.#callbackUnregister(); }
      };
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have document update context.
    */
   #updateSubscribers(force, options = {}) // eslint-disable-line no-unused-vars
   {
      // Shallow copy w/ remapped keys.
      const optionsRemap = {
         action: options.action ?? options.renderContext ?? 'tjs-unknown',
         data: options.data ?? options.renderData ?? []
      };

      // Coerce `data` as necessary into an array to standardize receiving processing.
      if (!Array.isArray(optionsRemap.data)) { optionsRemap.data = [optionsRemap.data]; }

      this.#updateOptions = optionsRemap;

      const subscribers = this.#subscribers;
      const doc = this.#document[0];

      for (let cntr = 0; cntr < subscribers.length; cntr++) { subscribers[cntr](doc, optionsRemap); }

      if (this.#embeddedStoreManager)
      {
         this.#embeddedStoreManager.handleUpdate(optionsRemap.action);
      }
   }
}

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template [C=fvtt.DocumentCollection]
 *
 * @typeParam C `Foundry Collection`.
 *
 * @implements {import('svelte/store').Readable<C>}
 */
class TJSDocumentCollection
{
   /**
    * Fake Application API that DocumentCollection uses for document model callbacks.
    *
    * @type {{ uuid: string, close: Function, render: Function }}
    */
   #callbackAPI;

   /**
    * @type {C}
    */
   #collection;

   /**
    * @type {string}
    */
   #uuidv4;

   /**
    * @type {{ delete?: Function, preDelete?: Function }}
    */
   #options = { delete: void 0, preDelete: void 0 };

   /**
    * @type {((value: C, updateOptions?: import('./types').TJSDocumentCollectionUpdateOptions<C>) => void)[]}
    */
   #subscribers = [];

   /**
    * @type {import('./types').TJSDocumentCollectionUpdateOptions<C>}
    */
   #updateOptions;

   /**
    * @param {C | import('./types').TJSDocumentCollectionOptions<C>}   [collection] - Collection to wrap or
    *        TJSDocumentCollectionOptions.
    *
    * @param {import('./types').TJSDocumentCollectionOptions<C>}     [options] - TJSDocumentCollection options.
    */
   constructor(collection, options = {})
   {
      this.#uuidv4 = `tjs-collection-${Hashing.uuidv4()}`;

      this.#callbackAPI = {
         uuid: this.#uuidv4,
         close: this.#deleted.bind(this),
         render: this.#updateSubscribers.bind(this)
      };

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
    * @returns {import('./types').TJSDocumentCollectionUpdateOptions<C>} Last update options.
    */
   get updateOptions() { return this.#updateOptions ?? {}; }

   /**
    * Returns the UUID assigned to this store.
    *
    * @returns {string} UUID
    */
   get uuid() { return this.#uuidv4; }

   /**
    * Register the callback API with the underlying Foundry collection.
    */
   #callbackRegister()
   {
      const collection = this.#collection;

      if (collection instanceof DocumentCollection && Array.isArray(collection?.apps))
      {
         const index = collection.apps.findIndex((sub) => sub === this.#callbackAPI);
         if (index === -1) { collection.apps.push(this.#callbackAPI); }
      }
   }

   /**
    * Unregister the callback API with the underlying Foundry collection.
    */
   #callbackUnregister()
   {
      const collection = this.#collection;
      if (collection instanceof DocumentCollection && Array.isArray(collection?.apps))
      {
         const index = collection.apps.findIndex((sub) => sub === this.#callbackAPI);
         if (index >= 0) { collection.apps.splice(index, 1); }
      }
   }

   /**
    * Handles cleanup when the collection is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      const collection = this.#collection;

      this.#callbackUnregister();
      this.#collection = void 0;

      if (typeof this.#options.preDelete === 'function') { await this.#options.preDelete(collection); }

      this.#updateSubscribers(false, { action: 'delete' });

      if (typeof this.#options.delete === 'function') { await this.#options.delete(collection); }

      // Allow subscribers to be able to query `updateOptions` involving any reactive statements.
      await tick();

      this.#updateOptions = void 0;
   }

   /**
    * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
    * DocumentCollection `apps` tracking array.
    */
   destroy()
   {
      this.#callbackUnregister();
      this.#collection = void 0;

      this.#options.delete = void 0;
      this.#options.preDelete = void 0;

      this.#subscribers.length = 0;
   }

   /**
    * @returns {C | undefined} Current collection
    */
   get() { return this.#collection; }

   /**
    * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
    *
    * @param {C | undefined | null}  collection - New collection to set.
    *
    * @param {import('./types').TJSDocumentCollectionUpdateOptions<C>}  [options] - New collection update options to
    *        set.
    */
   set(collection, options = {})
   {
      if (collection !== void 0 && collection !== null && !(collection instanceof DocumentCollection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      const changed = this.#collection !== collection;

      if (changed) { this.#callbackUnregister(); }

      this.#collection = collection === void 0 || collection === null ? void 0 : collection;
      this.#updateOptions = options;

      if (changed)
      {
         if (collection instanceof DocumentCollection && this.#subscribers.length) { this.#callbackRegister(); }

         this.#updateSubscribers(false, {
            ...options,
            action: `tjs-set-${collection === void 0 || collection === null ? 'undefined' : 'new'}`
         });
      }
   }

   /**
    * Sets options for this collection wrapper / store.
    *
    * @param {import('./types').TJSDocumentCollectionOptions<C>}  options - Options for TJSDocumentCollection.
    */
   setOptions(options)
   {
      if (!isObject(options))
      {
         throw new TypeError(`TJSDocumentCollection error: 'options' is not an object.`);
      }

      // Verify valid values -------------

      if (options.delete !== void 0 && options.delete !== null && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function or null.`);
      }

      if (options.preDelete !== void 0 && options.preDelete !== null && typeof options.preDelete !== 'function')
      {
         throw new TypeError(
          `TJSDocumentCollection error: 'preDelete' attribute in options is not a function or null.`);
      }

      // Set any valid values -------------

      if (options.delete !== void 0)
      {
         this.#options.delete = typeof options.delete === 'function' ? options.delete : void 0;
      }

      if (options.preDelete !== void 0)
      {
         this.#options.preDelete = typeof options.preDelete === 'function' ? options.preDelete : void 0;
      }
   }

   /**
    * @param {(value: C, updateOptions?: import('./types').TJSDocumentCollectionUpdateOptions<C>) => void} handler -
    *        Callback function that is invoked on update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      let addedSubscriber = false;

      const currentIdx = this.#subscribers.findIndex((entry) => entry === handler);
      if (currentIdx === -1)
      {
         this.#subscribers.push(handler);
         addedSubscriber = true;
      }

      if (addedSubscriber)
      {
         // Register callback with first subscriber.
         if (this.#subscribers.length === 1) { this.#callbackRegister(); }

         const collection = this.#collection;

         const updateOptions = { action: 'tjs-subscribe', data: [] };

         handler(collection, updateOptions);  // Call handler with current value and update options.
      }

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscribers.findIndex((sub) => sub === handler);
         if (index !== -1) { this.#subscribers.splice(index, 1); }

         // Unsubscribe from collection if there are no subscribers.
         if (this.#subscribers.length === 0) { this.#callbackUnregister(); }
      };
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have collection update context.
    */
   #updateSubscribers(force, options = {}) // eslint-disable-line no-unused-vars
   {
      // Shallow copy w/ remapped keys.
      const optionsRemap = {
         action: options.action ?? options.renderContext ?? 'tjs-unknown',
         data: options.data ?? options.renderData ?? []
      };

      // Coerce `data` as necessary into an array to standardize receiving processing.
      if (!Array.isArray(optionsRemap.data)) { optionsRemap.data = [optionsRemap.data]; }

      this.#updateOptions = optionsRemap;

      const subscribers = this.#subscribers;
      const collection = this.#collection;

      for (let cntr = 0; cntr < subscribers.length; cntr++) { subscribers[cntr](collection, optionsRemap); }
   }
}

export { TJSDocument, TJSDocumentCollection };
//# sourceMappingURL=index.js.map
