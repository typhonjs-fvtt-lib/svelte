import type { MinimalWritable }  from '#runtime/svelte/store/util';

/**
 * Defines the core Foundry options for a game setting.
 */
interface CoreSettingOptions {
   /**
    * If choices are defined, the resulting setting will be a select menu and `type` must be a `string`.
    */
   choices?: Record<string, string>;

   /**
    * Specifies that the setting appears in the configuration view; default: `true`.
    */
   config?: boolean;

   /**
    * A default value for the setting.
    */
   default: number | string | boolean | object;

   /**
    * Setting is a file picker and `type` must be a `string`. You may use a boolean for `any` file type or select a
    * specific file type.
    */
   filePicker?: boolean | 'any' | 'audio' | 'folder' | 'font' | 'image' | 'imagevideo' | 'text' | 'video';

   /**
    * A description of the registered setting and its behavior.
    */
   hint?: string;

   /**
    * The displayed name of the setting.
    */
   name?: string;

   /**
    * An onChange callback function or iterable list of callbacks to directly receive callbacks from Foundry on setting
    * change.
    */
   onChange?: Function | Iterable<Function>;

   /**
    * If range is specified, the resulting setting will be a range slider.
    */
   range?: { min: number; max: number; step?: number };

   /**
    * If true then a prompt to reload after changes occurs; default: `false`.
    */
   requiresReload?: boolean;

   /**
    * Scope for setting. `client` uses local storage and `world` is saved in Foundry DB.
    */
   scope: 'client' | 'world';

   /**
    * A constructable object, function, or DataModel.
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
    * Core game setting configuration options.
    */
   options: CoreSettingOptions;

   /**
    * The setting namespace; usually the ID of the package. If not provided the associated namespace with the instance
    * of `TJSGameSettings` will be used.
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
interface GameSettingData {
   /**
    * The setting key to register.
    */
   key: string;

   /**
    * The setting namespace; usually the ID of the package. If not provided the associated namespace with the instance
    * of `TJSGameSettings` will be used.
    */
   namespace: string;

   /**
    * Core game setting configuration options.
    */
   options: CoreSettingOptions;

   /**
    * The name of the `TJSSvgFolder` to put this setting in to group them.
    */
   folder?: string;
}

export {
   GameSetting,
   GameSettingData,
   CoreSettingOptions
}
