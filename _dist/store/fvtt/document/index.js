import { tick } from 'svelte';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';
import { hasPrototype, isObject, isPlainObject } from '@typhonjs-svelte/runtime-base/util/object';
import { isDocument, isDocumentCollection } from '@typhonjs-fvtt/types-fvtt-shim/guard';
import { DynMapReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';

/**
 * Provides management of reactive embedded collections.
 *
 * @privateRemarks
 * TODO: Consider subscribing to TJSDocument rather than exposing {@link EmbeddedStoreManager.handleDocChange} and
 * {@link EmbeddedStoreManager.handleUpdate}
 */
class EmbeddedStoreManager {
    /**
     * RegExp for detecting CRUD updates for the associated document.
     */
    static #updateActionRegex = /(?<action>create|delete|update)(?<sep>\.?)(?<name>\w+)/;
    /**
     */
    #name = new Map();
    /**
     * Source document.
     */
    #document;
    /**
     * Reverse lookup for older Foundry versions.
     */
    #collectionToDocName = new Map();
    /**
     * Valid embedded collection actions.
     */
    #embeddedNames = new Set();
    /**
     * @param document - The associated document holder.
     */
    constructor(document) {
        this.#document = document;
        this.handleDocChange();
        Object.seal(this);
    }
    /**
     * Create a reactive embedded collection store. When no options are provided the name of the embedded collection
     * matches the document name.
     *
     * @param FoundryDoc - A Foundry document.
     *
     * @param [options] - Dynamic reducer create options.
     *
     * @typeParam D `Foundry Document`.
     *
     * @typeParam O `CreateOptions` - Embedded API create options.
     */
    create(FoundryDoc, options) {
        const docName = FoundryDoc?.documentName;
        if (typeof docName !== 'string') {
            throw new TypeError(`EmbeddedStoreManager.create error: 'FoundryDoc' does not have a valid 'documentName' property.`);
        }
        const doc = this.#document[0];
        let collection = null;
        if (doc) {
            try {
                collection = doc.getEmbeddedCollection(docName);
            }
            catch (err) {
                console.warn(`EmbeddedStoreManager.create error: No valid embedded collection for: ${docName}`);
            }
        }
        let embeddedData = this.#name.get(docName);
        if (!embeddedData) {
            embeddedData = {
                collection,
                stores: new Map()
            };
            this.#name.set(docName, embeddedData);
        }
        /**
         * Reducer name
         */
        let name;
        /**
         * Rest of common reducer options.
         */
        let rest = {};
        /**
         * Reducer constructor function.
         */
        let ctor;
        if (typeof options === 'string') {
            name = options;
            ctor = DynMapReducer;
        }
        else if (typeof options === 'function' && hasPrototype(options, DynMapReducer)) {
            ctor = options;
        }
        else if (isObject(options)) {
            ({ name, ctor = DynMapReducer, ...rest } = options);
        }
        else {
            name = docName;
            ctor = DynMapReducer;
        }
        if (!hasPrototype(ctor, DynMapReducer)) {
            throw new TypeError(`EmbeddedStoreManager.create error: 'ctor' is not a 'DynMapReducer'.`);
        }
        name = name ?? ctor?.name;
        if (typeof name !== 'string') {
            throw new TypeError(`EmbeddedStoreManager.create error: 'name' is not a string.`);
        }
        if (embeddedData.stores.has(name)) {
            return embeddedData.stores.get(name);
        }
        else {
            const reducerOptions = collection ? { data: collection, ...rest } : { ...rest };
            const instance = new ctor(reducerOptions);
            embeddedData.stores.set(name, instance);
            // Invoke protected initialize method.
            if (typeof instance?.initialize === 'function') {
                instance.initialize(rest);
            }
            return instance;
        }
    }
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
    destroy(FoundryDoc, reducerName) {
        let count = 0;
        // Destroy all embedded stores
        if (FoundryDoc === void 0) {
            for (const embeddedData of this.#name.values()) {
                embeddedData.collection = null;
                for (const store of embeddedData.stores.values()) {
                    store.destroy();
                    count++;
                }
            }
            this.#name.clear();
        }
        else {
            const docName = FoundryDoc?.documentName;
            if (typeof docName !== 'string') {
                throw new TypeError(`EmbeddedStoreManager.delete error: 'FoundryDoc' does not have a valid 'documentName' property.`);
            }
            if (reducerName === void 0) {
                const embeddedData = this.#name.get(docName);
                if (embeddedData) {
                    embeddedData.collection = null;
                    for (const store of embeddedData.stores.values()) {
                        store.destroy();
                        count++;
                    }
                }
                this.#name.delete(docName);
            }
            else if (reducerName === 'string') {
                const embeddedData = this.#name.get(docName);
                if (embeddedData) {
                    const store = embeddedData.stores.get(reducerName);
                    if (store) {
                        store.destroy();
                        count++;
                    }
                }
            }
        }
        return count > 0;
    }
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
    get(FoundryDoc, reducerName) {
        const docName = FoundryDoc?.documentName;
        if (typeof docName !== 'string') {
            throw new TypeError(`EmbeddedStoreManager.get error: 'FoundryDoc' does not have a valid 'documentName' property.`);
        }
        const embeddedData = this.#name.get(docName);
        if (embeddedData) {
            return embeddedData.stores.get(reducerName ?? docName);
        }
    }
    /**
     * Updates all existing embedded collection stores with the associated embedded collection
     */
    handleDocChange() {
        const doc = this.#document[0];
        if (isDocument(doc)) {
            const existingEmbeddedNames = new Set(this.#name.keys());
            /**
             * All embedded names from associated document.
             */
            const embeddedNames = Object.entries(doc.constructor?.metadata?.embedded ?? []);
            this.#collectionToDocName.clear();
            // Remove all previously stored embedded name CRUD keys.
            this.#embeddedNames.clear();
            for (const [docName, collectionName] of embeddedNames) {
                // Remove processed embedded doc name from existingEmbeddedNames set.
                existingEmbeddedNames.delete(docName);
                // Update CRUD keys for v10.
                this.#embeddedNames.add(`create${docName}`);
                this.#embeddedNames.add(`delete${docName}`);
                this.#embeddedNames.add(`update${docName}`);
                // Update CRUD keys for v11.
                this.#embeddedNames.add(`create.${collectionName}`);
                this.#embeddedNames.add(`delete.${collectionName}`);
                this.#embeddedNames.add(`update.${collectionName}`);
                // Update CRUD keys for v12.
                this.#embeddedNames.add(`create${collectionName}`);
                this.#embeddedNames.add(`delete${collectionName}`);
                this.#embeddedNames.add(`update${collectionName}`);
                // v10 collection to doc name lookup.
                this.#collectionToDocName.set(docName, docName);
                this.#collectionToDocName.set(collectionName, docName);
                let collection = null;
                try {
                    // Update any existing stores with the actual collection.
                    collection = doc.getEmbeddedCollection(docName);
                }
                catch (err) {
                    console.warn(`EmbeddedStoreManager.handleDocUpdate error: No valid embedded collection for: ${docName}`);
                }
                // Update EmbeddedData for new collection.
                const embeddedData = this.#name.get(docName);
                if (embeddedData) {
                    // A bit funky here, but Foundry collections modify the Map type.
                    embeddedData.collection = collection;
                    // Update all existing stores.
                    for (const store of embeddedData.stores.values()) {
                        store.setData(embeddedData.collection, true);
                    }
                }
            }
            // Update all existing embedded collections with null data that aren't processed above.
            for (const embeddedName of existingEmbeddedNames) {
                const embeddedData = this.#name.get(embeddedName);
                if (embeddedData) {
                    embeddedData.collection = null;
                    for (const store of embeddedData.stores.values()) {
                        store.setData(null, true);
                    }
                }
            }
        }
        else // Reset all embedded reducer stores to null data.
         {
            this.#collectionToDocName.clear();
            this.#embeddedNames.clear();
            for (const embeddedData of this.#name.values()) {
                embeddedData.collection = null;
                for (const store of embeddedData.stores.values()) {
                    store.setData(null, true);
                }
            }
        }
    }
    /**
     * Handles updates to embedded stores parsing the document update action for valid embedded store types.
     *
     * On create, delete, update parse the type being modified then force index updates for the embedded type.
     *
     * @param action - Update action from document.
     */
    handleUpdate(action) {
        if (!this.#embeddedNames.has(action)) {
            return;
        }
        const match = EmbeddedStoreManager.#updateActionRegex.exec(action);
        if (match && match.groups) {
            const docOrCollectionName = match.groups.name;
            const embeddedName = this.#collectionToDocName.get(docOrCollectionName);
            const embeddedData = this.#name.get(embeddedName);
            if (embeddedData) {
                for (const store of embeddedData.stores.values()) {
                    store.index.update(true);
                }
            }
        }
    }
}

/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @typeParam D `Foundry Document`.
 */
class TJSDocument {
    /**
     * Fake Application API that ClientDocumentMixin uses for document model callbacks.
     */
    #callbackAPI;
    /**
     * Wrapped document.
     */
    #document = [void 0];
    /**
     *
     */
    #embeddedStoreManager;
    /**
     *
     */
    #embeddedAPI;
    /**
     * UUIDv4 assigned to this instance.
     */
    #uuidv4;
    /**
     *
     */
    #options = {};
    /**
     * All current subscribers.
     */
    #subscribers = [];
    /**
     * Latest update options processed.
     */
    #updateOptions;
    /**
     * @param [document] - Document to wrap or TJSDocumentOptions.
     *
     * @param [options] - TJSDocument options.
     */
    constructor(document, options = {}) {
        this.#uuidv4 = `tjs-document-${Hashing.uuidv4()}`;
        this.#callbackAPI = {
            close: this.#deleted.bind(this),
            render: this.#updateSubscribers.bind(this)
        };
        if (isPlainObject(document)) // Handle case when only options are passed into ctor.
         {
            this.setOptions(document);
        }
        else {
            this.setOptions(options);
            this.set(document);
        }
    }
    /**
     * @returns {import('./types').EmbeddedAPI} Embedded store manager.
     */
    get embedded() {
        if (!this.#embeddedAPI) {
            this.#embeddedStoreManager = new EmbeddedStoreManager(this.#document);
            this.#embeddedAPI = {
                create: (doc, options) => this.#embeddedStoreManager.create(doc, options),
                destroy: (doc, storeName) => this.#embeddedStoreManager.destroy(doc, storeName),
                get: (doc, storeName) => this.#embeddedStoreManager.get(doc, storeName)
            };
        }
        return this.#embeddedAPI;
    }
    /**
     * @returns Returns the options passed on last update.
     */
    get updateOptions() {
        return this.#updateOptions ?? { action: 'unknown', data: [] };
    }
    /**
     * @returns Returns the UUIDv4 assigned to this store.
     */
    get uuidv4() { return this.#uuidv4; }
    /**
     * Register the callback API with the underlying Foundry document.
     */
    #callbackRegister() {
        const doc = this.#document[0];
        if (isDocument(doc) && isObject(doc?.apps) && !doc.apps[this.#uuidv4]) {
            doc.apps[this.#uuidv4] = this.#callbackAPI;
        }
    }
    /**
     * Unregister the callback API with the underlying Foundry document.
     */
    #callbackUnregister() {
        const doc = this.#document[0];
        if (isDocument(doc)) {
            delete doc?.apps?.[this.#uuidv4];
        }
    }
    /**
     * Handles cleanup when the document is deleted. Invoking any optional delete function set in the constructor.
     *
     * @returns Promise when completed.
     */
    async #deleted() {
        const doc = this.#document[0];
        // Check to see if the document is still in the associated collection to determine if actually deleted.
        if (isDocument(doc) && !doc?.collection?.has(doc.id)) {
            this.#setDocument(void 0);
            if (typeof this.#options.preDelete === 'function') {
                await this.#options.preDelete(doc);
            }
            this.#updateSubscribers(false, { action: 'delete' });
            if (typeof this.#options.delete === 'function') {
                await this.#options.delete(doc);
            }
            // Allow subscribers to be able to query `updateOptions` involving any reactive statements.
            await tick();
            this.#updateOptions = void 0;
        }
    }
    /**
     * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
     * ClientDocumentMixin `apps` tracking object.
     */
    destroy() {
        if (this.#embeddedStoreManager) {
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
    get() { return this.#document[0]; }
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
    static getUUIDFromDataTransfer(data, { compendium = true, world = true, types = void 0 } = {}) {
        if (!isObject(data)) {
            return void 0;
        }
        if (Array.isArray(types) && !types.includes(data.type)) {
            return void 0;
        }
        let uuid = void 0;
        if (typeof data.uuid === 'string') // v10 and above provides a full UUID.
         {
            const isCompendium = data.uuid.startsWith('Compendium');
            if (isCompendium && compendium) {
                uuid = data.uuid;
            }
            else if (world) {
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
    set(doc, options = {}) {
        if (doc !== void 0 && doc !== null && !isDocument(doc)) {
            throw new TypeError(`TJSDocument set error: 'document' is not a valid Document or undefined / null.`);
        }
        if (!isObject(options)) {
            throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
        }
        // Only post an update if the document has changed.
        if (this.#setDocument(doc)) {
            // Only add registration if there are current subscribers.
            if (isDocument(doc) && this.#subscribers.length) {
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
    #setDocument(doc) {
        const changed = doc !== this.#document[0];
        // Unregister before setting new document state.
        if (changed) {
            this.#callbackUnregister();
        }
        this.#document[0] = doc === void 0 || doc === null ? void 0 : doc;
        if (changed && this.#embeddedStoreManager) {
            this.#embeddedStoreManager.handleDocChange();
        }
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
    async setFromDataTransfer(data, options) {
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
    async setFromUUID(uuid, options) {
        if (typeof uuid !== 'string' || uuid.length === 0) {
            return false;
        }
        try {
            const doc = await globalThis.fromUuid(uuid);
            if (doc) {
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
     * @param options - Options for TJSDocument.
     */
    setOptions(options) {
        if (!isObject(options)) {
            throw new TypeError(`TJSDocument error: 'options' is not a plain object.`);
        }
        // Verify valid values -------------
        if (options.delete !== void 0 && options.delete !== null && typeof options.delete !== 'function') {
            throw new TypeError(`TJSDocument error: 'delete' attribute in options is not a function or null.`);
        }
        if (options.preDelete !== void 0 && options.preDelete !== null && typeof options.preDelete !== 'function') {
            throw new TypeError(`TJSDocument error: 'preDelete' attribute in options is not a function or null.`);
        }
        // Set any valid values -------------
        if (options.delete !== void 0) {
            this.#options.delete = options.delete ?? void 0;
        }
        if (options.preDelete !== void 0) {
            this.#options.preDelete = options.preDelete ?? void 0;
        }
    }
    /**
     * @param handler - Callback function that is invoked on update / changes.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        let addedSubscriber = false;
        const currentIdx = this.#subscribers.findIndex((entry) => entry === handler);
        if (currentIdx === -1) {
            this.#subscribers.push(handler);
            addedSubscriber = true;
        }
        if (addedSubscriber) {
            // Register callback with first subscriber.
            if (this.#subscribers.length === 1) {
                this.#callbackRegister();
            }
            const updateOptions = { action: 'tjs-subscribe', data: [] };
            handler(this.#document[0], updateOptions); // Call handler with current value and update options.
        }
        // Return unsubscribe function.
        return () => {
            const index = this.#subscribers.findIndex((sub) => sub === handler);
            if (index !== -1) {
                this.#subscribers.splice(index, 1);
            }
            // Unsubscribe from document callback if there are no subscribers.
            if (this.#subscribers.length === 0) {
                this.#callbackUnregister();
            }
        };
    }
    /**
     * @param [force] - unused - signature from Foundry render function.
     *
     * @param [options] - Options from render call; will have document update context.
     */
    #updateSubscribers(force, options = {}) {
        // Shallow copy w/ remapped keys.
        const optionsRemap = {
            action: (options.action ?? options.renderContext ?? 'tjs-unknown'),
            data: (options.data ?? options.renderData ?? [])
        };
        // Coerce `data` as necessary into an array to standardize receiving processing.
        if (!Array.isArray(optionsRemap.data)) {
            optionsRemap.data = [optionsRemap.data];
        }
        this.#updateOptions = optionsRemap;
        const subscribers = this.#subscribers;
        const doc = this.#document[0];
        for (let cntr = 0; cntr < subscribers.length; cntr++) {
            subscribers[cntr](doc, optionsRemap);
        }
        if (this.#embeddedStoreManager) {
            this.#embeddedStoreManager.handleUpdate(optionsRemap.action);
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
class TJSDocumentCollection {
    /**
     * Fake Application API that DocumentCollection uses for document model callbacks.
     */
    #callbackAPI;
    /**
     * Collection being wrapped.
     */
    #collection = void 0;
    /**
     * UUIDv4 to associate as key with wrapped collection.
     */
    #uuidv4;
    /**
     * Configuration options.
     */
    #options = {};
    /**
     * All current subscribers.
     */
    #subscribers = [];
    /**
     * Latest update options processed.
     */
    #updateOptions;
    /**
     * @param [collection] - Collection to wrap or TJSDocumentCollectionOptions.
     *
     * @param [options] - TJSDocumentCollection options.
     */
    constructor(collection, options = {}) {
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
        else {
            this.setOptions(options);
            this.set(collection);
        }
    }
    /**
     * Returns the options passed on last update.
     *
     * @returns Last update options.
     */
    get updateOptions() {
        return this.#updateOptions ?? { action: 'unknown', data: [] };
    }
    /**
     * Returns the UUIDv4 assigned to this store.
     *
     * @returns UUIDv4
     */
    get uuid() { return this.#uuidv4; }
    /**
     * Register the callback API with the underlying Foundry collection.
     */
    #callbackRegister() {
        const collection = this.#collection;
        if (isDocumentCollection(collection) && Array.isArray(collection?.apps)) {
            const index = collection.apps.findIndex((sub) => sub === this.#callbackAPI);
            if (index === -1) {
                collection.apps.push(this.#callbackAPI);
            }
        }
    }
    /**
     * Unregister the callback API with the underlying Foundry collection.
     */
    #callbackUnregister() {
        const collection = this.#collection;
        if (isDocumentCollection(this.#collection) && Array.isArray(collection?.apps)) {
            const index = collection.apps.findIndex((sub) => sub === this.#callbackAPI);
            if (index >= 0) {
                collection.apps.splice(index, 1);
            }
        }
    }
    /**
     * Handles cleanup when the collection is deleted. Invoking any optional delete function set in the constructor.
     *
     * @returns {Promise<void>}
     */
    async #deleted() {
        const collection = this.#collection;
        this.#callbackUnregister();
        this.#collection = void 0;
        // Only invoke handlers and subscribers if the collection was defined.
        if (collection) {
            if (typeof this.#options.preDelete === 'function') {
                await this.#options.preDelete(collection);
            }
            this.#updateSubscribers(false, { action: 'delete' });
            if (typeof this.#options.delete === 'function') {
                await this.#options.delete(collection);
            }
        }
        // Allow subscribers to be able to query `updateOptions` involving any reactive statements.
        await tick();
        this.#updateOptions = void 0;
    }
    /**
     * Completely removes all internal subscribers, any optional delete callback, and unregisters from the
     * DocumentCollection `apps` tracking array.
     */
    destroy() {
        this.#callbackUnregister();
        this.#collection = void 0;
        this.#options.delete = void 0;
        this.#options.preDelete = void 0;
        this.#subscribers.length = 0;
    }
    /**
     * @returns Current collection if any.
     */
    get() { return this.#collection; }
    /**
     * Sets a new document collection target to be monitored. To unset use `undefined` or `null`.
     *
     * @param collection - New collection to set.
     *
     * @param [options] - New collection update options to set.
     */
    set(collection, options = {}) {
        if (collection !== void 0 && collection !== null && !isDocumentCollection(collection)) {
            throw new TypeError(`TJSDocumentCollection set error: 'collection' is not a valid DocumentCollection or undefined.`);
        }
        if (!isObject(options)) {
            throw new TypeError(`TJSDocument set error: 'options' is not an object.`);
        }
        const changed = this.#collection !== collection;
        if (changed) {
            this.#callbackUnregister();
        }
        this.#collection = collection === void 0 || collection === null ? void 0 : collection;
        if (changed) {
            if (isDocumentCollection(collection) && this.#subscribers.length) {
                this.#callbackRegister();
            }
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
    setOptions(options) {
        if (!isObject(options)) {
            throw new TypeError(`TJSDocumentCollection error: 'options' is not an object.`);
        }
        // Verify valid values -------------
        if (options.delete !== void 0 && options.delete !== null && typeof options.delete !== 'function') {
            throw new TypeError(`TJSDocumentCollection error: 'delete' attribute in options is not a function or null.`);
        }
        if (options.preDelete !== void 0 && options.preDelete !== null && typeof options.preDelete !== 'function') {
            throw new TypeError(`TJSDocumentCollection error: 'preDelete' attribute in options is not a function or null.`);
        }
        // Set any valid values -------------
        if (options.delete !== void 0) {
            this.#options.delete = options.delete ?? void 0;
        }
        if (options.preDelete !== void 0) {
            this.#options.preDelete = options.delete ?? void 0;
        }
    }
    /**
     * @param handler - Callback function that is invoked on update / changes.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        let addedSubscriber = false;
        const currentIdx = this.#subscribers.findIndex((entry) => entry === handler);
        if (currentIdx === -1) {
            this.#subscribers.push(handler);
            addedSubscriber = true;
        }
        if (addedSubscriber) {
            // Register callback with first subscriber.
            if (this.#subscribers.length === 1) {
                this.#callbackRegister();
            }
            const collection = this.#collection;
            const updateOptions = { action: 'tjs-subscribe', data: [] };
            handler(collection, updateOptions); // Call handler with current value and update options.
        }
        // Return unsubscribe function.
        return () => {
            const index = this.#subscribers.findIndex((sub) => sub === handler);
            if (index !== -1) {
                this.#subscribers.splice(index, 1);
            }
            // Unsubscribe from collection if there are no subscribers.
            if (this.#subscribers.length === 0) {
                this.#callbackUnregister();
            }
        };
    }
    /**
     * @param force - unused - signature from Foundry render function.
     *
     * @param [options] - Options from render call; will have collection update context.
     */
    #updateSubscribers(force, options = {}) {
        // Shallow copy w/ remapped keys.
        const optionsRemap = {
            action: (options.action ?? options.renderContext ?? 'tjs-unknown'),
            data: (options.data ?? options.renderData ?? [])
        };
        // Coerce `data` as necessary into an array to standardize receiving processing.
        if (!Array.isArray(optionsRemap.data)) {
            optionsRemap.data = [optionsRemap.data];
        }
        this.#updateOptions = optionsRemap;
        const subscribers = this.#subscribers;
        const collection = this.#collection;
        for (let cntr = 0; cntr < subscribers.length; cntr++) {
            subscribers[cntr](collection, optionsRemap);
        }
    }
}

export { TJSDocument, TJSDocumentCollection };
//# sourceMappingURL=index.js.map
