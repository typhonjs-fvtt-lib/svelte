import { isObject } from '@typhonjs-svelte/runtime-base/util/object';
import { group_outros, transition_out, check_outros } from 'svelte/internal';

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
function hashCode(str, seed = 0)
{
   if (typeof str !== 'string') { return 0; }

   let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;

   for (let ch, i = 0; i < str.length; i++)
   {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
   }

   h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
   h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

   return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const s_UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

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
function uuidv4()
{
   return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (globalThis.crypto || globalThis.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

/**
 * Validates that the given string is formatted as a UUIDv4 string.
 *
 * @param {string}   uuid - UUID string to test.
 *
 * @returns {boolean} Is UUIDv4 string.
 */
uuidv4.isValid = (uuid) => s_UUIDV4_REGEX.test(uuid);

/**
 * Normalizes a string.
 *
 * @param {string}   query - A string to normalize for comparisons.
 *
 * @returns {string} Cleaned string.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */
function normalizeString(query)
{
   return query.trim().normalize('NFD').replace(/[\x00-\x1F]/gm, ''); // eslint-disable-line no-control-regex
}

/**
 * Defines the application shell contract. If Svelte components export getter / setters for the following properties
 * then that component is considered an application shell.
 *
 * @type {string[]}
 */
const applicationShellContract = ['elementRoot'];

Object.freeze(applicationShellContract);

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
function isApplicationShell(component)
{
   if (component === null || component === void 0) { return false; }

   let compHasContract = true;
   let protoHasContract = true;

   // Check for accessors on the instance.
   for (const accessor of applicationShellContract)
   {
      const descriptor = Object.getOwnPropertyDescriptor(component, accessor);
      if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) { compHasContract = false; }
   }

   // Get the prototype which is the parent SvelteComponent that has any getter / setters.
   const prototype = Object.getPrototypeOf(component);

   // Verify the application shell contract. If the accessors (getters / setters) are defined for
   // `applicationShellContract`.
   for (const accessor of applicationShellContract)
   {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, accessor);
      if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) { protoHasContract = false; }
   }

   return compHasContract || protoHasContract;
}

/**
 * Provides basic duck typing to determine if the provided object is a HMR ProxyComponent instance or class.
 *
 * @param {*}  comp - Data to check as a HMR proxy component.
 *
 * @returns {boolean} Whether basic duck typing succeeds.
 */
function isHMRProxy(comp)
{
   const instanceName = comp?.constructor?.name;
   if (typeof instanceName === 'string' && (instanceName.startsWith('Proxy<') || instanceName === 'ProxyComponent'))
   {
      return true;
   }

   const prototypeName = comp?.prototype?.constructor?.name;
   return typeof prototypeName === 'string' && (prototypeName.startsWith('Proxy<') ||
    prototypeName === 'ProxyComponent');
}

/**
 * Provides basic duck typing to determine if the provided function is a constructor function for a Svelte component.
 *
 * @param {*}  comp - Data to check as a Svelte component.
 *
 * @returns {boolean} Whether basic duck typing succeeds.
 */
function isSvelteComponent(comp)
{
   if (comp === null || comp === void 0 || typeof comp !== 'function') { return false; }

   // When using Vite in a developer build the SvelteComponent is wrapped in a ProxyComponent class.
   // This class doesn't define methods on the prototype, so we must check if the constructor name
   // starts with `Proxy<` as it provides the wrapped component as `Proxy<_wrapped component name_>`.
   const prototypeName = comp?.prototype?.constructor?.name;
   if (typeof prototypeName === 'string' && (prototypeName.startsWith('Proxy<') || prototypeName === 'ProxyComponent'))
   {
      return true;
   }

   return typeof window !== void 0 ?
    typeof comp.prototype.$destroy === 'function' && typeof comp.prototype.$on === 'function' : // client-side
     typeof comp.render === 'function'; // server-side
}

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
function isTJSSvelteConfig(config, raiseException = false)
{
   if (!isObject(config))
   {
      if (raiseException) { throw new TypeError(`isTJSSvelteConfig error: 'config' is not an object.`); }
      return false;
   }

   if (!isSvelteComponent(config.class))
   {
      if (raiseException)
      {
         throw new TypeError(`isTJSSvelteConfig error: 'config.class' is not a Svelte component constructor.`);
      }
      return false;
   }

   return true;
}

