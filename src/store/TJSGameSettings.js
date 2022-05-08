import { isIterable }      from '@typhonjs-fvtt/svelte/util';
import { get, writable }   from 'svelte/store';

/**
 * Registers game settings and creates a backing Svelte store for each setting. It is possible to add multiple
 * `onChange` callbacks on registration.
 */
export class TJSGameSettings
{
   /**
    * @type {Map<string, GSWritableStore>}
    */
   #stores = new Map();

   /**
    * Returns a readable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {GSReadableStore|undefined} The associated store for the given game setting key.
    */
   getReadableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getStore: '${key}' is not a registered setting.`);
         return;
      }

      const store = s_GET_STORE(this.#stores, key);

      return { subscribe: store.subscribe, get: store.get };
   }

   /**
    * Returns a writable Game Settings store for the associated key.
    *
    * @param {string}   key - Game setting key.
    *
    * @returns {GSWritableStore|undefined} The associated store for the given game setting key.
    */
   getWritableStore(key)
   {
      if (!this.#stores.has(key))
      {
         console.warn(`TJSGameSettings - getStore: '${key}' is not a registered setting.`);
         return;
      }

      return s_GET_STORE(this.#stores, key);
   }

   /**
    * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
    */
   register(setting)
   {
      if (typeof setting !== 'object') { throw new TypeError(`TJSGameSettings - register: setting is not an object.`); }

      if (typeof setting.options !== 'object')
      {
         throw new TypeError(`TJSGameSettings - register: 'options' attribute is not an object.`);
      }

      const moduleId = setting.moduleId;
      const key = setting.key;

      /**
       * @type {GameSettingOptions}
       */
      const options = setting.options;

      const onchangeFunctions = [];

      // Handle loading any existing `onChange` callbacks.
      if (isIterable(options?.onChange))
      {
         for (const entry of options.onChange)
         {
            if (typeof entry === 'function') { onchangeFunctions.push(entry); }
         }
      }
      else if (typeof options.onChange === 'function')
      {
         onchangeFunctions.push(options.onChange);
      }

      // Provides an `onChange` callback to update the associated store.
      onchangeFunctions.push((value) =>
      {
         const store = s_GET_STORE(this.#stores, key);
         if (store) { store.set(value); }
      });

      // Provides the final onChange callback that iterates over all the stored onChange callbacks.
      const onChange = (value) =>
      {
         for (const entry of onchangeFunctions) { entry(value); }
      };

      game.settings.register(moduleId, key, { ...options, onChange });

      // Set new store value with existing setting or default value.
      const newStore = s_GET_STORE(this.#stores, key, game.settings.get(moduleId, key));

      // Subscribe to self to set associated game setting on updates after verifying that the new value does not match
      // existing game setting.
      newStore.subscribe((value) =>
      {
         if (game.settings.get(moduleId, key) !== value) { game.settings.set(moduleId, key, value); }
      });
   }

   /**
    * Registers multiple settings.
    *
    * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
    */
   registerAll(settings)
   {
      if (!isIterable(settings)) { throw new TypeError(`TJSGameSettings - registerAll: settings is not iterable.`); }

      for (const entry of settings)
      {
         if (typeof entry !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings is not an object.`);
         }

         if (typeof entry.moduleId !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'moduleId' attribute.`);
         }

         if (typeof entry.key !== 'string')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'key' attribute.`);
         }

         if (typeof entry.options !== 'object')
         {
            throw new TypeError(`TJSGameSettings - registerAll: entry in settings missing 'options' attribute.`);
         }

         this.register(entry);
      }
   }
}

/**
 * Gets a store from the GSWritableStore Map or creates a new store for the key.
 *
 * @param {Map<string, GSWritableStore>} stores - Map containing Svelte stores.
 *
 * @param {string}               key - Key to lookup in stores map.
 *
 * @param {string}               [initialValue] - An initial value to set to new stores.
 *
 * @returns {GSWritableStore} The store for the given key.
 */
function s_GET_STORE(stores, key, initialValue)
{
   let store = stores.get(key);
   if (store === void 0)
   {
      store = s_CREATE_STORE(initialValue);
      stores.set(key, store);
   }

   return store;
}

/**
 * Creates a new GSWritableStore for the given key.
 *
 * @param {string}   initialValue - An initial value to set to new stores.
 *
 * @returns {GSWritableStore} The new GSWritableStore.
 */
function s_CREATE_STORE(initialValue)
{
   const store = writable(initialValue);
   store.get = () => get(store);

   return store;
}

/**
 * @typedef {object} GameSettingOptions
 *
 * @property {object} [choices] - If choices are defined, the resulting setting will be a select menu.
 *
 * @property {boolean} [config=true] - Specifies that the setting appears in the configuration view.
 *
 * @property {string} [hint] - A description of the registered setting and its behavior.
 *
 * @property {string} name - The displayed name of the setting.
 *
 * @property {Function} [onChange] - An onChange callback to directly receive callbacks from Foundry on setting change.
 *
 * @property {object} [range] - If range is specified, the resulting setting will be a range slider.
 *
 * @property {('client' | 'world')} [scope='client'] - Scope for setting.
 *
 * @property {Object|Function} type - A constructable object or function.
 */

/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {GameSettingOptions} options - Configuration for setting data.
 */

/**
 * @typedef {import('svelte/store').Writable} GSWritableStore - The backing Svelte store; writable w/ get method attached.
 *
 * @property {Function} get -
 */

/**
 * @typedef {import('svelte/store').Readable} GSReadableStore - The backing Svelte store; readable w/ get method attached.
 *
 * @property {Function} get -
 */
