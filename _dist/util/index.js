import { isObject, isIterable } from '@typhonjs-svelte/runtime-base/util/object';
import { group_outros, transition_out, check_outros } from 'svelte/internal';

/**
 * Provides several helpful utility methods for accessibility and keyboard navigation.
 */
class A11yHelper
{
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
   static applyFocusSource(options)
   {
      if (!isObject(options)) { return; }

      // Handle the case of receiving an object with embedded `focusSource`.
      const focusOpts = isObject(options?.focusSource) ? options.focusSource : options;

      setTimeout(() =>
      {
         const debug = typeof focusOpts.debug === 'boolean' ? focusOpts.debug : false;

         if (isIterable(focusOpts.focusEl))
         {
            if (debug)
            {
               console.debug(`A11yHelper.applyFocusSource debug - Attempting to apply focus target: `, focusOpts.focusEl);
            }

            for (const target of focusOpts.focusEl)
            {
               if (target instanceof HTMLElement && target.isConnected)
               {
                  target.focus();
                  if (debug)
                  {
                     console.debug(`A11yHelper.applyFocusSource debug - Applied focus to target: `, target);
                  }
                  break;
               }
               else if (typeof target === 'string')
               {
                  const element = document.querySelector(target);
                  if (element instanceof HTMLElement && element.isConnected)
                  {
                     element.focus();
                     if (debug)
                     {
                        console.debug(`A11yHelper.applyFocusSource debug - Applied focus to target: `, element);
                     }
                     break;
                  }
                  else if (debug)
                  {
                     console.debug(`A11yHelper.applyFocusSource debug - Could not query selector: `, target);
                  }
               }
            }
         }
         else if (debug)
         {
            console.debug(`A11yHelper.applyFocusSource debug - No focus targets defined.`);
         }
      }, 0);
   }

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
   static getFirstFocusableElement(element = document, options)
   {
      const focusableElements = this.getFocusableElements(element, options);

      return focusableElements.length > 0 ? focusableElements[0] : void 0;
   }

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
   static getFocusableElements(element = document, { anchorHref = true, ignoreClasses, ignoreElements, selectors } = {})
   {
      if (!(element instanceof HTMLElement) && !(element instanceof Document))
      {
         throw new TypeError(`'element' is not a HTMLElement or Document instance.`);
      }

      if (typeof anchorHref !== 'boolean')
      {
         throw new TypeError(`'anchorHref' is not a boolean.`);
      }

      if (ignoreClasses !== void 0 && !isIterable(ignoreClasses))
      {
         throw new TypeError(`'ignoreClasses' is not an iterable list.`);
      }

      if (ignoreElements !== void 0 && !(ignoreElements instanceof Set))
      {
         throw new TypeError(`'ignoreElements' is not a Set.`);
      }

      if (selectors !== void 0 && typeof selectors !== 'string')
      {
         throw new TypeError(`'selectors' is not a string.`);
      }

      const selectorQuery = selectors ?? this.#getFocusableSelectors(anchorHref);

      const allElements = [...element.querySelectorAll(selectorQuery)];

      if (ignoreElements && ignoreClasses)
      {
         return allElements.filter((el) =>
         {
            let hasIgnoreClass = false;
            for (const ignoreClass of ignoreClasses)
            {
               if (el.classList.contains(ignoreClass))
               {
                  hasIgnoreClass = true;
                  break;
               }
            }

            return !hasIgnoreClass && !ignoreElements.has(el) && el.style.display !== 'none' &&
             el.style.visibility !== 'hidden' && !el.hasAttribute('disabled') && !el.hasAttribute('inert') &&
              el.getAttribute('aria-hidden') !== 'true';
         });
      }
      else if (ignoreClasses)
      {
         return allElements.filter((el) =>
         {
            let hasIgnoreClass = false;
            for (const ignoreClass of ignoreClasses)
            {
               if (el.classList.contains(ignoreClass))
               {
                  hasIgnoreClass = true;
                  break;
               }
            }

            return !hasIgnoreClass && el.style.display !== 'none' && el.style.visibility !== 'hidden' &&
             !el.hasAttribute('disabled') && !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true';
         });
      }
      else if (ignoreElements)
      {
         return allElements.filter((el) =>
         {
            return !ignoreElements.has(el) && el.style.display !== 'none' && el.style.visibility !== 'hidden' &&
             !el.hasAttribute('disabled') && !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true';
         });
      }
      else
      {
         return allElements.filter((el) =>
         {
            return el.style.display !== 'none' && el.style.visibility !== 'hidden' && !el.hasAttribute('disabled') &&
             !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true';
         });
      }
   }