/* eslint-disable */  // jsdoc/valid-types doesn't like the Google closure constructor function. TODO: verify in future eslint-plugin-jsdoc version
/**
 * @typedef {object} TJSSvelteConfig
 *
 * @property {{ new(options: import('#svelte').ComponentConstructorOptions): import('#svelte').SvelteComponent | import('#svelte').SvelteComponentTyped }} class -
 *
 * @property {Element|Document|ShadowRoot}   [target=document.body] -
 *
 * @property {Element} [anchor] -
 *
 * @property {() => Record<string, *> | Record<string, *>} [props] -
 *
 * @property {() => (Record<string, *> | Map<string, *>) | Map<string, *> | Record<string, *>} [context] -
 *
 * @property {boolean}  [hydrate] -
 *
 * @property {boolean} [intro] -
 *
 * @property {boolean}  [$$inline] -
 */
/* eslint-enable */

/**
 * Runs outro transition then destroys Svelte component.
 *
 * Workaround for https://github.com/sveltejs/svelte/issues/4056
 *
 * @param {*}  instance - A Svelte component.
 */
async function outroAndDestroy(instance)
{
   return new Promise((resolve) =>
   {
      if (instance.$$.fragment && instance.$$.fragment.o)
      {
         group_outros();
         transition_out(instance.$$.fragment, 0, 0, () =>
         {
            instance.$destroy();
            resolve();
         });
         check_outros();
      }
      else
      {
         instance.$destroy();
         resolve();
      }
   });
}

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
function parseTJSSvelteConfig(config, thisArg = void 0)
{
   if (typeof config !== 'object')
   {
      throw new TypeError(`parseSvelteConfig - 'config' is not an object:\n${JSON.stringify(config)}.`);
   }

   if (!isSvelteComponent(config.class))
   {
      throw new TypeError(
       `parseSvelteConfig - 'class' is not a Svelte component constructor for config:\n${JSON.stringify(config)}.`);
   }

   if (config.hydrate !== void 0 && typeof config.hydrate !== 'boolean')
   {
      throw new TypeError(
       `parseSvelteConfig - 'hydrate' is not a boolean for config:\n${JSON.stringify(config)}.`);
   }

   if (config.intro !== void 0 && typeof config.intro !== 'boolean')
   {
      throw new TypeError(
       `parseSvelteConfig - 'intro' is not a boolean for config:\n${JSON.stringify(config)}.`);
   }

   if (config.target !== void 0 && typeof config.target !== 'string' && !(config.target instanceof HTMLElement) &&
    !(config.target instanceof ShadowRoot) && !(config.target instanceof DocumentFragment))
   {
      throw new TypeError(
       `parseSvelteConfig - 'target' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:\n${
        JSON.stringify(config)}.`);
   }

   if (config.anchor !== void 0 && typeof config.anchor !== 'string' && !(config.anchor instanceof HTMLElement) &&
    !(config.anchor instanceof ShadowRoot) && !(config.anchor instanceof DocumentFragment))
   {
      throw new TypeError(
       `parseSvelteConfig - 'anchor' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:\n${
        JSON.stringify(config)}.`);
   }

   if (config.context !== void 0 && typeof config.context !== 'function' && !(config.context instanceof Map) &&
    typeof config.context !== 'object')
   {
      throw new TypeError(
       `parseSvelteConfig - 'context' is not a Map, function or object for config:\n${JSON.stringify(config)}.`);
   }

   // Validate extra TyphonJS options --------------------------------------------------------------------------------

   // `selectorTarget` optionally stores a target element found in main element.
   if (config.selectorTarget !== void 0 && typeof config.selectorTarget !== 'string')
   {
      throw new TypeError(
       `parseSvelteConfig - 'selectorTarget' is not a string for config:\n${JSON.stringify(config)}.`);
   }

   // `options` stores `injectApp`, `injectEventbus`, and `selectorElement`.
   if (config.options !== void 0 && typeof config.options !== 'object')
   {
      throw new TypeError(
       `parseSvelteConfig - 'options' is not an object for config:\n${JSON.stringify(config)}.`);
   }

   // Validate TyphonJS standard options.
   if (config.options !== void 0)
   {
      if (config.options.injectApp !== void 0 && typeof config.options.injectApp !== 'boolean')
      {
         throw new TypeError(
          `parseSvelteConfig - 'options.injectApp' is not a boolean for config:\n${JSON.stringify(config)}.`);
      }

      if (config.options.injectEventbus !== void 0 && typeof config.options.injectEventbus !== 'boolean')
      {
         throw new TypeError(
          `parseSvelteConfig - 'options.injectEventbus' is not a boolean for config:\n${JSON.stringify(config)}.`);
      }

      // `selectorElement` optionally stores a main element selector to be found in a HTMLElement target.
      if (config.options.selectorElement !== void 0 && typeof config.options.selectorElement !== 'string')
      {
         throw new TypeError(
          `parseSvelteConfig - 'selectorElement' is not a string for config:\n${JSON.stringify(config)}.`);
      }
   }

   const svelteConfig = { ...config };

   // Delete extra Svelte options.
   delete svelteConfig.options;

   let externalContext = {};

   // If a context callback function is provided then invoke it with `this` being the Foundry app.
   // If an object is returned it adds the entries to external context.
   if (typeof svelteConfig.context === 'function')
   {
      const contextFunc = svelteConfig.context;
      delete svelteConfig.context;

      const result = contextFunc.call(thisArg);
      if (isObject(result))
      {
         externalContext = { ...result };
      }
      else
      {
         throw new Error(`parseSvelteConfig - 'context' is a function that did not return an object for config:\n${
          JSON.stringify(config)}`);
      }
   }
   else if (svelteConfig.context instanceof Map)
   {
      externalContext = Object.fromEntries(svelteConfig.context);
      delete svelteConfig.context;
   }
   else if (isObject(svelteConfig.context))
   {
      externalContext = svelteConfig.context;
      delete svelteConfig.context;
   }

   // If a props is a function then invoke it with `this` being the Foundry app.
   // If an object is returned set it as the props.
   svelteConfig.props = s_PROCESS_PROPS(svelteConfig.props, thisArg, config);

   // Process children components attaching to external context.
   if (Array.isArray(svelteConfig.children))
   {
      const children = [];

      for (let cntr = 0; cntr < svelteConfig.children.length; cntr++)
      {
         const child = svelteConfig.children[cntr];

         if (!isSvelteComponent(child.class))
         {
            throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for child[${cntr}] for config:\n${
             JSON.stringify(config)}`);
         }

         child.props = s_PROCESS_PROPS(child.props, thisArg, config);

         children.push(child);
      }

      if (children.length > 0)
      {
         externalContext.children = children;
      }

      delete svelteConfig.children;
   }
   else if (isObject(svelteConfig.children))
   {
      if (!isSvelteComponent(svelteConfig.children.class))
      {
         throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for children object for config:\n${
          JSON.stringify(config)}`);
      }

      svelteConfig.children.props = s_PROCESS_PROPS(svelteConfig.children.props, thisArg, config);

      externalContext.children = [svelteConfig.children];
      delete svelteConfig.children;
   }

   if (!(svelteConfig.context instanceof Map))
   {
      svelteConfig.context = new Map();
   }

   svelteConfig.context.set('#external', externalContext);

   return svelteConfig;
}

