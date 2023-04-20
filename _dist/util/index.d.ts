/**
 * Provides several helpful utility methods for accessibility and keyboard navigation.
 */
declare class A11yHelper {
    /**
     * Apply focus to the HTMLElement targets in a given A11yFocusSource data object. An iterable list `options.focusEl`
     * can contain HTMLElements or selector strings. If multiple focus targets are provided in a list then the first
     * valid target found will be focused. If focus target is a string then a lookup via `document.querySelector` is
     * performed. In this case you should provide a unique selector for the desired focus target.
     *
     * Note: The body of this method is postponed to the next clock tick to allow any changes in the DOM to occur that
     * might alter focus targets before applying.
     *
     * @param {A11yFocusSource|{ focusSource: A11yFocusSource }}   options - The focus options instance to apply.
     */
    static applyFocusSource(options: A11yFocusSource | {
        focusSource: A11yFocusSource;
    }): void;
    /**
     * Returns first focusable element within a specified element.
     *
     * @param {HTMLElement|Document} [element=document] - Optional element to start query.
     *
     * @param {object} [options] - Optional parameters.
     *
     * @param {Iterable<string>} [options.ignoreClasses] - Iterable list of classes to ignore elements.
     *
     * @param {Set<HTMLElement>} [options.ignoreElements] - Set of elements to ignore.
     *
     * @returns {HTMLElement} First focusable child element
     */
    static getFirstFocusableElement(element?: HTMLElement | Document, options?: {
        ignoreClasses?: Iterable<string>;
        ignoreElements?: Set<HTMLElement>;
    }): HTMLElement;
    /**
     * Returns all focusable elements within a specified element.
     *
     * @param {HTMLElement|Document} [element=document] Optional element to start query.
     *
     * @param {object}            [options] - Optional parameters.
     *
     * @param {boolean}           [options.anchorHref=true] - When true anchors must have an HREF.
     *
     * @param {Iterable<string>}  [options.ignoreClasses] - Iterable list of classes to ignore elements.
     *
     * @param {Set<HTMLElement>}  [options.ignoreElements] - Set of elements to ignore.
     *
     * @param {string}            [options.selectors] - Custom list of focusable selectors for `querySelectorAll`.
     *
     * @returns {Array<HTMLElement>} Child keyboard focusable
     */
    static getFocusableElements(element?: HTMLElement | Document, { anchorHref, ignoreClasses, ignoreElements, selectors }?: {
        anchorHref?: boolean;
        ignoreClasses?: Iterable<string>;
        ignoreElements?: Set<HTMLElement>;
        selectors?: string;
    }): Array<HTMLElement>;
    /**
     * Returns the default focusable selectors query.
     *
     * @param {boolean}  [anchorHref=true] - When true anchors must have an HREF.
     *
     * @returns {string} Focusable selectors for `querySelectorAll`.
     */
    static "__#198161@#getFocusableSelectors"(anchorHref?: boolean): string;
    /**
     * Gets a A11yFocusSource object from the given DOM event allowing for optional X / Y screen space overrides.
     * Browsers (Firefox / Chrome) forwards a mouse event for the context menu keyboard button. Provides detection of
     * when the context menu event is from the keyboard. Firefox as of (1/23) does not provide the correct screen space
     * coordinates, so for keyboard context menu presses coordinates are generated from the centroid point of the
     * element.
     *
     * A default fallback element or selector string may be provided to provide the focus target. If the event comes from
     * the keyboard however the source focused element is inserted as the target with the fallback value appended to the
     * list of focus targets. When A11yFocusSource is applied by {@link A11yHelper.applyFocusSource} the target focus
     * list is iterated through until a connected target is found and focus applied.
     *
     * @param {object} options - Options
     *
     * @param {KeyboardEvent|MouseEvent}   [options.event] - The source DOM event.
     *
     * @param {boolean} [options.debug] - When true {@link A11yHelper.applyFocusSource} logs focus target data.
     *
     * @param {HTMLElement|string} [options.focusEl] - A specific HTMLElement or selector string as the focus target.
     *
     * @param {number}   [options.x] - Used when an event isn't provided; integer of event source in screen space.
     *
     * @param {number}   [options.y] - Used when an event isn't provided; integer of event source in screen space.
     *
     * @returns {A11yFocusSource} A A11yFocusSource object.
     *
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1426671
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=314314
     *
     * TODO: Evaluate / test against touch input devices.
     */
    static getFocusSource({ event, x, y, focusEl, debug }: {
        event?: KeyboardEvent | MouseEvent;
        debug?: boolean;
        focusEl?: HTMLElement | string;
        x?: number;
        y?: number;
    }): A11yFocusSource;
    /**
     * Returns first focusable element within a specified element.
     *
     * @param {HTMLElement|Document} [element=document] - Optional element to start query.
     *
     * @param {object} [options] - Optional parameters.
     *
     * @param {Iterable<string>} [options.ignoreClasses] - Iterable list of classes to ignore elements.
     *
     * @param {Set<HTMLElement>} [options.ignoreElements] - Set of elements to ignore.
     *
     * @returns {HTMLElement} First focusable child element
     */
    static getLastFocusableElement(element?: HTMLElement | Document, options?: {
        ignoreClasses?: Iterable<string>;
        ignoreElements?: Set<HTMLElement>;
    }): HTMLElement;
    /**
     * Tests if the given element is focusable.
     *
     * @param {HTMLElement} [el] - Element to test.
     *
     * @param {object} [options] - Optional parameters.
     *
     * @param {boolean} [options.anchorHref=true] - When true anchors must have an HREF.
     *
     * @param {Iterable<string>} [options.ignoreClasses] - Iterable list of classes to ignore elements.
     *
     * @returns {boolean} Element is focusable.
     */
    static isFocusable(el?: HTMLElement, { anchorHref, ignoreClasses }?: {
        anchorHref?: boolean;
        ignoreClasses?: Iterable<string>;
    }): boolean;
    /**
     * Convenience method to check if the given data is a valid focus source.
     *
     * @param {HTMLElement|string}   data - Either an HTMLElement or selector string.
     *
     * @returns {boolean} Is valid focus source.
     */
    static isFocusSource(data: HTMLElement | string): boolean;
}
/**
 * - Provides essential data to return focus to an HTMLElement after a series of UI
 * actions like working with context menus and modal dialogs.
 */
