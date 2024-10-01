import * as _runtime_svelte_store_reducer_array_object from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';

/**
 * @template [T=import('#runtime/svelte/store/reducer/array-object').BaseArrayObjectEntryStore]
 * @augments {CrudArrayObjectStore<T>}
 */
declare class WorldSettingArrayStore<
  T = _runtime_svelte_store_reducer_array_object.BaseArrayObjectEntryStore,
> extends CrudArrayObjectStore<T> {
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
  constructor({
    gameSettings,
    namespace,
    key,
    ...rest
  }?: {
    gameSettings?: any;
    namespace?: string;
    key?: string;
    rest?: _runtime_svelte_store_reducer_array_object.CrudArrayObjectStoreParams;
  });
  /**
   * @returns {string} The Foundry game setting key.
   */
  get key(): string;
  /**
   * @returns {string} The Foundry game setting namespace.
   */
  get namespace(): string;
  #private;
}

export { WorldSettingArrayStore };