/**
 * Processes Svelte props. Potentially props can be a function to invoke with `thisArg`.
 *
 * @param {object|Function}   props - Svelte props.
 *
 * @param {*}                 thisArg - `This` reference to set for invoking any props function.
 *
 * @param {object}            config - Svelte config
 *
 * @returns {object|void}     Svelte props.
 */
function s_PROCESS_PROPS(props, thisArg, config)
{
   // If a props is a function then invoke it with `this` being the Foundry app.
   // If an object is returned set it as the props.
   if (typeof props === 'function')
   {
      const result = props.call(thisArg);
      if (isObject(result))
      {
         return result;
      }
      else
      {
         throw new Error(`parseSvelteConfig - 'props' is a function that did not return an object for config:\n${
          JSON.stringify(config)}`);
      }
   }
   else if (isObject(props))
   {
      return props;
   }
   else if (props !== void 0)
   {
      throw new Error(
       `parseSvelteConfig - 'props' is not a function or an object for config:\n${JSON.stringify(config)}`);
   }

   return {};
}

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
function debounce(callback, delay)
{
   let timeoutId;

   return function(...args)
   {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { callback.apply(this, args); }, delay);
   };
}

function isSpace(character) {
    return character == " " || character == "\n" || character == "\r" || character == "\t";
}
function isQuote(character) {
    return character == '"' || character == "'";
}
const TAG_START = "<";
const TAG_END = ">";
const ENCODED_TAG_START = "&lt;";
const ENCODED_TAG_END = "&gt;";
class InPlaintextState {
    constructor(options) {
        this.options = options;
    }
    consume(character, transition) {
        if (character == TAG_START) {
            transition(new InTagNameState(this.options));
            return "";
        }
        else if (character == TAG_END && this.options.encodePlaintextTagDelimiters) {
            return ENCODED_TAG_END;
        }
        return character;
    }
}
class InTagNameState {
    constructor(options) {
        this.options = options;
        this.nameBuffer = "";
        this.isClosingTag = false;
    }
    consume(character, transition) {
        if (this.nameBuffer.length == 0) {
            if (isSpace(character)) {
                transition(new InPlaintextState(this.options));
                return ((this.options.encodePlaintextTagDelimiters ? ENCODED_TAG_START : "<") +
                    character);
            }
            if (character == "/") {
                this.isClosingTag = true;
                return "";
            }
        }
        if (isSpace(character)) {
            if (this.isNameBufferAnAllowedTag()) {
                transition(new InTagState(0 /* TagMode.Allowed */, this.options));
                return TAG_START + (this.isClosingTag ? "/" : "") + this.nameBuffer + character;
            }
            else {
                transition(new InTagState(1 /* TagMode.Disallowed */, this.options));
                return this.options.tagReplacementText;
            }
        }
        if (character == TAG_START) {
            this.nameBuffer += ENCODED_TAG_START;
            return "";
        }
        if (character == TAG_END) {
            transition(new InPlaintextState(this.options));
            if (this.isNameBufferAnAllowedTag()) {
                return TAG_START + (this.isClosingTag ? "/" : "") + this.nameBuffer + character;
            }
            else {
                return this.options.tagReplacementText;
            }
        }
        if (character == "-" && this.nameBuffer == "!-") {
            transition(new InCommentState(this.options));
            return "";
        }
        this.nameBuffer += character;
        return "";
    }
    isNameBufferAnAllowedTag() {
        const tagName = this.nameBuffer.toLowerCase();
        if (this.options.allowedTags) {
            return this.options.allowedTags.has(tagName);
        }
        else if (this.options.disallowedTags) {
            return !this.options.disallowedTags.has(tagName);
        }
        else {
            return false;
        }
    }
}
class InTagState {
    constructor(mode, options) {
        this.mode = mode;
        this.options = options;
    }
    consume(character, transition) {
        if (character == TAG_END) {
            transition(new InPlaintextState(this.options));
        }
        else if (isQuote(character)) {
            transition(new InQuotedStringInTagState(this.mode, character, this.options));
        }
        if (this.mode == 1 /* TagMode.Disallowed */) {
            return "";
        }
        if (character == TAG_START) {
            return ENCODED_TAG_START;
        }
        else {
            return character;
        }
    }
}
class InQuotedStringInTagState {
    constructor(mode, quoteCharacter, options) {
        this.mode = mode;
        this.quoteCharacter = quoteCharacter;
        this.options = options;
    }
    consume(character, transition) {
        if (character == this.quoteCharacter) {
            transition(new InTagState(this.mode, this.options));
        }
        if (this.mode == 1 /* TagMode.Disallowed */) {
            return "";
        }
        if (character == TAG_START) {
            return ENCODED_TAG_START;
        }
        else if (character == TAG_END) {
            return ENCODED_TAG_END;
        }
        else {
            return character;
        }
    }
}
class InCommentState {
    constructor(options) {
        this.options = options;
        this.consecutiveHyphens = 0;
    }
    consume(character, transition) {
        if (character == ">" && this.consecutiveHyphens >= 2) {
            transition(new InPlaintextState(this.options));
        }
        else if (character == "-") {
            this.consecutiveHyphens++;
        }
        else {
            this.consecutiveHyphens = 0;
        }
        return "";
    }
}

