import { tick }                     from 'svelte';

import { Hashing }                  from '#runtime/util';

import {
   isObject,
   isPlainObject }                  from '#runtime/util/object';

import { EmbeddedStoreManager }     from './EmbeddedStoreManager.js';

/**
 * @template [D=fvtt.Document]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam D `Foundry Document`.
 */
export class TJSDocument
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

         this.#updateSubscribers(false, { action: 'delete', data: void 0 });

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
            action: `tjs-set-${doc === void 0 || doc === null ? 'undefined' : 'new'}`,
            ...options
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

         const updateOptions = { action: 'subscribe', data: void 0 };

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
    * @param {import('./types').TJSDocumentUpdateOptions}   [options] - Options from render call; will have document
    *        update context.
    */
   #updateSubscribers(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      const doc = this.#document[0];

      for (let cntr = 0; cntr < this.#subscribers.length; cntr++) { this.#subscribers[cntr](doc, options); }

      if (this.#embeddedStoreManager)
      {
         this.#embeddedStoreManager.handleUpdate(options.renderContext);
      }
   }
}
