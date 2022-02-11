import { derived, writable }  from "svelte/store";

import {
   propertyStore,
   subscribeIgnoreFirst }     from '@typhonjs-fvtt/svelte/store';

import {
   safeAccess,
   safeSet }                  from '@typhonjs-fvtt/svelte/util';

/**
 * Contains the reactive functionality / Svelte stores associated with SvelteApplication.
 */
export class SvelteReactive
{
   /**
    * @type {SvelteApplication}
    */
   #application;

   /**
    * @type {boolean}
    */
   #initialized = false;

   /**
    * The Application option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {StoreAppOptions}
    */
   #storeAppOptions;

   /**
    * Stores the update function for `#storeAppOptions`.
    *
    * @type {import('svelte/store').Writable.update}
    */
   #storeAppOptionsUpdate;

   /**
    * The UI option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {StoreUIOptions}
    */
   #storeUIOptions;

   /**
    * Stores the update function for `#storeUIOptions`.
    *
    * @type {import('svelte/store').Writable.update}
    */
   #storeUIOptionsUpdate;

   /**
    * Stores the unsubscribe functions from local store subscriptions.
    *
    * @type {import('svelte/store').Unsubscriber[]}
    */
   #storeUnsubscribe = [];

   /**
    * @param {SvelteApplication} application - The host Foundry application.
    */
   constructor(application)
   {
      this.#application = application;
   }

   /**
    * Initializes reactive support. Package private for internal use.
    *
    * @returns {SvelteStores} Internal methods to interact with Svelte stores.
    * @package
    */
   initialize()
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      this.#storesInitialize();