   /**
    * Returns the default focusable selectors query.
    *
    * @param {boolean}  [anchorHref=true] - When true anchors must have an HREF.
    *
    * @returns {string} Focusable selectors for `querySelectorAll`.
    */
   static #getFocusableSelectors(anchorHref = true)
   {
      return `button, [contenteditable=""], [contenteditable="true"], details summary:not([tabindex="-1"]), embed, a${
       anchorHref ? '[href]' : ''}, iframe, object, input:not([type=hidden]), select, textarea, ` +
        `[tabindex]:not([tabindex="-1"])`;
   }

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
   static getFocusSource({ event, x, y, focusEl, debug = false })
   {
      if (focusEl !== void 0 && !(focusEl instanceof HTMLElement) && typeof focusEl !== 'string')
      {
         throw new TypeError(
          `A11yHelper.getFocusSource error: 'focusEl' is not a HTMLElement or string.`);
      }

      if (debug !== void 0 && typeof debug !== 'boolean')
      {
         throw new TypeError(`A11yHelper.getFocusSource error: 'debug' is not a boolean.`);
      }

      // Handle the case when no event is provided and x, y, or focusEl is explicitly defined.
      if (event === void 0)
      {
         if (typeof x !== 'number')
         {
            throw new TypeError(`A11yHelper.getFocusSource error: 'event' not defined and 'x' is not a number.`);
         }

         if (typeof y !== 'number')
         {
            throw new TypeError(`A11yHelper.getFocusSource error: 'event' not defined and 'y' is not a number.`);
         }

         return {
            debug,
            focusEl: focusEl !== void 0 ? [focusEl] : void 0,
            x,
            y,
         };
      }

      if (!(event instanceof KeyboardEvent) && !(event instanceof MouseEvent))
      {
         throw new TypeError(`A11yHelper.getFocusSource error: 'event' is not a KeyboardEvent or MouseEvent.`);
      }

      if (x !== void 0 && !Number.isInteger(x))
      {
         throw new TypeError(`A11yHelper.getFocusSource error: 'x' is not a number.`);
      }

      if (y !== void 0 && !Number.isInteger(y))
      {
         throw new TypeError(`A11yHelper.getFocusSource error: 'y' is not a number.`);
      }

      /** @type {HTMLElement} */
      const targetEl = event.target;

      if (!(targetEl instanceof HTMLElement))
      {
         throw new TypeError(`A11yHelper.getFocusSource error: 'event.target' is not an HTMLElement.`);
      }

      const result = { debug };

      if (event instanceof MouseEvent)
      {
         // Firefox currently (1/23) does not correctly determine the location of a keyboard originated
         // context menu location, so calculate position from middle of the event target.
         // Firefox fires a mouse event for the context menu key.
         if (event?.button !== 2 && event.type === 'contextmenu')
         {
            const rect = targetEl.getBoundingClientRect();
            result.x = x ?? rect.left + (rect.width / 2);
            result.y = y ?? rect.top + (rect.height / 2);
            result.focusEl = focusEl !== void 0 ? [targetEl, focusEl] : [targetEl];
            result.source = 'keyboard';
         }
         else
         {
            result.x = x ?? event.pageX;
            result.y = y ?? event.pageY;
            result.focusEl = focusEl !== void 0 ? [focusEl] : void 0;
         }
      }
      else
      {
         const rect = targetEl.getBoundingClientRect();
         result.x = x ?? rect.left + (rect.width / 2);
         result.y = y ?? rect.top + (rect.height / 2);
         result.focusEl = focusEl !== void 0 ? [targetEl, focusEl] : [targetEl];
         result.source = 'keyboard';
      }

      return result;
   }

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
   static getLastFocusableElement(element = document, options)
   {
      const focusableElements = this.getFocusableElements(element, options);

      return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : void 0;
   }

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
   static isFocusable(el, { anchorHref = true, ignoreClasses } = {})
   {
      if (el === void 0 || el === null || !(el instanceof HTMLElement) || el?.hidden || !el?.isConnected)
      {
         return false;
      }

      if (typeof anchorHref !== 'boolean')
      {
         throw new TypeError(`'anchorHref' is not a boolean.`);
      }

      if (ignoreClasses !== void 0 && !isIterable(ignoreClasses))
      {
         throw new TypeError(`'ignoreClasses' is not an iterable list.`);
      }

      const contenteditableAttr = el.getAttribute('contenteditable');
      const contenteditableFocusable = typeof contenteditableAttr === 'string' &&
       (contenteditableAttr === '' || contenteditableAttr === 'true');

      const tabindexAttr = el.getAttribute('tabindex');
      const tabindexFocusable = typeof tabindexAttr === 'string' && tabindexAttr !== '-1';

      const isAnchor = el instanceof HTMLAnchorElement;

      if (contenteditableFocusable || tabindexFocusable || isAnchor || el instanceof HTMLButtonElement ||
       el instanceof HTMLDetailsElement || el instanceof HTMLEmbedElement || el instanceof HTMLIFrameElement ||
        el instanceof HTMLInputElement || el instanceof HTMLObjectElement || el instanceof HTMLSelectElement ||
         el instanceof HTMLTextAreaElement)
      {
         if (isAnchor && anchorHref && typeof el.getAttribute('href') !== 'string')
         {
            return false;
         }

         return el.style.display !== 'none' && el.style.visibility !== 'hidden' && !el.hasAttribute('disabled') &&
          !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true';
      }

      return false;
   }

