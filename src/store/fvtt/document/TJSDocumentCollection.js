import { tick }      from 'svelte';

import { Hashing }   from '#runtime/util';

import {
   isObject,
   isPlainObject }   from '#runtime/util/object';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template [T=DocumentCollection]
 */
export class TJSDocumentCollection
{
   /**
    * Fake Application API that DocumentCollection uses for document model callbacks.
    *
    * @type {{ uuid: string, close: Function, render: Function }}
    */
   #callbackAPI;

   /**
    * @type {DocumentCollection}
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
    * @returns {TJSDocumentCollectionUpdateOptions<T>} Last update options.
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

      this.#updateSubscribers(false,
       { action: 'delete', documentType: collection.documentName, documents: [], data: [] });

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

      this.#subscriptions.length = 0;
   }

   /**
    * @returns {T} Current collection
    */
   get() { return this.#collection; }

   /**
    * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
    *
    * @param {T | undefined | null}  collection - New collection to set.
    *
    * @param {TJSDocumentCollectionUpdateOptions<T>}  [options] - New collection update options to set.
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
         if (collection instanceof DocumentCollection && this.#subscriptions.length) { this.#callbackRegister(); }

         this.#updateSubscribers(false, {
            action: `tjs-set-${collection === void 0 || collection === null ? 'undefined' : 'new'}`,
            ...options
         });
      }
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
    * @param {(value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void} handler - Callback function
    * that is invoked on update / changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);              // Add handler to the array of subscribers.

      // Register callback with first subscriber.
      if (this.#subscriptions.length === 1) { this.#callbackRegister(); }

      const collection = this.#collection;

      const documentType = collection?.documentName ?? void 0;

      const updateOptions = { action: 'subscribe', documentType, documents: [], data: [] };

      handler(collection, updateOptions);  // Call handler with current value and update options.

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }

         // Unsubscribe from collection if there are no subscribers.
         if (this.#subscriptions.length === 0) { this.#callbackUnregister(); }
      };
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {TJSDocumentCollectionUpdateOptions<T>}   [options] - Options from render call; will have collection
    *        update context.
    */
   #updateSubscribers(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      const subscriptions = this.#subscriptions;
      const collection = this.#collection;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](collection, options); }
   }
}

/**
 * @typedef TJSDocumentCollectionOptions
 *
 * @property {((collection: DocumentCollection) => void) | null} [delete] Optional post delete function
 *           to invoke when document is deleted _after_ subscribers have been notified.
 *
 * @property {((collection: DocumentCollection) => void) | null} [preDelete] Optional pre delete function to
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