      return {
         appOptionsUpdate: this.#storeAppOptionsUpdate,
         uiOptionsUpdate: this.#storeUIOptionsUpdate,
         subscribe: this.#storesSubscribe.bind(this),
         unsubscribe: this.#storesUnsubscribe.bind(this)
      };
   }

   /**
    * Returns the draggable app option.
    *
    * @returns {boolean} Draggable app option.
    */
   get draggable() { return this.#application?.options?.draggable; }

   /**
    * Returns the headerButtonNoClose app option.
    *
    * @returns {boolean} Remove the close the button in header app option.
    */
   get headerButtonNoClose() { return this.#application?.options?.headerButtonNoClose; }

   /**
    * Returns the headerButtonNoLabel app option.
    *
    * @returns {boolean} Remove the labels from buttons in header app option.
    */
   get headerButtonNoLabel() { return this.#application?.options?.headerButtonNoLabel; }

   /**
    * Returns the minimizable app option.
    *
    * @returns {boolean} Minimizable app option.
    */
   get minimizable() { return this.#application?.options?.minimizable; }

   /**
    * @inheritDoc
    */
   get popOut() { return this.#application.popOut; }

   /**
    * Returns the resizable option.
    *
    * @returns {boolean} Resizable app option.
    */
   get resizable() { return this.#application?.options?.resizable; }

   /**
    * Returns the store for app options.
    *
    * @returns {StoreAppOptions} App options store.
    */
   get storeAppOptions() { return this.#storeAppOptions; }

   /**
    * Returns the store for UI options.
    *
    * @returns {StoreUIOptions} UI options store.
    */
   get storeUIOptions() { return this.#storeUIOptions; }

   /**
    * Returns the title accessor from the parent Application class.
    * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.
    *
    * @returns {string} Title.
    */
   get title() { return this.#application.title; }

   /**
    * Returns the zIndex app option.
    *
    * @returns {number} z-index app option.
    */
   get zIndex() { return this.#application?.options?.zIndex; }

   /**
    * Sets `this.options.draggable` which is reactive for application shells.
    *
    * @param {boolean}  draggable - Sets the draggable option.
    */
   set draggable(draggable)
   {
      if (typeof draggable === 'boolean') { this.setOptions('draggable', draggable); }
   }

   /**
    * Sets `this.options.headerButtonNoClose` which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
    */
   set headerButtonNoClose(headerButtonNoClose)
   {
      if (typeof headerButtonNoClose === 'boolean') { this.setOptions('headerButtonNoClose', headerButtonNoClose); }
   }

   /**
    * Sets `this.options.headerButtonNoLabel` which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
    */
   set headerButtonNoLabel(headerButtonNoLabel)
   {
      if (typeof headerButtonNoLabel === 'boolean') { this.setOptions('headerButtonNoLabel', headerButtonNoLabel); }
   }

   /**
    * Sets `this.options.minimizable` which is reactive for application shells that are also pop out.
    *
    * @param {boolean}  minimizable - Sets the minimizable option.
    */
   set minimizable(minimizable)
   {
      if (typeof minimizable === 'boolean') { this.setOptions('minimizable', minimizable); }
   }

   /**
    * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
    * from `ui.windows`.
    *
    * @param {boolean}  popOut - Sets the popOut option.
    */
   set popOut(popOut)
   {
      if (typeof popOut === 'boolean') { this.setOptions('popOut', popOut); }
   }

   /**
    * Sets `this.options.resizable` which is reactive for application shells.
    *
    * @param {boolean}  resizable - Sets the resizable option.
    */
   set resizable(resizable)
   {
      if (typeof resizable === 'boolean') { this.setOptions('resizable', resizable); }
   }

   /**
    * Sets `this.options.title` which is reactive for application shells.
    *
    * @param {string}   title - Application title; will be localized, so a translation key is fine.
    */
   set title(title)
   {
      if (typeof title === 'string') { this.setOptions('title', title); }
   }

   /**
    * Sets `this.options.zIndex` which is reactive for application shells.
    *
    * @param {number}   zIndex - Application z-index.
    */
   set zIndex(zIndex)
   {
      this.setOptions('zIndex', Number.isInteger(zIndex) ? zIndex : null);
   }

   /**
    * Provides a way to safely get this applications options given an accessor string which describes the
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
   getOptions(accessor, defaultValue)
   {
      return safeAccess(this.#application.options, accessor, defaultValue);
   }

   /**
    * Provides a way to merge `options` into this applications options and update the appOptions store.
    *
    * @param {object}   options - The options object to merge with `this.options`.
    */
   mergeOptions(options)
   {
      this.#storeAppOptionsUpdate((instanceOptions) => foundry.utils.mergeObject(instanceOptions, options));
   }

   /**
    * Provides a way to safely set this applications options given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * Additionally if an application shell Svelte component is mounted and exports the `appOptions` property then
    * the application options is set to `appOptions` potentially updating the application shell / Svelte component.
    *
    * // TODO DOCUMENT the accessor in more detail.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {*}        value - Value to set.
    */
   setOptions(accessor, value)
   {
      const success = safeSet(this.#application.options, accessor, value);

      // If `this.options` modified then update the app options store.
      if (success)
      {
         this.#storeAppOptionsUpdate(() => this.#application.options);
      }
   }

   /**
    * Initializes the Svelte stores and derived stores for the application options and UI state.
    *
    * While writable stores are created the update method is stored in private variables locally and derived Readable
    * stores are provided for essential options which are commonly used.
    *
    * These stores are injected into all Svelte components mounted under the `external` context: `storeAppOptions` and
    * ` storeUIOptions`.
    */
   #storesInitialize()
   {
      const writableAppOptions = writable(this.#application.options);

      // Keep the update function locally, but make the store essentially readable.
      this.#storeAppOptionsUpdate = writableAppOptions.update;

      /**
       * Create custom store. The main subscribe method for all app options changes is provided along with derived
       * writable stores for all reactive options.
       *
       * @type {StoreAppOptions}
       */
      const storeAppOptions = {
         subscribe: writableAppOptions.subscribe,

         draggable: propertyStore(writableAppOptions, 'draggable'),
         headerButtonNoClose: propertyStore(writableAppOptions, 'headerButtonNoClose'),
         headerButtonNoLabel: propertyStore(writableAppOptions, 'headerButtonNoLabel'),
         minimizable: propertyStore(writableAppOptions, 'minimizable'),
         popOut: propertyStore(writableAppOptions, 'popOut'),
         resizable: propertyStore(writableAppOptions, 'resizable'),
         title: propertyStore(writableAppOptions, 'title'),
         zIndex: propertyStore(writableAppOptions, 'zIndex'),
      };

      Object.freeze(storeAppOptions);

      this.#storeAppOptions = storeAppOptions;

      // Create a store for UI state data.
      const writableUIOptions = writable({
         dragging: false,
         headerButtons: [],
         minimized: this.#application._minimized
      });

      // Keep the update function locally, but make the store essentially readable.
      this.#storeUIOptionsUpdate = writableUIOptions.update;

      /**
       * @type {StoreUIOptions}
       */
      const storeUIOptions = {
         subscribe: writableUIOptions.subscribe,

         dragging: propertyStore(writableUIOptions, 'dragging'),

         headerButtons: derived(writableUIOptions, ($options, set) => set($options.headerButtons)),
         minimized: derived(writableUIOptions, ($options, set) => set($options.minimized))
      };

      Object.freeze(storeUIOptions);

      // Initialize the store with options set in the Application constructor.
      this.#storeUIOptions = storeUIOptions;
   }

   /**
    * Registers local store subscriptions for app options. `popOut` controls registering this app with `ui.windows`.
    * `zIndex` controls the z-index style of the element root.
    *
    * @see SvelteApplication._injectHTML
    */
   #storesSubscribe()
   {
      // Register local subscriptions.

      // Handles updating header buttons to add / remove the close button.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoClose, (value) =>
      {
         this.updateHeaderButtons({ headerButtonNoClose: value });
      }));

      // Handles updating header buttons to add / remove button labels.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoLabel, (value) =>
      {
         this.updateHeaderButtons({ headerButtonNoLabel: value });
      }));

      // Handles adding / removing this application from `ui.windows` when popOut changes.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.popOut, (value) =>
      {
         if (value && this.#application.rendered)
         {
            ui.windows[this.#application.appId] = this.#application;
         }
         else
         {
            delete ui.windows[this.#application.appId];
         }
      }));

      // Handles directly updating the element root `z-index` style when `zIndex` changes.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.zIndex, (value) =>
      {
         if (this.#application._element !== null) { this.#application._element[0].style.zIndex = value; }
      }));
   }

   /**
    * Unsubscribes from any locally monitored stores.
    *
    * @see SvelteApplication.close
    */
   #storesUnsubscribe()
   {
      this.#storeUnsubscribe.forEach((unsubscribe) => unsubscribe());
      this.#storeUnsubscribe = [];
   }

   /**
    * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
    * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
    * Hooks fired return a new button array and the uiOptions store is updated and the application shell will render
    * the new buttons.
    *
    * Optionally you can set in the Foundry app options `headerButtonNoClose` to remove the close button and
    * `headerButtonNoLabel` to true and labels will be removed from the header buttons.
    *
    * @param {object} opts - Optional parameters (for internal use)
    *
    * @param {boolean} opts.headerButtonNoClose - The value for `headerButtonNoClose`.
    *
    * @param {boolean} opts.headerButtonNoLabel - The value for `headerButtonNoLabel`.
    */
   updateHeaderButtons({ headerButtonNoClose = this.#application.options.headerButtonNoClose,
    headerButtonNoLabel = this.#application.options.headerButtonNoLabel } = {})
   {
      let buttons = this.#application._getHeaderButtons();

      // Remove close button if this.options.headerButtonNoClose is true;
      if (typeof headerButtonNoClose === 'boolean' && headerButtonNoClose)
      {
         buttons = buttons.filter((button) => button.class !== 'close');
      }

      // Remove labels if this.options.headerButtonNoLabel is true;
      if (typeof headerButtonNoLabel === 'boolean' && headerButtonNoLabel)
      {
         for (const button of buttons) { button.label = void 0; }
      }

      this.#storeUIOptionsUpdate((options) =>
      {
         options.headerButtons = buttons;
         return options;
      });
   }
}
