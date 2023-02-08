import { DialogShell }        from '@typhonjs-fvtt/svelte/component/core';

import {
   deepMerge,
   isObject,
   ManagedPromise }           from '@typhonjs-fvtt/svelte/util';

import { TJSDialogData }      from './internal/TJSDialogData.js';
import { SvelteApplication }  from './SvelteApplication.js';

/**
 * Provides a reactive dialog implementation configured from a unique dialog options object. The dialog features a
 * bottom button bar for user selection.
 *
 * A glasspane / modal option with various styling and transition capabilities is available when setting `modal: true`.
 *
 * Most importantly the `content` attribute of dialog data can be a Svelte component configuration object to render
 * your custom component as the dialog content. When using a Svelte component as the content you can assign a string
 * to the various `on<XXX>` dialog callbacks and an exported function from your component will be invoked to handle the
 * button callback. All dialog button callbacks and `onClose` callback receive a single argument which is the dialog /
 * application instance.
 *
 * When making a form with form validation or other dialog that you don't want to close immediately on button press you
 * can set `autoClose: false`, however you are 100% in control of resolving any Promise callbacks from button presses
 * and also closing the application. Each button can also be configured with `autoClose: false` in the button data.
 *
 * There is a handy Promise management capability to track a single Promise for the lifetime of a dialog available
 * at {@link TJSDialog.managedPromise}. By default when the user closes the dialog / application any managed Promise is
 * resolved with `null`. The managed Promise is available in any Svelte content component by using
 * `const managedPromise = getContext('#managedPromise')`. When handling any custom resolution particularly when
 * setting `autoClose: false` for a given button you are 100% in control of resolving or rejecting asynchronous data to
 * return from the dialog.
 *
 * To create and wait upon a managed promise for asynchronous return results use the static or member variation of
 * {@link TJSDialog.wait}.
 *
 * Please refer to {@link TJSDialogOptions} for the various options used to construct the dialog.
 *
 * There are a couple of static helper methods to quickly create standard dialogs such as a 'yes' / 'no' confirmation
 * dialog with {@link TJSDialog.confirm} and an 'ok' single button dialog with {@link TJSDialog.prompt}.
 *
 * TODO: document all extended dialog data parameters such as transition options / modal transitions.
 */
export class TJSDialog extends SvelteApplication
{
   /** @type {TJSDialogData} */
   #data;

   /** @type {ManagedPromise} */
   #managedPromise;

   /**
    * @param {TJSDialogOptions}           data - Dialog options.
    *
    * @param {SvelteApplicationOptions}   [options] - SvelteApplication options.
    */
   constructor(data, options = {})
   {
      super(options);

      this.#managedPromise = new ManagedPromise();

      this.#data = new TJSDialogData(this);
      this.data = data;

      /**
       * @member {object} dialogComponent - A getter to SvelteData to retrieve any mounted Svelte component as the
       *                                    dialog content.
       *
       * @memberof GetSvelteData#
       * @readonly
       */
      Object.defineProperty(this.svelte, 'dialogComponent', {
         get: () => this.svelte?.applicationShell?.dialogComponent,
      });
   }

   /**
    * Default options for TJSDialog. Provides a default width and setting `height` to `auto` to always display dialog
    * content even if it changes. The default `DialogShell` / `svelte` options should not be changed and instead mount
    * the dialog content component by supplying a Svelte configuration object to dialog data `content` field.
    *
    * @returns {SvelteApplicationOptions} Default options
    */
   static get defaultOptions()
   {
      return deepMerge(super.defaultOptions, {
         classes: ['dialog'],
         width: 400,
         height: 'auto',
         svelte: {
            class: DialogShell,
            intro: true,
            target: document.body,
            props: function() // `this` is the TJSDialog instance when invoked.
            {
               return {
                  data: this.#data,
                  managedPromise: this.#managedPromise
               };
            }
         }
      });
   }