type A11yFocusSource = {
    /**
     * - When true logs to console the actions taken in {@link A11yHelper.applyFocusSource }.
     */
    debug?: boolean;
    /**
     * - List of targets to attempt to focus.
     */
    focusEl?: Iterable<HTMLElement | string>;
    /**
     * - The source of the event: 'keyboard' for instance.
     */
    source?: string;
    /**
     * - Potential X coordinate of initial event.
     */
    x?: number;
    /**
     * - Potential Y coordinate of initial event.
     */
    y?: number;
};

/**
 * Provides management of a single Promise that can be shared and accessed across JS & Svelte components. This allows a
 * Promise to be created and managed as part of the TRL application lifecycle and accessed safely in various control
 * flow scenarios. When resolution of the current managed Promise starts further interaction is prevented.
 *
 * Note: to enable debugging / log statements set the static `logging` variable to true.
 */
declare class ManagedPromise {
    /** @type {boolean} */
    static "__#198162@#logging": boolean;
    /**
     * Sets global logging enabled state.
     *
     * @param {boolean}  logging - New logging enabled state.
     */
    static set logging(arg: boolean);
    /**
     * @returns {boolean} Whether global logging is enabled.
     */
    static get logging(): boolean;
    /**
     * @returns {boolean} Whether there is an active managed Promise.
     */
    get isActive(): boolean;
    /**
     * @returns {boolean} Whether there is an active managed Promise and resolution is currently being processed.
     */
    get isProcessing(): boolean;
    /**
     * Resolves any current Promise with undefined and creates a new current Promise.
     *
     * @template T
     *
     * @param {object} opts - Options.
     *
     * @param {boolean}  [opts.reuse=false] - When true if there is an existing live Promise it is returned immediately.
     *
     * @returns {Promise<T>} The new current managed Promise.
     */
    create<T>({ reuse }?: {
        reuse?: boolean;
    }): Promise<T>;
    /**
     * Gets the current Promise if any.
     *
     * @returns {Promise<any>} Current Promise.
     */
    get(): Promise<any>;
    /**
     * Rejects the current Promise if applicable.
     *
     * @param {*}  [result] - Result to reject.
     *
     * @returns {boolean} Was the promise rejected.
     */
    reject(result?: any): boolean;
    /**
     * Resolves the current Promise if applicable.
     *
     * @param {*}  [result] - Result to resolve.
     *
     * @returns {boolean} Was the promise resolved.
     */
    resolve(result?: any): boolean;
    #private;
}

