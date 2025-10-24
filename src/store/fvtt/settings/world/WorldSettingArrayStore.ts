import { CrudArrayObjectStore }  from '#runtime/svelte/store/reducer/array-object';
import { Hashing }               from '#runtime/util';

import type { TJSGameSettings }  from '#svelte-fvtt/store/fvtt/settings';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a world game setting. WorldArrayObjectStore is automatically associated as the store receiving updates with the
 * associated game setting.
 *
 * @typeParam S - Store type.
 */
class WorldArrayObjectStore<S extends WorldArrayObjectStore.Data.BaseObjectEntryStore<any>> extends
 CrudArrayObjectStore<S>
{
   /**
    * Game setting 'key' field.
    */
   readonly #key: string;

   /**
    * Game setting 'namespace' field.
    */
   readonly #namespace: string;

   /**
    * @param options - WorldArrayObjectStore Options.
    */
   constructor({ namespace, key, defaultData = [], gameSettings, ...rest }: WorldArrayObjectStore.Options.Config<S>)
   {
      super({
         ...rest,
         extraData: { namespace, key }
      });

      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }

      this.#namespace = namespace;
      this.#key = key;

      if (!Array.isArray(defaultData)) { throw new TypeError(`'defaultData' is not an array.`); }

      // Define default `id` if not provided in `defaultData` then create a random `UUIDv4` value.
      for (const entry of defaultData)
      {
         if (typeof entry.id !== 'string') { entry.id = Hashing.uuidv4(); }
      }

      if (gameSettings)
      {
         gameSettings.register({
            namespace,
            key,
            store: this,
            options: {
               scope: 'world',
               config: false,
               default: Array.isArray(defaultData) ? defaultData : [],
               type: Array,
               name: key
            }
         });
      }
   }

   /**
    * @returns The Foundry game setting key.
    */
   get key(): string { return this.#key; }

   /**
    * @returns The Foundry game setting namespace.
    */
   get namespace(): string { return this.#namespace; }
}

declare namespace WorldArrayObjectStore {
   export import Data = CrudArrayObjectStore.Data;
   export import Util = CrudArrayObjectStore.Util;

   export namespace Options {
      /**
       * @typeParam S - Store type.
       */
      export interface Config<S extends Data.BaseObjectEntryStore<any>> extends CrudArrayObjectStore.Options.Config<S> {
         /**
          * Game setting 'namespace' field.
          */
         namespace: string;

         /**
          * Game setting 'key' field.
          */
         key: string;

         /**
          * When an instance of {@link TJSGameSettings} is defined and automatic game setting registered you may
          * provide default data for the Foundry game setting.
          */
         defaultData?: WorldArrayObjectStore.Util.ExtractDataType<S>[];

         /**
          * An instance of {@link TJSGameSettings}. If provided a world game setting will be automatically registered
          * for the given `namespace` and `key` with this instance as the associated game setting store.
          */
         gameSettings?: TJSGameSettings;
      }
   }
}

export { WorldArrayObjectStore };