   /**
    * Convenience method to check if the given data is a valid focus source.
    *
    * @param {HTMLElement|string}   data - Either an HTMLElement or selector string.
    *
    * @returns {boolean} Is valid focus source.
    */
   static isFocusSource(data)
   {
      return data instanceof HTMLElement || typeof data === 'string';
   }
}

/**
 * @typedef {object} A11yFocusSource - Provides essential data to return focus to an HTMLElement after a series of UI
 * actions like working with context menus and modal dialogs.
 *
 * @property {boolean} [debug] - When true logs to console the actions taken in {@link A11yHelper.applyFocusSource}.
 *
 * @property {Iterable<HTMLElement|string>} [focusEl] - List of targets to attempt to focus.
 *
 * @property {string} [source] - The source of the event: 'keyboard' for instance.
 *
 * @property {number} [x] - Potential X coordinate of initial event.
 *
 * @property {number} [y] - Potential Y coordinate of initial event.
 */

/**
 * Provides management of a single Promise that can be shared and accessed across JS & Svelte components. This allows a
 * Promise to be created and managed as part of the TRL application lifecycle and accessed safely in various control
 * flow scenarios. When resolution of the current managed Promise starts further interaction is prevented.
 *
 * Note: to enable debugging / log statements set the static `logging` variable to true.
 */
class ManagedPromise
{
   /** @type {boolean} */
   static #logging = false;

   /** @type {{ isProcessing?: boolean, promise?: Promise, reject: Function, resolve: Function }} */
   #current;

   /**
    * @returns {boolean} Whether global logging is enabled.
    */
   static get logging()
   {
      return this.#logging;
   }

