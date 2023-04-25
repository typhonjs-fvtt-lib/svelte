import * as _svelte_store from 'svelte/store';
import { Writable, Readable } from 'svelte/store';
import * as _typhonjs_fvtt_svelte_util from '@typhonjs-fvtt/svelte/util';

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
    constructor(data?: Map<K, T> | DataDynMap<K, T>);
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
     * @returns Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<T, T, T>;
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
declare class DerivedMapReducer<K, T> implements IDerivedReducer<Map<K, T>, K, T> {
    #private;
    /**
     * @param map - Data host Map.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(map: DataHost<Map<K, T>>, parentIndex: IndexerAPI<K, T>, options: DataOptions<T>);
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
     * @returns Generator / iterator of all data.
     */
    [Symbol.iterator](): Generator<T, T, T>;
    /**
     * Subscribe to this DerivedMapReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DerivedMapReducer<K, T>) => void): () => void;
}

/**
 * Defines the shape of dynamic array constructor functions.
 */
interface IDynArrayReducerCtor<T> {
    new (data?: Iterable<T> | DataDynArray<T>): DynArrayReducer<T>;
}
/**
 * Defines the shape of dynamic map constructor functions.
 */
interface IDynMapReducerCtor<K, T> {
    new (data?: Map<K, T> | DataDynMap<K, T>): DynMapReducer<K, T>;
}
/**
 * Defines the shape of derived reducers constructor functions.
 */
interface IDerivedReducerCtor<T> {
    new (hostData: DataHost<any>, parentIndex: IndexerAPI<any, T>, options: DataOptions<T>): IDerivedReducer<any, any, T>;
}
/**
 * Defines the interface for all derived reducers.
 */
interface IDerivedReducer<D, K, T> {
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
    subscribe(handler: (value: IDerivedReducer<D, K, T>) => void): () => void;
}

/**
 * Defines the additional options for filters and sort function.
 */
declare type DataOptions<T> = {
    /**
     * Iterable list of filters.
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;
    /**
     * Compare function.
     */
    sort?: CompareFn<T> | DataSort<T>;
};
/**
 * The main options object for DynArrayReducer.
 */
declare type DataDynArray<T> = {
    /**
     * Initial data iterable list.
     */
    data?: Iterable<T>;
} & DataOptions<T>;
/**
 * The main options object for DynMapReducer.
 */
declare type DataDynMap<K, T> = {
    /**
     * Optional initial backing Map.
     */
    data?: Map<K, T>;
} & DataOptions<T>;
/**
 * Defines the data object to configure a filter w/ additional configuration options.
 */
declare type DataFilter<T> = {
    /**
     * An optional ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * Filter function that takes a value argument and returns a truthy value to keep it.
     */
    filter: FilterFn<T>;
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
declare type DataHost<D> = (D | null)[];
/**
 * Defines the data object storing index data in AdapterIndexer.
 */
declare type DataIndexer<K, T> = {
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
declare type DataSort<T> = {
    /**
     * - A callback function that compares two values.
     */
    compare: CompareFn<T>;
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
declare type CompareFn<T> = {
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
declare type FilterFn<T> = {
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
declare type DataDerivedCreate<T> = {
    /**
     * - Name of derived reducer.
     */
    name?: string;
    /**
     * - A DerivedReducer constructor function / class.
     */
    ctor?: IDerivedReducerCtor<T>;
} & DataOptions<T>;
/**
 * Creates a compound type for all derived reducer 'create' option combinations.
 */
declare type OptionsDerivedCreate<T> = string | IDerivedReducerCtor<T> | DataDerivedCreate<T>;
/**
 * Defines object / options for creating a dynamic array reducer.
 */
declare type DataDynArrayCreate<T> = {
    /**
     * - Name of dynamic array reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynArrayReducerCtor<T>;
} & DataOptions<T>;
declare type OptionsDynArrayCreate<T> = string | IDynArrayReducerCtor<T> | DataDynArrayCreate<T>;
/**
 * Defines object / options for creating a dynamic map reducer.
 */
declare type DataDynMapCreate<K, T> = {
    /**
     * - Name of dynamic map reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynMapReducerCtor<K, T>;
} & DataOptions<T>;
declare type OptionsDynMapCreate<K, T> = string | IDynMapReducerCtor<K, T> | DataDynMapCreate<K, T>;

/**
 * Provides construction and management of indexed data when there are parent indexes or filter / sort functions
 * applied.
 */
declare abstract class AdapterIndexer<D, K, T> {
    derivedAdapter: AdapterDerived<D, K, T>;
    filtersData: {
        filters: DataFilter<T>[];
    };
    hostData: DataHost<D>;
    hostUpdate: Function;
    indexData: DataIndexer<K, T>;
    sortData: {
        compareFn: CompareFn<T>;
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
    constructor(hostData: DataHost<D>, hostUpdate: Function, parentIndexer?: IndexerAPI<K, T>);
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
        filters: DataFilter<T>[];
    }, sortData: {
        compareFn: CompareFn<T>;
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
     * @returns Iterator / generator
     * @yields {K}
     */
    [Symbol.iterator](): Generator<K, K, K>;
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
    constructor(hostData: DataHost<D>, parentIndex: IndexerAPI<K, T>, DerivedReducerCtor: IDerivedReducerCtor<T>);
    /**
     * Creates a new derived reducer.
     *
     * @param options - Options defining the new derived reducer.
     *
     * @returns Newly created derived reducer.
     */
    create(options: OptionsDerivedCreate<T>): IDerivedReducer<D, K, T>;
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
    get(name: string): IDerivedReducer<D, K, T>;
    /**
     * Updates all managed derived reducer indexes.
     *
     * @param [force] - Force an update to subscribers.
     */
    update(force?: boolean): void;
}

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
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
        filters: DataFilter<T>[];
    });
    /**
     * @returns Returns the length of the filter data.
     */
    get length(): number;
    /**
     * Provides an iterator for filters.
     *
     * @returns Generator / iterator of filters.
     * @yields {DataFilter<T>}
     */
    [Symbol.iterator](): Generator<DataFilter<T>, DataFilter<T>, DataFilter<T>> | void;
    /**
     * @param filters -
     */
    add(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Clears and removes all filters.
     */
    clear(): void;
    /**
     * @param filters -
     */
    remove(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (id: any, filter: FilterFn<T>, weight: number) => boolean): void;
    /**
     * @param ids - Removes filters by ID.
     */
    removeById(...ids: any[]): void;
}

/**
 * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function or a
 * {@link DataSort} object containing an `compare`, and `subscribe` attributes; `compare` is the only required
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
        compareFn: CompareFn<T>;
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
    set(data: CompareFn<T> | DataSort<T>): void;
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
    create: (options: OptionsDerivedCreate<T>) => IDerivedReducer<D, K, T>;
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
    get: (name: string) => IDerivedReducer<D, K, T>;
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
    constructor(data?: Iterable<T> | DataDynArray<T>);
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
     * @returns Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<T, T, T>;
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
declare class DerivedArrayReducer<T> implements IDerivedReducer<T[], number, T> {
    #private;
    /**
     * @param array - Data host array.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(array: DataHost<T[]>, parentIndex: IndexerAPI<number, T>, options: DataOptions<T>);
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
     * @returns Generator / iterator of all data.
     */
    [Symbol.iterator](): Generator<T, T, T>;
    /**
     * Subscribe to this DerivedArrayReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DerivedArrayReducer<T>) => void): () => void;
}

/**
 * Provides a readable store to track keys actively pressed. KeyStore is designed to be used with the {@link keyforward}
 * action.
 */
declare class KeyStore {
    /**
     * @param {Iterable<string>}  [keyNames] -
     *
     * @param {KeyStoreOptions}   [options] - Optional parameters
     */
    constructor(keyNames?: Iterable<string>, options?: KeyStoreOptions);
    /**
     * Add given key to the tracking key set.
     *
     * @param {string}   key - Key to add.
     */
    addKey(key: string): void;
    /**
     * @returns {boolean} True if any keys in the key set are pressed.
     */
    /**
     * Returns true if any of given keys are pressed. If `keys` is undefined then the result is true if any keys being
     * tracked are pressed.
     *
     * @param {string|Iterable<string>|undefined} keys - Zero or more key strings or list to verify if any pressed.
     *
     * @returns {boolean} True if any keys set are pressed.
     */
    anyPressed(keys: string | Iterable<string> | undefined): boolean;
    /**
     * Is the given key in the tracking key set.
     *
     * @param {string}   key - Key to check.
     */
    hasKey(key: string): void;
    /**
     * Returns true if all given keys are pressed.
     *
     * @param {string|Iterable<string>} keys - One or more key strings to verify if pressed.
     *
     * @returns {boolean} Are all keys pressed.
     */
    isPressed(keys: string | Iterable<string>): boolean;
    /**
     * Handle keydown event adding any key from the tracked key set.
     *
     * @param {KeyboardEvent}  event - KeyboardEvent.
     */
    keydown(event: KeyboardEvent): void;
    /**
     * @returns {IterableIterator<string>} Returns current pressed keys iterator.
     */
    keysPressed(): IterableIterator<string>;
    /**
     * @returns {IterableIterator<string>} Returns currently tracked keys iterator.
     */
    keysTracked(): IterableIterator<string>;
    /**
     * Handle keyup event removing any key from the tracked key set.
     *
     * @param {KeyboardEvent}  event - KeyboardEvent.
     */
    keyup(event: KeyboardEvent): void;
    /**
     * Remove the given key from the tracking key set.
     *
     * @param {string}   key - Key to remove.
     */
    removeKey(key: string): void;
    /**
     * Update options.
     *
     * @param {KeyStoreOptions}   options - Options to set.
     */
    setOptions(options: KeyStoreOptions): void;
    /**
     * @param {string}   key - key or key code to lookup.
     *
     * @returns {number} 1 if currently pressed and 0 if not pressed.
     */
    value(key: string): number;
    /**
     * @param {function(KeyStore): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: KeyStore) => void): (() => void);
    /**
     * Updates subscribers.
     *
     * @protected
     */
    protected _updateSubscribers(): void;
    #private;
}
type KeyStoreOptions = {
    /**
     * - Invoke `preventDefault` on key events.
     */
    preventDefault?: boolean;
    /**
     * - When true use `event.code` otherwise use `event.key` to get active key.
     */
    useCode?: boolean;
    /**
     * - Invoke `stopPropagation` on key events.
     */
    stopPropagation?: boolean;
};

declare class TJSLocalStorage {
    /**
     * Creates a new writable store for the given key.
     *
     * @param {string}   key - Key to lookup in stores map.
     *
     * @param {boolean}  [defaultValue] - A default value to set for the store.
     *
     * @returns {import('#svelte/store').Writable} The new store.
     */
    static "__#122534@#createStore"(key: string, defaultValue?: boolean): _svelte_store.Writable<any>;
    /**
     * Get value from the localStorage.
     *
     * @param {string}   key - Key to lookup in localStorage.
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
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {import('#svelte/store').Writable} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): _svelte_store.Writable<any>;
    /**
     * Sets the value for the given key in localStorage.
     *
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in localStorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
    #private;
}

declare class TJSSessionStorage {
    /**
     * Creates a new store for the given key.
     *
     * @param {string}   key - Key to lookup in stores map.
     *
     * @param {boolean}  [defaultValue] - A default value to set for the store.
     *
     * @returns {import('#svelte/store').Writable} The new store.
     */
    static "__#122535@#createStore"(key: string, defaultValue?: boolean): _svelte_store.Writable<any>;
    /**
     * Get value from the sessionStorage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
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
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {*}        [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {import('#svelte/store').Writable} The Svelte store for this key.
     */
    getStore(key: string, defaultValue?: any): _svelte_store.Writable<any>;
    /**
     * Sets the value for the given key in sessionStorage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {*}        value - A value to set for this key.
     */
    setItem(key: string, value: any): void;
    /**
     * Convenience method to swap a boolean value stored in session storage.
     *
     * @param {string}   key - Key to lookup in sessionStorage.
     *
     * @param {boolean}  [defaultValue] - A default value to return if key not present in session storage.
     *
     * @returns {boolean} The boolean swap for the given key.
     */
    swapItemBoolean(key: string, defaultValue?: boolean): boolean;
    #private;
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a readable store by having a `subscribe`
 * function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
declare function isReadableStore(store: any): boolean;
/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * function and an `update` function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
declare function isUpdatableStore(store: any): boolean;
/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * `set`, and `update` functions.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ `subscribe` & `set` functions.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
declare function isWritableStore(store: any): boolean;
/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
declare function subscribeIgnoreFirst(store: _svelte_store.Readable<any> | _svelte_store.Writable<any>, update: any): _svelte_store.Unsubscriber;
/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('#svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
declare function subscribeFirstRest(store: _svelte_store.Readable<any> | _svelte_store.Writable<any>, first: any, update: any): _svelte_store.Unsubscriber;

/** The minimal requirements of the
 * [writable store contract](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract).
 */
type MinimalWritable<T> = Pick<Writable<T>, "set" | "subscribe">;

/** Stores that may be used as origins. */
type Stores = MinimalWritable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

/** Values retrieved from origin stores. */
type StoresValues<T> = T extends Readable<infer U> ? U :
    { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

/** Values sent to origin stores. */
type SetValues<T> = T extends MinimalWritable<infer U> ? U :
    { [K in keyof T]?: T[K] extends MinimalWritable<infer U> ? U : never };

/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#run-time-svelte-store-writable), but which
 * has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 *
 * @param origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 1st parameter.
 * @param derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 2nd parameter.
 * @param reflect Called when the
 * derived store gets a new value via its `set` or `update` methods, and determines new values for
 * the origin stores. [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 3rd parameter.
 *
 * @returns A writable store.
 */
declare function writableDerived<S extends Stores, T>(
    origins: S,
    derive: (values: StoresValues<S>) => T,
    reflect: (reflecting: T, old: StoresValues<S>) => SetValues<S>,
    initial?: T
): Writable<T>;

declare function writableDerived<S extends Stores, T>(
    origins: S,
    derive: (values: StoresValues<S>, set: (value: T) => void) => void,
    reflect: (reflecting: T, old: StoresValues<S>) => SetValues<S>,
    initial?: T
): Writable<T>;


/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 *
 * @param origin The store containing the object to get/set from.
 * @param propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns A writable store.
 */
declare function propertyStore<O extends object, K extends keyof O>(
    origin: MinimalWritable<O>,
    propName: K | [K]
): Writable<O[K]>;

declare function propertyStore<O extends object, K1 extends keyof O, K2 extends keyof O[K1]>(
    origin: MinimalWritable<O>,
    propName: [K1, K2]
): Writable<O[K1][K2]>;

declare function propertyStore<
    O extends object,
    K1 extends keyof O,
    K2 extends keyof O[K1],
    K3 extends keyof O[K1][K2]
>(
    origin: MinimalWritable<O>,
    propName: [K1, K2, K3]
): Writable<O[K1][K2][K3]>;

declare function propertyStore<
    O extends object,
    K1 extends keyof O,
    K2 extends keyof O[K1],
    K3 extends keyof O[K1][K2],
    K4 extends keyof O[K1][K2][K3]
>(
    origin: MinimalWritable<O>,
    propName: [K1, K2, K3, K4]
): Writable<O[K1][K2][K3][K4]>;

declare function propertyStore(
    origin: MinimalWritable<object>,
    propName: string | number | symbol | Array<string | number | symbol>
): Writable<any>;

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
    get embedded(): EmbeddedAPI;
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
type EmbeddedAPI = {
    /**
     * - Creates an embedded collection store.
     */
    create: (embeddedName: string, options: any) => any;
    /**
     * - Destroys one or more embedded collection stores.
     */
    destroy: (embeddedName?: string, storeName?: string) => boolean;
    /**
     * - Returns a specific existing embedded collection store.
     */
    get: (embeddedName: string, storeName: string) => any;
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

/**
 * - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 */
type GameState = _svelte_store.Readable<any>;
/**
 * @type {GameState} Provides a Svelte store wrapping the Foundry runtime / global game state.
 */
declare const gameState: _svelte_store.Readable<any>;

export { CompareFn, DataDerivedCreate, DataDynArray, DataDynArrayCreate, DataDynMap, DataDynMapCreate, DataFilter, DataOptions, DataSort, DerivedArrayReducer, DerivedMapReducer, DynArrayReducer, DynMapReducer, EmbeddedAPI, FilterFn, GameState, IDerivedReducer, IDerivedReducerCtor, IDynArrayReducerCtor, IDynMapReducerCtor, KeyStore, KeyStoreOptions, OptionsDerivedCreate, OptionsDynArrayCreate, OptionsDynMapCreate, TJSDocument, TJSDocumentCollection, TJSDocumentCollectionOptions, TJSDocumentOptions, TJSLocalStorage, TJSSessionStorage, gameState, isReadableStore, isUpdatableStore, isWritableStore, propertyStore, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
