import type { TJSSvelteConfig }  from '#runtime/svelte/util';

import type { TJSDialog }        from '../../TJSDialog.js';

/**
 * Provides the ability the save / restore application state for positional and UI state such as minimized status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
declare interface TJSDialogData
{
   /**
    * Provides configuration of the dialog button bar.
    *
    * @type {Record<string, TJSDialogButtonData>}
    */
   buttons: Record<string, TJSDialogButtonData>;

   /**
    * A Svelte configuration object or HTML string content.
    *
    * @type {TJSSvelteConfig | string}
    */
   content: TJSSvelteConfig | string;

   /**
    * The default button ID to focus initially.
    *
    * @type {string}
    */
   default: string;

   /**
    * The dialog is draggable when true.
    *
    * @type {boolean}
    */
   draggable: boolean;

   /**
    * When true auto-management of app focus is enabled.
    *
    * @type {boolean}
    */
   focusAuto: boolean;

   /**
    * When true the first focusable element that isn't a button is focused.
    *
    * @type {boolean}
    */
   focusFirst: boolean;

   /**
    * When `focusAuto` and `focusKeep` is true; keeps internal focus.
    *
    * @type {boolean}
    */
   focusKeep: boolean;

   /**
    * When true the dialog is minimizable.
    *
    * @type {boolean}
    */
   minimizable: boolean;

   /**
    * When true a modal dialog is displayed.
    *
    * @type {boolean}
    */
   modal: boolean;

   /**
    * Additional options for modal dialog display.
    *
    * @type {object}
    * TODO: Better specify type / options.
    */
   modalOptions: object;

   /**
    * When true and an error is raised in dialog callback functions post a UI error notification.
    *
    * @type {boolean}
    */
   notifyError: boolean;

   /**
    * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
    * by name exported from content Svelte component is invoked.
    *
    * @type {string | ((application: TJSDialog) => any)}
    */
   onClose: string | ((application: TJSDialog) => any);

   /**
    * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
    * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
    * will cause the Promise to then be rejected.
    *
    * @type {boolean}
    */
   rejectClose: boolean;

   /**
    * When true the dialog is resizable.
    *
    * @type {boolean}
    */
   resizable: boolean;

   /**
    * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
    * resolved.
    *
    * @type {boolean}
    */
   resolveId: boolean;

   /**
    * The dialog window title.
    *
    * @type {string}
    */
   title: string;

   /**
    * Transition options for the dialog.
    *
    * @type {object}
    * TODO: Better specify type / options.
    */
   transition: object;

   /**
    * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
    * top when activated.
    *
    * @type {number | null}
    */
   zIndex: number | null;

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
   get(accessor: string, defaultValue: any): any;

   /**
    * @param {TJSDialogOptions} data - Merge provided data object into Dialog data.
    */
   merge(data: TJSDialogOptions): void;

   /**
    * Replaces all dialog data; this is reactive.
    *
    * @param {TJSDialogOptions}   data - Dialog data.
    */
   replace(data): void

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
   set(accessor: string, value: any): boolean;
}

/**
 * TJSDialog button data.
 */
type TJSDialogButtonData = {
   /**
    * When false the dialog does not automatically close when button selected.
    */
   autoClose?: boolean;

   /**
    * Determines if the button is accessible providing a truthy value.
    */
   condition?: boolean | (() => boolean);

   /**
    * Button label; will be localized.
    */
   label?: string;

   /**
    * Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
    */
   icon?: string;

   /**
    * Callback for button press. When defined as a string any matching function by name exported from content Svelte
    * component is invoked.
    */
   onPress?: string | ((application: TJSDialog) => any);

   /**
    * Inline styles to apply to the button.
    */
   styles?: Record<string, string>;
};

/**
 * Defines the common dialog configuration data.
 */
type TJSDialogOptions = {
   /**
    * Provides configuration of the dialog button bar.
    */
   buttons?: Record<string, TJSDialogButtonData>;

   /**
    * A Svelte configuration object or HTML string content.
    */
   content?: TJSSvelteConfig | string;

   /**
    * The default button ID to focus initially.
    */
   default?: string;

   /**
    * The dialog is draggable when true.
    */
   draggable?: boolean;

   /**
    * When true auto-management of app focus is enabled.
    */
   focusAuto?: boolean;

   /**
    * When true the first focusable element that isn't a button is focused.
    */
   focusFirst?: boolean;

   /**
    * When `focusAuto` and `focusKeep` is true; keeps internal focus.
    */
   focusKeep?: boolean;

   /**
    * When true focus trapping / wrapping is enabled keeping focus inside app.
    */
   focusTrap?: boolean;

   /**
    * When true the dialog is minimizable.
    */
   minimizable?: boolean;

   /**
    * When true a modal dialog is displayed.
    */
   modal?: boolean;

   /**
    * Additional options for modal dialog display.
    */
   modalOptions?: object;

   /**
    * When true and an error is thrown in dialog callback functions post a UI error notification.
    */
   notifyError?: boolean;

   /**
    * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
    * by name exported from content Svelte component is invoked.
    */
   onClose?: string | ((application: TJSDialog) => any);

   /**
    * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
    * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
    * will cause the Promise to then be rejected.
    */
   rejectClose?: boolean;

   /**
    * When true the dialog is resizable.
    */
   resizable?: boolean;

   /**
    * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
    * resolved.
    */
   resolveId?: boolean;

   /**
    * The dialog window title.
    */
   title?: string;

   /**
    * Transition options for the dialog.
    */
   transition?: object;

   /**
    * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
    * top when activated.
    */
   zIndex?: number | null;
}

export {
   TJSDialogButtonData,
   TJSDialogData,
   TJSDialogOptions
}
