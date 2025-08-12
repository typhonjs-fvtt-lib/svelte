import { tick }                  from 'svelte';

import { Hashing }               from '#runtime/util';

import {
   isObject,
   isPlainObject }               from '#runtime/util/object';

import { isDocumentCollection }  from '#runtime/types/fvtt-shim/guard';

import type {
   Readable,
   Subscriber,
   Unsubscriber }                from 'svelte/store';

type CallbackAPI = { uuid: string, close: Function, render: Function };

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam C `Foundry Collection`.
 */
class TJSDocumentCollection<C extends fvtt.DocumentCollection> implements Readable<C>
{
   /**
    * Fake Application API that DocumentCollection uses for document model callbacks.
    */
   readonly #callbackAPI: CallbackAPI;

   /**
    * Collection being wrapped.
    */
   #collection: C | undefined = void 0;

   /**
    * UUIDv4 to associate as key with wrapped collection.
    */
   readonly #uuidv4: string;

   /**
    * Configuration options.
    */
   #options: TJSDocumentCollection.Options.Config<C> = {};

   /**
    * All current subscribers.
    */
   #subscribers: TJSDocumentCollection.SubscriberFn<C>[] = [];

   /**
    * Latest update options processed.
    */
   #updateOptions: TJSDocumentCollection.Data.Update | undefined;

