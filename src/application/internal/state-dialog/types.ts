import type { TJSSvelteConfig }  from '#runtime/svelte/util';

import type { TransitionFunction } from '#runtime/svelte/transition';

import type { TJSDialog }        from '../../TJSDialog.js';

/**
 * Provides storage for all dialog options through individual accessors and `get`, `merge`, `replace` and `set` methods
 * that safely access and update data changed to the mounted DialogShell component reactively.
 */
declare interface TJSDialogData
{
   /**
    * @returns {Record<string, TJSDialogButtonData>} The dialog button configuration.
    */
   get buttons(): Record<string, TJSDialogButtonData>;

   /**
    * Set the dialog button configuration.
    *
    * @param {Record<string, TJSDialogButtonData>} buttons - New dialog button configuration.
    */
   set buttons(buttons: Record<string, TJSDialogButtonData>)

   /**
    * @returns {TJSSvelteConfig | string} The Svelte configuration object or HTML string content.
    */
   get content(): TJSSvelteConfig | string;

   /**
    * Set the Svelte configuration object or HTML string content.
    *
    * @param {TJSSvelteConfig | string} content - New Svelte configuration object or HTML string content.
    */
   set content(content: TJSSvelteConfig | string);

   /**
    * @returns {string} The default button ID to focus initially.
    */
   get default(): string;

   /**
    * Set the default button ID to focus initially.
    *
    * @param {string} newDefault - New default button ID to focus initially.
    */
   set default(newDefault: string);

   /**
    * @returns {boolean} The dialog draggable state; draggable when true.
    */
   get draggable(): boolean;

   /**
    * Set the dialog state; draggable when true.
    *
    * @param {boolean} draggable - New dialog draggable state; draggable when true.
    */
   set draggable(draggable: boolean);

   /**
    * @returns {boolean} When true auto-management of app focus is enabled.
    */
   get focusAuto(): boolean;

   /**
    * Set the dialog auto-management of app focus.
    *
    * @param {boolean} focusAuto - New dialog auto-management of app focus.
    */
   set focusAuto(focusAuto: boolean);

   /**
    * @returns {boolean} When true the first focusable element that isn't a button is focused.
    */
   get focusFirst(): boolean;

   /**
    * Set the dialog first focusable element state.
    *
    * @param {boolean} focusFirst - New dialog first focusable element state.
    */
   set focusFirst(focusFirst: boolean);

   /**
    * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
    */
   get focusKeep(): boolean;

   /**
    * Set the dialog `focusKeep` state. When `focusAuto` and `focusKeep` is true; keeps internal focus.
    *
    * @param {boolean} focusKeep - New dialog `focusKeep` state.
    */
   set focusKeep(focusKeep: boolean);

   /**
    * @returns {boolean} When true the dialog is minimizable.
    */
   get minimizable(): boolean;

   /**
    * Set the dialog `minimizable` state. When true the dialog is minimizable.
    *
    * @param {boolean} minimizable - New dialog `minimizable` state.
    */
   set minimizable(minimizable: boolean);

   /**
    * @returns {boolean} When true a modal dialog is displayed.
    */
   get modal(): boolean;

   /**
    * Set the dialog `modal` state. When true a modal dialog is displayed.
    *
    * @param {boolean} modal - New dialog `modal` state.
    */
   set modal(modal: boolean);

   /**
    * @returns {object} Additional options for modal dialog display.
    */
   get modalOptions(): TJSDialogModalOptions;

   /**
    * Set additional options for modal dialog display.
    *
    * @param {TJSDialogModalOptions} modalOptions - New additional options for modal dialog display.
    */
   set modalOptions(modalOptions: TJSDialogModalOptions);

   /**
    * @returns {boolean} When true and an error is raised in dialog callback functions post a UI error notification.
    */
   get notifyError(): boolean;

   /**
    * Set the dialog `notifyError` state. When true and an error is raised in dialog callback functions post a UI error
    * notification.
    *
    * @param {boolean} notifyError - New dialog `notifyError` state.
    */
   set notifyError(notifyError: boolean);

   /**
    * @returns {string | ((application: TJSDialog) => any)} Callback invoked when dialog is
    *          closed; no button option selected. When defined as a string any matching function by name exported from
    *          content Svelte component is invoked.
    */
   get onClose(): string | ((application: TJSDialog) => any);

   /**
    * Set callback invoked when dialog is closed; no button option selected. When defined as a string any matching
    * function by name exported from content Svelte component is invoked..
    *
    * @param {string | ((application: TJSDialog) => any)} onClose - New dialog `onClose` state.
    */
   set onClose(onClose: string | ((application: TJSDialog) => any));

   /**
    * @returns {boolean} Dialog `rejectClose` state. When true and a Promise has been created by {@link TJSDialog.wait}
    *          and the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
    *          function is invoked and any result that is undefined will cause the Promise to then be rejected..
    */
   get rejectClose(): boolean;

   /**
    * Set the dialog `rejectClose` state.
    *
    * @param {boolean} rejectClose - New dialog `rejectClose` state.
    */
   set rejectClose(rejectClose: boolean);

