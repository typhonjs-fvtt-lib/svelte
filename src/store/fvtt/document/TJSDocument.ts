import { tick }                     from 'svelte';

import { Hashing }                  from '#runtime/util';

import {
   isObject,
   isPlainObject }                  from '#runtime/util/object';

import { isDocument }               from '#runtime/types/fvtt-shim/guard';

import { EmbeddedStoreManager }     from './EmbeddedStoreManager';

import type {
   Readable,
   Subscriber,
   Unsubscriber }                   from 'svelte/store';

import type {
   DynMapReducer,
   DynReducer }                     from '#runtime/svelte/store/reducer';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam D `Foundry Document`.
 */

class TJSDocument<D extends fvtt.ClientDocument> implements Readable<D>
{
   /**
    * Fake Application API that ClientDocumentMixin uses for document model callbacks.
    */
   #callbackAPI: CallbackAPI;

   /**
    * Wrapped document.
    */
   #document: (D | undefined)[] = [void 0];

   /**
    *
    */
   #embeddedStoreManager: EmbeddedStoreManager | undefined;

   /**
    *
    */
   #embeddedAPI: TJSDocument.API.Embedded | undefined;

   /**
    * UUIDv4 assigned to this instance.
    */
   readonly #uuidv4: string;

   /**
    *
    */
   #options: TJSDocument.Options.Config<D> = {};

   /**
    * All current subscribers.
    */
   #subscribers: TJSDocument.SubscriberFn<D>[] = [];

   /**
    * Latest update options processed.
    */
   #updateOptions: TJSDocument.Data.Update | undefined;

   /**
    * @param [document] - Document to wrap or TJSDocumentOptions.
    *
    * @param [options] - TJSDocument options.
    */
   constructor(document?: D | TJSDocument.Options.Config<D>, options: TJSDocument.Options.Config<D> = {})
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
         this.set(document as D);
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