   /**
    * Returns the dialog data.
    *
    * @returns {TJSDialogData} Dialog data.
    */
   get data() { return this.#data; }

   /**
    * @returns {ManagedPromise} Returns the managed promise.
    */
   get managedPromise() { return this.#managedPromise; }

   /**
    * Sets the dialog data; this is reactive.
    *
    * @param {object}   data - Dialog data.
    */
   set data(data)
   {
      if (!isObject(data)) { throw new TypeError(`TJSDialog set data error: 'data' is not an object'.`); }

      const descriptors = Object.getOwnPropertyDescriptors(this.#data);

      // Remove old data for all configurable descriptors.
      for (const descriptor in descriptors)
      {
         if (descriptors[descriptor].configurable) { delete this.#data[descriptor]; }
      }

      // Merge new data and perform a reactive update.
      this.#data.merge(data);
   }

   /**
    * Close the dialog and un-register references to it within UI mappings.
    * This function returns a Promise which resolves once the window closing animation concludes.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {boolean}  [options.force] - Force close regardless of render state.
    *
    * @returns {Promise<void>} A Promise which resolves once the application is closed with the callback value or
    *                          `true`.
    */
   async close(options)
   {
      try
      {
         // Note: When handling a managed promise if a button selection has already been made the managed promise is
         // already processing and the resolution below is skipped.
         if (this.#managedPromise.isActive && !this.#managedPromise.isProcessing)
         {
            const result = TJSDialog.#invokeFn(this.#data.onClose, this, null);
            const rejectClose = typeof this.#data.rejectClose === 'boolean' ? this.#data.rejectClose : false;

            if (rejectClose && result === null)
            {
               this.#managedPromise.reject(new Error('TJSDialog was closed without a choice being made.'));
            }
            else
            {
               this.#managedPromise.resolve(result);
            }
         }
      }
      catch (err)
      {
         const notifyError = typeof this.#data.notifyError === 'boolean' ? this.#data.notifyError : true;
         if (notifyError)
         {
            // TODO: When app eventbus is available send event for UI notification instead of Foundry API usage.
            globalThis.ui.notifications.error(err, { console: false });
         }

         // If there is a managed Promise reject it or re-throw error.
         if (!this.#managedPromise.reject(err)) { throw err; }
      }
      finally
      {
         await super.close(options);
      }
   }

   /**
    * Brings to top or renders this dialog returning a Promise that is resolved any button pressed or when the dialog
    * is closed.
    *
    * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
    * choice.
    *
    * Note: `null` is returned if the dialog is closed without a user making a choice.
    *
    * @template T
    *
    * @param {object}   [options] - Options.
    *
    * @param {boolean}  [options.reuse=false] - When true if there is an existing managed Promise this allows multiple
    *        sources to await on the same result.
    *
    * @returns {Promise<T>} A promise for dialog resolution.
    */
   async wait(options)
   {
      // TODO: Direct usage of Foundry core Application API.
      if (this.rendered)
      {
         this.bringToTop();
      }
      else
      {
         this.render(true, { focus: true });
      }

      // Return a managed Promise which is automatically resolved on button press via `DialogContent` component or when
      // the dialog is closed.
      return this.#managedPromise.create(options);
   }

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
    * If you require more flexibility, a custom TJSDialog instance is preferred. The default focused button is 'yes'.
    * You can change the default focused button by setting `default` to `yes` or `no`.
    *
    * @template T
    *
    * @param {TJSDialogOptions} data - Confirm dialog options.
    *
    * @param {string|((application: TJSDialog) => any)} [data.onYes] - Callback function upon `yes`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {string|((application: TJSDialog) => any)} [data.onNo] - Callback function upon `no`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
    *
    * @returns {Promise<T>} A promise which resolves with result of yes / no callbacks or true / false.
    *
    * @example
    * const result = await TJSDialog.confirm({
    *  title: 'A Yes or No Question',
    *  content: '<p>Choose wisely.</p>',
    *  onYes: () => 'YES Result'
    *  onNo: () => 'NO Result'
    * });
    *
    * // Logs 'YES result', 'NO Result', or null if the user closed the dialog without making a selection.
    * console.log(result);
    */
   static async confirm({ onYes, onNo, ...data } = {}, options = {})
   {
      // Allow overwriting of default icon and labels.
      const mergedButtons = deepMerge({
         yes: {
            icon: 'fas fa-check',
            label: 'Yes'
         },
         no: {
            icon: 'fas fa-times',
            label: 'No',
         }
      }, data.buttons ?? {});

      return this.wait({
         ...data,
         buttons: deepMerge(mergedButtons, {
            yes: {
               onPress: (application) => this.#invokeFn(onYes, application, true)
            },
            no: {
               onPress: (application) => this.#invokeFn(onNo, application, false)
            }
         }),
         default: data.default ?? 'yes'
      }, options);
   }

   /**
    * A helper method to invoke a callback function directly or lookup an exported function with the same name from any
    * content Svelte component to invoke. This is used internally to apply default values for `confirm` and `prompt`.
    *
    * @param {string|((application: TJSDialog) => any)} callback - Callback function to invoke; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {TJSDialog} application - TJSDialog instance passed to callback.
    *
    * @param {*} [defaultResult] - An optional default result to return; undefined if not specified.
    *
    * @returns {*} Result.
    */
   static #invokeFn(callback, application, defaultResult = void 0)
   {
      let result = defaultResult;

      switch (typeof callback)
      {
         case 'function':
            // Pass the dialog instance to the callback.
            result = callback(application);
            break;

         case 'string':
         {
            const dialogComponent = application?.svelte?.dialogComponent;

            // Attempt lookup by function name in dialog instance component.
            if (dialogComponent !== void 0 && typeof dialogComponent?.[callback] === 'function')
            {
               result = dialogComponent?.[callback](application);
            }
            else
            {
               if (dialogComponent === void 0)
               {
                  console.warn(`[TRL] TJSDialog warning: 'onPress' defined as a string with no ` +
                   `associated content Svelte component.`);
               }
               else if (typeof dialogComponent?.[callback] !== 'function')
               {
                  console.warn(`[TRL] TJSDialog warning: The content Svelte component does not contain ` +
                   `an associated function '${callback}'. Did you remember to add ` +
                   `'<svelte:options accessors={true} />' and export the function?`);
               }
            }
            break;
         }
      }

      return result;
   }

   /**
    * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
    *
    * @template T
    *
    * @param {TJSDialogOptions} [data] - Prompt dialog options.
    *
    * @param {string|((application: TJSDialog) => any)} [data.onOk] - Callback function upon `ok`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {string}   [data.label] - The OK prompt button text.
    *
    * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
    *
    * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
    *
    * @returns {Promise<T>} The returned value from the provided callback function or `true` if the button
    *          is pressed.
    *
    * @example
    * const result = await TJSDialog.prompt({
    *  title: 'Are you OK?',
    *  content: '<p>Are you OK?.</p>',
    *  label: 'Feeling Fine!'
    *  onOk: () => 'OK'
    * });
    *
    * // Logs 'OK' or null if the user closed the dialog without making a selection.
    * console.log(result);
    */
   static async prompt({ onOk, label, icon = 'fas fa-check', ...data } = {}, options = {})
   {
      return this.wait({
         ...data,
         buttons: {
            ok: {
               icon,
               label,
               onPress: (application) => this.#invokeFn(onOk, application, true)
            }
         },
         default: 'ok'
      }, options);
   }

   /**
    * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
    * choice.
    *
    * Note: By default `null` is returned if the dialog is closed without a user making a choice.
    *
    * @template T
    *
    * @param {TJSDialogOptions}  data - Dialog data passed to the TJSDialog constructor.
    *
    * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
    *
    * @returns {Promise<T>} A Promise that resolves to the chosen result.
    */
   static async wait(data, options = {})
   {
      if (!isObject(data)) { throw new TypeError(`TJSDialog.wait error: 'data' is not an object'.`); }

      // Instantiate and render the dialog.
      return new this({ ...data }, options).wait();
   }
}

/**
 * @typedef {object} TJSDialogOptions - Defines the common dialog configuration data.
 *
 * @property {Record<string, TJSDialogButtonData>}  [buttons={}] - Provides configuration of the dialog button bar.
 *
 * @property {object|string}  content - A Svelte configuration object or HTML string content.
 *
 * @property {string}   [default] - The default button ID to focus initially.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {boolean}  [focusAuto=true] - When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [focusKeep=false] - When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {boolean}  [focusTrap=true] - When true focus trapping / wrapping is enabled keeping focus inside app.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [notifyError=true] - When true and an error is raised in dialog callback functions post a UI
 *           error notification.
 *
 * @property {string|((application: TJSDialog) => any)} [onClose] - Callback invoked when dialog is closed; no button
 *           option selected. When defined as a string any matching function by name exported from content Svelte
 *           component is invoked.
 *
 * @property {boolean}  [rejectClose=false] - When true and a Promise has been created by {@link TJSDialog.wait} and
 *           the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
 *           function is invoked and any result that is undefined will cause the Promise to then be rejected.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
 *
 * @property {boolean}  [resolveId=false] - When true and resolving any Promises and there are undefined results from
 *           any button callbacks the button ID is resolved.
 *
 * @property {string}   [title] - The dialog window title.
 *
 * @property {object}   [transition] - Transition options for the dialog.
 *
 * @property {number|null} [zIndex] - A specific z-index for the dialog. Pass null for the dialog to act like other
 *           applications in regard bringing to top when activated.
 */

/**
 * @typedef {object} TJSDialogButtonData - TJSDialog button data.
 *
 * @property {boolean} [autoClose=true] - When false the dialog does not automatically close when button selected.
 *
 * @property {boolean|(() => boolean)} [condition] - Determines if the button is accessible providing a truthy value.
 *
 * @property {string} [label] - Button label; will be localized.
 *
 * @property {string} [icon] - Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
 *
 * @property {string|((application: TJSDialog) => any)} [onPress] - Callback for button press. When defined as a
 *           string any matching function by name exported from content Svelte component is invoked.
 *
 * @property {Record<string, string>} [styles] - Inline styles to apply to the button.
 */