   /**
    * @returns {boolean} Whether there is an active managed Promise.
    */
   get isActive()
   {
      return this.#current !== void 0;
   }

   /**
    * @returns {boolean} Whether there is an active managed Promise and resolution is currently being processed.
    */
   get isProcessing()
   {
      return this.#current !== void 0 ? this.#current.isProcessing : false;
   }

   /**
    * Sets global logging enabled state.
    *
    * @param {boolean}  logging - New logging enabled state.
    */
   static set logging(logging)
   {
      if (typeof logging !== 'boolean')
      {
         throw new TypeError(`[TRL] ManagedPromise.logging error: 'logging' is not a boolean.`);
      }

      this.#logging = logging;
   }

   // ----------------------------------------------------------------------------------------------------------------

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
   create({ reuse = false } = {})
   {
      if (typeof reuse !== 'boolean')
      {
         throw new TypeError(`[TRL] ManagedPromise.create error: 'reuse' is not a boolean.`);
      }

      if (reuse && this.#current !== void 0 && this.#current.promise instanceof Promise)
      {
         if (ManagedPromise.#logging)
         {
            console.warn(`[TRL] ManagedPromise.create info: Reusing / returning existing managed Promise.`);
         }

         return this.#current.promise;
      }

      if (this.#current !== void 0)
      {
         if (ManagedPromise.#logging)
         {
            console.warn(
             `[TRL] ManagedPromise.create info: Creating a new Promise and resolving existing immediately.`);
         }

         this.#current.resolve(void 0);
         this.#current = void 0;
      }

      const promise = new Promise((resolve, reject) =>
      {
         this.#current = {
            isProcessing: false,
            reject,
            resolve
         };
      });

      this.#current.promise = promise;

      return promise;
   }

   /**
    * Gets the current Promise if any.
    *
    * @returns {Promise<any>} Current Promise.
    */
   get()
   {
      return this.#current ? this.#current.promise : void 0;
   }

   /**
    * Rejects the current Promise if applicable.
    *
    * @param {*}  [result] - Result to reject.
    *
    * @returns {boolean} Was the promise rejected.
    */
   reject(result = void 0)
   {
      // Early out as Promise resolution is currently processing.
      if (this.#current !== void 0 && this.#current.isProcessing)
      {
         if (ManagedPromise.#logging)
         {
            console.warn(`[TRL] ManagedPromise.reject info: Currently processing promise.`);
         }

         return true;
      }

      if (this.#current !== void 0)
      {
         this.#current.isProcessing = true;

         if (result instanceof Promise)
         {
            result.then((value) =>
            {
               this.#current.reject(value);
               this.#current = void 0;
            }).catch((err) =>
            {
               this.#current.reject(err);
               this.#current = void 0;
            });
         }
         else
         {
            this.#current.reject(result);
            this.#current = void 0;
         }

         return true;
      }
      else
      {
         if (ManagedPromise.#logging)
         {
            console.warn(`[TRL] ManagedPromise.reject warning: No current managed Promise to reject.`);
         }

         return false;
      }
   }

   /**
    * Resolves the current Promise if applicable.
    *
    * @param {*}  [result] - Result to resolve.
    *
    * @returns {boolean} Was the promise resolved.
    */
   resolve(result = void 0)
   {
      // Early out as Promise resolution is currently processing.
      if (this.#current !== void 0 && this.#current.isProcessing)
      {
         if (ManagedPromise.#logging)
         {
            console.warn(`[TRL] ManagedPromise.resolve info: Currently processing promise.`);
         }

         return true;
      }

      if (this.#current !== void 0)
      {
         if (result instanceof Promise)
         {
            this.#current.isProcessing = true;

            result.then((value) =>
            {
               this.#current.resolve(value);
               this.#current = void 0;
            }).catch((err) =>
            {
               this.#current.reject(err);
               this.#current = void 0;
            });
         }
         else
         {
            this.#current.resolve(result);
            this.#current = void 0;
         }

         return true;
      }
      else
      {
         if (ManagedPromise.#logging)
         {
            console.warn(`[TRL] ManagedPromise.resolve warning: No current managed Promise to resolve.`);
         }

         return false;
      }
   }
}

/**
 * Provides utility methods for checking browser capabilities.
 *
 * @see https://kilianvalkhof.com/2021/web/detecting-media-query-support-in-css-and-javascript/
 * TODO: perhaps add support for various standard media query checks for level 4 & 5.
 */
class BrowserSupports
{
   /**
    * Check for container query support.
    *
    * @returns {boolean} True if container queries supported.
    */
   static get containerQueries()
   {
      return 'container' in document.documentElement.style;
   }
}

/**
 * Provides access to the Clipboard API for reading / writing text strings. This requires a secure context.
 *
 * Note: `writeText` will attempt to use the older `execCommand` if available when `navigator.clipboard` is not
 * available.
 */
class ClipboardAccess
{
   /**
    * Uses `navigator.clipboard` if available to read text from the clipboard.
    *
    * Note: Always returns `undefined` when `navigator.clipboard` is not available or the clipboard contains the
    * empty string.
    *
    * @returns {Promise<string|undefined>} The current clipboard text or undefined.
    */
   static async readText()
   {
      let result;

      if (globalThis?.navigator?.clipboard)
      {
         try
         {
            result = await globalThis.navigator.clipboard.readText();
         }
         catch (err) { /**/ }
      }

      return result === '' ? void 0 : result;
   }

   /**
    * Uses `navigator.clipboard` if available then falls back to `document.execCommand('copy')` if available to copy
    * the given text to the clipboard.
    *
    * @param {string}   text - Text to copy to the browser clipboard.
    *
    * @returns {Promise<boolean>} Copy successful.
    */
   static async writeText(text)
   {
      if (typeof text !== 'string')
      {
         throw new TypeError(`ClipboardAccess.writeText error: 'text' is not a string.`);
      }

      let success = false;

      if (globalThis?.navigator?.clipboard)
      {
         try
         {
            await globalThis.navigator.clipboard.writeText(text);
            success = true;
         }
         catch (err) { /**/ }
      }
      else if (globalThis?.document?.execCommand instanceof Function)
      {
         const textArea = globalThis.document.createElement('textarea');

         // Place in the top-left corner of screen regardless of scroll position.
         textArea.style.position = 'fixed';
         textArea.style.top = '0';
         textArea.style.left = '0';

         // Ensure it has a small width and height. Setting to 1px / 1em
         // doesn't work as this gives a negative w/h on some browsers.
         textArea.style.width = '2em';
         textArea.style.height = '2em';

         // We don't need padding, reducing the size if it does flash render.
         textArea.style.padding = '0';

         // Clean up any borders.
         textArea.style.border = 'none';
         textArea.style.outline = 'none';
         textArea.style.boxShadow = 'none';

         // Avoid flash of the white box if rendered for any reason.
         textArea.style.background = 'transparent';

         textArea.value = text;

         globalThis.document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();

         try
         {
            success = document.execCommand('copy');
         }
         catch (err) { /**/ }

         document.body.removeChild(textArea);
      }

      return success;
   }
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
function getStackingContext(node)
{
   // the root element (HTML).
   if (!node || node.nodeName === 'HTML')
   {
      return { node: document.documentElement, reason: 'root' };
   }

   // handle shadow root elements.
   if (node.nodeName === '#document-fragment')
   {
      return getStackingContext(node.host);
   }

   const computedStyle = globalThis.getComputedStyle(node);

   // position: fixed or sticky.
   if (computedStyle.position === 'fixed' || computedStyle.position === 'sticky')
   {
      return { node, reason: `position: ${computedStyle.position}` };
   }

   // positioned (absolutely or relatively) with a z-index value other than "auto".
   if (computedStyle.zIndex !== 'auto' && computedStyle.position !== 'static')
   {
      return { node, reason: `position: ${computedStyle.position}; z-index: ${computedStyle.zIndex}` };
   }

   // elements with an opacity value less than 1.
   if (computedStyle.opacity !== '1')
   {
      return { node, reason: `opacity: ${computedStyle.opacity}` };
   }

   // elements with a transform value other than "none".
   if (computedStyle.transform !== 'none')
   {
      return { node, reason: `transform: ${computedStyle.transform}` };
   }

   // elements with a mix-blend-mode value other than "normal".
   if (computedStyle.mixBlendMode !== 'normal')
   {
      return { node, reason: `mixBlendMode: ${computedStyle.mixBlendMode}` };
   }

   // elements with a filter value other than "none".
   if (computedStyle.filter !== 'none')
   {
      return { node, reason: `filter: ${computedStyle.filter}` };
   }

   // elements with a perspective value other than "none".
   if (computedStyle.perspective !== 'none')
   {
      return { node, reason: `perspective: ${computedStyle.perspective}` };
   }

   // elements with a clip-path value other than "none".
   if (computedStyle.clipPath !== 'none')
   {
      return { node, reason: `clip-path: ${computedStyle.clipPath} ` };
   }

   // elements with a mask value other than "none".
   const mask = computedStyle.mask || computedStyle.webkitMask;
   if (mask !== 'none' && mask !== undefined)
   {
      return { node, reason: `mask:  ${mask}` };
   }

   // elements with a mask-image value other than "none".
   const maskImage = computedStyle.maskImage || computedStyle.webkitMaskImage;
   if (maskImage !== 'none' && maskImage !== undefined)
   {
      return { node, reason: `mask-image: ${maskImage}` };
   }

   // elements with a mask-border value other than "none".
   const maskBorder = computedStyle.maskBorder || computedStyle.webkitMaskBorder;
   if (maskBorder !== 'none' && maskBorder !== undefined)
   {
      return { node, reason: `mask-border: ${maskBorder}` };
   }

   // elements with isolation set to "isolate".
   if (computedStyle.isolation === 'isolate')
   {
      return { node, reason: `isolation: ${computedStyle.isolation}` };
   }

   // transform or opacity in will-change even if you don't specify values for these attributes directly.
   if (computedStyle.willChange === 'transform' || computedStyle.willChange === 'opacity')
   {
      return { node, reason: `willChange: ${computedStyle.willChange}` };
   }

   // elements with -webkit-overflow-scrolling set to "touch".
   if (computedStyle.webkitOverflowScrolling === 'touch')
   {
      return { node, reason: '-webkit-overflow-scrolling: touch' };
   }

   // an item with a z-index value other than "auto".
   if (computedStyle.zIndex !== 'auto')
   {
      const parentStyle = globalThis.getComputedStyle(node.parentNode);
      // with a flex|inline-flex parent.
      if (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex')
      {
         return { node, reason: `flex-item; z-index: ${computedStyle.zIndex}` };
         // with a grid parent.
      }
      else if (parentStyle.grid !== 'none / none / none / row / auto / auto')
      {
         return { node, reason: `child of grid container; z-index: ${computedStyle.zIndex}` };
      }
   }

   // contain with a value of layout, or paint, or a composite value that includes either of them
   const contain = computedStyle.contain;
   if (['layout', 'paint', 'strict', 'content'].indexOf(contain) > -1 ||
    contain.indexOf('paint') > -1 ||
    contain.indexOf('layout') > -1
   )
   {
      return { node, reason: `contain: ${contain}` };
   }

   return getStackingContext(node.parentNode);
}

/**
 * @typedef {object} StackingContext
 *
 * @property {Element} node - A DOM Element.
 *
 * @property {string}  reason - Reason for why a stacking context was created.
 */

const s_REGEX = /(\d+)\s*px/;

/**
 * Parses a pixel string / computed styles. Ex. `100px` returns `100`.
 *
 * @param {string}   value - Value to parse.
 *
 * @returns {number|undefined} The integer component of a pixel string.
 */
function styleParsePixels(value)
{
   if (typeof value !== 'string') { return void 0; }

   const isPixels = s_REGEX.test(value);
   const number = parseInt(value);

   return isPixels && Number.isFinite(number) ? number : void 0;
}

/**
 * Provides a managed dynamic style sheet / element useful in configuring global CSS variables. When creating an
 * instance of TJSStyleManager you must provide a "document key" / string for the style element added. The style element
 * can be accessed via `document[docKey]`.
 *
 * Instances of TJSStyleManager can also be versioned by supplying a positive integer greater than or equal to `1` via
 * the 'version' option. This version number is assigned to the associated style element. When a TJSStyleManager
 * instance is created and there is an existing instance with a version that is lower than the current instance all CSS
 * rules are removed letting the higher version to take precedence. This isn't a perfect system and requires thoughtful
 * construction of CSS variables exposed, but allows multiple independently compiled TRL packages to load the latest
 * CSS variables. It is recommended to always set `overwrite` option of {@link TJSStyleManager.setProperty} and
 * {@link TJSStyleManager.setProperties} to `false` when loading initial values.
 */
class TJSStyleManager
{
   /** @type {CSSStyleRule} */
   #cssRule;

   /** @type {string} */
   #docKey;

   /** @type {string} */
   #selector;

   /** @type {HTMLStyleElement} */
   #styleElement;

   /** @type {number} */
   #version;

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
    */
   constructor({ docKey, selector = ':root', document = globalThis.document, version } = {})
   {
      if (typeof docKey !== 'string') { throw new TypeError(`StyleManager error: 'docKey' is not a string.`); }

      // TODO: Verify 'document' type from Popout FVTT module. For some reason the popout document trips this
      //  unintentionally.
      // if (!(document instanceof Document))
      // {
      //    throw new TypeError(`TJSStyleManager error: 'document' is not an instance of Document.`);
      // }

      if (typeof selector !== 'string') { throw new TypeError(`StyleManager error: 'selector' is not a string.`); }

      if (version !== void 0 && !Number.isSafeInteger(version) && version < 1)
      {
         throw new TypeError(`StyleManager error: 'version' is defined and is not a positive integer >= 1.`);
      }

      this.#selector = selector;
      this.#docKey = docKey;
      this.#version = version;

      if (document[this.#docKey] === void 0)
      {
         this.#styleElement = document.createElement('style');

         document.head.append(this.#styleElement);

         // Set initial style manager version if any supplied.
         this.#styleElement._STYLE_MANAGER_VERSION = version;

         this.#styleElement.sheet.insertRule(`${selector} {}`, 0);

         this.#cssRule = this.#styleElement.sheet.cssRules[0];

         document[docKey] = this.#styleElement;
      }
      else
      {
         this.#styleElement = document[docKey];
         this.#cssRule = this.#styleElement.sheet.cssRules[0];

         if (version)
         {
            const existingVersion = this.#styleElement._STYLE_MANAGER_VERSION ?? 0;

            // Remove all existing CSS rules / text if version is greater than existing version.
            if (version > existingVersion)
            {
               this.#cssRule.style.cssText = '';
            }
         }
      }
   }

   /**
    * @returns {string} Provides an accessor to get the `cssText` for the style sheet.
    */
   get cssText()
   {
      return this.#cssRule.style.cssText;
   }

   /**
    * @returns {number} Returns the version of this instance.
    */
   get version()
   {
      return this.#version;
   }

   /**
    * Provides a copy constructor to duplicate an existing TJSStyleManager instance into a new document.
    *
    * Note: This is used to support the `PopOut` module.
    *
    * @param {Document} [document] Target browser document to clone into.
    *
    * @returns {TJSStyleManager} New style manager instance.
    */
   clone(document = globalThis.document)
   {
      const newStyleManager = new TJSStyleManager({
         selector: this.#selector,
         docKey: this.#docKey,
         document,
         version: this.#version
      });

      newStyleManager.#cssRule.style.cssText = this.#cssRule.style.cssText;

      return newStyleManager;
   }

   get()
   {
      const cssText = this.#cssRule.style.cssText;

      const result = {};

      if (cssText !== '')
      {
         for (const entry of cssText.split(';'))
         {
            if (entry !== '')
            {
               const values = entry.split(':');
               result[values[0].trim()] = values[1];
            }
         }
      }

      return result;
   }

   /**
    * Gets a particular CSS variable.
    *
    * @param {string}   key - CSS variable property key.
    *
    * @returns {string} Returns CSS variable value.
    */
   getProperty(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`StyleManager error: 'key' is not a string.`); }

      return this.#cssRule.style.getPropertyValue(key);
   }

   /**
    * Set rules by property / value; useful for CSS variables.
    *
    * @param {{ [key: string]: string }}  rules - An object with property / value string pairs to load.
    *
    * @param {boolean}                 [overwrite=true] - When true overwrites any existing values.
    */
   setProperties(rules, overwrite = true)
   {
      if (!isObject(rules)) { throw new TypeError(`StyleManager error: 'rules' is not an object.`); }

      if (typeof overwrite !== 'boolean') { throw new TypeError(`StyleManager error: 'overwrite' is not a boolean.`); }

      if (overwrite)
      {
         for (const [key, value] of Object.entries(rules))
         {
            this.#cssRule.style.setProperty(key, value);
         }
      }
      else
      {
         // Only set property keys for entries that don't have an existing rule set.
         for (const [key, value] of Object.entries(rules))
         {
            if (this.#cssRule.style.getPropertyValue(key) === '')
            {
               this.#cssRule.style.setProperty(key, value);
            }
         }
      }
   }

   /**
    * Sets a particular property.
    *
    * @param {string}   key - CSS variable property key.
    *
    * @param {string}   value - CSS variable value.
    *
    * @param {boolean}  [overwrite=true] - Overwrite any existing value.
    */
   setProperty(key, value, overwrite = true)
   {
      if (typeof key !== 'string') { throw new TypeError(`StyleManager error: 'key' is not a string.`); }

      if (typeof value !== 'string') { throw new TypeError(`StyleManager error: 'value' is not a string.`); }

      if (typeof overwrite !== 'boolean') { throw new TypeError(`StyleManager error: 'overwrite' is not a boolean.`); }

      if (overwrite)
      {
         this.#cssRule.style.setProperty(key, value);
      }
      else
      {
         if (this.#cssRule.style.getPropertyValue(key) === '')
         {
            this.#cssRule.style.setProperty(key, value);
         }
      }
   }

   /**
    * Removes the property keys specified. If `keys` is an iterable list then all property keys in the list are removed.
    *
    * @param {Iterable<string>} keys - The property keys to remove.
    */
   removeProperties(keys)
   {
      if (!isIterable(keys)) { throw new TypeError(`StyleManager error: 'keys' is not an iterable list.`); }

      for (const key of keys)
      {
         if (typeof key === 'string') { this.#cssRule.style.removeProperty(key); }
      }
   }

   /**
    * Removes a particular CSS variable.
    *
    * @param {string}   key - CSS variable property key.
    *
    * @returns {string} CSS variable value when removed.
    */
   removeProperty(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`StyleManager error: 'key' is not a string.`); }

      return this.#cssRule.style.removeProperty(key);
   }
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

export { A11yHelper, BrowserSupports, ClipboardAccess, ManagedPromise, TJSStyleManager, debounce, getStackingContext, getUUIDFromDataTransfer, hashCode, isApplicationShell, isHMRProxy, isSvelteComponent, isTJSSvelteConfig, normalizeString, outroAndDestroy, parseTJSSvelteConfig, striptags, styleParsePixels, uuidv4 };
//# sourceMappingURL=index.js.map
