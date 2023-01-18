import { DialogShell }        from '@typhonjs-fvtt/svelte/component/core';
import { localize }           from '@typhonjs-fvtt/svelte/helper';
import {
   deepMerge,
   isObject }                 from '@typhonjs-fvtt/svelte/util';

import { DialogData }         from './internal/DialogData.js';
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
    * @type {DialogData}
    */
   #data;

   /**
    * @param {object}   data - Dialog data.
    *
    * @param {object}   [options] - SvelteApplication options.
    */
   constructor(data, options = {})
   {
      super(options);

      this.#data = new DialogData(this);
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
    * Default options
    *
    * @returns {object} Default options
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
    * @returns {DialogData} Dialog data.
    *
    * TODO: Update with TJSDialogData above.
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
      /**
       * Invoke any `close` function defined in dialog data.
       */
      if (typeof this.data.close === 'function') { this.data.close(this); }

      return super.close(options);
   }

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * A helper factory method to create simple confirmation dialog windows which consist of simple yes/no prompts.
    * If you require more flexibility, a custom Dialog instance is preferred.
    *
    * @param {TJSConfirmConfig} config - Confirm dialog options.
    *
    * @returns {Promise<*>} A promise which resolves once the user makes a choice or closes the window.
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
   static async confirm({ title, content, yes, no, defaultYes = true, rejectClose = false, options = {},
    buttons = {}, draggable = true, focusFirst = false, modal = false, modalOptions = {}, minimizable = true,
     resizable = false, transition = {}, zIndex } = {})
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
         title,
         content,
         draggable,
         focusFirst,
         modal,
         modalOptions,
         minimizable,
         resizable,
         transition,
         zIndex,
         rejectClose,
         buttons: deepMerge(mergedButtons, {
            yes: {
               onPress: (dialog) => typeof yes === 'function' ? yes(dialog) : true
            },
            no: {
               onPress: (dialog) => typeof no === 'function' ? no(dialog) : false
            }
         }),
         default: defaultYes ? 'yes' : 'no'
      }, options);
   }

   /**
    * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
    *
    * @param {TJSPromptConfig} config - Prompt dialog options.
    *
    * @returns {Promise<*>} The returned value from the provided callback function, if any.
    */
   static async prompt({ title, content, label, callback, rejectClose = false, options = {}, draggable = true,
    focusFirst = false, icon = 'fas fa-check', modal = false, modalOptions = {}, popOut = true,
     minimizable = true, resizable = false, transition = {}, zIndex } = {})
   {
      return this.wait({
         title,
         content,
         draggable,
         focusFirst,
         modal,
         modalOptions,
         popOut,
         minimizable,
         resizable,
         transition,
         zIndex,
         rejectClose,
         buttons: {
            ok: {
               icon,
               label,
               onPress: (dialog) => callback ? callback(dialog) : true
            }
         },
         default: 'ok'
      }, options);
   }

   /**
    * Wrap a data defined TJSDialog with an enclosing Promise which resolves or rejects when the client makes a choice.
    *
    * @param {DialogData} [data]        Dialog data passed to the TJSDialog constructor.
    *
    * @param {DialogOptions} [options]  SvelteApplication options passed to the TJSDialog constructor.
    *
    * @param {object} [renderOptions]   Render options passed to the TJSDialog render call.
    *
    * @returns {Promise<any>}           A Promise that resolves to the chosen result.
    */
   static async wait(data = {}, options = {}, renderOptions = {})
   {
      // Define `rejectClose` if available in dialog data otherwise default to false.
      const rejectClose = typeof data?.rejectClose === 'boolean' ? data.rejectClose : false;

      return new Promise((resolve, reject) =>
      {
         // Tracks if a valid button target has been pressed.
         let buttonPressed = false;

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

               wrappedButtons[id].onPress = async (dialog) =>
               {
                  let result;

                  switch (typeof callback)
                  {
                     case 'function':
                        buttonPressed = true;

                        // Pass the dialog instance to the callback.
                        result = await callback(dialog);
                        break;

                     case 'string':
                     {
                        const dialogComponent = dialog?.svelte?.dialogComponent;

                        // Attempt lookup by function name in dialog instance component.
                        if (dialogComponent !== void 0 && typeof dialogComponent?.[callback] === 'function')
                        {
                           buttonPressed = true;

                           result = await dialogComponent?.[callback](dialog);
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

                  resolve(result);
               };
            }
         }

         /** @type {Function|void} */
         const closeCallback = data.close;

         /**
          * Provides a customized close method that is invoked when the application is closed. If `rejectClose` is
          * true and a valid button has not been pressed the Promise returned from `TJSDialog.wait` is rejected.
          *
          * @param {HTMLElement} html - Target application element.
          */
         const resolveClose = async (html) =>
         {
            // If a valid button is pressed then resolution occurs above otherwise we need to resolve or reject the
            // Promise.
            if (!buttonPressed)
            {
               const result = await (typeof closeCallback === 'function' ? closeCallback(html) : void 0);

               if (rejectClose)
               {
                  if (result !== void 0)
                  {
                     resolve(result);
                  }
                  else
                  {
                     reject(new Error('TJSDialog was closed without a choice being made.'));
                  }
               }
               else
               {
                  resolve(result);
               }
            }
         };

         // Instantiate and render the dialog.
         new this({ ...data, buttons: wrappedButtons, close: resolveClose }, options).render(true, renderOptions);
      });
   }
}

/**
 * @typedef {object} TJSConfirmConfig - Configuration options for the confirm dialog.
 *
 * @property {string}   title - The confirmation window title.
 *
 * @property {string}   content - The confirmation message.
 *
 * @property {(HTMLElement) => void} [yes] - Callback function upon `yes`.
 *
 * @property {(HTMLElement) => void} [no] - Callback function upon `no`.
 *
 * @property {boolean}  [defaultYes=true] - Make "yes" the default choice?
 *
 * @property {boolean}  [rejectClose=false] - Reject the Promise if the Dialog is closed without making a choice.
 *
 * @property {object}   [options={}] - Additional application options passed to the TJSDialog.
 *
 * @property {object}   [buttons={}] - Provides a button override that is merged with default buttons.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [popOut=true] - When true the dialog is a pop out Application.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
 *
 * @property {object}   [transition] - Transition options for the dialog.
 *
 * @property {number|null} [zIndex] - A specific z-index for the dialog.
 */

/**
 * @typedef {object} TJSPromptConfig - Configuration options for the confirm dialog.
 *
 * @property {string}   title - The confirmation window title.
 *
 * @property {string}   content - The confirmation message.
 *
 * @property {string}   [label] - The confirmation button text.
 *
 * @property {(HTMLElement) => void} [callback] - A callback function to fire when the button is clicked.
 *
 * @property {boolean}  [rejectClose=false] - Reject the Promise if the Dialog is closed without making a choice.
 *
 * @property {object}   [options={}] - Additional application options passed to the TJSDialog.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {string}   [icon="<i class="fas fa-check"></i>"] - Set another icon besides `fa-check` for button.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [popOut=true] - When true the dialog is a pop out Application.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
 *
 * @property {object}   [transition] - Transition options for the dialog.
 *
 * @property {number|null} [zIndex] - A specific z-index for the dialog.
 */
