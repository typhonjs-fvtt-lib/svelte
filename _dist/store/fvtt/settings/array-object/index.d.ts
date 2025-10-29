import {
  CrudArrayObjectStore,
  ObjectEntryStore,
} from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
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
   * @returns The default object entry store constructor that can facilitate the creation of the required
   *          {@link GameSettingArrayObject.Options.Config.StoreClass} and generic `T` type parameter.
   */
  static get EntryStore(): typeof FVTTObjectEntryStore;
  /**
   * @param options - GameSettingArrayObject Options.
   */
  constructor({ namespace, key, scope, defaultData, gameSettings, ...rest }: GameSettingArrayObject.Options.Config<S>);
  /**
   * Can the current user edit / save this instance to the Foundry DB.
   */
  get canEdit(): boolean;
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

/**
 * Provides an extension to {@link #runtime/svelte/store/reducer/array-object!ObjectEntryStore} adding the
 * {@link FVTTObjectEntryStore.canEdit} accessor which when paired with {@link GameSettingArrayObject} forwards on
 * whether the current Foundry user can edit / save to the Foundry DB.
 *
 * This is the base {@link ObjectEntryStore} available from a direct import or through
 * {@link GameSettingArrayObject.EntryStore} accessor.
 */
declare abstract class FVTTObjectEntryStore<
  T extends GameSettingArrayObject.Data.BaseArrayObject = GameSettingArrayObject.Data.BaseArrayObject,
> extends ObjectEntryStore<T> {
  #private;
  /**
   * @param data - Initial entry data.
   *
   * @param [gameSettingArrayObject] - Associated backing array object store. Automatically passed on entry creation
   *        by {@link #runtime/svelte/store/reducer/array-object!ArrayObjectStore}.
   */
  constructor(data: T, gameSettingArrayObject?: GameSettingArrayObject<any>);
  /**
   * Can the current user edit / save this instance to the Foundry DB.
   */
  get canEdit(): boolean;
}

export { FVTTObjectEntryStore, GameSettingArrayObject };
