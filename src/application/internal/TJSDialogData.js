import {
   deepMerge,
   safeAccess,
   safeSet }   from '@typhonjs-fvtt/svelte/util';

/**
 * Provides storage for all dialog options adding `get`, `merge` and `set` methods that safely access and update
 * data changed to the mounted DialogShell component.
 */
export class TJSDialogData
{
   /**
    * @type {SvelteApplication}
    */
   #application;

   /**
    * Provides configuration of the dialog button bar.
    *
    * @type {Record<string, TJSDialogButtonData>}
    */
   buttons;

   /**
    * A Svelte configuration object or HTML string content.
    *
    * @type {object|string}
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
    * When true the first focusable element that isn't a button is focused.
    *
    * @type {boolean}
    */
   focusFirst;

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
    * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
    * by name exported from content Svelte component is invoked.
    *
    * @type {string|((application: TJSDialog) => any)}
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
    * @type {number|null}
    */
   zIndex;

   /**
    * @param {SvelteApplication} application - The host Foundry application.
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
    * @param {*}        [defaultValue] - A default value returned if the accessor is not found.
    *
    * @returns {*} Value at the accessor.
    */
   get(accessor, defaultValue)
   {
      return safeAccess(this, accessor, defaultValue);
   }

   /**
    * @param {object} data - Merge provided data object into Dialog data.
    */
   merge(data)
   {
      deepMerge(this, data);

      const component = this.#application.svelte.component(0);
      if (component?.data) { component.data = this; }
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
    * @param {*}        value - Value to set.
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
