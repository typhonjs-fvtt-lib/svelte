import {
   getUUIDFromDataTransfer,
   isObject,
   isPlainObject,
   uuidv4 } from '@typhonjs-fvtt/svelte/util';

import { EmbeddedStoreManager } from './EmbeddedStoreManager.js';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
export class TJSDocument
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
   #options = { delete: void 0 };

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
      if (doc instanceof foundry.abstract.Document && !doc?.collection?.has(doc.id))
      {
         delete doc?.apps[this.#uuidv4];
         this.#setDocument(void 0);

         this.#updateSubscribers(false, { action: 'delete', data: void 0 });

         if (typeof this.#options.delete === 'function') { await this.#options.delete(); }

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

      if (doc instanceof foundry.abstract.Document)
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

      if (document !== void 0 && !(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined.`);
      }

      if (options === null || typeof options !== 'object')
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      if (document instanceof foundry.abstract.Document)
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
    * @param {ParseDataTransferOptions & TJSDocumentOptions}   [options] - Optional parameters.
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

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function.`);
      }

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
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
 * @property {Function} [delete] - Optional delete function to invoke when document is deleted.
 */

/**
 * @typedef {object} EmbeddedAPI
 *
 * @property {(embeddedName: string, options: import('@typhonjs-fvtt/runtime/svelte/store').OptionsDynMapCreate<string, any>) => import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, T>} create - Creates an embedded collection store.
 *
 * @property {(embeddedName?: string, storeName?: string) => boolean} destroy - Destroys one or more embedded collection stores.
 *
 * @property {(embeddedName: string, storeName: string) => import('@typhonjs-fvtt/runtime/svelte/store').DynMapReducer<string, T>} get - Returns a specific existing embedded collection store.
 */
