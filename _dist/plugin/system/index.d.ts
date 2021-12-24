import * as svelte_store from 'svelte/store';
import { noop } from 'svelte/types/runtime/internal/utils';
import { get } from 'svelte/types/runtime/store';

/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type LSStore = ((key: any, value: any, start?: typeof noop) => {
    set: (new_value: any) => void;
    update: (fn: any) => void;
    subscribe: (run: any, invalidate?: typeof noop) => svelte_store.Unsubscriber;
}) & typeof get;
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type SSStore = ((key: any, value: any, start?: typeof noop) => {
    set: (new_value: any) => void;
    update: (fn: any) => void;
    subscribe: (run: any, invalidate?: typeof noop) => svelte_store.Unsubscriber;
}) & typeof get;
/**
 * - Defines a game setting.
 */
type GameSetting = {
    /**
     * - The ID of the module / system.
     */
    moduleId: string;
    /**
     * - The setting key to register.
     */
    key: string;
    /**
     * - Configuration for setting data.
     */
    options: object;
};
declare class LocalStorage {
    onPluginLoad(ev: any): void;
    #private;
}
declare class SessionStorage {
    onPluginLoad(ev: any): void;
    #private;
}
/**
 * @typedef {object} GameSetting - Defines a game setting.
 *
 * @property {string} moduleId - The ID of the module / system.
 *
 * @property {string} key - The setting key to register.
 *
 * @property {object} options - Configuration for setting data.
 */
/**
 * Provides a TyphonJS plugin to add TJSGameSettings to the plugin eventbus.
 *
 * The following events are available for registration:
 *
 * `tjs:system:game:settings:store:get`      - Invokes `getStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:register`       - Registers a setting adding a callback to fire an event on change.
 * `tjs:system:game:settings:register:all`   - Registers multiple settings.
 *
 * The following events are triggered on change of a game setting.
 *
 * `tjs:system:game:settings:change:any`           - Provides an object containing the setting and value.
 * `tjs:system:game:settings:change:<SETTING KEY>` - Provides the value of the keyed event.
 */
declare class TJSGameSettings {
    register(moduleId: any, key: any, options: any): void;
    /**
     * Registers multiple settings.
     *
     * @param {Iterable<GameSetting>} settings - An iterable list of game setting configurations to register.
     */
    registerAll(settings: Iterable<GameSetting>): void;
    onPluginLoad(ev: any): void;
    _eventbus: any;
    #private;
}
/**
 * Defines a base class for dispatch handling from events triggered from the TJSGameSettings plugin. This is a
 * convenience mechanism and is not the only way to handle game settings related events. Use this for small to medium
 * scoped apps that do not have a lot of cross-cutting concerns.
 *
 * SettingsControl listens for all setting change events and attempts to invoke a method with the same name as the
 * setting located in the implementing child class.
 *
 * There is one additional event handled by SettingsControl:
 * `tjs:system:settings:control:log:enable` - When passed a truthy value console logging of setting changes occurs.
 */
declare class TJSSettingsControl {
    onPluginLoad(ev: any): void;
    _eventbus: any;
    #private;
}

export { GameSetting, LSStore, LocalStorage, SSStore, SessionStorage, TJSGameSettings, TJSSettingsControl };
