import * as svelte_store from 'svelte/store';
import { get } from 'svelte/types/runtime/store';

type GameSettingOptions = {
    /**
     * - If choices are defined, the resulting setting will be a select menu.
     */
    choices?: object;
    /**
     * - Specifies that the setting appears in the configuration view.
     */
    config?: boolean;
    /**
     * - A description of the registered setting and its behavior.
     */
    hint?: string;
    /**
     * - The displayed name of the setting.
     */
    name: string;
    /**
     * - An onChange callback to directly receive callbacks from Foundry on setting change.
     */
    onChange?: Function;
    /**
     * - If range is specified, the resulting setting will be a range slider.
     */
    range?: object;
    /**
     * - Scope for setting.
     */
    scope?: ('client' | 'world');
    /**
     * - A constructable object or function.
     */
    type: any | Function;
};
/**
 * - Defines a game setting.
 */
type GameSetting = {
    /**
     * - The ID of the module / system.
     */
    moduleId: string;
    /**
     * - The setting key to register.
     */
    key: string;
    /**
     * - Configuration for setting data.
     */
    options: GameSettingOptions;
};
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type GSStore = svelte_store.Writable<any> & typeof get;
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type LSStore = svelte_store.Writable<any> & typeof get;
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type SSStore = svelte_store.Writable<any> & typeof get;
type TJSDocumentOptions = {
    /**
     * - Optional delete function to invoke when document is deleted.
     */
    delete: Function;
    /**
     * - When true a subscribers are notified of the deletion of the document.
     */
    notifyOnDelete: boolean;
};
type TJSDocumentCollectionOptions = {
    /**
     * - Optional delete function to invoke when document is deleted.
     */
    delete: Function;
    /**
     * - When true a subscribers are notified of the deletion of the document.
     */
    notifyOnDelete: boolean;
};
/**
 * - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 */
type GameState = svelte_store.Readable<any>;
/**
 * - Position validator function that
 *                         takes a {@link PositionData } instance potentially modifying it or returning null if invalid.
 */
