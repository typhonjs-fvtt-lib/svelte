/**
 * Provides a solid string hashing algorithm.
 *
 * Sourced from: https://stackoverflow.com/a/52171480
 *
 * @param {string}   str - String to hash.
 *
 * @param {number}   seed - A seed value altering the hash.
 *
 * @returns {number} Hash code.
 */
declare function hashCode(str: string, seed?: number): number;

/**
 * Generates a UUID v4 compliant ID. Please use a complete UUID generation package for guaranteed compliance.
 *
 * This code is an evolution of the following Gist.
 * https://gist.github.com/jed/982883
 *
 * There is a public domain / free copy license attached to it that is not a standard OSS license...
 * https://gist.github.com/jed/982883#file-license-txt
 *
 * @returns {string} UUIDv4
 */
declare function uuidv4(): string;
declare namespace uuidv4 {
    /**
     * Validates that the given string is formatted as a UUIDv4 string.
     *
     * @param {string}   uuid - UUID string to test.
     *
     * @returns {boolean} Is UUIDv4 string.
     */
    function isValid(uuid: string): boolean;
}

/**
 * Normalizes a string.
 *
 * @param {string}   query - A string to normalize for comparisons.
 *
 * @returns {string} Cleaned string.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */
declare function normalizeString(query: string): string;

/**
 * Recursive function that finds the closest parent stacking context.
 * See also https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
 *
 * Original author: Kerry Liu / https://github.com/gwwar
 *
 * @see https://github.com/gwwar/z-context/blob/master/content-script.js
 * @see https://github.com/gwwar/z-context/blob/master/LICENSE
 *
 * @param {Element} node -
 *
 * @returns {StackingContext} The closest parent stacking context
 */
declare function getStackingContext(node: Element): StackingContext;
type StackingContext = {
    /**
     * - A DOM Element.
     */
    node: Element;
    /**
     * - Reason for why a stacking context was created.
     */
    reason: string;
};

/**
 * Parses a pixel string / computed styles. Ex. `100px` returns `100`.
 *
 * @param {string}   value - Value to parse.
 *
 * @returns {number|undefined} The integer component of a pixel string.
 */
declare function styleParsePixels(value: string): number | undefined;

/**
 * Provides a method to determine if the passed in object / Svelte component follows the application shell contract.
 * This involves ensuring that the accessors defined in `applicationShellContract`.
 *
 * Note: A caveat is that when using Vite in a developer build components are wrapped in a proxy / ProxyComponent that
 * defines instance accessors versus on the prototype, so the check below ensures that all accessors in the contract are
 * either available on the prototype or directly on the instance.
 *
 * @param {*}  component - Object / component to test.
 *
 * @returns {boolean} Whether the component is a ApplicationShell or TJSApplicationShell.
 */
declare function isApplicationShell(component: any): boolean;

/**
 * Provides basic duck typing to determine if the provided object is a HMR ProxyComponent instance or class.
 *
 * @param {*}  comp - Data to check as a HMR proxy component.
 *
 * @returns {boolean} Whether basic duck typing succeeds.
 */
declare function isHMRProxy(comp: any): boolean;

/**
 * Provides basic duck typing to determine if the provided function is a constructor function for a Svelte component.
 *
 * @param {*}  comp - Data to check as a Svelte component.
 *
 * @returns {boolean} Whether basic duck typing succeeds.
 */
declare function isSvelteComponent(comp: any): boolean;

/**
 * Runs outro transition then destroys Svelte component.
 *
 * Workaround for https://github.com/sveltejs/svelte/issues/4056
 *
 * @param {*}  instance - A Svelte component.
 */
declare function outroAndDestroy(instance: any): Promise<any>;

/**
 * Parses a TyphonJS Svelte config object ensuring that classes specified are Svelte components and props are set
 * correctly.
 *
 * @param {object}   config - Svelte config object.
 *
 * @param {*}        [thisArg] - `This` reference to set for invoking any props function.
 *
 * @returns {object} The processed Svelte config object.
 */
declare function parseSvelteConfig(config: object, thisArg?: any): object;

/**
 * Wraps a callback in a debounced timeout.
 *
 * Delay execution of the callback function until the function has not been called for the given delay in milliseconds.
 *
 * @param {Function} callback - A function to execute once the debounced threshold has been passed.
 *
 * @param {number}   delay - An amount of time in milliseconds to delay.
 *
 * @returns {Function} A wrapped function that can be called to debounce execution.
 */
declare function debounce(callback: Function, delay: number): Function;

/**
 * Provides a method to determine if the passed in Svelte component has a getter accessor.
 *
 * @param {*}        object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the getter for accessor.
 */
declare function hasGetter(object: any, accessor: string): boolean;
/**
 * Provides a method to determine if the passed in Svelte component has a getter & setter accessor.
 *
 * @param {*}        object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the getter and setter for accessor.
 */
declare function hasAccessor(object: any, accessor: string): boolean;
/**
 * Provides a method to determine if the passed in Svelte component has a setter accessor.
 *
 * @param {*}        object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the setter for accessor.
 */
declare function hasSetter(object: any, accessor: string): boolean;

/**
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @param {*}  target - Any target to test.
 *
 * @param {Function} Prototype - Prototype function / class constructor to find.
 *
 * @returns {boolean} Target matches prototype.
 */
declare function hasPrototype(target: any, Prototype: Function): boolean;

interface StateMachineOptions {
    readonly allowedTags?: Set<string>;
    readonly disallowedTags?: Set<string>;
    readonly tagReplacementText: string;
    readonly encodePlaintextTagDelimiters: boolean;
}
declare function striptags(text: string, options?: Partial<StateMachineOptions>): string;

/**
 * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
 *
 * @param {object}   data - Drop transfer data.
 *
 * @param {ParseDataTransferOptions}   opts - Optional parameters.
 *
 * @returns {string|undefined} Foundry UUID for drop data.
 */
declare function getUUIDFromDataTransfer(data: object, { actor, compendium, world, types }?: ParseDataTransferOptions): string | undefined;
type ParseDataTransferOptions = {
    /**
     * - Accept actor owned documents.
     */
    actor?: boolean;
    /**
     * - Accept compendium documents.
     */
    compendium?: boolean;
    /**
     * - Accept world documents.
     */
    world?: boolean;
    /**
     * - Require the `data.type` to match entry in `types`.
     */
    types?: string[] | undefined;
};

export { ParseDataTransferOptions, StackingContext, debounce, getStackingContext, getUUIDFromDataTransfer, hasAccessor, hasGetter, hasPrototype, hasSetter, hashCode, isApplicationShell, isHMRProxy, isSvelteComponent, normalizeString, outroAndDestroy, parseSvelteConfig, striptags, styleParsePixels, uuidv4 };
