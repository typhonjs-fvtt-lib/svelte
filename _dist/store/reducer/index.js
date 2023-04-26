import { isObject, uuidv4, debounce, klona, normalizeString, isIterable } from '@typhonjs-fvtt/svelte/util';
import { writable, get } from 'svelte/store';

class DynReducerUtils {
    /**
     * Checks for array equality between two arrays of numbers.
     *
     * @param a - Array A
     *
     * @param b - Array B
     *
     * @returns Arrays are equal.
     */
    static arrayEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        /* c8 ignore next */
        if (a.length !== b.length) {
            return false;
        }
        for (let cntr = a.length; --cntr >= 0;) {
            /* c8 ignore next */
            if (a[cntr] !== b[cntr]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Provides a solid string hashing algorithm.
     *
     * Sourced from: https://stackoverflow.com/a/52171480
     *
     * @param str - String to hash.
     *
     * @param seed - A seed value altering the hash.
     *
     * @returns Hash code.
     */
    static hashString(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let ch, i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }
    /**
     * Converts an unknown value for hashing purposes in {@link AdapterIndexer.calcHashUpdate}.
     *
     * Currently objects / Map w/ object keys is not supported. Potentially can include `object-hash` to handle this
     * case, but it is not common to use objects as keys in Maps.
     *
     * @param value - An unknown value to convert to a number.
     */
    static hashUnknown(value) {
        if (value === null || value === void 0) {
            return 0;
        }
        let result = 0;
        switch (typeof value) {
            case 'boolean':
                result = value ? 1 : 0;
                break;
            case 'bigint':
                result = Number(BigInt.asIntN(64, value));
                break;
            case 'function':
                result = this.hashString(value.name);
                break;
            case 'number':
                result = Number.isFinite(value) ? value : 0;
                break;
            case 'object':
                // TODO: consider hashing an object IE `object-hash` and convert to number.
                break;
            case 'string':
                result = this.hashString(value);
                break;
            case 'symbol':
                result = this.hashString(Symbol.keyFor(value));
                break;
        }
        return result;
    }
    /**
     * @param target -
     *
     * @param Prototype -
     *
     * @returns target constructor function has Prototype.
     */
    static hasPrototype(target, Prototype) {
        /* c8 ignore next */
        if (typeof target !== 'function') {
            return false;
        }
        if (target === Prototype) {
            return true;
        }
        // Walk parent prototype chain. Check for descriptor at each prototype level.
        for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto)) {
            if (proto === Prototype) {
                return true;
            }
        }
        return false;
    }
    /**
     * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
     *
     * @param data - Data to verify as iterable.
     *
     * @returns Is data iterable.
     */
    static isIterable(data) {
        return data !== null && data !== void 0 && typeof data === 'object' &&
            typeof data[Symbol.iterator] === 'function';
    }
}

/**
 * Provides the `derived` API for all dynamic reducers.
 */