const DefaultStateMachineOptions = {
    tagReplacementText: "",
    encodePlaintextTagDelimiters: true,
};
class StateMachine {
    constructor(partialOptions = {}) {
        this.state = new InPlaintextState(Object.assign(Object.assign({}, DefaultStateMachineOptions), partialOptions));
        this.transitionFunction = ((next) => {
            this.state = next;
        }).bind(this);
    }
    consume(text) {
        let outputBuffer = "";
        for (const character of text) {
            outputBuffer += this.state.consume(character, this.transitionFunction);
        }
        return outputBuffer;
    }
}
function striptags(text, options = {}) {
    return new StateMachine(options).consume(text);
}

/**
 * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
 *
 * @param {object}   data - Drop transfer data.
 *
 * @param {ParseDataTransferOptions}   opts - Optional parameters.
 *
 * @returns {string|undefined} Foundry UUID for drop data.
 */
function getUUIDFromDataTransfer(data, { actor = true, compendium = true, world = true, types = void 0 } = {})
{
   if (typeof data !== 'object') { return void 0; }
   if (Array.isArray(types) && !types.includes(data.type)) { return void 0; }

   let uuid = void 0;

   if (typeof data.uuid === 'string') // v10 and above provides a full UUID.
   {
      const isCompendium = data.uuid.startsWith('Compendium');

      if (isCompendium && compendium)
      {
         uuid = data.uuid;
      }
      else if (world)
      {
         uuid = data.uuid;
      }
   }
   else // v9 and below parsing.
   {
      if (actor && world && data.actorId && data.type)
      {
         uuid = `Actor.${data.actorId}.${data.type}.${data.data._id}`;
      }
      else if (typeof data.id === 'string') // v9 and below uses `id`
      {
         if (compendium && typeof data.pack === 'string')
         {
            uuid = `Compendium.${data.pack}.${data.id}`;
         }
         else if (world)
         {
            uuid = `${data.type}.${data.id}`;
         }
      }
   }

   return uuid;
}

/**
 * @typedef {object} ParseDataTransferOptions
 *
 * @property {boolean}  [actor=true] - Accept actor owned documents.
 *
 * @property {boolean}  [compendium=true] - Accept compendium documents.
 *
 * @property {boolean}  [world=true] - Accept world documents.
 *
 * @property {string[]|undefined}   [types] - Require the `data.type` to match entry in `types`.
 */

export { debounce, getUUIDFromDataTransfer, hashCode, isApplicationShell, isHMRProxy, isSvelteComponent, isTJSSvelteConfig, normalizeString, outroAndDestroy, parseTJSSvelteConfig, striptags, uuidv4 };
//# sourceMappingURL=index.js.map
