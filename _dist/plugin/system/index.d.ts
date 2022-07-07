import * as svelte_store from 'svelte/store';
import { get } from 'svelte/types/runtime/store';

/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type LSStore = svelte_store.Writable<any> & typeof get;
/**
 * - The backing Svelte store; a writable w/ get method attached.
 */
type SSStore = svelte_store.Writable<any> & typeof get;
type GameSettingOptions = {
    /**
     * - If choices are defined, the resulting setting will be a select menu.
     */
    choices?: object;
    /**
     * - Specifies that the setting appears in the configuration view.
     */
    config?: boolean;
    /**
     * - A description of the registered setting and its behavior.
     */
    hint?: string;
    /**
     * - The displayed name of the setting.
     */
    name: string;
    /**
     * - An onChange callback to directly receive callbacks from Foundry on setting change.
     */
    onChange?: Function;
    /**
     * - If range is specified, the resulting setting will be a range slider.
     */
    range?: object;
    /**
     * - Scope for setting.
     */
    scope?: ('client' | 'world');
    /**
     * - A constructable object or function.
     */
    type: any | Function;
};
/**
 * - Defines a game setting.
 */
type GameSetting = {
    /**
     * - The setting namespoce; usually the ID of the module / system.
     */
    namespace: string;
    /**
     * - The setting key to register.
     */
    key: string;
    /**
     * - Configuration for setting data.
     */
    options: GameSettingOptions;
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
 * Provides a TyphonJS plugin to add TJSGameSettings to the plugin eventbus.
 *
 * The following events are available for registration:
 *
 * `tjs:system:game:settings:store:get`          - Invokes `getWritableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:store:writable:get` - Invokes `getWritableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:store:readable:get` - Invokes `getReadableStore` from backing TJSGameSettings instance.
 * `tjs:system:game:settings:register`           - Registers a setting adding a callback to fire an event on change.
 * `tjs:system:game:settings:register:all`       - Registers multiple settings.
 *
 * The following events are triggered on change of a game setting.
 *
 * `tjs:system:game:settings:change:any`           - Provides an object containing the setting and value.
 * `tjs:system:game:settings:change:<SETTING KEY>` - Provides the value of the keyed event.
 */
declare class TJSGameSettings {
    /**
     * @param {GameSetting} setting - A GameSetting instance to set to Foundry game settings.
     */
    register(setting: GameSetting): void;
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

export { GameSetting, GameSettingOptions, LSStore, LocalStorage, SSStore, SessionStorage, TJSGameSettings, TJSSettingsControl };
