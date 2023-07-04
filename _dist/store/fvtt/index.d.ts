

import * as svelte_store from 'svelte/store';
import { DynOptionsMapCreate, DynMapReducer } from '@typhonjs-svelte/runtime-base/svelte/store/reducer';
import * as _runtime_svelte_store_web_storage from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
    /**
     * Creates an embedded collection store.
     */
    create<T extends NamedDocumentConstructor>(doc: T, options: DynOptionsMapCreate<string, InstanceType<T>>): DynMapReducer<string, InstanceType<T>>;
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
 * @template [T=globalThis.foundry.abstract.Document]
 *
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 */
declare class TJSDocument<T = globalThis.foundry.abstract.Document> {
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
    static getUUIDFromDataTransfer(data: object, { actor, compendium, world, types }?: {
        actor?: boolean;
        compendium?: boolean;
        world?: boolean;
        types?: string[] | undefined;
    }): string | undefined;
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
     * @param {{ actor?: boolean, compendium?: boolean, world?: boolean, types?: string[] } & TJSDocumentOptions}   [options] - Optional
     *        parameters.
     *
     * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
     */
    setFromDataTransfer(data: object, options?: {
        actor?: boolean;
        compendium?: boolean;
        world?: boolean;
        types?: string[];
    } & TJSDocumentOptions): Promise<boolean>;
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
    delete?: (doc: globalThis.foundry.abstract.Document) => void;
    /**
     * Optional pre delete function to invoke
     * when document is deleted _before_ subscribers are notified.
     */
    preDelete?: (doc: globalThis.foundry.abstract.Document) => void;
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
     * @returns {*} UUID
     */
    get uuid(): any;
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
     * @param {(value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void} handler - Callback function
     * that is invoked on update / changes.
     *
     * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
     */
    subscribe(handler: (value: T, updateOptions?: TJSDocumentCollectionUpdateOptions<T>) => void): svelte_store.Unsubscriber;
    #private;
}
type TJSDocumentCollectionOptions = {
    /**
     * Optional post delete function
     * to invoke when document is deleted _after_ subscribers have been notified.
     */
    delete?: (collection: DocumentCollection) => void;
    /**
     * Optional pre delete function to
     * invoke when document is deleted _before_ subscribers are notified.
     */
    preDelete?: (collection: DocumentCollection) => void;
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

/**
 * Controls preparation and processing of registered game settings w/ TJSGameSettings. Game settings are parsed
 * for UI display by TJSSettingsEdit. The store `showSettings` is utilized in TJSSettingsSwap component to provide
 * an easy way to flip between settings component or any main slotted component.
 */
declare class UIControl {
    /**
     * @param {import('./').TJSGameSettings}   settings -
     */
    constructor(settings: TJSGameSettings);
    /**
     * Sets current `showSettings` state.
     *
     * @param {boolean}  showSettings - New `showSettings` state.
     */
    set showSettings(arg: boolean);
    /**
     * @returns {boolean} Current `showSettings` state.
     */
    get showSettings(): boolean;
    /**
     * @returns {{showSettings: import('svelte/store').Readable<boolean>}} Returns the managed stores.
     */
    get stores(): {
        showSettings: svelte_store.Readable<boolean>;
    };
    /**
     * Adds a custom section / folder defined by the provided TJSSettingsCustomSection options object.
     *
     * @param {TJSSettingsCustomSection} options - The configuration object for the custom section.
     */
    addSection(options: TJSSettingsCustomSection): void;
    /**
     * Creates the UISettingsData object by parsing stored settings in
     *
     * @param {TJSSettingsCreateOptions} [options] - Optional parameters.
     *
     * @returns {TJSSettingsUIData} Parsed UI settings data.
     */
    create(options?: TJSSettingsCreateOptions): TJSSettingsUIData;
    /**
     * Convenience method to swap `showSettings`.
     *
     * @returns {boolean} New `showSettings` state.
     */
    swapShowSettings(): boolean;
    #private;
}
type TJSSettingsCreateOptions = {
    /**
     * Defines the effects added to TJS components; ripple by default.
     */
    efx?: string;
    /**
     * - TRL TJSWebStorage (session)
     * instance to serialize folder state and scrollbar position.
     */
    storage?: _runtime_svelte_store_web_storage.TJSWebStorage;
};
type TJSSettingsCustomSection = {
    /**
     * Svelte component constructor function for custom section.
     */
    class: Function;
    /**
     * Svelte component constructor function for custom section.
     */
    props?: Function;
    /**
     * Inline styles for the section element.
     */
    styles?: object;
    /**
     * A folder label or TJSSettingsCustomSectionFolder object.
     */
    folder?: string | TJSSettingsCustomSectionFolder;
};
type TJSSettingsCustomSectionFolder = {
    /**
     * The folder label.
     */
    label: string;
    /**
     * A Svelte component config object defining TJSSvgFolder summary end component.
     */
    summaryEnd?: object;
    /**
     * Inline styles for the `TJSSvgFolder`; useful for setting CSS variables.
     */
    styles?: object;
};
type TJSSettingsUIData = {
    /**
     * Sorted folders with associated settings and label.
     */
    folders: {
        label: string;
        settings: object[];
    }[];
    /**
     * Top level settings data.
     */
    topLevel: object[];
    /**
     * Custom sections.
     */
    sections: object[];
    /**
     * The store for `applyScrolltop`.
     */
    storeScrollbar: svelte_store.Writable<number>;
    /**
     * The bound destroy callback function for received of TJSSettingsUIData.
     */
    destroy?: Function;
};

/**
 * Registers game settings and creates a backing Svelte store for each setting. The Svelte store will update the
 * Foundry game settings and vice versa when changes occur to the Foundry game settings the updated data is set to the
 * store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
declare class TJSGameSettings {
    /**
     * Creates the TJSGameSettings instance.
     *
     * @param {string}   namespace - The namespace for all settings.
     */
    constructor(namespace: string);
    /**
     * @returns {string} Returns namespace set in constructor.
     */
    get namespace(): string;
    /**
     * @returns {UIControl} The associated UIControl.
     */
    get uiControl(): UIControl;
    /**
     * Returns a readable Game Settings store for the associated key.
     *
     * @param {string}   key - Game setting key.
     *
     * @returns {import('svelte/store').Readable|undefined} The associated store for the given game setting key.
     */
    getReadableStore(key: string): svelte_store.Readable<any> | undefined;
    /**
     * Returns a writable Game Settings store for the associated key.
     *
     * @param {string}   key - Game setting key.
     *
     * @returns {import('svelte/store').Writable|undefined} The associated store for the given game setting key.
     */
    getStore(key: string): svelte_store.Writable<any> | undefined;
    /**
     * Returns a writable Game Settings store for the associated key.
     *
     * @param {string}   key - Game setting key.
     *
     * @returns {import('svelte/store').Writable|undefined} The associated store for the given game setting key.
     */
    getWritableStore(key: string): svelte_store.Writable<any> | undefined;
    /**
     * Registers a setting with TJSGameSettings and Foundry core.
     *
     * Note: The specific store subscription handler assigned to the passed in store or store created for the setting
     * internally is returned from this function. In some cases when setting up custom stores particularly of object
     * types with several child property stores (`propertyStore`) it is necessary to only update the setting store and
     * not all subscribers to the custom store as the `propertyStore` instances are also subscribers to the custom store.
     *
     * This allows the custom store in the `set` implementation to mainly only trigger the TJSGameSettings subscriber
     * handler on updates and not all the connected `propertyStore` instances.
     *
     * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
     *
     * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
     *                                   registering the setting with Foundry. This allows the settings to be displayed
     *                                   in the app itself, but removed from the standard Foundry configuration location.
     *
     * @returns {Function} The specific store subscription handler assigned to the passed in store.
     */
    register(setting: GameSetting, coreConfig?: boolean): Function;
    /**
     * Registers multiple settings.
     *
     * Please refer to the note in {@link TJSGameSettings.register} about the returned object of store subscriber handler
     * functions.
     *
     * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
     *
     * @param {boolean}     coreConfig - When false this overrides the `setting.options.config` parameter when
     *                                   registering the setting with Foundry. This allows the settings to be displayed
     *                                   in the app itself, but removed from the standard Foundry configuration location.
     *
     * @returns { {[key: string]: Function} } An object containing all TJSGameSetting store subscriber handlers for each
     *          setting `key` added.
     */
    registerAll(settings: Iterable<GameSetting>, coreConfig: boolean): {
        [key: string]: Function;
    };
    /**
     * Provides an iterator / generator to return stored settings data.
     *
     * @yields {GameSettingData}
     */
    [Symbol.iterator](): Generator<GameSettingOptions, void, unknown>;
    #private;
}
type GameSettingOptions = {
    /**
     * If choices are defined, the resulting setting will be a select menu.
     */
    choices?: object;
    /**
     * Specifies that the setting appears in the configuration view.
     */
    config?: boolean;
    /**
     * A default value for the setting.
     */
    default?: any;
    /**
     * A description of the registered setting and its behavior.
     */
    hint?: string;
    /**
     * The displayed name of the setting.
     */
    name: string;
    /**
     * An onChange callback function or iterable list of callbacks to
     * directly receive callbacks from Foundry on setting change.
     */
    onChange?: Function | Iterable<Function>;
    /**
     * If range is specified, the resulting setting will be
     * a range slider.
     */
    range?: {
        min: number;
        max: number;
        step: number;
    };
    /**
     * If true then a prompt to reload after changes occurs.
     */
    requiresReload?: boolean;
    /**
     * Scope for setting.
     */
    scope?: ('client' | 'world');
    /**
     * A constructable object or function.
     */
    type: object | Function;
};
/**
 * Defines a game setting.
 */
type GameSetting = {
    /**
     * The setting namespace; usually the ID of the module / system.
     */
    namespace: string;
    /**
     * The setting key to register.
     */
    key: string;
    /**
     * The name of the TJSSvgFolder to put this setting in to group them.
     */
    folder: string;
    /**
     * An existing store instance to use.
     */
    store?: svelte_store.Writable<any>;
    /**
     * Configuration for setting data.
     */
    options: GameSettingOptions;
};
/**
 * Stores the primary TJS game setting keys w/ GameSettingOptions.
 */
type GameSettingData = GameSettingOptions;

/**
 * Provides an accessible JS object that is updated reactively from all or subset of TJSGameSettings stores.
 * Accessors are provided to directly get / set current setting data. Using a setter will update the setting and backing
 * store.
 *
 * Note: You can create a JSDoc / `@typedef` to apply with `@type` and achieve typing support in IDEs for the
 * customizable live settings instance. Please see the example at the end of this source file on how to accomplish this
 * task.
 *
 * TJSLiveGameSettings is also a readable Svelte store essentially providing a customizable derived store of all
 * settings tracked.
 *
 * Note: When using from JS a second subscriber function argument is the key that was updated.
 * From Svelte: Use 'lastKey' accessor to retrieve the last updated key.
 */
declare class TJSLiveGameSettings {
    /**
     * Creates a live binding against the setting stores. All settings are configured by default, but can also be
     * filtered by setting key with inclusive / exclusive Sets.
     *
     * @param {TJSGameSettings}   gameSettings - A game settings instance to subscribe to...
     *
     * @param {object}            [options] - TJSLiveGameSettings options.
     *
     * @param {Set<string>}       [options.include] - A Set of setting keys to include from subscribing.
     *
     * @param {Set<string>}       [options.exclude] - A Set of setting keys to exclude from subscribing.
     */
    constructor(gameSettings: TJSGameSettings, { include, exclude }?: {
        include?: Set<string>;
        exclude?: Set<string>;
    });
    /**
     * @returns {string} Last updated setting key.
     */
    get lastKey(): string;
    /**
     * Destroys this instance of TJSLiveGameSettings and unsubscribes from all game setting stores.
     */
    destroy(): void;
    /**
     * Returns an iterator / generator of all setting entries.
     *
     * @yields {string}
     */
    entries(): Generator<any[], void, unknown>;
    /**
     * Returns an iterator / generator of all setting keys.
     *
     * @yields {string}
     */
    keys(): Generator<string, void, unknown>;
    /**
     * Returns a string / JSON stringify of the current setting data.
     *
     * @returns {string} Tracked setting data.
     */
    toString(): string;
    /**
     * Override to respond to setting update.
     *
     * @param {string} key - The setting / local key that updated.
     *
     * @protected
     */
    protected _update(key: string): void;
    /**
     * Returns an iterator / generator of all values.
     *
     * @yields {*}
     */
    values(): Generator<any, void, unknown>;
    /**
     * @param {(value: TJSLiveGameSettings, key?: string) => void} handler - Callback function that is invoked on
     * update / changes.
     *
     * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
     */
    subscribe(handler: (value: TJSLiveGameSettings, key?: string) => void): svelte_store.Unsubscriber;
    #private;
}

/**
 * @type {import('svelte/store').Readable<globalThis.game>} Provides a Svelte store wrapping the Foundry `game` global
 * variable. It is initialized on the `ready` hook. You may use this store to access the global game state from a
 * Svelte template. It is a read only store and will receive no reactive updates during runtime.
 */
declare const gameState: svelte_store.Readable<globalThis.game>;

export { GameSetting, GameSettingData, GameSettingOptions, TJSDocument, TJSDocumentCollection, TJSDocumentCollectionOptions, TJSDocumentCollectionUpdateOptions, TJSDocumentOptions, TJSDocumentUpdateOptions, TJSGameSettings, TJSLiveGameSettings, gameState };