         this.#embeddedAPI = {
            create: (doc, options) => this.#embeddedStoreManager!.create(doc, options),
            destroy: (doc, storeName) => this.#embeddedStoreManager!.destroy(doc, storeName),
            get: (doc, storeName) => this.#embeddedStoreManager!.get(doc, storeName)
         };
      }

      return this.#embeddedAPI;
   }

   /**
    * @returns Returns the options passed on last update.
    */
   get updateOptions(): TJSDocument.Data.Update
   {
      return this.#updateOptions ?? { action: 'unknown', data: [] };
   }

   /**
    * @returns Returns the UUIDv4 assigned to this store.
    */
   get uuidv4(): string { return this.#uuidv4; }

   /**
    * Register the callback API with the underlying Foundry document.
    */
   #callbackRegister(): void
   {
      const doc: D | undefined = this.#document[0];
      if (isDocument(doc) && isObject(doc?.apps) && !doc.apps[this.#uuidv4])
      {
         doc.apps[this.#uuidv4] = this.#callbackAPI as fvtt.Application;
      }
   }

   /**
    * Unregister the callback API with the underlying Foundry document.
    */
   #callbackUnregister(): void
   {
      const doc: D | undefined = this.#document[0];
      if (isDocument(doc))
      {
         delete doc?.apps?.[this.#uuidv4];
      }
   }

   /**
    * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns Promise when completed.
    */
   async #deleted(): Promise<void>
   {
      const doc: D | undefined = this.#document[0];

      // Check to see if the document is still in the associated collection to determine if actually deleted.
      if (isDocument(doc) && !doc?.collection?.has(doc.id))
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
   destroy(): void
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
    * @returns Current document
    */
   get(): D | undefined { return this.#document[0]; }

   /**
    * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
    *
    * @param data - Drop transfer data.
    *
    * @param [opts] - Optional parameters.
    *
    * @param [opts.compendium=true] - Accept compendium documents.
    *
    * @param [opts.world=true] - Accept world documents.
    *
    * @param [opts.types] - Require the `data.type` to match entry in `types`.
    *
    * @returns Foundry UUID for drop data.
    */
   static getUUIDFromDataTransfer(data: TJSDocument.Data.UUIDDataTransfer,
    { compendium = true, world = true, types = void 0 }: TJSDocument.Options.UUIDFromDataTransfer = {}):
     string | undefined
   {
      if (!isObject(data)) { return void 0; }

      if (Array.isArray(types) && !types.includes(data.type!)) { return void 0; }

      let uuid: string | undefined = void 0;

      if (typeof data.uuid === 'string') // v10 and above provides a full UUID.
      {
         const isCompendium: boolean = data.uuid.startsWith('Compendium');

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
    * @param doc - New document to set.
    *
    * @param [options] - New document update options to set.
    */
   set(doc: D | undefined | null, options: Partial<TJSDocument.Data.Update> = {}): void
   {
      if (doc !== void 0 && doc !== null && !isDocument(doc))
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
         if (isDocument(doc) && this.#subscribers.length)
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
    * @param doc -
    *
    * @returns {boolean} Whether the document changed.
    */
   #setDocument(doc: D | undefined | null): boolean
   {
      const changed: boolean = doc !== this.#document[0];

      // Unregister before setting new document state.
      if (changed) { this.#callbackUnregister(); }

      this.#document[0] = doc === void 0 || doc === null ? void 0 : doc;

      if (changed && this.#embeddedStoreManager) { this.#embeddedStoreManager.handleDocChange(); }

      return changed;
   }

   /**
    * Potentially sets new document from data transfer object.
    *
    * @param data - Document transfer data.
    *
    * @param [options] - Optional parameters for {@link TJSDocument.getUUIDFromDataTransfer}.
    *
    * @returns Returns true if new document set from data transfer blob.
    */
   async setFromDataTransfer(data: TJSDocument.Data.UUIDDataTransfer,
    options?: TJSDocument.Options.UUIDFromDataTransfer): Promise<boolean>
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
   async setFromUUID(uuid?: string, options?: TJSDocument.Data.Update): Promise<boolean>
   {
      if (typeof uuid !== 'string' || uuid.length === 0) { return false; }

      try
      {
         const doc: fvtt.ClientDocument = await (globalThis as any).fromUuid(uuid);

         if (doc)
         {
            this.set(doc as D, options);
            return true;
         }
      }
      catch (err) { /**/ }

      return false;
   }

   /**
    * Sets options for this document wrapper / store.
    *
    * @param options - Options for TJSDocument.
    */
   setOptions(options: TJSDocument.Options.Config<D>): void
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
         this.#options.delete = options.delete as TJSDocument.Options.Config<D>['delete'] ?? void 0;
      }

      if (options.preDelete !== void 0)
      {
         this.#options.preDelete = options.preDelete as TJSDocument.Options.Config<D>['preDelete'] ?? void 0;
      }
   }

   /**
    * @param handler - Callback function that is invoked on update / changes.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: TJSDocument.SubscriberFn<D>): Unsubscriber
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
    * @param [force] - unused - signature from Foundry render function.
    *
    * @param [options] - Options from render call; will have document update context.
    */
   #updateSubscribers(force: boolean, options: Record<string, unknown> = {}): void // eslint-disable-line no-unused-vars
   {
      // Shallow copy w/ remapped keys.
      const optionsRemap: TJSDocument.Data.Update = {
         action: (options.action ?? options.renderContext ?? 'tjs-unknown') as string,
         data: (options.data ?? options.renderData ?? []) as []
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

type CallbackAPI = { close: Function, render: Function };

declare namespace TJSDocument {
   /**
    * Subscriber handler function to receive updates.
    */
   export interface SubscriberFn<D extends fvtt.ClientDocument> extends Subscriber<D> {
      (value: D | undefined, options?: Data.Update): void;
   }

   export namespace API {
      /**
       * Provides the public embedded reactive collection API.
       */
      export interface Embedded {
         /**
          * Create a reactive embedded collection store. When no options are provided the name of the embedded
          * collection matches the document name.
          *
          * @param FoundryDoc - A Foundry document class constructor.
          *
          * @param [options] - Dynamic reducer create options.
          *
          * @typeParam D `Foundry Document`.
          *
          * @typeParam O `CreateOptions` - Embedded API create options.
          */
         create<D extends fvtt.DocumentConstructor, O extends Embedded.CreateOptions<InstanceType<D>>>(
            FoundryDoc: D, options?: O):
            O extends typeof DynMapReducer<string, InstanceType<D>>
               ? InstanceType<O>
               : O extends { ctor: typeof DynMapReducer<string, InstanceType<D>> }
                  ? InstanceType<O['ctor']>
                  : DynMapReducer<string, InstanceType<D>>;

         /**
          * Destroys one or more embedded collection reducers. When no `reducerName` is provided all reactive embedded
          * collections are destroyed for the given document type.
          *
          * @param FoundryDoc - A Foundry document class constructor.
          *
          * @param [reducerName] - Optional name of a specific reducer to destroy.
          *
          * @typeParam D `Foundry Document`.
          */
         destroy<D extends fvtt.DocumentConstructor>(FoundryDoc?: D, reducerName?: string): boolean;

         /**
          * Returns a specific existing embedded collection store. When no `reducerName` is provided the document name
          * is used instead.
          *
          * @param FoundryDoc - A Foundry document class constructor.
          *
          * @param [reducerName] - Optional name of a specific reducer to get.
          *
          * @typeParam D `Foundry Document`.
          *
          * @returns The associated reactive embedded collection / reducer.
          */
         get<D extends fvtt.DocumentConstructor>(FoundryDoc: D, reducerName?: string):
          DynMapReducer<string, InstanceType<D>> | undefined;
      }

      export namespace Embedded {
         /**
          * Creates a compound type for embedded collection map reducer 'create' option combinations.
          *
          * Includes additional type inference constraints for {@link DynReducer.Data.MapCreate} requiring either
          * `ctor` or `sort` / `filters` to be defined.
          *
          * @typeParam D `Foundry Document` - Instance type of Foundry document.
          */
         export type CreateOptions<D> =
            | string
            | typeof DynMapReducer<string, D>
            | (DynReducer.Data.MapCreate<string, D> & { ctor: typeof DynMapReducer<string, D> })
            | (DynReducer.Data.MapCreate<string, D> & (
               | { filters: Iterable<DynReducer.Data.FilterFn<D> | DynReducer.Data.Filter<D>> }
               | { sort: DynReducer.Data.CompareFn<D> | DynReducer.Data.Sort<D> }
            ));
      }
   }

   export namespace Data {
      /**
       * Defines the shape of the data transfer object for {@link TJSDocument.getUUIDFromDataTransfer}.
       */
      interface UUIDDataTransfer {
         /**
          * The type of the document ("item", "actor").
          */
         type?: string;

         /**
          * The Foundry UUID if available
          */
         uuid?: string;

         /**
          * Extra properties.
          */
         [key: string]: any;
      }

      /**
       * Provides data regarding the latest document change / update.
       */
      export interface Update {
         /**
          * The update action. Useful for filtering.
          */
         action: string;

         /**
          * Foundry data associated with document changes.
          */
         data: { [key: string]: unknown }[] | string[];
      }
   }

   export namespace Options {
      interface Config<D extends fvtt.ClientDocument> {
         /**
          * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
          *
          * @param doc Document being deleted.
          */
         delete?: ((doc?: D) => void | Promise<void>);

         /**
          * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
          *
          * @param doc Document being deleted.
          */
         preDelete?: ((doc?: D) => void | Promise<void>);
      }

      /**
       * Options for the {@link TJSDocument.getUUIDFromDataTransfer} and {@link TJSDocument.setFromDataTransfer}
       * methods.
       */
      export interface UUIDFromDataTransfer {
         /**
          * Accept compendium documents.
          */
         compendium?: boolean;

         /**
          * Accept world documents.
          */
         world?: boolean;

         /**
          * Require the `data.type` to match an entry in `types`.
          */
         types?: string[];
      }
   }
}

export { TJSDocument }
