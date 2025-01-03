import { Readable, Unsubscriber, Subscriber } from 'svelte/store';
import { DynMapReducer, DynReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam D `Foundry Document`.
 */
declare class TJSDocument<D extends fvtt.ClientDocument> implements Readable<D> {
  #private;
  /**
   * @param [document] - Document to wrap or TJSDocumentOptions.
   *
   * @param [options] - TJSDocument options.
   */
  constructor(document?: D | TJSDocument.Options.Config<D>, options?: TJSDocument.Options.Config<D>);
  /**
   * @returns {import('./types').EmbeddedAPI} Embedded store manager.
   */
  get embedded(): TJSDocument.API.Embedded;
  /**
   * @returns Returns the options passed on last update.
   */
  get updateOptions(): TJSDocument.Data.Update;
  /**
   * @returns Returns the UUIDv4 assigned to this store.
   */
  get uuidv4(): string;
  /**
   * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
   * ClientDocumentMixin `apps` tracking object.
   */
  destroy(): void;
  /**
   * @returns Current document
   */
  get(): D | undefined;
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
  static getUUIDFromDataTransfer(
    data: TJSDocument.Data.UUIDDataTransfer,
    { compendium, world, types }?: TJSDocument.Options.UUIDFromDataTransfer,
  ): string | undefined;
  /**
   * Sets a new document target to be monitored. To unset use `undefined` or `null`.
   *
   * @param doc - New document to set.
   *
   * @param [options] - New document update options to set.
   */
  set(doc: D | undefined | null, options?: Partial<TJSDocument.Data.Update>): void;
  /**
   * Potentially sets new document from data transfer object.
   *
   * @param data - Document transfer data.
   *
   * @param [options] - Optional parameters for {@link TJSDocument.getUUIDFromDataTransfer}.
   *
   * @returns Returns true if new document set from data transfer blob.
   */
  setFromDataTransfer(
    data: TJSDocument.Data.UUIDDataTransfer,
    options?: TJSDocument.Options.UUIDFromDataTransfer,
  ): Promise<boolean>;
  /**
   * Sets the document by Foundry UUID performing a lookup and setting the document if found.
   *
   * @param {string}   uuid - A Foundry UUID to lookup.
   *
   * @param {import('./types').TJSDocumentUpdateOptions}   [options] - New document update options to set.
   *
   * @returns {Promise<boolean>} True if successfully set document from UUID.
   */
  setFromUUID(uuid?: string, options?: TJSDocument.Data.Update): Promise<boolean>;
  /**
   * Sets options for this document wrapper / store.
   *
   * @param options - Options for TJSDocument.
   */
  setOptions(options: TJSDocument.Options.Config<D>): void;
  /**
   * @param handler - Callback function that is invoked on update / changes.
   *
   * @returns Unsubscribe function.
   */
  subscribe(handler: TJSDocument.SubscriberFn<D>): Unsubscriber;
}
declare namespace TJSDocument {
  /**
   * Subscriber handler function to receive updates.
   */
  interface SubscriberFn<D extends fvtt.ClientDocument> extends Subscriber<D> {
    (value: D | undefined, options?: Data.Update): void;
  }
  namespace API {
    /**
     * Provides the public embedded reactive collection API.
     */
    interface Embedded {
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
        FoundryDoc: D,
        options?: O,
      ): O extends typeof DynMapReducer<string, InstanceType<D>>
        ? InstanceType<O>
        : O extends {
              ctor: typeof DynMapReducer<string, InstanceType<D>>;
            }
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
      get<D extends fvtt.DocumentConstructor>(
        FoundryDoc: D,
        reducerName?: string,
      ): DynMapReducer<string, InstanceType<D>> | undefined;
    }
    namespace Embedded {
      /**
       * Creates a compound type for embedded collection map reducer 'create' option combinations.
       *
       * Includes additional type inference constraints for {@link DynReducer.Data.MapCreate} requiring either
       * `ctor` or `sort` / `filters` to be defined.
       *
       * @typeParam D `Foundry Document` - Instance type of Foundry document.
       */
      type CreateOptions<D> =
        | string
        | typeof DynMapReducer<string, D>
        | (DynReducer.Data.MapCreate<string, D> & {
            ctor: typeof DynMapReducer<string, D>;
          })
        | (DynReducer.Data.MapCreate<string, D> &
            (
              | {
                  filters: Iterable<DynReducer.Data.FilterFn<D> | DynReducer.Data.Filter<D>>;
                }
              | {
                  sort: DynReducer.Data.CompareFn<D> | DynReducer.Data.Sort<D>;
                }
            ));
    }
  }
  namespace Data {
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
    interface Update {
      /**
       * The update action. Useful for filtering.
       */
      action: string;
      /**
       * Foundry data associated with document changes.
       */
      data:
        | {
            [key: string]: unknown;
          }[]
        | string[];
    }
  }
  namespace Options {
    interface Config<D extends fvtt.ClientDocument> {
      /**
       * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
       *
       * @param doc Document being deleted.
       */
      delete?: (doc?: D) => void | Promise<void>;
      /**
       * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
       *
       * @param doc Document being deleted.
       */
      preDelete?: (doc?: D) => void | Promise<void>;
    }
    /**
     * Options for the {@link TJSDocument.getUUIDFromDataTransfer} and {@link TJSDocument.setFromDataTransfer}
     * methods.
     */
    interface UUIDFromDataTransfer {
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

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam C `Foundry Collection`.
 */
declare class TJSDocumentCollection<C extends fvtt.DocumentCollection> implements Readable<C> {
  #private;
  /**
   * @param [collection] - Collection to wrap or TJSDocumentCollectionOptions.
   *
   * @param [options] - TJSDocumentCollection options.
   */
  constructor(
    collection?: C | TJSDocumentCollection.Options.Config<C>,
    options?: TJSDocumentCollection.Options.Config<C>,
  );
  /**
   * Returns the options passed on last update.
   *
   * @returns Last update options.
   */
  get updateOptions(): TJSDocumentCollection.Data.Update;
  /**
   * Returns the UUIDv4 assigned to this store.
   *
   * @returns UUIDv4
   */
  get uuid(): string;
  /**
   * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
   * DocumentCollection `apps` tracking array.
   */
  destroy(): void;
  /**
   * @returns Current collection if any.
   */
  get(): C | undefined;
  /**
   * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
   *
   * @param collection - New collection to set.
   *
   * @param [options] - New collection update options to set.
   */
  set(collection: C | undefined | null, options?: Partial<TJSDocumentCollection.Data.Update>): void;
  /**
   * Sets options for this collection wrapper / store.
   *
   * @param options - Options for TJSDocumentCollection.
   */
  setOptions(options: TJSDocumentCollection.Options.Config<C>): void;
  /**
   * @param handler - Callback function that is invoked on update / changes.
   *
   * @returns Unsubscribe function.
   */
  subscribe(handler: TJSDocumentCollection.SubscriberFn<C>): Unsubscriber;
}
declare namespace TJSDocumentCollection {
  /**
   * Subscriber handler function to receive updates.
   */
  interface SubscriberFn<C extends fvtt.DocumentCollection> extends Subscriber<C> {
    (value: C | undefined, options?: Data.Update): void;
  }
  namespace Data {
    /**
     * Provides data regarding the latest collection change / update.
     */
    interface Update {
      /**
       * The update action. Useful for filtering.
       */
      action: string;
      /**
       * Foundry data associated with document changes.
       */
      data:
        | {
            [key: string]: unknown;
          }[]
        | string[];
    }
  }
  namespace Options {
    interface Config<C extends fvtt.DocumentCollection> {
      /**
       * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
       *
       * @param collection Document collecting being deleted.
       */
      delete?: (collection: C) => void | Promise<void>;
      /**
       * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
       *
       * @param collection Document collecting being deleted.
       */
      preDelete?: (collection: C) => void | Promise<void>;
    }
  }
}

export { TJSDocument, TJSDocumentCollection };
