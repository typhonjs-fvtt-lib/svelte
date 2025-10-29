import { CrudArrayObjectStore }  from '#runtime/svelte/store/reducer/array-object';
import { Hashing }               from '#runtime/util';
import { isObject }              from '#runtime/util/object';

import { FVTTObjectEntryStore }  from './FVTTObjectEntryStore';

import type { TJSGameSettings }  from '#svelte-fvtt/store/fvtt/settings';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a `world` or `user` game setting. `GameSettingArrayObject` is automatically associated as the store receiving
 * updates with the associated game setting.
 *
 * @typeParam S - Store type.
 */
class GameSettingArrayObject<S extends GameSettingArrayObject.Data.BaseObjectEntryStore<any>> extends
 CrudArrayObjectStore<S>
{
   /**
    * Game setting `key` field.
    */
   readonly #key: string;

   /**
    * Game setting `namespace` field.
    */
   readonly #namespace: string;

   /**
    * Game setting `scope` field.
    */
   readonly #scope: string;

   /**
    * @returns The default object entry store constructor that can facilitate the creation of the required
    *          {@link GameSettingArrayObject.Options.Config.StoreClass} and generic `T` type parameter.
    */
   static get EntryStore(): typeof FVTTObjectEntryStore { return FVTTObjectEntryStore; }

   /**
    * @param options - GameSettingArrayObject Options.
    */
   constructor({ namespace, key, scope, defaultData = [], gameSettings, ...rest }:
    GameSettingArrayObject.Options.Config<S>)
   {
      super({
         ...rest,
         extraData: { namespace, key, scope }
      });

      if (typeof key !== 'string') { throw new TypeError(`'key' is not a string.`); }
      if (typeof namespace !== 'string') { throw new TypeError(`'namespace' is not a string.`); }
      if (typeof scope !== 'string') { throw new TypeError(`'scope' is not a string.`); }

      if (scope !== 'world' && scope !=='user') { throw new Error(`'scope' must be 'world' or 'user'.`); }

      this.#namespace = namespace;
      this.#key = key;
      this.#scope = scope;

      if (!Array.isArray(defaultData)) { throw new TypeError(`'defaultData' is not an array.`); }

      // Define default `id` if not provided in `defaultData` then create a random `UUIDv4` value.
      for (const entry of defaultData)
      {
         if (!isObject(entry)) { throw new TypeError(`'entry' in 'defaultData' is not an object.`); }

         if (!Hashing.isUuidv4(entry.id)) { entry.id = Hashing.uuidv4(); }
      }

      if (gameSettings)
      {
         gameSettings.register({
            namespace,
            key,
            store: this,
            options: {
               scope,
               config: false,
               default: Array.isArray(defaultData) ? defaultData : [],
               type: Array,
               name: key
            }
         });
      }
   }

   /**
    * Can the current user edit / save this instance to the Foundry DB.
    */
   get canUserEdit(): boolean
   {
      let canUserEdit = false;

      switch (this.#scope)
      {
         case 'user':
            canUserEdit = true;
            break;

         case 'world':
            // @ts-ignore - No Foundry types associated in build.
            canUserEdit = globalThis.game.user.isGM;
            break;
      }

      return canUserEdit;
   }

   /**
    * @returns The Foundry game setting `key`.
    */
   get key(): string { return this.#key; }

   /**
    * @returns The Foundry game setting `namespace`.
    */
   get namespace(): string { return this.#namespace; }

   /**
    * @returns The Foundry game setting `scope`.
    */
   get scope(): string { return this.#scope; }
}

declare namespace GameSettingArrayObject {
   export import Data = CrudArrayObjectStore.Data;
   export import Util = CrudArrayObjectStore.Util;

   export namespace Options {
      /**
       * @typeParam S - Store type.
       */
      export interface Config<S extends Data.BaseObjectEntryStore<any>> extends CrudArrayObjectStore.Options.Config<S> {
         /**
          * Game setting `namespace` field.
          */
         namespace: string;

         /**
          * Game setting `key` field.
          */
         key: string;

         /**
          * Game setting `scope` field. Must be `world` or `user`. For GM only modification w/ readability by all users
          * choose `world`. For unique user private data that can be read / write by a single user choose `user`.
          */
         scope: string;

         /**
          * When an instance of {@link TJSGameSettings} is defined and automatic game setting registered you may
          * provide default data for the Foundry game setting.
          */
         defaultData?: GameSettingArrayObject.Util.ExtractDataType<S>[];

         /**
          * An instance of {@link TJSGameSettings}. If provided a user game setting will be automatically registered
          * for the given `namespace`,`key`, and `scope` with this instance as the associated game setting store.
          */
         gameSettings?: TJSGameSettings;
      }
   }
}

export { GameSettingArrayObject };
