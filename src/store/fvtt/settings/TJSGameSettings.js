import { TJSGameSettingStores } from "./TJSGameSettingStores.js";
import { UIControl } from "./UIControl.js";

/**
 * Registers game settings and creates a backing Svelte store and a UI Control element for each setting.
 * The Svelte store will update the Foundry game settings and vice versa when changes occur to the Foundry game
 * settings the updated data is set to the store.
 *
 * Note: It is possible to add multiple `onChange` callbacks on registration.
 *
 * TODO: A possible future extension is to offer type checking against the setting type by creating a customized
 * writable store that has an overloaded `set` method to provide type checking.
 */
export class TJSGameSettings extends TJSGameSettingStores
{
   /** @type {import('./types').UIControl} */
   #uiControl;

   /**
    * Creates the TJSGameSettings instance.
    *
    * @param {string}   namespace - The namespace for all settings.
    */
   constructor(namespace)
   {
      super(namespace);
      this.#uiControl = new UIControl(this);
   }

   /**
    * @returns {import('./types').UIControl} The associated UIControl.
    */
   get uiControl()
   {
      return this.#uiControl;
   }
}
