import {
  BaseObjectEntryStore,
  CrudArrayObjectStore,
  ExtractDataType,
  CrudArrayObjectStoreParams,
} from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { TJSGameSettings } from '@typhonjs-fvtt/svelte/store/fvtt/settings';

/**
 * @typeParam S - Store type.
 */
declare class WorldSettingArrayStore<S extends BaseObjectEntryStore<any>> extends CrudArrayObjectStore<S> {
  #private;
  /**
   * @param options - WorldSettingArrayStore Options.
   *
   * @param options.namespace - Game setting 'namespace' field.
   *
   * @param options.key - Game setting 'key' field.
   *
   * @param [options.defaultData] - When an instance of TJSGameSettings is defined and automatic game setting
   *        registered you may provide default data for the Foundry game setting.
   *
   * @param [options.gameSettings] - An instance of TJSGameSettings. If provided a world game setting will be
   *        automatically registered for the given `namespace` and `key` with this instance as the associated game
   *        setting store.
   *
   * @param options.rest - Rest of {@link CrudArrayObjectStoreParams} / {@link ArrayObjectStoreParams} parameters.
   */
  constructor({
    namespace,
    key,
    defaultData,
    gameSettings,
    ...rest
  }: {
    namespace: string;
    key: string;
    defaultData?: ExtractDataType<S>[];
    gameSettings?: TJSGameSettings;
  } & CrudArrayObjectStoreParams<S>);
  /**
   * @returns The Foundry game setting key.
   */
  get key(): string;
  /**
   * @returns The Foundry game setting namespace.
   */
  get namespace(): string;
}

export { WorldSettingArrayStore };
