import * as svelte_store from 'svelte/store';
import { DynOptionsMapCreate, DynMapReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
  /**
   * Creates an embedded collection store.
   */
  create<T extends NamedDocumentConstructor>(
    doc: T,
    options: DynOptionsMapCreate<string, InstanceType<T>>,
  ): DynMapReducer<string, InstanceType<T>>;
  /**
   * - Destroys one or more embedded collection stores.
   */
  destroy<T extends NamedDocumentConstructor>(doc?: T, storeName?: string): boolean;
  /**
   * - Returns a specific existing embedded collection store.
   */
  get<T extends NamedDocumentConstructor>(doc: T, storeName: string): DynMapReducer<string, InstanceType<T>>;
}
/**
 * Provides a basic duck type for Foundry documents. Expects a constructor / class w/ static property `name`.
 */
interface NamedDocumentConstructor {
  new (...args: any[]): any;
  readonly documentName: string;
}

/**
 * @template [T=import('./types').NamedDocumentConstructor]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
declare class TJSDocument<T = NamedDocumentConstructor> {
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
   * @param {T | TJSDocumentOptions}  [document] - Document to wrap or TJSDocumentOptions.
   *
   * @param {TJSDocumentOptions}      [options] - TJSDocument options.
   */
  constructor(document?: T | TJSDocumentOptions, options?: TJSDocumentOptions);
  /**
   * @returns {import('./types').EmbeddedAPI} Embedded store manager.
   */
  get embedded(): EmbeddedAPI;
  /**
   * Returns the options passed on last update.
   *
   * @returns {TJSDocumentUpdateOptions} Last update options.
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
   * @returns {T} Current document
   */
  get(): T;
  /**
   * @param {T | undefined}  document - New document to set.
   *
   * @param {TJSDocumentUpdateOptions}   [options] - New document update options to set.
   */
  set(document: T | undefined, options?: TJSDocumentUpdateOptions): void;
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
   * @param {TJSDocumentUpdateOptions}   [options] - New document update options to set.
   *
   * @returns {Promise<boolean>} True if successfully set document from UUID.
   */
  setFromUUID(uuid: string, options?: TJSDocumentUpdateOptions): Promise<boolean>;
  /**
   * Sets options for this document wrapper / store.
   *
   * @param {TJSDocumentOptions}   options - Options for TJSDocument.
   */
  setOptions(options: TJSDocumentOptions): void;
  /**
   * @param {(value: T, updateOptions?: TJSDocumentUpdateOptions) => void} handler - Callback function that is
   * invoked on update / changes.
   *
   * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
   */
  subscribe(handler: (value: T, updateOptions?: TJSDocumentUpdateOptions) => void): svelte_store.Unsubscriber;
  #private;
}
type TJSDocumentOptions = {
  /**
   * Optional post delete function to invoke when
   * document is deleted _after_ subscribers have been notified.
   */
  delete?: ((doc?: object) => void) | null;
  /**
   * Optional pre delete function to invoke
   * when document is deleted _before_ subscribers are notified.
   */
  preDelete?: ((doc?: object) => void) | null;
};
/**
 * Provides data regarding the latest document change.
 */
type TJSDocumentUpdateOptions = {
  /**
   * The update action. Useful for filtering.
   */
  action?: string;
  /**
   * The update action. Useful for filtering.
   */
  renderContext?: string;
  /**
   * Foundry data associated with document changes.
   */
  data?: object[] | string[];
};

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template [T=DocumentCollection]
 */
declare class TJSDocumentCollection<T = DocumentCollection> {
  /**
   * @param {T | TJSDocumentCollectionOptions}   [collection] - Collection to wrap or TJSDocumentCollectionOptions.
   *
   * @param {TJSDocumentCollectionOptions}     [options] - TJSDocumentCollection options.
   */
  constructor(collection?: T | TJSDocumentCollectionOptions, options?: TJSDocumentCollectionOptions);
  /**
   * Returns the options passed on last update.
   *
   * @returns {TJSDocumentCollectionUpdateOptions<T>} Last update options.
   */
  get updateOptions(): TJSDocumentCollectionUpdateOptions<T>;
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
   * @returns {T} Current collection
   */
  get(): T;
  /**
   * @param {T | undefined}  collection - New collection to set.
   *
   * @param {TJSDocumentCollectionUpdateOptions<T>}  [options] - New collection update options to set.
   */
  set(collection: T | undefined, options?: TJSDocumentCollectionUpdateOptions<T>): void;
  /**
   * Sets options for this collection wrapper / store.
   *
   * @param {TJSDocumentCollectionOptions}   options - Options for TJSDocumentCollection.
   */
  setOptions(options: TJSDocumentCollectionOptions): void;
  /**
   * @param {(value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void} handler - Callback function
   * that is invoked on update / changes.
   *
   * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
   */
  subscribe(
    handler: (value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void,
  ): svelte_store.Unsubscriber;
  #private;
}
type TJSDocumentCollectionOptions = {
  /**
   * Optional post delete function
   * to invoke when document is deleted _after_ subscribers have been notified.
   */
  delete?: ((collection: DocumentCollection) => void) | null;
  /**
   * Optional pre delete function to
   * invoke when document is deleted _before_ subscribers are notified.
   */
  preDelete?: ((collection: DocumentCollection) => void) | null;
};
/**
 * Provides data regarding the latest collection change.
 */
type TJSDocumentCollectionUpdateOptions<T> = {
  /**
   * The update action. Useful for filtering.
   */
  action: string;
  /**
   * The document name.
   */
  documentType: string;
  /**
   * associated documents that changed.
   */
  documents: T[];
  /**
   * Foundry data associated with document changes.
   */
  data: object[] | string[];
};

export {
  type EmbeddedAPI,
  type NamedDocumentConstructor,
  TJSDocument,
  TJSDocumentCollection,
  type TJSDocumentCollectionOptions,
  type TJSDocumentCollectionUpdateOptions,
  type TJSDocumentOptions,
  type TJSDocumentUpdateOptions,
};
