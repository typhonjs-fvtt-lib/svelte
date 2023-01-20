import { DialogShell }        from '@typhonjs-fvtt/svelte/component/core';
import { localize }           from '@typhonjs-fvtt/svelte/helper';
import {
   deepMerge,
   isObject }                 from '@typhonjs-fvtt/svelte/util';

import { TJSDialogData }      from './internal/TJSDialogData.js';
import { SvelteApplication }  from './SvelteApplication.js';

/**
 * Provides a near Foundry API compatible dialog alternative implemented w/ Svelte. There are several features including
 * a glasspane / modal option with various styling and transition capabilities. Most importantly the `content`
 * attribute of dialog data can be a Svelte component configuration object to render HTML content.
 *
 * TODO: document all dialog data parameters; keep track of newly added like button -> styles, title; modal,
 * draggable, transition options, modal transitions
 */
export class TJSDialog extends SvelteApplication
{
   /**
    * @type {TJSDialogData}
    */
   #data;

   /**
    * @param {TJSDialogOptions}           data - Dialog options.
    *
    * @param {SvelteApplicationOptions}   [options] - SvelteApplication options.
    */
   constructor(data, options = {})
   {
      super(options);

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
            props: function() { return { data: this.#data }; } // this context is the SvelteApplication when invoked.
         }
      });
   }

   /**
    * Returns the dialog data.
    *
    * @returns {TJSDialogData} Dialog data.
    *
    * TODO: Update with TJSDialogOptions above.
    */
   get data() { return this.#data; }

   /**
    * Sets the dialog data; this is reactive.
    *
    * @param {object}   data - Dialog data.
    */
   set data(data)
   {
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
    * @returns {Promise<void>} A Promise which resolves once the application is closed.
    */
   async close(options)
   {
      // Invoke any `onClose` function defined in dialog data.
      if (this.data.onClose !== void 0) { TJSDialog.#invokeFn(this.data.onClose, this); }

      return super.close(options);
   }

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
    * If you require more flexibility, a custom Dialog instance is preferred.
    *
    * @param {TJSDialogOptions} data - Confirm dialog options.
    *
    * @param {Record<string, TJSDialogButtonData>}  [data.buttons={}] - Provides a button override that is merged
    *        with default buttons allowing a change in icon / label for the default buttons.
    *
    * @param {boolean}  [data.defaultYes=true] - Make `yes` the default choice?
    *
    * @param {string|((application: TJSDialog) => any)} [data.yes] - Callback function upon `yes`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {string|((application: TJSDialog) => any)} [data.no] - Callback function upon `no`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {boolean}  [data.rejectClose=false] - Reject the Promise if the dialog is closed without making a choice.
    *
    * @returns {Promise<any>} A promise which resolves with result of yes / no callbacks or true / false.
    *
    * @example
    * let d = TJSDialog.confirm({
    *  title: "A Yes or No Question",
    *  content: "<p>Choose wisely.</p>",
    *  yes: () => console.log("You chose ... wisely"),
    *  no: () => console.log("You chose ... poorly"),
    *  defaultYes: false
    * });
    */
   static async confirm({ buttons = {}, defaultYes = true, yes, no, ...data } = {})
   {
      // Allow overwriting of default icon and labels.
      const mergedButtons = deepMerge({
         yes: {
            icon: 'fas fa-check',
            label: localize('Yes')
         },
         no: {
            icon: 'fas fa-times',
            label: localize('No'),
         }
      }, buttons);

      return this.wait({
         ...data,
         buttons: deepMerge(mergedButtons, {
            yes: {
               onPress: async (application) => this.#invokeFn(yes, application, true)
            },
            no: {
               onPress: async (application) => this.#invokeFn(no, application, false)
            }
         }),
         default: defaultYes ? 'yes' : 'no'
      });
   }

   /**
    * A helper method to invoke a callback function directly or lookup an exported function with the same name from any
    * content Svelte component to invoke.
    *
    * @param {string|((application: TJSDialog) => any)} callback - Callback function to invoke; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {TJSDialog} application - TJSDialog instance passed to callback.
    *
    * @param {*} [defaultResult] - An optional default result to return; undefined if not specified.
    *
    * @returns {Promise<any>} Result.
    */
   static async #invokeFn(callback, application, defaultResult = void 0)
   {
      let result = defaultResult;

      switch (typeof callback)
      {
         case 'function':
            // Pass the dialog instance to the callback.
            result = await callback(application);
            break;

         case 'string':
         {
            const dialogComponent = application?.svelte?.dialogComponent;

            // Attempt lookup by function name in dialog instance component.
            if (dialogComponent !== void 0 && typeof dialogComponent?.[callback] === 'function')
            {
               result = await dialogComponent?.[callback](application);
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
    * @param {TJSDialogOptions} [data] - Prompt dialog options.
    *
    * @param {string|((application: TJSDialog) => any)} [data.callback] - Callback function upon `ok`; may be an async
    *        function. When defined as a string any matching function by name exported from content Svelte component is
    *        invoked.
    *
    * @param {string}   [data.label] - The OK prompt button text.
    *
    * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
    *
    * @param {boolean}  [data.rejectClose=false] - Reject the Promise if the dialog is closed without making a choice.
    *
    * @returns {Promise<any|boolean>} The returned value from the provided callback function or `true` if the button
    *          is pressed.
    */
   static async prompt({ callback, label, icon = 'fas fa-check', ...data } = {})
   {
      return this.wait({
         ...data,
         buttons: {
            ok: {
               icon,
               label,
               onPress: async (application) => this.#invokeFn(callback, application, true)
            }
         },
         default: 'ok'
      });
   }

   /**
    * Wrap a data defined TJSDialog with an enclosing Promise which resolves or rejects when the client makes a choice.
    *
    * @param {TJSDialogOptions}  [data] - Dialog data passed to the TJSDialog constructor.
    *
    * @param {boolean}           [data.resolveId=false] - When true and there are undefined results from any button
    *        callbacks the button ID is returned.
    *
    * @param {boolean}           [data.rejectClose=false] - When true and there are undefined results reject Promise.
    *
    * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
    *
    * @param {object}            [renderOptions]   Render options passed to the TJSDialog render call.
    *
    * @returns {Promise<any>} A Promise that resolves to the chosen result.
    */
   static async wait(data = {}, options = {}, renderOptions = {})
   {
      // Explicitly define `rejectClose` and `resolveId` if available in dialog data otherwise default to false.
      const rejectClose = typeof data?.rejectClose === 'boolean' ? data.rejectClose : false;
      const resolveId = typeof data?.resolveId === 'boolean' ? data.resolveId : false;

      return new Promise((resolve, reject) =>
      {
         // Tracks if a valid result is determined from a button press or default button ID.
         let isResolved = false;

         // Stores the wrapped `data.buttons`.
         const wrappedButtons = {};

         if (isObject(data.buttons))
         {
            // Wrap buttons with Promise resolution. Allow button callback functions to be async.
            for (const [id, button] of Object.entries(data.buttons))
            {
               /** @type {string|Function} */
               const callback = button.onPress;

               // Don't override the actual `onPress` callback supplied in `data.buttons`.
               wrappedButtons[id] = Object.assign({}, button);

               wrappedButtons[id].onPress = async (application) =>
               {
                  // Button is pressed and this function will resolve the Promise.
                  isResolved = true;

                  const result = this.#invokeFn(callback, application);

                  // Handle the case when default button IDs are desired and there are no callback results.
                  resolve(resolveId && result === void 0 ? id : result);
               };
            }
         }

         const closeCallback = data.onClose;

         /**
          * Provides a customized close method that is invoked when the application is closed. If `rejectClose` is
          * true and a result has not been resolved above then the Promise returned from `TJSDialog.wait` is rejected.
          *
          * @param {TJSDialog} application - The dialog application.
          */
         const resolveClose = async (application) =>
         {
            if (!isResolved)
            {
               const result = await (typeof closeCallback === 'function' ? closeCallback(application) : void 0);

               if (rejectClose && result === void 0)
               {
                  reject(new Error('TJSDialog was closed without a choice being made.'));
               }
               else
               {
                  resolve(result);
               }
            }
         };

         // Instantiate and render the dialog.
         new this({ ...data, buttons: wrappedButtons, onClose: resolveClose }, options).render(true, renderOptions);
      });
   }
}

/**
 * @typedef {object} TJSDialogOptions - Defines the common dialog configuration data.
 *
 * @property {object|string}  content - A Svelte configuration object or HTML string content.
 *
 * @property {Record<string, TJSDialogButtonData>}  [buttons={}] - Provides a button override that is merged with default
 *           buttons.
 *
 * @property {string|((application: TJSDialog) => any)} [onClose] - Callback invoked when dialog is closed; no button
 *           option selected. When defined as a string any matching function by name exported from content Svelte
 *           component is invoked.
 *
 * @property {string}   [default] - The default button ID to focus initially.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {SvelteApplicationOptions}   [options={}] - Additional application options passed to the TJSDialog.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
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
