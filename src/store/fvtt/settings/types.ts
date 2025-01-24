import type { MinimalWritable }     from '#runtime/svelte/store/util';

import type { TJSLiveGameSettings } from './TJSLiveGameSettings';

interface GameSettingOptions {
   /**
    * If choices are defined, the resulting setting will be a select menu.
    */
   choices?: Record<string, unknown>;

   /**
    * Specifies that the setting appears in the configuration view; default: `true`.
    */
   config?: boolean;

   /**
    * A default value for the setting.
    */
   default: number | string | boolean | object | (() => number | string | boolean | object);

   /**
    * A description of the registered setting and its behavior.
    */
   hint?: string;

   /**
    * The displayed name of the setting.
    */
   name: string;

   /**
    * An onChange callback function or iterable list of callbacks to directly receive callbacks from Foundry on setting
    * change.
    */
   onChange?: Function | Iterable<Function>;

   /**
    * If range is specified, the resulting setting will be a range slider.
    */
   range?: this['type'] extends NumberConstructor ? { min: number; max: number; step?: number } : never;

   /**
    * If true then a prompt to reload after changes occurs; default: `false`.
    */
   requiresReload?: boolean;

   /**
    * Scope for setting; default: `client`.
    */
   scope?: 'client' | 'world';

   /**
    * A constructable object or function.
    */
   type: NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor |
    (new (...args: any[]) => fvtt.DataModel) | ((data: unknown) => unknown);
}

/**
 * Defines a game setting.
 */
interface GameSetting {
   /**
    * The setting key to register.
    */
   key: string;

   /**
    * Configuration for setting data.
    */
   options: GameSettingOptions;

   /**
    * The setting namespace; usually the ID of the module / system. If not provided the associated namespace with
    * the instance of `TJSGameSettings` will be used.
    */
   namespace?: string;

   /**
    * The name of the `TJSSvgFolder` to put this setting in to group them.
    */
   folder?: string;

   /**
    * An existing store instance to use.
    */
   store?: MinimalWritable<any>;
}

/**
 * Stores the primary TJS game setting keys w/ GameSettingOptions.
 */
interface GameSettingData extends GameSettingOptions {
   /**
    * The setting namespace; usually the ID of the module / system.
    */
   namespace: string;

   /**
    * The setting key to register.
    */
   key: string;

   /**
    * The name of the `TJSSvgFolder` to put this setting in to group them.
    */
   folder?: string;
}


export {
   GameSetting,
   GameSettingData,
   GameSettingOptions
}