/**
 * Provides access to the Clipboard API for reading / writing text strings. This requires a secure context.
 *
 * Note: `writeText` will attempt to use the older `execCommand` if available when `navigator.clipboard` is not
 * available.
 */
declare class ClipboardAccess {
    /**
     * Uses `navigator.clipboard` if available to read text from the clipboard.
     *
     * Note: Always returns `undefined` when `navigator.clipboard` is not available or the clipboard contains the
     * empty string.
     *
     * @returns {Promise<string|undefined>} The current clipboard text or undefined.
     */
    static readText(): Promise<string | undefined>;
    /**
     * Uses `navigator.clipboard` if available then falls back to `document.execCommand('copy')` if available to copy
     * the given text to the clipboard.
     *
     * @param {string}   text - Text to copy to the browser clipboard.
     *
     * @returns {Promise<boolean>} Copy successful.
     */
    static writeText(text: string): Promise<boolean>;
}

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
 * Provides a managed dynamic style sheet / element useful in configuring global CSS variables. When creating an
 * instance of StyleManager you must provide a "document key" / string for the style element added. The style element
 * can be accessed via `document[docKey]`.
 *
 * Instances of StyleManager can also be versioned by supplying a positive integer greater than or equal to `1` via the
 * 'version' option. This version number is assigned to the associated style element. When a StyleManager instance is
 * created and there is an existing instance with a version that is lower than the current instance all CSS rules are
 * removed letting the higher version to take precedence. This isn't a perfect system and requires thoughtful
 * construction of CSS variables exposed, but allows multiple independently compiled TRL packages to load the latest
 * CSS variables. It is recommended to always set `overwrite` option of {@link StyleManager.setProperty} and
 * {@link StyleManager.setProperties} to `false` when loading initial values.
 */