type ValidatorFn = (arg0: object, arg1: any) => any | null;
type ValidatorData = {
    /**
     * - An ID associated with this validator. Can be used to remove the validator.
     */
    id?: any;
    /**
     * - Position validator function that takes a {@link PositionData } instance
     *   potentially modifying it or returning null if invalid.
     */
    validator: ValidatorFn;
    /**
     * - A number between 0 and 1 inclusive to position this validator against others.
     */
    weight?: number;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
declare class DynArrayReducer {
    /**
     * @type {AdapterFilters<T>}
     */
    /**
     * @type {{filters: FilterFn<T>[]}}
     */
    /**
     * @type {AdapterSort<T>}
     */
    /**
     * @type {{compareFn: CompareFn<T>}}
     */
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param {Iterable<T>|DynData<T>}   data - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | any);
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns {IndexerAPI & Iterable<number>} Indexer API - is also iterable.
     */
    get index(): any;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * @returns {AdapterSort<T>} The sort adapter.
     */
    get sort(): any;
    /**
     *
     * @param {function(DynArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                       Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DynArrayReducer<T>) => void): (() => void);
}
declare class LocalStorage {
    /**
     * Get value from the localstorage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {*} Value from local storage or if not defined any default value provided.
     */
    getItem(key: string, defaultValue?: any): any;
    /**
     * Returns the backing Svelte store for the given key; potentially sets a default value if the key
     * is not already set.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {LSStore} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): LSStore;
    /**
     * Sets the value for the given key in localstorage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in local storage.
     *
     * @param {string}   key - Key to lookup in localstorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in local storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
}
/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
declare class Position {
    static get Validators(): Readonly<{
        __proto__: any;
        browserWindow: typeof browserWindow;
        transformWindow: typeof transformWindow;
    }>;
    /**
     * @param {object}         parent - The associated parent for positional data tracking. Used in validators.
     *
     * @param {object}         options - Default values.
     */
    constructor(parent: object, options?: object);
    /**
     * Returns a promise that is resolved on the next element update with the time of the update.
     *
     * @returns {Promise<number>} Promise resolved on element update.
     */
    get elementUpdated(): Promise<number>;
    /**
     * Returns the derived writable stores for individual data variables.
     *
     * @returns {StorePosition} Derived / writable stores.
     */
    get stores(): any;
    /**
     * Returns the validators.
     *
     * @returns {AdapterValidators} validators.
     */
    get validators(): AdapterValidators;
    /**
     * @param {number|'auto'|null} height -
     */
    set height(arg: number | "auto");
    /**
     * @returns {number|'auto'|null} height
     */
    get height(): number | "auto";
    /**
     * @param {number|null} left -
     */
    set left(arg: number);
    /**
     * @returns {number|null} left
     */
    get left(): number;
    /**
     * @param {number|null} rotateX -
     */
    set rotateX(arg: number);
    /**
     * @returns {number|null} rotateX
     */
    get rotateX(): number;
    /**
     * @param {number|null} rotateY -
     */
    set rotateY(arg: number);
    /**
     * @returns {number|null} rotateY
     */
    get rotateY(): number;
    /**
     * @param {number|null} rotateZ -
     */
    set rotateZ(arg: number);
    /**
     * @returns {number|null} rotateZ
     */
    get rotateZ(): number;
    /**
     * @param {number|null} scale -
     */
    set scale(arg: number);
    /**
     * @returns {number|null} scale
     */
    get scale(): number;
    /**
     * @param {number|null} top -
     */
    set top(arg: number);
    /**
     * @returns {number|null} top
     */
    get top(): number;
    /**
     * @param {string} transformOrigin -
     */
    set transformOrigin(arg: string);
    /**
     * @returns {string} transformOrigin
     */
    get transformOrigin(): string;
    /**
     * @param {number|'auto'|null} width -
     */
    set width(arg: number | "auto");
    /**
     * @returns {number|'auto'|null} width
     */
    get width(): number | "auto";
    /**
     * @param {number|null} zIndex -
     */
    set zIndex(arg: number);
    /**
     * @returns {number|null} z-index
     */
    get zIndex(): number;
    /**
     * Provides animation
     *
     * @param {PositionData}   position - The destination position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.duration] - Duration in milliseconds.
     *
     * @param {Function}       [opts.easing=linear] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {Promise<void>} Animation complete.
     */
    animateTo(position?: any, { duration, easing, interpolate }?: {
        duration?: number;
        easing?: Function;
        interpolate?: Function;
    }): Promise<void>;
    /**
     * Assigns current position to object passed into method.
     *
     * @param {object|PositionData} [position] - Target to assign current position data.
     *
     * @returns {PositionData} Passed in object with current position data.
     */
    get(position?: object | any): any;
    /**
     * Returns any stored save state by name.
     *
     * @param {string}   name - Saved data set name.
     *
     * @returns {PositionData} The saved data set.
     */
    getSave({ name }: string): any;
    /**
     * @returns {PositionData} Current position data.
     */
    toJSON(): any;
    /**
     * Resets data to default values and invokes set. Check options, but by default current z-index is maintained.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.keepZIndex=false] - When true keeps current z-index.
     *
     * @param {boolean}  [opts.invokeSet=true] - When true invokes set method.
     *
     * @returns {boolean} Operation successful.
     */
    reset({ keepZIndex, invokeSet }?: {
        keepZIndex?: boolean;
        invokeSet?: boolean;
    }): boolean;
    /**
     * Removes and returns any position state by name.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - Name to remove and retrieve.
     *
     * @returns {PositionData} Saved position data.
     */
    remove({ name }: {
        name: string;
    }): any;
    /**
     * Restores a saved positional state returning the data. Several optional parameters are available
     * to control whether the restore action occurs silently (no store / inline styles updates), animates
     * to the stored data, or simply sets the stored data. Restoring via {@link Position.animateTo} allows
     * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
     * returned if awaiting the end of the animation.
     *
     * @param {object}            params - Parameters
     *
     * @param {string}            params.name - Saved data set name.
     *
     * @param {boolean}           [params.remove=false] - Remove data set.
     *
     * @param {Iterable<string>}  [params.properties] - Specific properties to set / animate.
     *
     * @param {boolean}           [params.silent] - Set position data directly; no store or style updates.
     *
     * @param {boolean}           [params.async=false] - If animating return a Promise that resolves with any saved data.
     *
     * @param {boolean}           [params.animateTo=false] - Animate to restore data.
     *
     * @param {number}            [params.duration=100] - Duration in milliseconds.
     *
     * @param {Function}          [params.easing=linear] - Easing function.
     *
     * @param {Function}          [params.interpolate=lerp] - Interpolation function.
     *
     * @returns {PositionData} Saved position data.
     */
    restore({ name, remove, properties, silent, async, animateTo, duration, easing, interpolate }: {
        name: string;
        remove?: boolean;
        properties?: Iterable<string>;
        silent?: boolean;
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        easing?: Function;
        interpolate?: Function;
    }): any;
    /**
     * Saves current position state with the opportunity to add extra data to the saved state.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - name to index this saved data.
     *
     * @param {...*}     [options.extra] - Extra data to add to saved data.
     *
     * @returns {PositionData} Current position data
     */
    save({ name, ...extra }: {
        name: string;
        extra?: any[];
    }): any;
    /**
     * All calculation and updates of position are implemented in {@link Position}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * Note: the logic for updating position is improved and changes a few aspects from the default
     * {@link Application.setPosition}. The gate on `popOut` is removed, so to ensure no positional application occurs
     * popOut applications can set `this.options.positionable` to false ensuring no positional inline styles are
     * applied.
     *
     * The initial set call on an application with a target element will always set width / height as this is
     * necessary for correct calculations.
     *
     * When a target element is present updated styles are applied after validation. To modify the behavior of set
     * implement one or more validator functions and add them from the application via
     * `this.position.validators.add(<Function>)`.
     *
     * Updates to any target element are decoupled from the underlying Position data. This method returns this instance
     * that you can then await on the target element inline style update by using {@link Position.elementUpdated}.
     *
     * @param {PositionData}   [position] - Position data to set.
     *
     * @returns {Position} This Position instance.
     */
    set(position?: any): Position;
    /**
     *
     * @param {function(PositionData): void} handler - Callback function that is invoked on update / changes. Receives
     *                                                 a copy of the PositionData.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: any) => void): (() => void);
    #private;
}
declare class SessionStorage {
    /**
     * Get value from the sessionstorage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {*} Value from session storage or if not defined any default value provided.
     */
    getItem(key: string, defaultValue?: any): any;
    /**
     * Returns the backing Svelte store for the given key; potentially sets a default value if the key
     * is not already set.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {LSStore} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): LSStore;
    /**
     * Sets the value for the given key in sessionstorage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in sessionstorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
}
/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any Document / ClientMixinDocument.
 * This makes documents reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {foundry.abstract.Document} T
 */
declare class TJSDocument<T extends any> {
    /**
     * @param {T}                    [document] - Document to wrap.
     *
     * @param {TJSDocumentOptions}   [options] - TJSDocument options.
     */
    constructor(document?: T, options?: TJSDocumentOptions);
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
    get uuidv4(): any;
    /**
     * @returns {T | undefined} Current document
     */
    get(): T | undefined;
    /**
     * @param {T | undefined}  document - New document to set.
     *
     * @param {object}         [options] - New document update options to set.
     */
    set(document: T | undefined, options?: object): void;
    /**
     * Potentially sets new document from data transfer object.
     *
     * @param {object}   data - Document transfer data.
     *
     * @param {ParseDataTransferOptions & TJSDocumentOptions}   [options] - Optional parameters.
     *
     * @returns {Promise<boolean>} Returns true if new document set from data transfer blob.
     */
    setFromDataTransfer(data: object, options?: any & TJSDocumentOptions): Promise<boolean>;
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
     * @param {function(T, object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: T, arg1: object) => void): (() => void);
    #private;
}
/**
 * @typedef TJSDocumentOptions
 *
 * @property {Function} delete - Optional delete function to invoke when document is deleted.
 *
 * @property {boolean} notifyOnDelete - When true a subscribers are notified of the deletion of the document.
 */
/**
 * Provides a wrapper implementing the Svelte store / subscriber protocol around any DocumentCollection. This makes
 * document collections reactive in a Svelte component, but otherwise provides subscriber functionality external to
 * Svelte.
 *
 * @template {DocumentCollection} T
 */
declare class TJSDocumentCollection<T extends any> {
    /**
     * @param {T}                             [collection] - Collection to wrap.
     *
     * @param {TJSDocumentCollectionOptions}  [options] - TJSDocumentCollection options.
     */
    constructor(collection?: T, options?: TJSDocumentCollectionOptions);
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
/**
 * @typedef {import('svelte/store').Readable} GameState - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Provides the Svelte store subscribe function.
 *
 * @property {Function} get - Provides a mechanism to directly access the Foundry game state without subscribing.
 */
/**
 * Registers game settings and creates a backing Svelte store for each setting. It is possible to add multiple
 * `onChange` callbacks on registration.
 */
declare class TJSGameSettings {
    /**
     * Returns the Game Settings store for the associated key.
     *
     * @param {string}   key - Game setting key.
     *
     * @returns {GSStore|undefined} The associated store for the given game setting key.
     */
    getStore(key: string): GSStore | undefined;
    /**
     * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
     */
    register(setting: GameSetting): void;
    /**
     * Registers multiple settings.
     *
     * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
     */
    registerAll(settings: Iterable<GameSetting>): void;
    #private;
}
/**
 * @type {GameState} Provides a Svelte store wrapping the Foundry runtime / global game state.
 */
declare const gameState: svelte_store.Readable<any>;
/**
 * Provides a basic test for a given variable to test if it has the shape of a store by having a `subscribe` function.
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
declare function isStore(store: any): boolean;
/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 *
 * @param {Store} origin The store containing the object to get/set from.
 * @param {string|number|symbol|Array<string|number|symbol>} propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns {Store} A writable store.
 */
declare function propertyStore(origin: any, propName: string | number | symbol | Array<string | number | symbol>): any;
/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */
declare function subscribeFirstRest(store: svelte_store.Readable<any> | svelte_store.Writable<any>, first: any, update: any): svelte_store.Unsubscriber;
/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('svelte/store').Unsubscriber} Store unsubscribe function.
 */
declare function subscribeIgnoreFirst(store: svelte_store.Readable<any> | svelte_store.Writable<any>, update: any): svelte_store.Unsubscriber;
/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#Store_contract)
 */
/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#derived), but which
 * has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 *
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 2nd parameter.
 * @param {!Function|{withOld: !Function}} reflect Called when the
 * derived store gets a new value via its `set` or `update` methods, and determines new values for
 * the origin stores. [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 3rd parameter.
 *
 * @returns {Store} A writable store.
 */
declare function writableDerived(origins: any | any[], derive: Function, reflect: Function | {
    withOld: Function;
}, initial?: any): any;

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link FilterData} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main DynArrayReducer instance.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 *
 * @template T
 */
declare class AdapterFilters<T> {
    /**
     * @param {Function} indexUpdate - update function for the indexer.
     *
     * @returns {[AdapterFilters<T>, {filters: FilterData<T>[]}]} Returns this and internal storage for filter adapters.
     */
    constructor(indexUpdate: Function);
    /**
     * @returns {number} Returns the length of the
     */
    get length(): number;
    /**
     * @param {...(FilterFn<T>|FilterData<T>)}   filters -
     */
    add(...filters: (any | any)[]): void;
    clear(): void;
    /**
     * @param {...(FilterFn<T>|FilterData<T>)}   filters -
     */
    remove(...filters: (any | any)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param {function(*, FilterFn<T>, number): boolean} callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (arg0: any, arg1: any, arg2: number) => boolean): void;
    removeById(...ids: any[]): void;
}
/**
 * Provides the storage and sequencing of managed position validators. Each validator added may be a bespoke function or
 * a {@link ValidatorData} object containing an `id`, `validator`, and `weight` attributes; `validator` is the only
 * required attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the validator; recommended strings or numbers. This
 * allows validators to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows validators to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted validator always
 * runs before a higher weighted validator. If no weight is specified the default of '1' is assigned and it is appended
 * to the end of the validators list.
 *
 * This class forms the public API which is accessible from the `.validators` getter in the main Position instance.
 * ```
 * const position = new Position(<PositionData>);
 * position.validators.add(...);
 * position.validators.clear();
 * position.validators.length;
 * position.validators.remove(...);
 * position.validators.removeBy(...);
 * position.validators.removeById(...);
 * ```
 */
declare class AdapterValidators {
    /**
     * @returns {number} Returns the length of the validators array.
     */
    get length(): number;
    /**
     * @param {...(ValidatorFn<T>|ValidatorData<T>)}   validators -
     */
    add(...validators: (ValidatorFn<T> | ValidatorData<T>)[]): void;
    clear(): void;
    /**
     * @param {...(ValidatorFn<T>|ValidatorData<T>)}   validators -
     */
    remove(...validators: (ValidatorFn<T> | ValidatorData<T>)[]): void;
    /**
     * Remove validators by the provided callback. The callback takes 3 parameters: `id`, `validator`, and `weight`.
     * Any truthy value returned will remove that validator.
     *
     * @param {function(*, ValidatorFn<T>, number): boolean} callback - Callback function to evaluate each validator
     *                                                                  entry.
     */
    removeBy(callback: (arg0: any, arg1: ValidatorFn<T>, arg2: number) => boolean): void;
    removeById(...ids: any[]): void;
    /**
     * Provides an iterator for validators.
     *
     * @returns {Generator<ValidatorData|undefined>} Generator / iterator of validators.
     * @yields {ValidatorData<T>}
     */
    [Symbol.iterator](): Generator<ValidatorData | undefined>;
    #private;
}
/**
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
declare function browserWindow({ position, el, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width, height }: any): any;
/**
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
declare function transformWindow({ position, el, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width, height, transforms }: any): any;

export { DynArrayReducer, GSStore, GameSetting, GameSettingOptions, GameState, LSStore, LocalStorage, Position, SSStore, SessionStorage, TJSDocument, TJSDocumentCollection, TJSDocumentCollectionOptions, TJSDocumentOptions, TJSGameSettings, ValidatorData, ValidatorFn, gameState, isStore, propertyStore, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
