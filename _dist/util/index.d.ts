import * as _svelte from 'svelte';

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
 * Validates `config` argument whether it is a valid {@link TJSSvelteConfig}.
 *
 * @param {*}  config - The potential config object to validate.
 *
 * @param {boolean}  [raiseException=false] - If validation fails raise an exception.
 *
 * @returns {boolean} Is the config a valid TJSSvelteConfig.
 *
 * @throws {TypeError}  Any validation error when `raiseException` is enabled.
 */
declare function isTJSSvelteConfig(config: any, raiseException?: boolean): boolean;
type TJSSvelteConfig = {
    /**
     * -
     */
    class: new (options: _svelte.ComponentConstructorOptions) => _svelte.SvelteComponent | _svelte.SvelteComponentTyped;
    /**
     * -
     */
    target?: Element | Document | ShadowRoot;
    /**
     * -
     */
    anchor?: Element;
    /**
     * -
     */
    props?: () => Record<string, any> | Record<string, any>;
    /**
     * -
     */
    context?: () => (Record<string, any> | Map<string, any>) | Map<string, any> | Record<string, any>;
    /**
     * -
     */
    hydrate?: boolean;
    /**
     * -
     */
    intro?: boolean;
    /**
     * -
     */
    $$inline?: boolean;
};

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
declare function parseTJSSvelteConfig(config: object, thisArg?: any): object;

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

export { ParseDataTransferOptions, TJSSvelteConfig, debounce, getUUIDFromDataTransfer, hashCode, isApplicationShell, isHMRProxy, isSvelteComponent, isTJSSvelteConfig, normalizeString, outroAndDestroy, parseTJSSvelteConfig, striptags, uuidv4 };