   /**
    * @param [collection] - Collection to wrap or TJSDocumentCollectionOptions.
    *
    * @param [options] - TJSDocumentCollection options.
    */
   constructor(collection?: C | TJSDocumentCollection.Options.Config<C>,
    options: TJSDocumentCollection.Options.Config<C> = {})
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
         this.set(collection as C);
      }
   }

   /**
    * Returns the options passed on last update.
    *
    * @returns Last update options.
    */
   get updateOptions(): TJSDocumentCollection.Data.Update
   {
      return this.#updateOptions ?? { action: 'unknown', data: [] };
   }

   /**
    * Returns the UUIDv4 assigned to this store.
    *
    * @returns UUIDv4
    */
   get uuid(): string { return this.#uuidv4; }

   /**
    * Register the callback API with the underlying Foundry collection.
    */
   #callbackRegister()
   {
      const collection: C | undefined = this.#collection;

      if (isDocumentCollection(collection) && Array.isArray(collection?.apps))
      {
         const index: number = collection.apps.findIndex((sub: CallbackAPI): boolean => sub === this.#callbackAPI);
         if (index === -1) { collection.apps.push(this.#callbackAPI as unknown as fvtt.Application); }
      }
   }

   /**
    * Unregister the callback API with the underlying Foundry collection.
    */
   #callbackUnregister()
   {
      const collection: C | undefined = this.#collection;

      if (isDocumentCollection(this.#collection) && Array.isArray(collection?.apps))
      {
         const index = collection.apps.findIndex((sub: CallbackAPI): boolean => sub === this.#callbackAPI);
         if (index >= 0) { collection.apps.splice(index, 1); }
      }
   }

   /**
    * Handles cleanup when the collection is deleted. Invoking any optional delete function set in the constructor.
    *
    * @returns {Promise<void>}
    */
   async #deleted(): Promise<void>
   {
      const collection: C | undefined = this.#collection;

      this.#callbackUnregister();

      this.#collection = void 0;

      // Only invoke handlers and subscribers if the collection was defined.
      if (collection)
      {
         if (typeof this.#options.preDelete === 'function') { await this.#options.preDelete(collection); }

         this.#updateSubscribers(false, { action: 'delete' });

         if (typeof this.#options.delete === 'function') { await this.#options.delete(collection); }
      }

      // Allow subscribers to be able to query `updateOptions` involving any reactive statements.
      await tick();

      this.#updateOptions = void 0;
   }

   /**
    * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
    * DocumentCollection `apps` tracking array.
    */
   destroy(): void
   {
      this.#callbackUnregister();
      this.#collection = void 0;

      this.#options.delete = void 0;
      this.#options.preDelete = void 0;

      this.#subscribers.length = 0;
   }

   /**
    * @returns Current collection if any.
    */
   get(): C | undefined { return this.#collection; }

   /**
    * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
    *
    * @param collection - New collection to set.
    *
    * @param [options] - New collection update options to set.
    */
   set(collection: C | undefined | null, options: Partial<TJSDocumentCollection.Data.Update> = {}): void
   {
      if (collection !== void 0 && collection !== null && !isDocumentCollection(collection))
      {
         throw new TypeError(
          `TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
      }

      if (!isObject(options))
      {
         throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
      }

      const changed: boolean = this.#collection !== collection;

      if (changed) { this.#callbackUnregister(); }

      this.#collection = collection === void 0 || collection === null ? void 0 : collection;

      if (changed)
      {
         if (isDocumentCollection(collection) && this.#subscribers.length) { this.#callbackRegister(); }

         this.#updateSubscribers(false, {
            data: [],
            ...options,
            action: `tjs-set-${collection === void 0 || collection === null ? 'undefined' : 'new'}`
         });
      }
   }

   /**
    * Sets options for this collection wrapper / store.
    *
    * @param options - Options for TJSDocumentCollection.
    */
   setOptions(options: TJSDocumentCollection.Options.Config<C>): void
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
         this.#options.delete = options.delete as TJSDocumentCollection.Options.Config<C>['delete'] ?? void 0;
      }

      if (options.preDelete !== void 0)
      {
         this.#options.preDelete = options.delete as TJSDocumentCollection.Options.Config<C>['preDelete'] ?? void 0;
      }
   }

   /**
    * @param handler - Callback function that is invoked on update / changes.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: TJSDocumentCollection.SubscriberFn<C>): Unsubscriber
   {
      let addedSubscriber: boolean = false;

      const currentIdx: number = this.#subscribers.findIndex(
       (entry: TJSDocumentCollection.SubscriberFn<C>): boolean => entry === handler);

      if (currentIdx === -1)
      {
         this.#subscribers.push(handler);
         addedSubscriber = true;
      }

      if (addedSubscriber)
      {
         // Register callback with first subscriber.
         if (this.#subscribers.length === 1) { this.#callbackRegister(); }

         const collection: C | undefined = this.#collection;

         const updateOptions = { action: 'tjs-subscribe', data: [] };

         handler(collection, updateOptions);  // Call handler with current value and update options.
      }

      // Return unsubscribe function.
      return (): void =>
      {
         const index: number = this.#subscribers.findIndex(
          (sub: TJSDocumentCollection.SubscriberFn<C>): boolean => sub === handler);

         if (index !== -1) { this.#subscribers.splice(index, 1); }

         // Unsubscribe from collection if there are no subscribers.
         if (this.#subscribers.length === 0) { this.#callbackUnregister(); }
      };
   }

   /**
    * @param force - unused - signature from Foundry render function.
    *
    * @param [options] - Options from render call; will have collection update context.
    */
   #updateSubscribers(force: boolean, options: Record<string, unknown> = {}): void // eslint-disable-line no-unused-vars
   {
      // Shallow copy w/ remapped keys.
      const optionsRemap: TJSDocumentCollection.Data.Update = {
         action: (options.action ?? options.renderContext ?? 'tjs-unknown') as string,
         data: (options.data ?? options.renderData ?? []) as []
      };

      // Coerce `data` as necessary into an array to standardize receiving processing.
      if (!Array.isArray(optionsRemap.data)) { optionsRemap.data = [optionsRemap.data]; }

      this.#updateOptions = optionsRemap;

      const subscribers: TJSDocumentCollection.SubscriberFn<C>[] = this.#subscribers;
      const collection: C | undefined = this.#collection;

      for (let cntr: number = 0; cntr < subscribers.length; cntr++) { subscribers[cntr](collection, optionsRemap); }
   }
}

namespace TJSDocumentCollection {
   /**
    * Subscriber handler function to receive updates.
    */
   export interface SubscriberFn<C extends fvtt.DocumentCollection> extends Subscriber<C> {
      (value: C | undefined, options?: Data.Update): void;
   }

   export namespace Data {
      /**
       * Provides data regarding the latest collection change / update.
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
      export interface Config<C extends fvtt.DocumentCollection> {
         /**
          * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
          *
          * @param collection Document collecting being deleted.
          */
         delete?: ((collection: C) => void | Promise<void>);

         /**
          * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
          *
          * @param collection Document collecting being deleted.
          */
         preDelete?: ((collection: C) => void | Promise<void>);
      }
   }
}

export { TJSDocumentCollection }
