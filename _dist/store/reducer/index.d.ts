import * as _svelte_store from 'svelte/store';

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
declare class DynMapReducer<K, T> {
    #private;
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Map<K, T> | DynMapData<K, T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: When a map is set as data then that map is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): Map<K, T> | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<Map<K, T>, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<K, T>;
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed(): boolean;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;
    /**
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data: Map<K, T> | null, replace?: boolean): void;
    /**
     * Add a subscriber to this DynMapReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynMapReducer<K, T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynMapReducer.
     *
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
declare class DynMapReducerDerived<K, T> implements IDynDerivedReducer<Map<K, T>, K, T> {
    #private;
    /**
     * @param map - Data host Map.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(map: DynDataHost<Map<K, T>>, parentIndex: IndexerAPI<K, T>, options: DynDataOptions<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: The returned map is the same map set by the main reducer. If any changes are performed to the data
     * externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): Map<K, T> | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<Map<K, T>, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index(): IndexerAPI<K, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;
    /**
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Provides an iterator for data stored in DerivedMapReducer.
     *
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Subscribe to this DerivedMapReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynMapReducerDerived<K, T>) => void): () => void;
}

/**
 * Defines the shape of dynamic array constructor functions.
 */
interface IDynArrayReducerCtor<T> {
    new (data?: Iterable<T> | DynArrayData<T>): DynArrayReducer<T>;
}
/**
 * Defines the shape of dynamic map constructor functions.
 */
interface IDynMapReducerCtor<K, T> {
    new (data?: Map<K, T> | DynMapData<K, T>): DynMapReducer<K, T>;
}
/**
 * Defines the shape of derived reducers constructor functions.
 */
interface IDynDerivedReducerCtor<T> {
    new (hostData: DynDataHost<any>, parentIndex: IndexerAPI<any, T>, options: DynDataOptions<T>): IDynDerivedReducer<any, any, T>;
}
/**
 * Defines the interface for all derived reducers.
 */
interface IDynDerivedReducer<D, K, T> {
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns The internal data.
     */
    get data(): D | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<D, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<K, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): any;
    /**
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: IDynDerivedReducer<D, K, T>) => void): () => void;
}

/**
 * Defines the additional options for filters and sort function.
 */
type DynDataOptions<T> = {
    /**
     * Iterable list of filters.
     */
    filters?: Iterable<DynFilterFn<T> | DynDataFilter<T>>;
    /**
     * Compare function.
     */
    sort?: DynCompareFn<T> | DynDataSort<T>;
};
/**
 * The main options object for DynArrayReducer.
 */
type DynArrayData<T> = {
    /**
     * Initial data iterable list.
     */
    data?: Iterable<T>;
} & DynDataOptions<T>;
/**
 * The main options object for DynMapReducer.
 */
type DynMapData<K, T> = {
    /**
     * Optional initial backing Map.
     */
    data?: Map<K, T>;
} & DynDataOptions<T>;
/**
 * Defines the data object to configure a filter w/ additional configuration options.
 */
