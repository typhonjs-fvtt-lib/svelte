import * as svelte_store from 'svelte/store';
import { Readable } from 'svelte/store';
import { DynMapReducer, DynReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
  /**
   * Create a reactive embedded collection store. When no options are provided the name of the embedded collection
   * matches the document name.
   *
   * @param doc - A Foundry document.
   *
   * @param [options] - Dynamic reducer create options.
   *
   * @typeParam D `Foundry Document`.
   *
   * @typeParam O `EmbeddedCreate` - create options.
   */
  create<D extends fvtt.DocumentConstructor, O extends EmbeddedCreateOptions<InstanceType<D>>>(
    doc: D,
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
   * @param doc - A Foundry document.
   *
   * @param [reducerName] - Optional name of a specific reducer to destroy.
   *
   * @typeParam D `Foundry Document`.
   */
  destroy<D extends fvtt.DocumentConstructor>(doc?: D, reducerName?: string): boolean;
  /**
   * Returns a specific existing embedded collection store. When no `reducerName` is provided the document name
   * is used instead.
   *
   * @param doc - A Foundry document.
   *
   * @param [reducerName] - Optional name of a specific reducer to get.
   *
   * @typeParam D `Foundry Document`.
   */
  get<D extends fvtt.DocumentConstructor>(
    doc: D,
    reducerName?: string,
  ): DynMapReducer<string, InstanceType<D>> | undefined;
}
/**
 * Creates a compound type for embedded collection map reducer 'create' option combinations.
 *
 * Includes additional type inference constraints for {@link DynReducer.Data.MapCreate} requiring either `ctor` or
 * `sort` / `filters` to be defined.
 *
 * @typeParam T `any` - Type of data.
 */
type EmbeddedCreateOptions<T> =
  | string
  | typeof DynMapReducer<string, T>
  | (DynReducer.Data.MapCreate<string, T> & {
      ctor: typeof DynMapReducer<string, T>;
    })
  | (DynReducer.Data.MapCreate<string, T> &
      (
        | {
            filters: Iterable<DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>>;
          }
        | {
            sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T>;
          }
      ));
interface TJSDocumentOptions<D extends fvtt.Document> {
  /**
   * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
   */
  delete?: ((doc?: D) => void) | null;
  /**
   * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
   */
  preDelete?: ((doc?: D) => void) | null;
}
/**
 * Provides data regarding the latest document change.
 */
interface TJSDocumentUpdateOptions {
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
interface TJSDocumentCollectionOptions<C extends fvtt.DocumentCollection> {
  /**
   * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
   *
   * @param collection
   */
  delete?: (collection: C) => void | null;
  /**
   * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
   *
   * @param collection
   */
  preDelete?: (collection: C) => void | null;
}
/**
 * Provides data regarding the latest collection change.
 */
interface TJSDocumentCollectionUpdateOptions<C extends fvtt.DocumentCollection> {
  /**
   * The update action. Useful for filtering.
   */
  action?: string;
  /**
   * Foundry data associated with document changes.
   */
  data:
    | {
        [key: string]: unknown;
      }[]
    | string[];
}

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
declare class TJSDocument<D = fvtt.Document> implements Readable<D> {
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
  static getUUIDFromDataTransfer(
    data: object,
    {
      compendium,
      world,
      types,
    }?: {
      compendium?: boolean;
      world?: boolean;
      types?: string[];
    },
  ): string | undefined;
  /**
   * @param {D | import('./types').TJSDocumentOptions<D>}  [document] - Document to wrap or TJSDocumentOptions.
   *
   * @param {import('./types').TJSDocumentOptions<D>}      [options] - TJSDocument options.
   */
  constructor(document?: D | TJSDocumentOptions<D>, options?: TJSDocumentOptions<D>);
  /**
   * @returns {import('./types').EmbeddedAPI} Embedded store manager.
   */
  get embedded(): EmbeddedAPI;
  /**
   * Returns the options passed on last update.
   *
   * @returns {import('./types').TJSDocumentUpdateOptions} Last update options.
   */
  get updateOptions(): TJSDocumentUpdateOptions;
  /**
   * Returns the UUID assigned to this store.
   *
   * @returns {string} UUID
   */
  get uuidv4(): string;
  /**
   * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
   * ClientDocumentMixin `apps` tracking object.
   */
  destroy(): void;
  /**
   * @returns {D | undefined} Current document
   */
  get(): D | undefined;
  /**
   * Sets a new document target to be monitored. To unset use `undefined` or `null`.
   *
   * @param {D | undefined | null}  doc - New document to set.
   *
   * @param {import('./types').TJSDocumentUpdateOptions}   [options] - New document update options to set.
   */
  set(doc: D | undefined | null, options?: TJSDocumentUpdateOptions): void;
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
  setFromDataTransfer(
    data: object,
    options?: {
      compendium?: boolean;
      world?: boolean;
      types?: string[];
    },
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
  setFromUUID(uuid: string, options?: TJSDocumentUpdateOptions): Promise<boolean>;
  /**
   * Sets options for this document wrapper / store.
   *
   * @param {import('./types').TJSDocumentOptions<D>}   options - Options for TJSDocument.
   */
  setOptions(options: TJSDocumentOptions<D>): void;
  /**
   * @param {(value: D, updateOptions?: import('./types').TJSDocumentUpdateOptions) => void} handler - Callback
   * function that is invoked on update / changes.
   *
   * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
   */
  subscribe(handler: (value: D, updateOptions?: TJSDocumentUpdateOptions) => void): svelte_store.Unsubscriber;
  #private;
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
declare class TJSDocumentCollection<C = fvtt.DocumentCollection> implements Readable<C> {
  /**
   * @param {C | import('./types').TJSDocumentCollectionOptions<C>}   [collection] - Collection to wrap or
   *        TJSDocumentCollectionOptions.
   *
   * @param {import('./types').TJSDocumentCollectionOptions<C>}     [options] - TJSDocumentCollection options.
   */
  constructor(collection?: C | TJSDocumentCollectionOptions<C>, options?: TJSDocumentCollectionOptions<C>);
  /**
   * Returns the options passed on last update.
   *
   * @returns {import('./types').TJSDocumentCollectionUpdateOptions<C>} Last update options.
   */
  get updateOptions(): TJSDocumentCollectionUpdateOptions<C>;
  /**
   * Returns the UUID assigned to this store.
   *
   * @returns {string} UUID
   */
  get uuid(): string;
  /**
   * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
   * DocumentCollection `apps` tracking array.
   */
  destroy(): void;
  /**
   * @returns {C | undefined} Current collection
   */
  get(): C | undefined;
  /**
   * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
   *
   * @param {C | undefined | null}  collection - New collection to set.
   *
   * @param {import('./types').TJSDocumentCollectionUpdateOptions<C>}  [options] - New collection update options to
   *        set.
   */
  set(collection: C | undefined | null, options?: TJSDocumentCollectionUpdateOptions<C>): void;
  /**
   * Sets options for this collection wrapper / store.
   *
   * @param {import('./types').TJSDocumentCollectionOptions<C>}  options - Options for TJSDocumentCollection.
   */
  setOptions(options: TJSDocumentCollectionOptions<C>): void;
  /**
   * @param {(value: C, updateOptions?: import('./types').TJSDocumentCollectionUpdateOptions<C>) => void} handler -
   *        Callback function that is invoked on update / changes.
   *
   * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
   */
  subscribe(
    handler: (value: C, updateOptions?: TJSDocumentCollectionUpdateOptions<C>) => void,
  ): svelte_store.Unsubscriber;
  #private;
}

export {
  type EmbeddedAPI,
  type EmbeddedCreateOptions,
  TJSDocument,
  TJSDocumentCollection,
  type TJSDocumentCollectionOptions,
  type TJSDocumentCollectionUpdateOptions,
  type TJSDocumentOptions,
  type TJSDocumentUpdateOptions,
};
