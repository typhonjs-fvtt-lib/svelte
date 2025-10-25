import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { TJSGameSettings } from '@typhonjs-fvtt/svelte/store/fvtt/settings';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a `world` or `user` game setting. `GameSettingArrayObject` is automatically associated as the store receiving
 * updates with the associated game setting.
 *
 * @typeParam S - Store type.
 */
declare class GameSettingArrayObject<
  S extends GameSettingArrayObject.Data.BaseObjectEntryStore<any>,
> extends CrudArrayObjectStore<S> {
  #private;
  /**
   * @param options - GameSettingArrayObject Options.
   */
  constructor({ namespace, key, scope, defaultData, gameSettings, ...rest }: GameSettingArrayObject.Options.Config<S>);
  /**
   * @returns The Foundry game setting `key`.
   */
  get key(): string;
  /**
   * @returns The Foundry game setting `namespace`.
   */
  get namespace(): string;
  /**
   * @returns The Foundry game setting `scope`.
   */
  get scope(): string;
}
declare namespace GameSettingArrayObject {
  export import Data = CrudArrayObjectStore.Data;
  export import Util = CrudArrayObjectStore.Util;
  namespace Options {
    /**
     * @typeParam S - Store type.
     */
    interface Config<S extends Data.BaseObjectEntryStore<any>> extends CrudArrayObjectStore.Options.Config<S> {
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
