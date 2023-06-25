/**
 * Tests for whether an object is iterable.
 *
 * @param {unknown} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
function isIterable(value) {
    if (value === null || value === void 0 || typeof value !== 'object') {
        return false;
    }
    return Symbol.iterator in value;
}

/**
 * Provides a readable store to track keys actively pressed. KeyStore is designed to be used with the {@link keyforward}
 * action.
 */
class KeyStore
{
   #keySet;

   /**
    * @type {Map<string, number>}
    */
   #keyMap = new Map();

   /**
    * @type {KeyStoreOptions}
    */
   #options = { preventDefault: true, useCode: true, stopPropagation: true };

   /**
    * Stores the subscribers.
    *
    * @type {(function(KeyStore): void)[]}
    */
   #subscriptions = [];

   /**
    * @param {Iterable<string>}  [keyNames] -
    *
    * @param {KeyStoreOptions}   [options] - Optional parameters
    */
   constructor(keyNames, options)
   {
      if (!isIterable(keyNames))
      {
         throw new TypeError(`'keyNames' is not an iterable list.`);
      }

      this.setOptions(options);

      this.#keySet = new Set(keyNames);
   }

   /**
    * Add given key to the tracking key set.
    *
    * @param {string}   key - Key to add.
    */
   addKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      this.#keySet.add(key);
   }

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
   anyPressed(keys)
   {
      // When no keys given then check if any key is pressed.
      if (keys === void 0) { return this.#keyMap.size > 0; }

      const isList = isIterable(keys);

      if (typeof keys !== 'string' && !isList)
      {
         throw new TypeError(`'keys' is not a string or iterable list of strings.`);
      }

      let result = false;

      if (isList)
      {
         for (const key of keys)
         {
            if (this.#keyMap.has(key))
            {
               result = true;
               break;
            }
         }
      }
      else
      {
         if (this.#keyMap.has(keys)) { result = true; }
      }

      return result;
   }

   /**
    * Is the given key in the tracking key set.
    *
    * @param {string}   key - Key to check.
    */
   hasKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      this.#keySet.has(key);
   }

   /**
    * Returns true if all given keys are pressed.
    *
    * @param {string|Iterable<string>} keys - One or more key strings to verify if pressed.
    *
    * @returns {boolean} Are all keys pressed.
    */
   isPressed(keys)
   {
      const isList = isIterable(keys);

      if (typeof keys !== 'string' && !isList)
      {
         throw new TypeError(`'keys' is not a string or iterable list of strings.`);
      }

      let result = true;

      if (isList)
      {
         for (const key of keys)
         {
            if (!this.#keyMap.has(key))
            {
               result = false;
               break;
            }
         }
      }
      else
      {
         if (!this.#keyMap.has(keys)) { result = false; }
      }

      return result;
   }

   /**
    * Handle keydown event adding any key from the tracked key set.
    *
    * @param {KeyboardEvent}  event - KeyboardEvent.
    */
   keydown(event)
   {
      const key = this.#options.useCode ? event.code : event.key;

      if (this.#keySet.has(key))
      {
         if (!this.#keyMap.has(key))
         {
            this.#keyMap.set(key, 1);
            this._updateSubscribers();
         }

         if (this.#options.preventDefault) { event.preventDefault(); }
         if (this.#options.stopPropagation) { event.stopPropagation(); }
      }
   }

   /**
    * @returns {IterableIterator<string>} Returns current pressed keys iterator.
    */
   keysPressed()
   {
      return this.#keyMap.keys();
   }

   /**
    * @returns {IterableIterator<string>} Returns currently tracked keys iterator.
    */
   keysTracked()
   {
      return this.#keySet.keys();
   }

   /**
    * Handle keyup event removing any key from the tracked key set.
    *
    * @param {KeyboardEvent}  event - KeyboardEvent.
    */
   keyup(event)
   {
      const key = this.#options.useCode ? event.code : event.key;

      if (this.#keySet.has(key))
      {
         if (this.#keyMap.has(key))
         {
            this.#keyMap.delete(key);
            this._updateSubscribers();
         }

         if (this.#options.preventDefault) { event.preventDefault(); }
         if (this.#options.stopPropagation) { event.stopPropagation(); }
      }
   }

   /**
    * Remove the given key from the tracking key set.
    *
    * @param {string}   key - Key to remove.
    */
   removeKey(key)
   {
      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }

      if (this.#keySet.has(key))
      {
         this.#keySet.delete(key);

         if (this.#keyMap.has(key))
         {
            this.#keyMap.delete(key);
            this._updateSubscribers();
         }
      }
   }

   /**
    * Update options.
    *
    * @param {KeyStoreOptions}   options - Options to set.
    */
   setOptions(options)
   {
      if (typeof options?.preventDefault === 'boolean') { this.#options.preventDefault = options.preventDefault; }
      if (typeof options?.useCode === 'boolean') { this.#options.useCode = options.useCode; }
      if (typeof options?.stopPropagation === 'boolean') { this.#options.stopPropagation = options.stopPropagation; }
   }

   /**
    * @param {string}   key - key or key code to lookup.
    *
    * @returns {number} 1 if currently pressed and 0 if not pressed.
    */
   value(key)
   {
      return this.#keyMap.has(key) ? 1 : 0;
   }

   // Store subscriber implementation --------------------------------------------------------------------------------

   /**
    * @param {function(KeyStore): void} handler - Callback function that is invoked on update / changes.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

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
    * @protected
    */
   _updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](this); }
   }
}

/**
 * @typedef {object} KeyStoreOptions
 *
 * @property {boolean}  [preventDefault=true] - Invoke `preventDefault` on key events.
 *
 * @property {boolean}  [useCode=true] - When true use `event.code` otherwise use `event.key` to get active key.
 *
 * @property {boolean}  [stopPropagation=true] - Invoke `stopPropagation` on key events.
 */

/**
 * Provides an action to forward on key down & up events. This can be any object that has associated `keydown` and
 * `keyup` methods. See {@link KeyStore} for a store implementation.
 *
 * @param {HTMLElement} node - Target element.
 *
 * @param {import('..').KeyStore}   keyStore - KeyStore to forward events key down / up events to...
 *
 * @returns {{update: (function(import('..').KeyStore): void), destroy: Function}} Action lifecycle methods.
 */
function keyforward(node, keyStore)
{
   if (typeof keyStore?.keydown !== 'function' || typeof keyStore.keyup !== 'function')
   {
      throw new TypeError(`'keyStore' doesn't have required 'keydown' or 'keyup' methods.`);
   }

   /**
    * @param {KeyboardEvent} event -
    */
   function onKeydown(event)
   {
      keyStore.keydown(event);
   }

   /**
    * @param {KeyboardEvent} event -
    */
   function onKeyup(event)
   {
      keyStore.keyup(event);
   }

   /**
    * Activates key listeners.
    */
   function activateListeners()
   {
      node.addEventListener('keydown', onKeydown);
      node.addEventListener('keyup', onKeyup);
   }

   /**
    * Removes key listeners.
    */
   function removeListeners()
   {
      node.removeEventListener('keydown', onKeydown);
      node.removeEventListener('keyup', onKeyup);
   }

   activateListeners();

   return {
      update: (newKeyStore) =>  // eslint-disable-line no-shadow
      {
         keyStore = newKeyStore;

         if (typeof keyStore?.keydown !== 'function' || typeof keyStore.keyup !== 'function')
         {
            throw new TypeError(`'newKeyStore' doesn't have required 'keydown' or 'keyup' methods.`);
         }
      },

      destroy: () => removeListeners()
   };
}

export { KeyStore, keyforward };
//# sourceMappingURL=index.js.map