type DynDataFilter<T> = {
    /**
     * An optional ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * Filter function that takes a value argument and returns a truthy value to keep it.
     */
    filter: DynFilterFn<T>;
    /**
     * An optional number between 0 and 1 inclusive to position this filter against others.
     */
    weight?: number;
    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * Provides a compound type for the backing data structure stored in reducers.
 */
type DynDataHost<D> = (D | null)[];
/**
 * Defines the data object storing index data in AdapterIndexer.
 */
type DynDataIndexer<K, T> = {
    /**
     * - The index array.
     */
    index: K[] | null;
    /**
     * - Hashcode for current index content.
     */
    hash: number | null;
    /**
     * - Is iteration reversed?
     */
    reversed: boolean;
    /**
     * - Any associated parent index data.
     */
    parent?: IndexerAPI<K, T>;
};
/**
 * Defines an object to configure sort functionality.
 */
type DynDataSort<T> = {
    /**
     * - A callback function that compares two values.
     */
    compare: DynCompareFn<T>;
    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * A callback function that compares two values. Return > 0 to sort 'b' before 'a'; < 0 to sort 'a' before 'b'; or 0 to
 * keep original order of 'a' & 'b'.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
type DynCompareFn<T> = {
    /**
     * @param a - Element 'a' of backing data to sort.
     *
     * @param b - Element 'b' of backing data to sort.
     */
    (a: T, b: T): number;
    /**
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
type DynFilterFn<T> = {
    /**
     * @param element - Element of backing data structure to filter.
     *
     * @returns Does the element pass the filter test.
     */
    (element: T): boolean;
    /**
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * Defines object / options for creating a derived reducer.
 */
type DynDataDerivedCreate<T> = {
    /**
     * - Name of derived reducer.
     */
    name?: string;
    /**
     * - A DerivedReducer constructor function / class.
     */
    ctor?: IDynDerivedReducerCtor<T>;
} & DynDataOptions<T>;
/**
 * Creates a compound type for all derived reducer 'create' option combinations.
 */
type DynOptionsDerivedCreate<T> = string | IDynDerivedReducerCtor<T> | DynDataDerivedCreate<T>;
/**
 * Defines object / options for creating a dynamic array reducer.
 */
type DynDataArrayCreate<T> = {
    /**
     * - Name of dynamic array reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynArrayReducerCtor<T>;
} & DynDataOptions<T>;
type DynOptionsArrayCreate<T> = string | IDynArrayReducerCtor<T> | DynDataArrayCreate<T>;
/**
 * Defines object / options for creating a dynamic map reducer.
 */
type DynDataMapCreate<K, T> = {
    /**
     * - Name of dynamic map reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynMapReducerCtor<K, T>;
} & DynDataOptions<T>;
type DynOptionsMapCreate<K, T> = string | IDynMapReducerCtor<K, T> | DynDataMapCreate<K, T>;

/**
 * Provides construction and management of indexed data when there are parent indexes or filter / sort functions
 * applied.
 */
declare abstract class AdapterIndexer<D, K, T> {
    derivedAdapter: AdapterDerived<D, K, T>;
    filtersData: {
        filters: DynDataFilter<T>[];
    };
    hostData: DynDataHost<D>;
    hostUpdate: Function;
    indexData: DynDataIndexer<K, T>;
    sortData: {
        compareFn: DynCompareFn<T>;
    };
    sortFn: (a: K, b: K) => number;
    destroyed: boolean;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param hostUpdate - Host update function invoked on index updates.
     *
     * @param [parentIndexer] - Any associated parent index API.
     *
     * @returns Indexer adapter instance.
     */
    constructor(hostData: DynDataHost<D>, hostUpdate: Function, parentIndexer?: IndexerAPI<K, T>);
    /**
     * @returns Returns whether the index is active.
     */
    get active(): boolean;
    /**
     * @returns Returns length of reduced index.
     */
    get length(): number;
    /**
     * @returns Returns reversed state.
     */
    get reversed(): boolean;
    /**
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
     * is set to null. Set calculated new hash value to the index adapter hash value.
     *
     * After hash generation compare old and new hash values and perform an update if they are different. If they are
     * equal check for array equality between the old and new index array and perform an update if they are not equal.
     *
     * @param oldIndex - Old index array.
     *
     * @param oldHash - Old index hash value.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    calcHashUpdate(oldIndex: K[], oldHash: number | null, force?: boolean): void;
    /**
     * @returns Sort function adapting host data.
     */
    abstract createSortFn(): (a: K, b: K) => number;
    /**
     * Destroys all resources.
     */
    destroy(): void;
    /**
     * Store associated filter and sort data that are constructed after the indexer.
     *
     * @param filtersData - Associated AdapterFilters instance.
     *
     * @param sortData - Associated AdapterSort instance.
     *
     * @param derivedAdapter - Associated AdapterDerived instance.
     */
    initAdapters(filtersData: {
        filters: DynDataFilter<T>[];
    }, sortData: {
        compareFn: DynCompareFn<T>;
    }, derivedAdapter: AdapterDerived<D, K, T>): void;
    /**
     * Handles updating the index in child implementation specific to the backing data structure.
     *
     * @param [force] - Force an update to any subscribers.
     */
    abstract update(force: boolean): void;
}

/**
 * Provides the public API for accessing the index API.
 *
 * This class forms the public API which is accessible from the `.index` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.index.active;
 * dynArray.index.hash;
 * dynArray.index.length;
 * dynArray.index.update(...);
 * ```
 */
declare class IndexerAPI<K, T> {
    #private;
    /**
     * Provides a getter to determine if the index is active.
     */
    readonly active: boolean;
    /**
     * Provides length of reduced / indexed elements.
     */
    readonly length: number;
    /**
     * Manually invoke an update of the index.
     *
     * @param force - Force update to any subscribers.
     */
    readonly update: (force?: boolean) => void;
    constructor(adapterIndexer: AdapterIndexer<any, K, T>);
    /**
     * - Current hash value of the index.
     */
    get hash(): number | null;
    /**
     * Provides an iterator over the index array.
     *
     * @yields {K}
     */
    [Symbol.iterator](): IterableIterator<K>;
}

/**
 * Provides the `derived` API for all dynamic reducers.
 */
declare class AdapterDerived<D, K, T> {
    #private;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param parentIndex - Any associated parent index API.
     *
     * @param DerivedReducerCtor - The default derived reducer constructor function.
     */
    constructor(hostData: DynDataHost<D>, parentIndex: IndexerAPI<K, T>, DerivedReducerCtor: IDynDerivedReducerCtor<T>);
    /**
     * Creates a new derived reducer.
     *
     * @param options - Options defining the new derived reducer.
     *
     * @returns Newly created derived reducer.
     */
    create(options: DynOptionsDerivedCreate<T>): IDynDerivedReducer<D, K, T>;
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear(): void;
    /**
     * Deletes and destroys a derived reducer by name.
     *
     * @param name - Name of the derived reducer.
     */
    delete(name: string): boolean;
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get(name: string): IDynDerivedReducer<D, K, T>;
    /**
     * Updates all managed derived reducer indexes.
     *
     * @param [force] - Force an update to subscribers.
     */
    update(force?: boolean): void;
}

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DynDataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
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
 * This class forms the public API which is accessible from the `.filters` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 */
declare class AdapterFilters<T> {
    #private;
    /**
     * @param indexUpdate - update function for the indexer.
     *
     * @param filtersAdapter - Stores the filter function data.
     */
    constructor(indexUpdate: any, filtersAdapter: {
        filters: DynDataFilter<T>[];
    });
    /**
     * @returns Returns the length of the filter data.
     */
    get length(): number;
    /**
     * Provides an iterator for filters.
     *
     * @yields {DataFilter<T>}
     */
    [Symbol.iterator](): IterableIterator<DynDataFilter<T>> | void;
    /**
     * @param filters -
     */
    add(...filters: (DynFilterFn<T> | DynDataFilter<T>)[]): void;
    /**
     * Clears and removes all filters.
     */
    clear(): void;
    /**
     * @param filters -
     */
    remove(...filters: (DynFilterFn<T> | DynDataFilter<T>)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (id: any, filter: DynFilterFn<T>, weight: number) => boolean): void;
    /**
     * @param ids - Removes filters by ID.
     */
    removeById(...ids: any[]): void;
}

/**
 * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function or a
 * {@link DynDataSort} object containing an `compare`, and `subscribe` attributes; `compare` is the only required
 * attribute.
 *
 * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
 * If a subscribe function is provided the sort function can notify any updates that may change sort order and this
 * triggers an index update.
 *
 * This class forms the public API which is accessible from the `.sort` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.sort.clear();
 * dynArray.sort.set(...);
 * ```
 */
declare class AdapterSort<T> {
    #private;
    /**
     * @param indexUpdate - Function to update indexer.
     *
     * @param sortData - Storage for compare function.
     */
    constructor(indexUpdate: Function, sortData: {
        compareFn: DynCompareFn<T>;
    });
    /**
     * Clears & removes any assigned sort function and triggers an index update.
     */
    clear(): void;
    /**
     * @param data - A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data: DynCompareFn<T> | DynDataSort<T>): void;
}

/**
 * Provides the public API for derived reducers. There are several ways to create a derived reducer from utilizing the
 * default implementation or passing in a constructor function / class for a custom derived reducer.
 *
 * This class forms the public API which is accessible from the `.derived` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.derived.clear();
 * dynArray.derived.create(...);
 * dynArray.derived.delete(...);
 * dynArray.derived.destroy();
 * dynArray.derived.get(...);
 * ```
 */
declare class DerivedAPI<D, K, T> {
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear: () => void;
    /**
     * @param options - Options for creating a reducer.
     *
     * @returns Newly created derived reducer.
     */
    create: (options: DynOptionsDerivedCreate<T>) => IDynDerivedReducer<D, K, T>;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete: (name: string) => boolean;
    /**
     * Removes all derived reducers, associated subscriptions, and cleans up all resources.
     */
    destroy: () => void;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get: (name: string) => IDynDerivedReducer<D, K, T>;
    constructor(adapterDerived: AdapterDerived<D, K, T>);
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
declare class DynArrayReducer<T> {
    #private;
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DynArrayData<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): T[] | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<T[], number, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<number, T>;
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed(): boolean;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;
    /**
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data: T[] | Iterable<T> | null, replace?: boolean): void;
    /**
     * Add a subscriber to this DynArrayReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducer<T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
declare class DynArrayReducerDerived<T> implements IDynDerivedReducer<T[], number, T> {
    #private;
    /**
     * @param array - Data host array.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(array: DynDataHost<T[]>, parentIndex: IndexerAPI<number, T>, options: DynDataOptions<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and
     * notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): T[] | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<T[], number, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index(): IndexerAPI<number, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;
    /**
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Provides an iterator for data stored in DerivedArrayReducer.
     *
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Subscribe to this DerivedArrayReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducerDerived<T>) => void): () => void;
}

/**
 * Provides a base implementation for store entries in {@link ArrayObjectStore}.
 *
 * In particular providing the required getting / accessor for the 'id' property.
 */
declare class ObjectEntryStore {
    /**
     * Invoked by ArrayObjectStore to provide custom duplication. Override this static method in your entry store.
     *
     * @param {object}   data - A copy of local data w/ new ID already set.
     *
     * @param {import('./ArrayObjectStore.js').ArrayObjectStore} arrayStore - The source ArrayObjectStore instance.
     */
    static duplicate(data: object, arrayStore: ArrayObjectStore): void;
    /**
     * @param {object}   data -
     */
    constructor(data?: object);
    /**
     * @returns {object} The object data tracked by this store.
     * @protected
     */
    protected get _data(): any;
    /**
     * @returns {string} The ID attribute in object data tracked by this store.
     */
    get id(): string;
    toJSON(): any;
    /**
     * @param {function(object): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: object) => void): (() => void);
    /**
     * @protected
     */
    protected _updateSubscribers(): void;
    #private;
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 */
declare class ArrayObjectStore<T = BaseArrayObjectEntryStore> {
    /**
     * @returns {ObjectEntryStore} The default object entry store constructor.
     */
    static get EntryStore(): ObjectEntryStore;
    /**
     * @param {import('./index.js').ArrayObjectStoreParams} params -
     */
    constructor({ StoreClass, defaultData, childDebounce, dataReducer, manualUpdate }?: ArrayObjectStoreParams);
    /**
     * @returns {T[]} The internal data array tracked allowing child classes direct access.
     * @protected
     */
    protected get _data(): T[];
    /**
     * @returns {DynArrayReducer<T>} The data reducer.
     */
    get dataReducer(): DynArrayReducer<T>;
    /**
     * @returns {number} The length of all data.
     */
    get length(): number;
    /**
     * Removes all child store entries.
     */
    clearEntries(): void;
    /**
     * Creates a new store from given data.
     *
     * @param {object}   entryData -
     *
     * @returns {T} The store
     */
    createEntry(entryData?: object): T;
    /**
     * Deletes a given entry store by ID from this world setting array store instance.
     *
     * @param {string}  id - ID of entry to delete.
     *
     * @returns {boolean} Delete operation successful.
     */
    deleteEntry(id: string): boolean;
    /**
     * Duplicates an entry store by the given ID.
     *
     * @param {string}   id - UUIDv4 string.
     *
     * @returns {*} Instance of StoreClass.
     */
    duplicateEntry(id: string): any;
    /**
     * Find an entry in the backing child store array.
     *
     * @param {function(T): T|void}  predicate - A predicate function
     *
     * @returns {T|void} Found entry in array or undefined.
     */
    findEntry(predicate: (arg0: T) => T | void): T | void;
    /**
     * Finds an entry store instance by 'id' / UUIDv4.
     *
     * @param {string}   id - A UUIDv4 string.
     *
     * @returns {T|void} Entry store instance.
     */
    getEntry(id: string): T | void;
    /**
     * Sets the children store data by 'id', adds new entry store instances, or removes entries that are no longer in the
     * update list.
     *
     * @param {T[]}   updateList -
     */
    set(updateList: T[]): void;
    toJSON(): T[];
    /**
     * @param {function(T[]): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: T[]) => void): (() => void);
    /**
     * Updates subscribers.
     *
     * @param {import('./index.js').ArrayObjectUpdateData}  [update] -
     */
    updateSubscribers(update?: ArrayObjectUpdateData): void;
    /**
     * Provide an iterator for public access to entry stores.
     *
     * @yields {T | void}
     */
    [Symbol.iterator](): Generator<T, void, unknown>;
    #private;
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 * @augments {ArrayObjectStore<T>}
 */
declare class CrudArrayObjectStore<T = BaseArrayObjectEntryStore> extends ArrayObjectStore<T> {
    /**
     * @param {object}                  [opts] - Optional parameters.
     *
     * @param {CrudDispatch}            [opts.crudDispatch] -
     *
     * @param {object}                  [opts.extraData] -
     *
     * @param {import('./index.js').ArrayObjectStoreParams}  [opts.rest] - Rest of ArrayObjectStore parameters.
     */
    constructor({ crudDispatch, extraData, ...rest }?: {
        crudDispatch?: CrudDispatch;
        extraData?: object;
        rest?: ArrayObjectStoreParams;
    });
    #private;
}
type CrudArrayObjectStoreParams = ArrayObjectStoreParams & CrudArrayObjectStoreParamProps;
type CrudArrayObjectStoreParamProps = {
    /**
     * -
     */
    crudDispatch?: CrudDispatch;
    /**
     * -
     */
    extraData?: object;
};
/**
 *
 * A function that accepts an object w/ 'action', 'moduleId', 'key' properties and optional 'id' / UUIDv4 string and
 * 'data' property.
 */
type CrudDispatch = (data: {
    action: string;
    id?: string;
    data?: object;
}) => boolean;

type ArrayObjectStoreParams = {
    /**
     * - The entry store class that is instantiated.
     */
    StoreClass: BaseArrayObjectEntryStore;
    /**
     * - An array of default data objects.
     */
    defaultData?: object[];
    /**
     * - An integer between and including 0 - 1000; a debounce time in
     * milliseconds for child store subscriptions to invoke
     * {@link ArrayObjectStore.updateSubscribers } notifying subscribers to this array
     * store.
     */
    childDebounce?: number;
    /**
     * - When true a DynArrayReducer will be instantiated wrapping store
     *    data and accessible from {@link ArrayObjectStore.dataReducer }.
     */
    dataReducer?: boolean;
    /**
     * - When true {@link ArrayObjectStore.updateSubscribers } must be
     * invoked with a single boolean parameter for subscribers to be updated.
     */
    manualUpdate?: boolean;
};
type ArrayObjectUpdateData = boolean | object | undefined;
type BaseArrayObjectEntryStore = _svelte_store.Writable<any> & {
    get id(): string;
};

/**
 * Provides helper functions to create dynamic store driven filters and sort functions for dynamic reducers. The
 * returned functions are also Svelte stores and can be added to a reducer as well as used as a store.
 */
declare class DynReducerHelper {
    /**
     * Returns the following filter functions:
     * - regexObjectQuery(property, options); suitable for object reducers matching one or more properties against
     *   the store value as a regex. Optional parameters to set case sensitivity and passing in an existing store.
     *
     * @returns {{
     *    regexObjectQuery: (properties: string|Iterable<string>, options?: {caseSensitive?: boolean, store?: import('svelte/store').Writable<string>}) => (((data: {}) => boolean) & import('svelte/store').Writable<string>)
     * }}
     */
    static get filters(): {
        regexObjectQuery: (properties: string | Iterable<string>, options?: {
            caseSensitive?: boolean;
            store?: _svelte_store.Writable<string>;
        }) => ((data: {}) => boolean) & _svelte_store.Writable<string>;
    };
}

export { ArrayObjectStore, ArrayObjectStoreParams, ArrayObjectUpdateData, BaseArrayObjectEntryStore, CrudArrayObjectStore, CrudArrayObjectStoreParamProps, CrudArrayObjectStoreParams, CrudDispatch, DynArrayData, DynArrayReducer, DynArrayReducerDerived, DynCompareFn, DynDataArrayCreate, DynDataDerivedCreate, DynDataFilter, DynDataMapCreate, DynDataOptions, DynDataSort, DynFilterFn, DynMapData, DynMapReducer, DynMapReducerDerived, DynOptionsArrayCreate, DynOptionsDerivedCreate, DynOptionsMapCreate, DynReducerHelper, IDynArrayReducerCtor, IDynDerivedReducer, IDynDerivedReducerCtor, IDynMapReducerCtor, ObjectEntryStore };
