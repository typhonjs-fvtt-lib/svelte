import { isObject, uuidv4 } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {foundry.abstract.Document} T
 */
export class TJSDocument
{
   #document;
   #uuid;

   /**
    * @type {TJSDocumentOptions}
    */
   #options = { delete: void 0, notifyOnDelete: false };

   #subscriptions = [];
   #updateOptions;

   /**
    * @param {T}                    [document] - Document to wrap.
    *
    * @param {TJSDocumentOptions}   [options] - TJSDocument options.
    */
   constructor(document, options = {})
   {
      this.#uuid = `tjs-document-${uuidv4()}`;

      this.setOptions(options);
      this.set(document);
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
    * @returns {*} UUID
    */
   get uuid() { return this.#uuid; }

   /**
    * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted()
   {
      if (this.#document instanceof foundry.abstract.Document)
      {
         delete this.#document.apps[this.#uuid];
         this.#document = void 0;
      }

      this.#updateOptions = void 0;

      if (typeof this.#options.delete === 'function') { await this.#options.delete(); }

      if (this.#options.notifyOnDelete) { this.#notify(); }
   }

   /**
    * @param {boolean}  [force] - unused - signature from Foundry render function.
    *
    * @param {object}   [options] - Options from render call; will have document update context.
    */
   #notify(force = false, options = {}) // eslint-disable-line no-unused-vars
   {
      this.#updateOptions = options;

      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      const document = this.#document;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](document, options); }
   }

   /**
    * @returns {T | undefined} Current document
    */
   get() { return this.#document; }

   /**
    * @param {T | undefined}  document - New document to set.
    *
    * @param {object}         [options] - New document update options to set.
    */
   set(document, options = {})
   {
      if (this.#document)
      {
         delete this.#document.apps[this.#uuid];
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
         document.apps[this.#uuid] = {
            close: this.#deleted.bind(this),
            render: this.#notify.bind(this)
         };
      }

      this.#document = document;
      this.#updateOptions = options;
      this.#notify();
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
         throw new TypeError(`TJSDocument error: 'options' is not an object.`);
      }

      if (options.delete !== void 0 && typeof options.delete !== 'function')
      {
         throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function.`);
      }

      if (options.notifyOnDelete !== void 0 && typeof options.notifyOnDelete !== 'boolean')
      {
         throw new TypeError(`TJSDocument error: 'notifyOnDelete' attribute in options is not a boolean.`);
      }

      if (options.delete === void 0 || typeof options.delete === 'function')
      {
         this.#options.delete = options.delete;
      }

      if (typeof options.notifyOnDelete === 'boolean')
      {
         this.#options.notifyOnDelete = options.notifyOnDelete;
      }
   }

   /**
    * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this.#document, this.#updateOptions);           // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }
}

/**
 * @typedef TJSDocumentOptions
 *
 * @property {Function} delete - Optional delete function to invoke when document is deleted.
 *
 * @property {boolean} notifyOnDelete - When true a subscribers are notified of the deletion of the document.
 */
