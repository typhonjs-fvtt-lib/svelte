import type {
   Readable,
   Writable }                 from 'svelte/store';

import type { TJSWebStorage } from '#runtime/svelte/store/web-storage'

/**
 * Controls preparation and processing of registered game settings w/ TJSGameSettings. Game settings are parsed
 * for UI display by TJSSettingsEdit. The store `showSettings` is utilized in TJSSettingsSwap component to provide
 * an easy way to flip between settings component or any main slotted component.
 */
export interface UIControl
{
   /**
    * @returns {{showSettings: Readable<boolean>}} Returns the managed stores.
    */
   get stores(): {
      showSettings: Readable<boolean>;
   };

   /**
    * @returns {boolean} Current `showSettings` state.
    */
   get showSettings(): boolean;

   /**
    * Sets current `showSettings` state.
    *
    * @param {boolean}  showSettings - New `showSettings` state.
    */
   set showSettings(showSettings: boolean);

   /**
    * Adds a custom section / folder defined by the provided TJSSettingsCustomSection options object.
    *
    * @param {TJSSettingsCustomSection} options - The configuration object for the custom section.
    */
   addSection(options: TJSSettingsCustomSection): void;

   /**
    * Creates the UISettingsData object by parsing stored settings in
    *
    * @param {TJSSettingsCreateOptions} [options] - Optional parameters.
    *
    * @returns {TJSSettingsUIData} Parsed UI settings data.
    */
   create(options?: TJSSettingsCreateOptions): TJSSettingsUIData;

   /**
    * Convenience method to swap `showSettings`.
    *
    * @returns {boolean} New `showSettings` state.
    */
   swapShowSettings(): boolean;
}

export type TJSSettingsCreateOptions = {
   /**
    * Defines the effects added to TJS components; ripple by default.
    */
   efx?: string;

   /**
    * TRL TJSWebStorage (session) instance to serialize folder state and scrollbar position.
    */
   storage?: TJSWebStorage;
};

export type TJSSettingsCustomSection = {
   /**
    * Svelte component constructor function for custom section.
    */
   class: Function;

   /**
    * Svelte component constructor function for custom section.
    */
   props?: Function;

   /**
    * Inline styles for the section element.
    */
   styles?: object;

   /**
    * A folder label or TJSSettingsCustomSectionFolder object.
    */
   folder?: string | TJSSettingsCustomSectionFolder;
};

export type TJSSettingsCustomSectionFolder = {
   /**
    * The folder label.
    */
   label: string;

   /**
    * A Svelte component config object defining TJSSvgFolder summary end component.
    */
   summaryEnd?: import('#runtime/svelte/util').TJSSvelteConfig;

   /**
    * Inline styles for the `TJSSvgFolder`; useful for setting CSS variables.
    */
   styles?: Record<string, string>;
};

export type TJSSettingsUIData = {
   /**
    * Sorted folders with associated settings and label.
    */
   folders: {
      label: string;
      settings: object[];
   }[];

   /**
    * Top level settings data.
    */
   topLevel: object[];

   /**
    * Custom sections.
    */
   sections: object[];

   /**
    * The store for `applyScrolltop`.
    */
   storeScrollbar: Writable<number>;

   /**
    * The bound destroy callback function for received of TJSSettingsUIData.
    */
   destroy?: Function;
};