   /**
    * @returns {boolean} When true the dialog is resizable.
    */
   get resizable(): boolean;

   /**
    * Set the dialog `resizable` state. When true the dialog is resizable.
    *
    * @param {boolean} resizable - New dialog `resizable` state.
    */
   set resizable(resizable: boolean);

   /**
    * @returns {boolean} When true and resolving any Promises and there are undefined results from any button callbacks
    *          the button ID is resolved.
    */
   get resolveId(): boolean;

   /**
    * Set the dialog `resolveId` state. When true and resolving any Promises and there are undefined results from any
    * button callbacks the button ID is resolved.
    *
    * @param {boolean} resolveId - New dialog `resolveId` state.
    */
   set resolveId(resolveId: boolean);

   /**
    * @returns {string} The dialog window title.
    */
   get title(): string;

   /**
    * Set the dialog window title.
    *
    * @param {string} title - New dialog window title.
    */
   set title(title: string)

   /**
    * @returns {TJSDialogTransitionOptions} Transition options for the dialog.
    */
   get transition(): TJSDialogTransitionOptions;

   /**
    * Set transition options for the dialog.
    *
    * @param {TJSDialogTransitionOptions} transition - New transition options for the dialog.
    */
   set transition(transition: TJSDialogTransitionOptions)

   /**
    * @returns {number | null} A specific z-index for the dialog. Pass null for the dialog to act like other
    *          applications in regard bringing to top when activated.
    */
   get zIndex(): number | null;

   /**
    * Set specific z-index for the dialog.
    *
    * @param {number | null} zIndex - New z-index for the dialog.
    */
   set zIndex(zIndex: number | null);

   /**
    * Provides a way to safely get this dialogs data given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
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
    * When false the dialog does not automatically close when button selected; default: true.
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
   onPress?: string | ((application?: TJSDialog) => any);

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
    * The dialog is draggable when true; default: true.
    */
   draggable?: boolean;

   /**
    * When true auto-management of app focus is enabled; default: true.
    */
   focusAuto?: boolean;

   /**
    * When true the first focusable element that isn't a button is focused; default: false.
    */
   focusFirst?: boolean;

   /**
    * When `focusAuto` and `focusKeep` is true; keeps internal focus; default: false.
    */
   focusKeep?: boolean;

   /**
    * When true focus trapping / wrapping is enabled keeping focus inside app; default: true.
    */
   focusTrap?: boolean;

   /**
    * When true the dialog is minimizable; default: true.
    */
   minimizable?: boolean;

   /**
    * When true a modal dialog is displayed; default: false.
    */
   modal?: boolean;

   /**
    * Additional options for modal dialog display.
    */
   modalOptions?: TJSDialogModalOptions;

   /**
    * When true and an error is thrown in dialog callback functions post a UI error notification; default: false.
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
    * will cause the Promise to then be rejected; default: false.
    */
   rejectClose?: boolean;

   /**
    * When true the dialog is resizable; default: false.
    */
   resizable?: boolean;

   /**
    * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
    * resolved; default: false.
    */
   resolveId?: boolean;

   /**
    * The dialog window title.
    */
   title?: string;

   /**
    * Transition options for the dialog.
    */
   transition?: TJSDialogTransitionOptions;

   /**
    * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
    * top when activated.
    */
   zIndex?: number | null;
}

/**
 *
 */
type TJSDialogTransitionOptions = {
   /**
    * A Svelte transition function applied to both in / out transitions.
    */
   transition?: TransitionFunction;

   /**
    * A Svelte transition applied to the `in` transition.
    */
   inTransition?: TransitionFunction;

   /**
    * A Svelte transition applied to tbe `out` transition.
    */
   outTransition?: TransitionFunction;

   /**
    * Additional transition options applied to both in / out transitions.
    */
   transitionOptions?: Record<string, any>;

   /**
    * Additional transition options applied to the `in` transition.
    */
   inTransitionOptions?: Record<string, any>;

   /**
    * Additional transition options applied to the `out` transition.
    */
   outTransitionOptions?: Record<string, any>;
}

/**
 * Defines additional modal options to control the display of the modal dialog and glasspane.
 */
type TJSDialogModalOptions = {
   /**
    * CSS background style for glasspane.
    */
   background?: string;

   /**
    * When true modal dialog is closed on any click / pointer down event on the glasspane.
    */
   closeOnInput?: boolean;

   /**
    * Creates a separate DIV element container for slot content.
    */
   slotSeparate?: boolean;

   /**
    * Custom styles applied to glasspane. Provide an object with CSS style properties with keys in kebab case.
    * @see https://www.w3.org/Style/CSS/all-properties.en.html
    */
   styles?: Record<string, string>;

   /**
    * Custom transition options for modal background / glasspane.
    */
   transition?: TJSDialogTransitionOptions;
}

export {
   TJSDialogButtonData,
   TJSDialogData,
   TJSDialogModalOptions,
   TJSDialogOptions,
   TJSDialogTransitionOptions
}
