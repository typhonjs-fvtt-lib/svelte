import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';

/**
 * @template [T=import('#runtime/svelte/store/reducer/array-object').BaseArrayObjectEntryStore]
 * @augments {CrudArrayObjectStore<T>}
 */
class WorldSettingArrayStore extends CrudArrayObjectStore
{
   /** @type {string} */
   #key;

   /** @type {string} */
   #namespace;

   /**
    *
    * @param {object}            [opts] - Optional parameters.
    *
    * @param {import('#runtime/svelte/store/fvtt/settings').TJSGameSettings}   [opts.gameSettings] - An instance of
    *        TJSGameSettings.
    *
    * @param {string}            [opts.namespace] - Game setting 'namespace' field.
    *
    * @param {string}            [opts.key] - Game setting 'key' field.
    *
    * @param {import('#runtime/svelte/store/reducer/array-object').CrudArrayObjectStoreParams} [opts.rest] - Rest
    *        of CrudArrayObjectStore parameters.
    */
   constructor({ gameSettings, namespace, key, ...rest })
   {
      super({
         ...rest,
         extraData: { namespace, key }
      });

      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      this.#namespace = namespace;
      this.#key = key;

      if (gameSettings)
      {
         gameSettings.register({
            namespace,
            key,
            store: this,
            options: {
               scope: 'world',
               config: false,
               default: Array.isArray(rest.defaultData) ? rest.defaultData : [],
               type: Array
            }
         });
      }
   }

   /**
    * @returns {string} The Foundry game setting key.
    */
   get key() { return this.#key; }

   /**
    * @returns {string} The Foundry game setting namespace.
    */
   get namespace() { return this.#namespace; }
}

export { WorldSettingArrayStore };
//# sourceMappingURL=index.js.map
