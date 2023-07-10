import { Hashing }                  from '#runtime/util';

import {
   isObject,
   isPlainObject }                  from '#runtime/util/object';

import { EmbeddedStoreManager }     from './EmbeddedStoreManager.js';

/**
 * @template [T=globalThis.foundry.abstract.Document]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
export class TJSDocument
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
