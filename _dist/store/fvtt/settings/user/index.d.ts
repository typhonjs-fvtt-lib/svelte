import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { TJSGameSettings } from '@typhonjs-fvtt/svelte/store/fvtt/settings';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a user game setting. UserArrayObjectStore is automatically associated as the store receiving updates with the
 * associated game setting.
 *
 * @typeParam S - Store type.
 */
declare class UserArrayObjectStore<
  S extends UserArrayObjectStore.Data.BaseObjectEntryStore<any>,
> extends CrudArrayObjectStore<S> {
  #private;
  /**
   * @param options - UserArrayObjectStore Options.
   */
  constructor({ namespace, key, defaultData, gameSettings, ...rest }: UserArrayObjectStore.Options.Config<S>);
  /**
   * @returns The Foundry game setting key.
   */
  get key(): string;
  /**
   * @returns The Foundry game setting namespace.
   */
  get namespace(): string;
}
declare namespace UserArrayObjectStore {
  export import Data = CrudArrayObjectStore.Data;
  export import Util = CrudArrayObjectStore.Util;
  namespace Options {
    /**
     * @typeParam S - Store type.
     */
    interface Config<S extends Data.BaseObjectEntryStore<any>> extends CrudArrayObjectStore.Options.Config<S> {
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
      defaultData?: UserArrayObjectStore.Util.ExtractDataType<S>[];
      /**
       * An instance of {@link TJSGameSettings}. If provided a user game setting will be automatically registered
       * for the given `namespace` and `key` with this instance as the associated game setting store.
       */
      gameSettings?: TJSGameSettings;
    }
  }
}

export { UserArrayObjectStore };
