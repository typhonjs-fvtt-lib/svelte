import * as _typhonjs_fvtt_svelte_store_reducer from '@typhonjs-fvtt/svelte/store/reducer';
import * as _typhonjs_fvtt_svelte_util from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
declare class TJSDocument {
    /**
     * @param {foundry.abstract.Document | TJSDocumentOptions}  [document] - Document to wrap or TJSDocumentOptions.
     *
     * @param {TJSDocumentOptions}      [options] - TJSDocument options.
     */
    constructor(document?: foundry.abstract.Document | TJSDocumentOptions, options?: TJSDocumentOptions);
    /**
     * @returns {EmbeddedAPI} Embedded store manager.
     */
    get embedded(): any;
    /**
     * Returns the options passed on last update.
     *
     * @returns {object} Last update options.
     */
    get updateOptions(): any;
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
     * @returns {foundry.abstract.Document | undefined} Current document
     */
    get(): foundry.abstract.Document | undefined;
    /**
     * @param {foundry.abstract.Document | undefined}  document - New document to set.
     *
     * @param {object}         [options] - New document update options to set.
     */
    set(document: foundry.abstract.Document | undefined, options?: object): void;
    /**
     * Potentially sets new document from data transfer object.
     *
     * @param {object}   data - Document transfer data.
     *
     * @param {import('@typhonjs-fvtt/svelte/util').ParseDataTransferOptions & TJSDocumentOptions}   [options] - Optional
     *        parameters.
     *
     * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
     */
    setFromDataTransfer(data: object, options?: _typhonjs_fvtt_svelte_util.ParseDataTransferOptions & TJSDocumentOptions): Promise<boolean>;
    /**
     * Sets the document by Foundry UUID performing a lookup and setting the document if found.
     *
     * @param {string}   uuid - A Foundry UUID to lookup.
     *
     * @param {TJSDocumentOptions}   [options] - New document update options to set.
     *
     * @returns {Promise<boolean>} True if successfully set document from UUID.
     */
    setFromUUID(uuid: string, options?: TJSDocumentOptions): Promise<boolean>;
    /**
     * Sets options for this document wrapper / store.
     *
     * @param {TJSDocumentOptions}   options - Options for TJSDocument.
     */
    setOptions(options: TJSDocumentOptions): void;
    /**
     * @param {function(foundry.abstract.Document, object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: foundry.abstract.Document, arg1: object) => void): (() => void);
    #private;
}
type TJSDocumentOptions = {
    /**
     * - Optional post delete function to invoke when
     * document is deleted _after_ subscribers have been notified.
     */
    delete?: (doc: foundry.abstract.Document) => void;
    /**
     * - Optional pre delete function to invoke when
     * document is deleted _before_ subscribers are notified.
     */
    preDelete?: (doc: foundry.abstract.Document) => void;
};
type EmbeddedAPI<T> = {
    /**
     * - Creates an embedded collection store.
     */
    create: (embeddedName: string, options: _typhonjs_fvtt_svelte_store_reducer.DynOptionsMapCreate<string, any>) => _typhonjs_fvtt_svelte_store_reducer.DynMapReducer<string, T>;
    /**
     * - Destroys one or more embedded collection stores.
     */
    destroy: (embeddedName?: string, storeName?: string) => boolean;
    /**
     * - Returns a specific existing embedded collection store.
     */
    get: (embeddedName: string, storeName: string) => _typhonjs_fvtt_svelte_store_reducer.DynMapReducer<string, T>;
};

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {globalThis.DocumentCollection} T
 */
declare class TJSDocumentCollection<T extends globalThis.DocumentCollection> {
    /**
     * @param {T|TJSDocumentCollectionOptions}   [collection] - Collection to wrap or TJSDocumentCollectionOptions.
     *
     * @param {TJSDocumentCollectionOptions}     [options] - TJSDocumentCollection options.
     */
    constructor(collection?: T | TJSDocumentCollectionOptions, options?: TJSDocumentCollectionOptions);
    /**
     * Returns the options passed on last update.
     *
     * @returns {object} Last update options.
     */
    get updateOptions(): any;
    /**
     * Returns the UUID assigned to this store.
     *
     * @returns {*} UUID
     */
    get uuid(): any;
    /**
     * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
     * DocumentCollection `apps` tracking array.
     */
    destroy(): void;
    /**
     * @returns {T | undefined} Current collection
     */
    get(): T | undefined;
    /**
     * @param {T | undefined}  collection - New collection to set.
     *
     * @param {object}         [options] - New collection update options to set.
     */
    set(collection: T | undefined, options?: object): void;
    /**
     * Sets options for this collection wrapper / store.
     *
     * @param {TJSDocumentCollectionOptions}   options - Options for TJSDocumentCollection.
     */
    setOptions(options: TJSDocumentCollectionOptions): void;
    /**
     * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: T, arg1: object) => void): (() => void);
    #private;
}
type TJSDocumentCollectionOptions = {
    /**
     * - Optional post delete function
     * to invoke when document is deleted _after_ subscribers have been notified.
     */
    delete?: (collection: globalThis.DocumentCollection) => void;
    /**
     * - Optional pre delete function to
     * invoke when document is deleted _before_ subscribers are notified.
     */
    preDelete?: (collection: globalThis.DocumentCollection) => void;
};

export { EmbeddedAPI, TJSDocument, TJSDocumentCollection, TJSDocumentCollectionOptions, TJSDocumentOptions };