class AdapterDerived {
    #hostData;
    #DerivedReducerCtor;
    #parentIndex;
    #derived = new Map();
    #destroyed = false;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param parentIndex - Any associated parent index API.
     *
     * @param DerivedReducerCtor - The default derived reducer constructor function.
     */
    constructor(hostData, parentIndex, DerivedReducerCtor) {
        this.#hostData = hostData;
        this.#parentIndex = parentIndex;
        this.#DerivedReducerCtor = DerivedReducerCtor;
        Object.freeze(this);
    }
    /**
     * Creates a new derived reducer.
     *
     * @param options - Options defining the new derived reducer.
     *
     * @returns Newly created derived reducer.
     */
    create(options) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.create error: this instance has been destroyed.`);
        }
        let name;
        let rest = {};
        let ctor;
        const DerivedReducerCtor = this.#DerivedReducerCtor;
        if (typeof options === 'string') {
            name = options;
            ctor = DerivedReducerCtor;
        }
        else if (typeof options === 'function' && DynReducerUtils.hasPrototype(options, DerivedReducerCtor)) {
            ctor = options;
        }
        else if (typeof options === 'object' && options !== null) {
            ({ name, ctor = DerivedReducerCtor, ...rest } = options);
        }
        else {
            throw new TypeError(`AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
        }
        if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor)) {
            throw new TypeError(`AdapterDerived.create error: 'ctor' is not a '${DerivedReducerCtor?.name}'.`);
        }
        name = name ?? ctor?.name;
        if (typeof name !== 'string') {
            throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`);
        }
        const derivedReducer = new ctor(this.#hostData, this.#parentIndex, rest);
        this.#derived.set(name, derivedReducer);
        return derivedReducer;
    }
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear() {
        if (this.#destroyed) {
            return;
        }
        for (const reducer of this.#derived.values()) {
            reducer.destroy();
        }
        this.#derived.clear();
    }
    /**
     * Deletes and destroys a derived reducer by name.
     *
     * @param name - Name of the derived reducer.
     */
    delete(name) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.delete error: this instance has been destroyed.`);
        }
        const reducer = this.#derived.get(name);
        if (reducer) {
            reducer.destroy();
        }
        return this.#derived.delete(name);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.clear();
        this.#hostData = [null];
        this.#parentIndex = null;
        this.#destroyed = true;
    }
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get(name) {
        if (this.#destroyed) {
            throw Error(`AdapterDerived.get error: this instance has been destroyed.`);
        }
        return this.#derived.get(name);
    }
    /**
     * Updates all managed derived reducer indexes.
     *
     * @param [force] - Force an update to subscribers.
     */
    update(force = false) {
        if (this.#destroyed) {
            return;
        }
        for (const reducer of this.#derived.values()) {
            reducer.index.update(force);
        }
    }
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
class AdapterFilters {
    #filtersData;
    #indexUpdate;
    #mapUnsubscribe = new Map();
    /**
     * @param indexUpdate - update function for the indexer.
     *
     * @param filtersAdapter - Stores the filter function data.
     */
    constructor(indexUpdate, filtersAdapter) {
        this.#indexUpdate = indexUpdate;
        this.#filtersData = filtersAdapter;
        Object.freeze(this);
    }
    /**
     * @returns Returns the length of the filter data.
     */
    get length() { return this.#filtersData.filters.length; }
    /**
     * Provides an iterator for filters.
     *
     * @yields {DataFilter<T>}
     */
    *[Symbol.iterator]() {
        if (this.#filtersData.filters.length === 0) {
            return;
        }
        for (const entry of this.#filtersData.filters) {
            yield { ...entry };
        }
    }
    /**
     * @param filters -
     */
    add(...filters) {
        /**
         * Tracks the number of filters added that have subscriber functionality.
         */
        let subscribeCount = 0;
        for (const filter of filters) {
            const filterType = typeof filter;
            if (filterType !== 'function' && (filterType !== 'object' || filter === null)) {
                throw new TypeError(`AdapterFilters error: 'filter' is not a function or object.`);
            }
            let data = void 0;
            let subscribeFn = void 0;
            if (filterType === 'function') {
                data = {
                    id: void 0,
                    filter,
                    weight: 1
                };
                subscribeFn = filter.subscribe;
            }
            else if (filterType === 'object') {
                if ('filter' in filter) {
                    if (typeof filter.filter !== 'function') {
                        throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
                    }
                    if (filter.weight !== void 0 && typeof filter.weight !== 'number' ||
                        (filter.weight < 0 || filter.weight > 1)) {
                        throw new TypeError(`AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
                    }
                    data = {
                        id: filter.id !== void 0 ? filter.id : void 0,
                        filter: filter.filter,
                        weight: filter.weight || 1
                    };
                    subscribeFn = filter.filter.subscribe ?? filter.subscribe;
                }
                else {
                    throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
                }
            }
            // Find the index to insert where data.weight is less than existing values weight.
            const index = this.#filtersData.filters.findIndex((value) => {
                return data.weight < value.weight;
            });
            // If an index was found insert at that location.
            if (index >= 0) {
                this.#filtersData.filters.splice(index, 0, data);
            }
            else // push to end of filters.
             {
                this.#filtersData.filters.push(data);
            }
            if (typeof subscribeFn === 'function') {
                const unsubscribe = subscribeFn(this.#indexUpdate);
                // Ensure that unsubscribe is a function.
                if (typeof unsubscribe !== 'function') {
                    throw new TypeError('AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.');
                }
                // Ensure that the same filter is not subscribed to multiple times.
                if (this.#mapUnsubscribe.has(data.filter)) {
                    throw new Error('AdapterFilters error: Filter added already has an unsubscribe function registered.');
                }
                this.#mapUnsubscribe.set(data.filter, unsubscribe);
                subscribeCount++;
            }
        }
        // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
        // subscriber count is less than the amount of filters added then automatically trigger an index update manually.
        if (subscribeCount < filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * Clears and removes all filters.
     */
    clear() {
        this.#filtersData.filters.length = 0;
        // Unsubscribe from all filters with subscription support.
        for (const unsubscribe of this.#mapUnsubscribe.values()) {
            unsubscribe();
        }
        this.#mapUnsubscribe.clear();
        this.#indexUpdate();
    }
    /**
     * @param filters -
     */
    remove(...filters) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        for (const data of filters) {
            // Handle the case that the filter may either be a function or a filter entry / object.
            const actualFilter = typeof data === 'function' ? data : data !== null && typeof data === 'object' ?
                data.filter : void 0;
            if (!actualFilter) {
                continue;
            }
            for (let cntr = this.#filtersData.filters.length; --cntr >= 0;) {
                if (this.#filtersData.filters[cntr].filter === actualFilter) {
                    this.#filtersData.filters.splice(cntr, 1);
                    // Invoke any unsubscribe function for given filter then remove from tracking.
                    let unsubscribe = void 0;
                    if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === 'function') {
                        unsubscribe();
                        this.#mapUnsubscribe.delete(actualFilter);
                    }
                }
            }
        }
        // Update the index a filter was removed.
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        if (typeof callback !== 'function') {
            throw new TypeError(`AdapterFilters error: 'callback' is not a function.`);
        }
        this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
            const remove = callback.call(callback, { ...data });
            if (remove) {
                let unsubscribe;
                if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function') {
                    unsubscribe();
                    this.#mapUnsubscribe.delete(data.filter);
                }
            }
            // Reverse remove boolean to properly filter / remove this filter.
            return !remove;
        });
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
    /**
     * @param ids - Removes filters by ID.
     */
    removeById(...ids) {
        const length = this.#filtersData.filters.length;
        if (length === 0) {
            return;
        }
        this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
            let remove = 0;
            for (const id of ids) {
                remove |= (data.id === id ? 1 : 0);
            }
            // If not keeping invoke any unsubscribe function for given filter then remove from tracking.
            if (!!remove) {
                let unsubscribe;
                if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function') {
                    unsubscribe();
                    this.#mapUnsubscribe.delete(data.filter);
                }
            }
            return !remove; // Swap here to actually remove the item via array filter method.
        });
        if (length !== this.#filtersData.filters.length) {
            this.#indexUpdate();
        }
    }
}

/**
 * Provides construction and management of indexed data when there are parent indexes or filter / sort functions
 * applied.
 */
class AdapterIndexer {
    derivedAdapter;
    filtersData;
    hostData;
    hostUpdate;
    indexData;
    sortData;
    sortFn;
    destroyed = false;
    /**
     * @param hostData - Hosted data structure.
     *
     * @param hostUpdate - Host update function invoked on index updates.
     *
     * @param [parentIndexer] - Any associated parent index API.
     *
     * @returns Indexer adapter instance.
     */
    constructor(hostData, hostUpdate, parentIndexer) {
        this.hostData = hostData;
        this.hostUpdate = hostUpdate;
        this.indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };
    }
    /**
     * @returns Returns whether the index is active.
     */
    get active() {
        return this.filtersData.filters.length > 0 || this.sortData.compareFn !== null ||
            this.indexData.parent?.active === true;
    }
    /**
     * @returns Returns length of reduced index.
     */
    get length() {
        return this.indexData.index ? this.indexData.index.length : 0;
    }
    /* c8 ignore start */
    /**
     * @returns Returns reversed state.
     */
    get reversed() { return this.indexData.reversed; }
    /* c8 ignore end */
    /**
     * @param reversed - New reversed state.
     */
    set reversed(reversed) { this.indexData.reversed = reversed; }
    // -------------------------------------------------------------------------------------------------------------------
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
    calcHashUpdate(oldIndex, oldHash, force = false) {
        // Use force if a boolean otherwise default to false.
        const actualForce = typeof force === 'boolean' ? force : /* c8 ignore next */ false;
        let newHash = null;
        const newIndex = this.indexData.index;
        if (newIndex) {
            for (let cntr = newIndex.length; --cntr >= 0;) {
                newHash ^= DynReducerUtils.hashUnknown(newIndex[cntr]) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
            }
        }
        this.indexData.hash = newHash;
        if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true)) {
            this.hostUpdate();
        }
    }
    /**
     * Destroys all resources.
     */
    destroy() {
        if (this.destroyed) {
            return;
        }
        this.indexData.index = null;
        this.indexData.hash = null;
        this.indexData.reversed = null;
        this.indexData.parent = null;
        this.destroyed = true;
    }
    /**
     * Store associated filter and sort data that are constructed after the indexer.
     *
     * @param filtersData - Associated AdapterFilters instance.
     *
     * @param sortData - Associated AdapterSort instance.
     *
     * @param derivedAdapter - Associated AdapterDerived instance.
     */
    initAdapters(filtersData, sortData, derivedAdapter) {
        this.filtersData = filtersData;
        this.sortData = sortData;
        this.derivedAdapter = derivedAdapter;
        this.sortFn = this.createSortFn();
    }
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
class AdapterSort {
    #sortData;
    #indexUpdate;
    #unsubscribe;
    /**
     * @param indexUpdate - Function to update indexer.
     *
     * @param sortData - Storage for compare function.
     */
    constructor(indexUpdate, sortData) {
        this.#indexUpdate = indexUpdate;
        this.#sortData = sortData;
        Object.freeze(this);
    }
    /**
     * Clears & removes any assigned sort function and triggers an index update.
     */
    clear() {
        const oldCompareFn = this.#sortData.compareFn;
        this.#sortData.compareFn = null;
        if (typeof this.#unsubscribe === 'function') {
            this.#unsubscribe();
            this.#unsubscribe = void 0;
        }
        // Only update index if an old compare function is set.
        if (typeof oldCompareFn === 'function') {
            this.#indexUpdate();
        }
    }
    /**
     * @param data - A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data) {
        if (typeof this.#unsubscribe === 'function') {
            this.#unsubscribe();
            this.#unsubscribe = void 0;
        }
        let compareFn = void 0;
        let subscribeFn = void 0;
        switch (typeof data) {
            case 'function':
                compareFn = data;
                subscribeFn = data.subscribe;
                break;
            case 'object':
                // Early out if data is null / noop.
                if (data === null) {
                    break;
                }
                if (typeof data.compare !== 'function') {
                    throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
                }
                compareFn = data.compare;
                subscribeFn = data.compare.subscribe ?? data.subscribe;
                break;
        }
        if (typeof compareFn === 'function') {
            this.#sortData.compareFn = compareFn;
        }
        else {
            const oldCompareFn = this.#sortData.compareFn;
            this.#sortData.compareFn = null;
            // Update index if the old compare function exists.
            if (typeof oldCompareFn === 'function') {
                this.#indexUpdate();
            }
            return;
        }
        if (typeof subscribeFn === 'function') {
            this.#unsubscribe = subscribeFn(this.#indexUpdate);
            // Ensure that unsubscribe is a function.
            if (typeof this.#unsubscribe !== 'function') {
                throw new Error(`AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
            }
        }
        else {
            // A sort function with subscriber functionality are assumed to immediately invoke the `subscribe` callback.
            // Only manually update the index if there is no subscriber functionality.
            this.#indexUpdate();
        }
    }
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
class IndexerAPI {
    #indexData;
    /**
     * Provides a getter to determine if the index is active.
     */
    active;
    /**
     * Provides length of reduced / indexed elements.
     */
    length;
    /**
     * Manually invoke an update of the index.
     *
     * @param force - Force update to any subscribers.
     */
    update;
    constructor(adapterIndexer) {
        this.#indexData = adapterIndexer.indexData;
        this.update = adapterIndexer.update.bind(adapterIndexer);
        // Defines getters on the public API to get the index hash, active state, and index length.
        Object.defineProperties(this, {
            active: { get: () => adapterIndexer.active },
            length: { get: () => adapterIndexer.length }
        });
        Object.freeze(this);
    }
    /**
     * - Current hash value of the index.
     */
    get hash() {
        return this.#indexData.hash;
    }
    /**
     * Provides an iterator over the index array.
     *
     * @yields {K}
     */
    *[Symbol.iterator]() {
        const indexData = this.#indexData;
        if (!indexData.index) {
            return;
        }
        const reversed = indexData.reversed;
        const length = indexData.index.length;
        if (reversed) {
            for (let cntr = length; --cntr >= 0;) {
                yield indexData.index[cntr];
            }
        }
        else {
            for (let cntr = 0; cntr < length; cntr++) {
                yield indexData.index[cntr];
            }
        }
    }
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
class DerivedAPI {
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear;
    /**
     * @param options - Options for creating a reducer.
     *
     * @returns Newly created derived reducer.
     */
    create;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete;
    /**
     * Removes all derived reducers, associated subscriptions, and cleans up all resources.
     */
    destroy;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get;
    constructor(adapterDerived) {
        this.clear = adapterDerived.clear.bind(adapterDerived);
        this.create = adapterDerived.create.bind(adapterDerived);
        this.delete = adapterDerived.delete.bind(adapterDerived);
        this.destroy = adapterDerived.destroy.bind(adapterDerived);
        this.get = adapterDerived.get.bind(adapterDerived);
        Object.freeze(this);
    }
}

/**
 */
let Indexer$1 = class Indexer extends AdapterIndexer {
    /**
     * @inheritDoc
     */
    createSortFn() {
        return (a, b) => this.sortData.compareFn(this.hostData[0][a], this.hostData[0][b]);
    }
    /**
     * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
     *
     * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
     * but the maintenance factor is not worth the extra complication.
     *
     * @returns New filtered index array.
     */
    reduceImpl() {
        const data = [];
        const array = this.hostData[0];
        if (!array) {
            return data;
        }
        const filters = this.filtersData.filters;
        let include = true;
        const parentIndex = this.indexData.parent;
        // Source index data is coming from an active parent index.
        if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active) {
            for (const adjustedIndex of parentIndex) {
                const value = array[adjustedIndex];
                include = true;
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(value)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(adjustedIndex);
                }
            }
        }
        else {
            for (let cntr = 0, length = array.length; cntr < length; cntr++) {
                include = true;
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(array[cntr])) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(cntr);
                }
            }
        }
        return data;
    }
    /**
     * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
     * pass in true to force an update to subscribers.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    update(force = false) {
        if (this.destroyed) {
            return;
        }
        const oldIndex = this.indexData.index;
        const oldHash = this.indexData.hash;
        const array = this.hostData[0];
        const parentIndex = this.indexData.parent;
        // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
        if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
            (this.indexData.index && array?.length !== this.indexData.index.length)) {
            this.indexData.index = null;
        }
        // If there are filters build new index.
        if (this.filtersData.filters.length > 0) {
            this.indexData.index = this.reduceImpl();
        }
        // If the index isn't built yet and there is an active parent index then create it from the parent.
        if (!this.indexData.index && parentIndex?.active) {
            this.indexData.index = [...parentIndex];
        }
        if (this.sortData.compareFn && Array.isArray(array)) {
            // If there is no index then create one with keys matching host item length.
            if (!this.indexData.index) {
                this.indexData.index = [...Array(array.length).keys()];
            }
            this.indexData.index.sort(this.sortFn);
        }
        this.calcHashUpdate(oldIndex, oldHash, force);
        // Update all derived reducers.
        this.derivedAdapter?.update(force);
    }
};

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
class DynArrayReducerDerived {
    #array;
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * @param array - Data host array.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(array, parentIndex, options) {
        this.#array = array;
        this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this), parentIndex);
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DynArrayReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        let filters = void 0;
        let sort = void 0;
        if (options !== void 0 && ('filters' in options || 'sort' in options)) {
            if (options.filters !== void 0) {
                if (DynReducerUtils.isIterable(options.filters)) {
                    filters = options.filters;
                }
                else {
                    throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
                }
            }
            if (options.sort !== void 0) {
                if (typeof options.sort === 'function') {
                    sort = options.sort;
                }
                else if (typeof options.sort === 'object' && options.sort !== null) {
                    sort = options.sort;
                }
                else {
                    throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // Add any filters and sort function defined by DataDynArray.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and
     * notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#array[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * @returns Main data / items length or indexed length.
     */
    get length() {
        const array = this.#array[0];
        return this.#index.active ? this.index.length :
            array ? array.length : 0;
    }
    /**
     * @returns Gets current reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        this.#destroyed = true;
        // Remove any external data reference and perform a final update.
        this.#array = [null];
        this.#index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#derived.destroy();
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Provides an iterator for data stored in DerivedArrayReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const array = this.#array[0];
        if (this.#destroyed || array === null || array?.length === 0) {
            return;
        }
        if (this.#index.active) {
            for (const entry of this.index) {
                yield array[entry];
            }
        }
        else {
            if (this.reversed) {
                for (let cntr = array.length; --cntr >= 0;) {
                    yield array[cntr];
                }
            }
            else {
                for (let cntr = 0; cntr < array.length; cntr++) {
                    yield array[cntr];
                }
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------
    /**
     * Subscribe to this DerivedArrayReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
class DynArrayReducer {
    #array = [null];
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data) {
        let dataIterable = void 0;
        let filters = void 0;
        let sort = void 0;
        if (data === null) {
            throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
        }
        if (data !== void 0 && typeof data !== 'object' && !DynReducerUtils.isIterable(data)) {
            throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
        }
        if (data !== void 0 && Symbol.iterator in data) {
            dataIterable = data;
        }
        else if (data !== void 0 && ('data' in data || 'filters' in data || 'sort' in data)) {
            if (data.data !== void 0 && !DynReducerUtils.isIterable(data.data)) {
                throw new TypeError(`DynArrayReducer error (DataDynArray): 'data' attribute is not iterable.`);
            }
            dataIterable = data.data;
            if (data.filters !== void 0) {
                if (DynReducerUtils.isIterable(data.filters)) {
                    filters = data.filters;
                }
                else {
                    throw new TypeError(`DynArrayReducer error (DataDynArray): 'filters' attribute is not iterable.`);
                }
            }
            if (data.sort !== void 0) {
                if (typeof data.sort === 'function') {
                    sort = data.sort;
                }
                else if (typeof data.sort === 'object' && data.sort !== null) {
                    sort = data.sort;
                }
                else {
                    throw new TypeError(`DynArrayReducer error (DataDynArray): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // In the case of the main data being an array directly use the array otherwise create a copy.
        if (dataIterable) {
            this.#array[0] = Array.isArray(dataIterable) ? dataIterable : [...dataIterable];
        }
        this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this));
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DynArrayReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        // Add any filters and sort function defined by DataDynArray.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#array[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * @returns Returns the Indexer public API.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length() {
        const array = this.#array[0];
        return this.#index.active ? this.#indexPublicAPI.length :
            array ? array.length : 0;
    }
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#derived.destroy();
        // Set the backing data to null and provide a final update.
        this.#array = [null];
        this.index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data, replace = false) {
        if (data !== null && !DynReducerUtils.isIterable(data)) {
            throw new TypeError(`DynArrayReducer.setData error: 'data' is not iterable.`);
        }
        if (typeof replace !== 'boolean') {
            throw new TypeError(`DynArrayReducer.setData error: 'replace' is not a boolean.`);
        }
        const array = this.#array[0];
        // If the array isn't defined or 'replace' is true then replace internal data with new array or create an array
        // from an iterable.
        if (!Array.isArray(array) || replace) {
            if (data) {
                this.#array[0] = Array.isArray(data) ? data : [...data];
            }
        }
        else {
            if (data) {
                // Remove all entries in internal data. This will not replace any initially set array.
                array.length = 0;
                // Add all new data.
                array.push(...data);
            }
            else {
                this.#array[0] = null;
            }
        }
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Add a subscriber to this DynArrayReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const array = this.#array[0];
        if (this.#destroyed || array === null || array?.length === 0) {
            return;
        }
        if (this.#index.active) {
            for (const entry of this.index) {
                yield array[entry];
            }
        }
        else {
            if (this.reversed) {
                for (let cntr = array.length; --cntr >= 0;) {
                    yield array[cntr];
                }
            }
            else {
                for (let cntr = 0; cntr < array.length; cntr++) {
                    yield array[cntr];
                }
            }
        }
    }
}

/**
 */
class Indexer extends AdapterIndexer {
    /**
     * @inheritDoc
     */
    createSortFn() {
        return (a, b) => this.sortData.compareFn(this.hostData[0].get(a), this.hostData[0].get(b));
    }
    /**
     * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
     *
     * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
     * but the maintenance factor is not worth the extra complication.
     *
     * @returns New filtered index array.
     */
    reduceImpl() {
        const data = [];
        const map = this.hostData[0];
        if (!map) {
            return data;
        }
        const filters = this.filtersData.filters;
        let include = true;
        const parentIndex = this.indexData.parent;
        // Source index data is coming from an active parent index.
        if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active) {
            for (const key of parentIndex) {
                const value = map.get(key);
                include = true;
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(value)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(key);
                }
            }
        }
        else {
            for (const key of map.keys()) {
                include = true;
                const value = map.get(key);
                for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
                    if (!filters[filCntr].filter(value)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    data.push(key);
                }
            }
        }
        return data;
    }
    /**
     * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
     * pass in true to force an update to subscribers.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    update(force = false) {
        if (this.destroyed) {
            return;
        }
        const oldIndex = this.indexData.index;
        const oldHash = this.indexData.hash;
        const map = this.hostData[0];
        const parentIndex = this.indexData.parent;
        // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
        if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
            (this.indexData.index && map?.size !== this.indexData.index.length)) {
            this.indexData.index = null;
        }
        // If there are filters build new index.
        if (this.filtersData.filters.length > 0) {
            this.indexData.index = this.reduceImpl();
        }
        // If the index isn't built yet and there is an active parent index then create it from the parent.
        if (!this.indexData.index && parentIndex?.active) {
            this.indexData.index = [...parentIndex];
        }
        if (this.sortData.compareFn && map instanceof Map) {
            // If there is no index then create one with keys matching host item length.
            if (!this.indexData.index) {
                this.indexData.index = this.indexData.index = [...map.keys()];
            }
            this.indexData.index.sort(this.sortFn);
        }
        this.calcHashUpdate(oldIndex, oldHash, force);
        // Update all derived reducers.
        this.derivedAdapter?.update(force);
    }
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
class DynMapReducerDerived {
    #map;
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * @param map - Data host Map.
     *
     * @param parentIndex - Parent indexer.
     *
     * @param options - Any filters and sort functions to apply.
     */
    constructor(map, parentIndex, options) {
        this.#map = map;
        this.#index = new Indexer(this.#map, this.#updateSubscribers.bind(this), parentIndex);
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        let filters = void 0;
        let sort = void 0;
        if (options !== void 0 && ('filters' in options || 'sort' in options)) {
            if (options.filters !== void 0) {
                if (DynReducerUtils.isIterable(options.filters)) {
                    filters = options.filters;
                }
                else {
                    throw new TypeError(`DerivedMapReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
                }
            }
            if (options.sort !== void 0) {
                if (typeof options.sort === 'function') {
                    sort = options.sort;
                }
                else if (typeof options.sort === 'object' && options.sort !== null) {
                    sort = options.sort;
                }
                else {
                    throw new TypeError(`DerivedMapReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // Add any filters and sort function defined by DataDynArray.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: The returned map is the same map set by the main reducer. If any changes are performed to the data
     * externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#map[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * @returns Main data / items length or indexed length.
     */
    get length() {
        const map = this.#map[0];
        return this.#index.active ? this.index.length :
            map ? map.size : 0;
    }
    /**
     * @returns Gets current reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DerivedMapReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        this.#destroyed = true;
        // Remove any external data reference and perform a final update.
        this.#map = [null];
        this.#index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#derived.destroy();
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Provides an iterator for data stored in DerivedMapReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const map = this.#map[0];
        if (this.#destroyed || map === null || map?.size === 0) {
            return;
        }
        if (this.#index.active) {
            for (const key of this.index) {
                yield map.get(key);
            }
        }
        else {
            if (this.reversed) {
                // TODO: Not efficient due to creating temporary values array.
                const values = [...map.values()];
                for (let cntr = values.length; --cntr >= 0;) {
                    yield values[cntr];
                }
            }
            else {
                for (const value of map.values()) {
                    yield value;
                }
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------
    /**
     * Subscribe to this DerivedMapReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
}

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
class DynMapReducer {
    #map = [null];
    #derived;
    #derivedPublicAPI;
    #filters;
    #filtersData = { filters: [] };
    #index;
    #indexPublicAPI;
    #reversed = false;
    #sort;
    #sortData = { compareFn: null };
    #subscriptions = [];
    #destroyed = false;
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data) {
        let dataMap = void 0;
        let filters = void 0;
        let sort = void 0;
        if (data === null) {
            throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
        }
        if (data !== void 0 && typeof data !== 'object' && !(data instanceof Map)) {
            throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
        }
        if (data !== void 0 && data instanceof Map) {
            dataMap = data;
        }
        else if (data !== void 0 && ('data' in data || 'filters' in data || 'sort' in data)) {
            if (data.data !== void 0 && !(data.data instanceof Map)) {
                throw new TypeError(`DynMapReducer error (DataDynMap): 'data' attribute is not a Map.`);
            }
            dataMap = data.data;
            if (data.filters !== void 0) {
                if (DynReducerUtils.isIterable(data.filters)) {
                    filters = data.filters;
                }
                else {
                    throw new TypeError(`DynMapReducer error (DataDynMap): 'filters' attribute is not iterable.`);
                }
            }
            if (data.sort !== void 0) {
                if (typeof data.sort === 'function') {
                    sort = data.sort;
                }
                else if (typeof data.sort === 'object' && data.sort !== null) {
                    sort = data.sort;
                }
                else {
                    throw new TypeError(`DynMapReducer error (DataDynMap): 'sort' attribute is not a function or object.`);
                }
            }
        }
        // In the case of the main data being an array directly use the array otherwise create a copy.
        if (dataMap) {
            this.#map[0] = dataMap;
        }
        this.#index = new Indexer(this.#map, this.#updateSubscribers.bind(this));
        this.#indexPublicAPI = new IndexerAPI(this.#index);
        this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
        this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
        this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
        this.#derivedPublicAPI = new DerivedAPI(this.#derived);
        this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
        // Add any filters and sort function defined by DataDynMap.
        if (filters) {
            this.filters.add(...filters);
        }
        if (sort) {
            this.sort.set(sort);
        }
        // Invoke an custom initialization for child classes.
        this.initialize();
    }
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: When a map is set as data then that map is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data() { return this.#map[0]; }
    /**
     * @returns Derived public API.
     */
    get derived() { return this.#derivedPublicAPI; }
    /**
     * @returns The filters adapter.
     */
    get filters() { return this.#filters; }
    /**
     * @returns Returns the Indexer public API.
     */
    get index() { return this.#indexPublicAPI; }
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed() { return this.#destroyed; }
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length() {
        const map = this.#map[0];
        return this.#index.active ? this.#indexPublicAPI.length :
            map ? map.size : 0;
    }
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed() { return this.#reversed; }
    /**
     * @returns The sort adapter.
     */
    get sort() { return this.#sort; }
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed) {
        if (typeof reversed !== 'boolean') {
            throw new TypeError(`DynMapReducer.reversed error: 'reversed' is not a boolean.`);
        }
        this.#reversed = reversed;
        this.#index.reversed = reversed;
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy() {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#derived.destroy();
        // Set the backing data to null and provide a final update.
        this.#map = [null];
        this.index.update(true);
        // Remove all subscriptions.
        this.#subscriptions.length = 0;
        this.#index.destroy();
        this.#filters.clear();
        this.#sort.clear();
    }
    /**
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize() { }
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data, replace = false) {
        if (data !== null && !(data instanceof Map)) {
            throw new TypeError(`DynMapReducer.setData error: 'data' is not iterable.`);
        }
        if (typeof replace !== 'boolean') {
            throw new TypeError(`DynMapReducer.setData error: 'replace' is not a boolean.`);
        }
        const map = this.#map[0];
        // If the array isn't defined or 'replace' is true then replace internal data with new array or create an array
        // from an iterable.
        if (!(map instanceof Map) || replace) {
            this.#map[0] = data instanceof Map ? data : null;
        }
        else if (data instanceof Map && map instanceof Map) {
            // Create a set of all current entry IDs.
            const removeKeySet = new Set(map.keys());
            for (const key of data.keys()) {
                map.set(key, data.get(key));
                if (removeKeySet.has(key)) {
                    removeKeySet.delete(key);
                }
            }
            // Remove entries that are no longer in data.
            for (const key of removeKeySet) {
                map.delete(key);
            }
        }
        else if (data === null) {
            this.#map[0] = null;
        }
        // Recalculate index and force an update to any subscribers.
        this.index.update(true);
    }
    /**
     * Add a subscriber to this DynMapReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler) {
        this.#subscriptions.push(handler); // add handler to the array of subscribers
        handler(this); // call handler with current value
        // Return unsubscribe function.
        return () => {
            const index = this.#subscriptions.findIndex((sub) => sub === handler);
            if (index >= 0) {
                this.#subscriptions.splice(index, 1);
            }
        };
    }
    /**
     * Updates subscribers on changes.
     */
    #updateSubscribers() {
        for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
            this.#subscriptions[cntr](this);
        }
    }
    /**
     * Provides an iterator for data stored in DynMapReducer.
     *
     * @yields {T}
     */
    *[Symbol.iterator]() {
        const map = this.#map[0];
        if (this.#destroyed || map === null || map?.size === 0) {
            return;
        }
        if (this.#index.active) {
            for (const key of this.index) {
                yield map.get(key);
            }
        }
        else {
            if (this.reversed) {
                // TODO: Not efficient due to creating temporary values array.
                const values = [...map.values()];
                for (let cntr = values.length; --cntr >= 0;) {
                    yield values[cntr];
                }
            }
            else {
                for (const value of map.values()) {
                    yield value;
                }
            }
        }
    }
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
function isWritableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function' && typeof store.set === 'function';
   }

   return false;
}

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
function subscribeIgnoreFirst(store, update)
{
   let firedFirst = false;

   return store.subscribe((value) =>
   {
      if (!firedFirst)
      {
         firedFirst = true;
      }
      else
      {
         update(value);
      }
   });
}

/**
 * Provides a base implementation for store entries in {@link ArrayObjectStore}.
 *
 * In particular providing the required getting / accessor for the 'id' property.
 */
class ObjectEntryStore
{
   /**
    * @type {object}
    */
   #data;

   /**
    * Stores the subscribers.
    *
    * @type {(function(object): void)[]}
    */
   #subscriptions = [];

   /**
    * @param {object}   data -
    */
   constructor(data = {})
   {
      if (!isObject(data)) { throw new TypeError(`'data' is not an object.`); }

      this.#data = data;

      // If an id is missing then add it.
      if (typeof data.id !== 'string') { this.#data.id = uuidv4(); }

      if (!uuidv4.isValid(data.id)) { throw new Error(`'data.id' (${data.id}) is not a valid UUIDv4 string.`); }
   }

   /**
    * Invoked by ArrayObjectStore to provide custom duplication. Override this static method in your entry store.
    *
    * @param {object}   data - A copy of local data w/ new ID already set.
    *
    * @param {import('./ArrayObjectStore.js').ArrayObjectStore} arrayStore - The source ArrayObjectStore instance.
    */
   static duplicate(data, arrayStore) {}  // eslint-disable-line no-unused-vars

   /**
    * @returns {object} The object data tracked by this store.
    * @protected
    */
   get _data() { return this.#data; }

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * @returns {string} The ID attribute in object data tracked by this store.
    */
   get id() { return this.#data.id; }

   toJSON()
   {
      return this.#data;
   }

   /**
    * @param {function(object): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler);  // add handler to the array of subscribers

      handler(this.#data);                // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * @protected
    */
   _updateSubscribers()
   {
      const subscriptions = this.#subscriptions;

      const data = this.#data;

      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](data); }
   }
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 */
class ArrayObjectStore
{
   /** @type {T[]} */
   #data = [];

   /**
    * @type {Map<string, { store: T, unsubscribe: Function}>}
    */
   #dataMap = new Map();

   /**
    * @type {DynArrayReducer<T>}
    */
   #dataReducer;

   /**
    * @type {boolean}
    */
   #manualUpdate;

   /**
    * @type {T}
    */
   #StoreClass;

   /**
    * Stores the subscribers.
    *
    * @type {(function(T[]): void)[]}
    */
   #subscriptions = [];

   /**
    * @type {Function}
    */
   #updateSubscribersBound;

   /**
    * @returns {ObjectEntryStore} The default object entry store constructor.
    */
   static get EntryStore() { return ObjectEntryStore; }

   /**
    * @param {import('./index.js').ArrayObjectStoreParams} params -
    */
   constructor({ StoreClass, defaultData = [], childDebounce = 250, dataReducer = false, manualUpdate = false } = {})
   {
      if (!Number.isInteger(childDebounce) || childDebounce < 0 || childDebounce > 1000)
      {
         throw new TypeError(`'childDebounce' must be an integer between and including 0 - 1000.`);
      }

      if (typeof manualUpdate !== 'boolean') { throw new TypeError(`'manualUpdate' is not a boolean.`); }

      if (!isWritableStore(StoreClass.prototype))
      {
         throw new TypeError(`'StoreClass' is not a writable store constructor.`);
      }

      let hasIDGetter = false;

      // Walk parent prototype chain. Check for descriptor at each prototype level.
      for (let o = StoreClass.prototype; o; o = Object.getPrototypeOf(o))
      {
         const descriptor = Object.getOwnPropertyDescriptor(o, 'id');
         if (descriptor !== void 0 && descriptor.get !== void 0)
         {
            hasIDGetter = true;
            break;
         }
      }

      if (!hasIDGetter)
      {
         throw new TypeError(`'StoreClass' does not have a getter accessor for 'id' property.`);
      }

      if (!Array.isArray(defaultData)) { throw new TypeError(`'defaultData' is not an array.`); }

      this.#manualUpdate = manualUpdate;

      this.#StoreClass = StoreClass;

      if (dataReducer) { this.#dataReducer = new DynArrayReducer({ data: this.#data }); }

      // Prepare a debounced callback that is used for all child store entry subscriptions.
      this.#updateSubscribersBound = childDebounce === 0 ? this.updateSubscribers.bind(this) :
       debounce((data) => this.updateSubscribers(data), childDebounce);
   }

   /**
    * Provide an iterator for public access to entry stores.
    *
    * @yields {T | void}
    */
   *[Symbol.iterator]()
   {
      if (this.#data.length === 0) { return; }

      for (const entryStore of this.#data) { yield entryStore; }
   }

   /**
    * @returns {T[]} The internal data array tracked allowing child classes direct access.
    * @protected
    */
   get _data() { return this.#data; }

   /**
    * @returns {DynArrayReducer<T>} The data reducer.
    */
   get dataReducer()
   {
      if (!this.#dataReducer)
      {
         throw new Error(
          `'dataReducer' is not initialized; did you forget to specify 'dataReducer' as true in constructor options?`);
      }

      return this.#dataReducer;
   }

   /**
    * @returns {number} The length of all data.
    */
   get length() { return this.#data.length; }

   /**
    * Removes all child store entries.
    */
   clearEntries()
   {
      for (const storeEntryData of this.#dataMap.values()) { storeEntryData.unsubscribe(); }

      this.#dataMap.clear();
      this.#data.length = 0;

      this.updateSubscribers();
   }

   /**
    * Creates a new store from given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} The store
    */
   createEntry(entryData = {})
   {
      if (!isObject(entryData)) { throw new TypeError(`'entryData' is not an object.`); }

      if (typeof entryData.id !== 'string') { entryData.id = uuidv4(); }

      if (this.#data.findIndex((entry) => entry.id === entryData.id) >= 0)
      {
         throw new Error(`'entryData.id' (${entryData.id}) already in this ArrayObjectStore instance.`);
      }

      const store = this.#createStore(entryData);

      this.updateSubscribers();

      return store;
   }

   /**
    * Add a new store entry from the given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} New store entry instance.
    */
   #createStore(entryData)
   {
      const store = new this.#StoreClass(entryData, this);

      if (!uuidv4.isValid(store.id))
      {
         throw new Error(`'store.id' (${store.id}) is not a UUIDv4 compliant string.`);
      }

      const unsubscribe = subscribeIgnoreFirst(store, this.#updateSubscribersBound);

      this.#data.push(store);
      this.#dataMap.set(entryData.id, { store, unsubscribe });

      return store;
   }

   /**
    * Deletes a given entry store by ID from this world setting array store instance.
    *
    * @param {string}  id - ID of entry to delete.
    *
    * @returns {boolean} Delete operation successful.
    */
   deleteEntry(id)
   {
      const result = this.#deleteStore(id);

      if (result) { this.updateSubscribers(); }

      return result;
   }

   #deleteStore(id)
   {
      if (typeof id !== 'string') { throw new TypeError(`'id' is not a string.`); }

      const storeEntryData = this.#dataMap.get(id);
      if (storeEntryData)
      {
         storeEntryData.unsubscribe();

         this.#dataMap.delete(id);

         const index = this.#data.findIndex((entry) => entry.id === id);
         if (index >= 0) { this.#data.splice(index, 1); }

         return true;
      }

      return false;
   }

   /**
    * Duplicates an entry store by the given ID.
    *
    * @param {string}   id - UUIDv4 string.
    *
    * @returns {*} Instance of StoreClass.
    */
   duplicateEntry(id)
   {
      if (typeof id !== 'string') { throw new TypeError(`'id' is not a string.`); }

      const storeEntryData = this.#dataMap.get(id);

      if (storeEntryData)
      {
         const data = klona(storeEntryData.store.toJSON());
         data.id = uuidv4();

         // Allow StoreClass to statically perform any specialized duplication.
         this.#StoreClass?.duplicate?.(data, this);

         return this.createEntry(data);
      }

      return void 0;
   }

   /**
    * Find an entry in the backing child store array.
    *
    * @param {function(T): T|void}  predicate - A predicate function
    *
    * @returns {T|void} Found entry in array or undefined.
    */
   findEntry(predicate)
   {
      return this.#data.find(predicate);
   }

   /**
    * Finds an entry store instance by 'id' / UUIDv4.
    *
    * @param {string}   id - A UUIDv4 string.
    *
    * @returns {T|void} Entry store instance.
    */
   getEntry(id)
   {
      const storeEntryData = this.#dataMap.get(id);
      return storeEntryData ? storeEntryData.store : void 0;
   }

   /**
    * Sets the children store data by 'id', adds new entry store instances, or removes entries that are no longer in the
    * update list.
    *
    * @param {T[]}   updateList -
    */
   set(updateList)
   {
      if (!Array.isArray(updateList))
      {
         console.warn(`ArrayObjectStore.set warning: aborting set operation as 'updateList' is not an array.`);
         return;
      }

      const data = this.#data;
      const dataMap = this.#dataMap;

      // Create a set of all current entry IDs.
      const removeIDSet = new Set(dataMap.keys());

      let rebuildIndex = false;

      for (let updateIndex = 0; updateIndex < updateList.length; updateIndex++)
      {
         const updateData = updateList[updateIndex];

         const id = updateData.id;

         if (typeof id !== 'string') { throw new Error(`'updateData.id' is not a string.`); }

         const localIndex = data.findIndex((entry) => entry.id === id);

         if (localIndex >= 0)
         {
            const localEntry = data[localIndex];

            // Update the entry data.
            localEntry.set(updateData);

            // Must move to correct position
            if (localIndex !== updateIndex)
            {
               // Remove from current location.
               data.splice(localIndex, 1);

               if (updateIndex < data.length)
               {
                  // Insert at new location.
                  data.splice(updateIndex, 0, localEntry);
               }
               else
               {
                  // Local data length is less than update data index; rebuild index.
                  rebuildIndex = true;
               }
            }

            // Delete from removeIDSet as entry is still in local data.
            removeIDSet.delete(id);
         }
         else
         {
            this.#createStore(updateData);
         }
      }

      if (rebuildIndex)
      {
         // Must invoke unsubscribe for all child stores.
         for (const storeEntryData of dataMap.values()) { storeEntryData.unsubscribe(); }

         data.length = 0;
         dataMap.clear();

         for (const updateData of updateList) { this.#createStore(updateData); }
      }
      else
      {
         // Remove entries that are no longer in data.
         for (const id of removeIDSet) { this.#deleteStore(id); }
      }

      this.updateSubscribers();
   }

   toJSON()
   {
      return this.#data;
   }

// -------------------------------------------------------------------------------------------------------------------

   /**
    * @param {function(T[]): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this.#data);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers.
    *
    * @param {import('./index.js').ArrayObjectUpdateData}  [update] -
    */
   updateSubscribers(update)
   {
      const updateGate = typeof update === 'boolean' ? update : !this.#manualUpdate;

      if (updateGate)
      {
         const subscriptions = this.#subscriptions;

         const data = this.#data;

         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](data); }
      }

      // This will update the filtered data and `dataReducer` store and forces an update to subscribers.
      if (this.#dataReducer) { this.#dataReducer.index.update(true); }
   }
}

/**
 * @template [T=import('./').BaseArrayObjectEntryStore]
 * @augments {ArrayObjectStore<T>}
 */
class CrudArrayObjectStore extends ArrayObjectStore
{
   /** @type {CrudDispatch} */
   #crudDispatch;

   /** @type {object} */
   #extraData;

   /**
    * @param {object}                  [opts] - Optional parameters.
    *
    * @param {CrudDispatch}            [opts.crudDispatch] -
    *
    * @param {object}                  [opts.extraData] -
    *
    * @param {import('./index.js').ArrayObjectStoreParams}  [opts.rest] - Rest of ArrayObjectStore parameters.
    */
   constructor({ crudDispatch, extraData, ...rest })
   {
      // 'manualUpdate' is set to true if 'crudUpdate' is defined, but can be overridden by `...rest`.
      super({
         manualUpdate: typeof crudDispatch === 'function',
         ...rest,
      });

      if (crudDispatch !== void 0 && typeof crudDispatch !== 'function')
      {
         throw new TypeError(`'crudDispatch' is not a function.`);
      }

      if (extraData !== void 0 && !isObject(extraData))
      {
         throw new TypeError(`'extraData' is not an object.`);
      }

      this.#crudDispatch = crudDispatch;
      this.#extraData = extraData ?? {};
   }

   /**
    * Removes all child store entries.
    */
   clearEntries()
   {
      super.clearEntries();

      if (this.#crudDispatch)
      {
         this.#crudDispatch({ action: 'clear', ...this.#extraData });
      }
   }

   /**
    * Creates a new store from given data.
    *
    * @param {object}   entryData -
    *
    * @returns {T} Associated store with entry data.
    */
   createEntry(entryData = {})
   {
      const store = super.createEntry(entryData);

      if (store && this.#crudDispatch)
      {
         this.#crudDispatch({
            action: 'create',
            ...this.#extraData,
            id: store.id,
            data: store.toJSON()
         });
      }

      return store;
   }

   /**
    * Deletes a given entry store by ID from this world setting array store instance.
    *
    * @param {string}  id - ID of entry to delete.
    *
    * @returns {boolean} Delete operation successful.
    */
   deleteEntry(id)
   {
      const result = super.deleteEntry(id);

      if (result && this.#crudDispatch)
      {
         this.#crudDispatch({ action: 'delete', ...this.#extraData, id });
      }

      return result;
   }

   /**
    * Updates subscribers, but provides special handling when WorldSettingArrayStore has an `crudDispatch` function
    * attached. When the update is an object with a valid UUIDv4 string as the id property the `crudDispatch`
    * function is invoked with  along with the data payload
    *
    * @param {import('./index.js').ArrayObjectUpdateData} [update] -
    */
   updateSubscribers(update)
   {
      if (this.#crudDispatch && isObject(update) && uuidv4.isValid(update.id))
      {
         const result = this.#crudDispatch({
            action: 'update',
            ...this.#extraData,
            id: update.id,
            data: update  // TODO: Consider using klona to clone data.
         });

         // If the crudDispatch function returns a boolean then invoke 'ArrayObjectStore.updateSubscribers' with it.
         super.updateSubscribers(typeof result === 'boolean' ? result : update);
      }
      else
      {
         super.updateSubscribers(update);
      }
   }
}

/**
 * @typedef {import('./index.js').ArrayObjectStoreParams & CrudArrayObjectStoreParamProps} CrudArrayObjectStoreParams
 */

/**
 * @typedef {object} CrudArrayObjectStoreParamProps
 *
 * @property {CrudDispatch}   [crudDispatch] -
 *
 * @property {object}         [extraData] -
 *
 * @internal
 */

/**
 * @typedef {(data: { action: string, id?: string, data?: object }) => boolean} CrudDispatch
 *
 * A function that accepts an object w/ 'action', 'moduleId', 'key' properties and optional 'id' / UUIDv4 string and
 * 'data' property.
 */

/**
 * Creates a filter function to compare objects by a give property key against a regex test. The returned function
 * is also a writable Svelte store that builds a regex from the stores value.
 *
 * This filter function can be used w/ a dynamic reducer and bound as a store to input elements.
 *
 * @param {string|Iterable<string>}   properties - Property key to compare.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {boolean}  [opts.caseSensitive=false] - When true regex test is case-sensitive.
 *
 * @param {import('#svelte/store').Writable<string>}  [opts.store=void] - Use the provided store to instead of creating
 *        a default writable store.
 *
 * @returns {((data: object) => boolean) & import('#svelte/store').Writable<string>} The query string filter.
 */
function regexObjectQuery(properties, { caseSensitive = false, store } = {})
{
   let keyword = '';
   let regex;

   if (store !== void 0 && !isWritableStore(store))
   {
      throw new TypeError(`createObjectQuery error: 'store' is not a writable store.`);
   }

   const storeKeyword = store ? store : writable(keyword);

   // If an existing store is provided then set initial values.
   if (store)
   {
      const current = get(store);

      if (typeof current === 'string')
      {
         keyword = normalizeString(current);
         regex = new RegExp(RegExp.escape(keyword), caseSensitive ? '' : 'i');
      }
      else
      {
         store.set(keyword);
      }
   }

   /**
    * If there is no filter keyword / regex then do not filter otherwise filter based on the regex
    * created from the search input element.
    *
    * @param {object} data - Data object to test against regex.
    *
    * @returns {boolean} AnimationStore filter state.
    */
   function filterQuery(data)
   {
      if (keyword === '' || !regex) { return true; }

      if (isIterable(properties))
      {
         for (const property of properties)
         {
            if (regex.test(normalizeString(data?.[property]))) { return true; }
         }

         return false;
      }
      else
      {
         return regex.test(normalizeString(data?.[properties]));
      }
   }

   /**
    * Create a custom store that changes when the search keyword changes.
    *
    * @param {(string) => void} handler - A callback function that accepts strings.
    *
    * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
    */
   filterQuery.subscribe = (handler) =>
   {
      return storeKeyword.subscribe(handler);
   };

   /**
    * Set
    *
    * @param {string}   value - A new value for the keyword / regex test.
    */
   filterQuery.set = (value) =>
   {
      if (typeof value === 'string')
      {
         keyword = normalizeString(value);
         regex = new RegExp(RegExp.escape(keyword), caseSensitive ? '' : 'i');
         storeKeyword.set(keyword);
      }
   };

   return filterQuery;
}

const filters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    regexObjectQuery: regexObjectQuery
});

/**
 * Provides helper functions to create dynamic store driven filters and sort functions for dynamic reducers. The
 * returned functions are also Svelte stores and can be added to a reducer as well as used as a store.
 */
class DynReducerHelper
{
   /**
    * Returns the following filter functions:
    * - regexObjectQuery(property, options); suitable for object reducers matching one or more properties against
    *   the store value as a regex. Optional parameters to set case sensitivity and passing in an existing store.
    *
    * @returns {{
    *    regexObjectQuery: (properties: string|Iterable<string>, options?: {caseSensitive?: boolean, store?: import('#svelte/store').Writable<string>}) => (((data: {}) => boolean) & import('#svelte/store').Writable<string>)
    * }}
    */
   static get filters() { return filters; }
}

export { ArrayObjectStore, CrudArrayObjectStore, DynArrayReducer, DynArrayReducerDerived, DynMapReducer, DynMapReducerDerived, DynReducerHelper, ObjectEntryStore };
//# sourceMappingURL=index.js.map
