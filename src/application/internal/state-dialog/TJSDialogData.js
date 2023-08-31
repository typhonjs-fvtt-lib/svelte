import {
   deepMerge,
   isObject,
   safeAccess,
   safeSet }   from '#runtime/util/object';

/**
 * Provides storage for all dialog options adding `get`, `merge` and `set` methods that safely access and update
 * data changed to the mounted DialogShell component reactively.
 */
export class TJSDialogData
{
   /**
    * @type {import('../../index.js').SvelteApplication}
    */
   #application;

   /**
    * Provides configuration of the dialog button bar.
    *
    * @type {Record<string, import('./types').TJSDialogButtonData>}
    */
   buttons;

   /**
    * A Svelte configuration object or HTML string content.
    *
    * @type {import('#runtime/svelte/util').TJSSvelteConfig | string}
    */
   content;

   /**
    * The default button ID to focus initially.
    *
    * @type {string}
    */
   default;

   /**
    * The dialog is draggable when true.
    *
    * @type {boolean}
    */
   draggable;

   /**
    * When true auto-management of app focus is enabled.
    *
    * @type {boolean}
    */
   focusAuto;

   /**
    * When true the first focusable element that isn't a button is focused.
    *
    * @type {boolean}
    */
   focusFirst;

   /**
    * When `focusAuto` and `focusKeep` is true; keeps internal focus.
    *
    * @type {boolean}
    */
   focusKeep;

   /**
    * When true the dialog is minimizable.
    *
    * @type {boolean}
    */
   minimizable;

   /**
    * When true a modal dialog is displayed.
    *
    * @type {boolean}
    */
   modal;

   /**
    * Additional options for modal dialog display.
    *
    * @type {object}
    * TODO: Better specify type / options.
    */
   modalOptions;

   /**
    * When true and an error is raised in dialog callback functions post a UI error notification.
    *
    * @type {boolean}
    */
   notifyError;

   /**
    * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
    * by name exported from content Svelte component is invoked.
    *
    * @type {string | ((application: import('../../index.js').TJSDialog) => any)}
    */
   onClose;

   /**
    * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
    * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
    * will cause the Promise to then be rejected.
    *
    * @type {boolean}
    */
   rejectClose;

   /**
    * When true the dialog is resizable.
    *
    * @type {boolean}
    */
   resizable;

   /**
    * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
    * resolved.
    *
    * @type {boolean}
    */
   resolveId;

   /**
    * The dialog window title.
    *
    * @type {string}
    */
   title;

   /**
    * Transition options for the dialog.
    *
    * @type {object}
    * TODO: Better specify type / options.
    */
   transition;

   /**
    * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
    * top when activated.
    *
    * @type {number | null}
    */
   zIndex;

   /**
    * @param {import('../../index.js').SvelteApplication} application - The host Foundry application.
    */
   constructor(application)
   {
      this.#application = application;
   }

   /**
    * Provides a way to safely get this dialogs data given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {any}      [defaultValue] - A default value returned if the accessor is not found.
    *
    * @returns {any} Value at the accessor.
    */
   get(accessor, defaultValue)
   {
      return safeAccess(this, accessor, defaultValue);
   }

   /**
    * @param {import('./types').TJSDialogOptions} data - Merge provided data object into Dialog data.
    */
   merge(data)
   {
      deepMerge(this, data);

      const component = this.#application.svelte.component(0);
      if (component?.data) { component.data = this; }
   }

   /**
    * Sets the dialog data; this is reactive.
    *
    * @param {import('./types').TJSDialogOptions}   data - Dialog data.
    */
   replace(data)
   {
      if (!isObject(data)) { throw new TypeError(`TJSDialogData replace error: 'data' is not an object'.`); }

      const descriptors = Object.getOwnPropertyDescriptors(this);

      // Remove old data for all configurable descriptors.
      for (const descriptor in descriptors)
      {
         if (descriptors[descriptor].configurable) { delete this[descriptor]; }
      }

      // Merge new data and perform a reactive update.
      this.merge(data);
   }

   /**
    * Provides a way to safely set this dialogs data given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * Automatically the dialog data will be updated in the associated DialogShell Svelte component.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {any}      value - Value to set.
    *
    * @returns {boolean} True if successful.
    */
   set(accessor, value)
   {
      const success = safeSet(this, accessor, value);

      // If `this.options` modified then update the app options store.
      if (success)
      {
         const component = this.#application.svelte.component(0);
         if (component?.data) { component.data = this; }
      }

      return success;
   }
}