declare class StyleManager {
    /**
     *
     * @param {object}   opts - Options.
     *
     * @param {string}   opts.docKey - Required key providing a link to a specific style sheet element.
     *
     * @param {string}   [opts.selector=:root] - Selector element.
     *
     * @param {Document} [opts.document] - Target document to load styles into.
     *
     * @param {number}   [opts.version] - An integer representing the version / level of styles being managed.
     *
     */
    constructor({ docKey, selector, document, version }?: {
        docKey: string;
        selector?: string;
        document?: Document;
        version?: number;
    });
    /**
     * @returns {string} Provides an accessor to get the `cssText` for the style sheet.
     */
    get cssText(): string;
    /**
     * @returns {number} Returns the version of this instance.
     */
    get version(): number;
    /**
     * Provides a copy constructor to duplicate an existing StyleManager instance into a new document.
     *
     * Note: This is used to support the `PopOut` module.
     *
     * @param {Document} [document] Target browser document to clone into.
     *
     * @returns {StyleManager} New style manager instance.
     */
    clone(document?: Document): StyleManager;
    get(): {};
    /**
     * Gets a particular CSS variable.
     *
     * @param {string}   key - CSS variable property key.
     *
     * @returns {string} Returns CSS variable value.
     */
    getProperty(key: string): string;
    /**
     * Set rules by property / value; useful for CSS variables.
     *
     * @param {Object<string, string>}  rules - An object with property / value string pairs to load.
     *
     * @param {boolean}                 [overwrite=true] - When true overwrites any existing values.
     */
    setProperties(rules: {
        [x: string]: string;
    }, overwrite?: boolean): void;
    /**
     * Sets a particular property.
     *
     * @param {string}   key - CSS variable property key.
     *
     * @param {string}   value - CSS variable value.
     *
     * @param {boolean}  [overwrite=true] - Overwrite any existing value.
     */
    setProperty(key: string, value: string, overwrite?: boolean): void;
    /**
     * Removes the property keys specified. If `keys` is an iterable list then all property keys in the list are removed.
     *
     * @param {Iterable<string>} keys - The property keys to remove.
     */
    removeProperties(keys: Iterable<string>): void;
    /**
     * Removes a particular CSS variable.
     *
     * @param {string}   key - CSS variable property key.
     *
     * @returns {string} CSS variable value when removed.
     */
    removeProperty(key: string): string;
    #private;
}

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

declare function klona<T>(input: T): T;

interface StateMachineOptions {
    readonly allowedTags?: Set<string>;
    readonly disallowedTags?: Set<string>;
    readonly tagReplacementText: string;
    readonly encodePlaintextTagDelimiters: boolean;
}
declare function striptags(text: string, options?: Partial<StateMachineOptions>): string;

/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a copy is produced. If the target and source property are object literals they are merged.
 * Deleting keys is supported by specifying a property starting with `-=`.
 *
 * @param {object}      target - Target object.
 *
 * @param {...object}   sourceObj - One or more source objects.
 *
 * @returns {object}    Target object.
 */
declare function deepMerge(target?: object, ...sourceObj: object[]): object;
/**
 * Tests for whether an object is iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
declare function isIterable(value: any): boolean;
/**
 * Tests for whether an object is async iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether value is async iterable.
 */
declare function isIterableAsync(value: any): boolean;
/**
 * Tests for whether object is not null and a typeof object.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Is it an object.
 */
declare function isObject(value: any): boolean;
/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: {}, new Object() or Object.create(null).
 *
 * @param {*} value - Any value
 *
 * @returns {boolean} Is it a plain object.
 */
declare function isPlainObject(value: any): boolean;
/**
 * Provides a way to safely access an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access.
 *
 * @param {*}        defaultValue - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns {object} The data object.
 */
declare function safeAccess(data: object, accessor: string, defaultValue?: any): object;
/**
 * Provides a way to safely set an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access.
 *
 * @param {*}        value - A new value to set if an entry for accessor is found.
 *
 * @param {string}   [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set',
 *                                       'set-undefined', 'sub'.
 *
 * @param {boolean}  [createMissing=true] - If true missing accessor entries will be created as objects
 *                                          automatically.
 *
 * @returns {boolean} True if successful.
 */
declare function safeSet(data: object, accessor: string, value: any, operation?: string, createMissing?: boolean): boolean;

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

export { A11yFocusSource, A11yHelper, ClipboardAccess, ManagedPromise, ParseDataTransferOptions, StackingContext, StyleManager, debounce, deepMerge, getStackingContext, getUUIDFromDataTransfer, hasAccessor, hasGetter, hasPrototype, hasSetter, hashCode, isApplicationShell, isHMRProxy, isIterable, isIterableAsync, isObject, isPlainObject, isSvelteComponent, klona, normalizeString, outroAndDestroy, parseSvelteConfig, safeAccess, safeSet, striptags, styleParsePixels, uuidv4 };
