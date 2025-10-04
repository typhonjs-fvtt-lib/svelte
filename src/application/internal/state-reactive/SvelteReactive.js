import { derived, writable }     from '#svelte/store';

import { SvelteSet }             from '#runtime/svelte/reactivity';

import { subscribeIgnoreFirst }  from '#runtime/svelte/store/util';

import {
   TJSSessionStorage,
   TJSWebStorage }               from '#runtime/svelte/store/web-storage';

import { propertyStore }         from '#runtime/svelte/store/writable-derived';

import {
   deepMerge,
   safeAccess,
   safeSet }                     from '#runtime/util/object';

import { handleAlwaysOnTop }     from '../util/index.js';

/**
 * API docs and description in {@link SvelteAppNS.API.Reactive}.
 */
export class SvelteReactive
{
   /**
    * @type {SvelteSet<string>}
    */
   #activeClasses;

   /**
    * @type {import('../SvelteApp').SvelteApp}
    */
   #application;

   /**
    * @type {boolean}
    */
   #initialized = false;

   /**
    * @type {boolean}
    */
   #initialPopOut;

   /** @type {import('#runtime/svelte/store/web-storage').WebStorage} */
   #sessionStorage;

   /**
    * The Application option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {import('../../types').SvelteAppNS.API.Reactive.AppOptions}
    */
   #storeAppOptions;

   /**
    * Stores the update function for `#storeAppOptions`.
    *
    * @type {(this: void, updater: import('svelte/store').Updater<object>) => void}
    */
   #storeAppOptionsUpdate;

   /**
    * Stores the UI state data to make it accessible via getters.
    *
    * @type {import('../../types').SvelteAppNS.API.Reactive.UIStateData}
    */
   #dataUIState;

   /**
    * The UI option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {import('../../types').SvelteAppNS.API.Reactive.UIState}
    */
   #storeUIState;

   /**
    * Stores the update function for `#storeUIState`.
    *
    * @type {(this: void, updater: import('svelte/store').Updater<object>) => void}
    */
   #storeUIStateUpdate;

   /**
    * Stores the unsubscribe functions from local store subscriptions.
    *
    * @type {import('svelte/store').Unsubscriber[]}
    */
   #storeUnsubscribe = [];

   /**
    * @param {import('../SvelteApp').SvelteApp} application - The host Foundry application.
    *
    * @param {boolean} initialPopOut - Initial `popOut` state on app construction.
    */
   constructor(application, initialPopOut)
   {
      this.#application = application;
      this.#initialPopOut = initialPopOut;

      const optionsSessionStorage = application?.options?.sessionStorage;

      if (optionsSessionStorage !== void 0 && !(optionsSessionStorage instanceof TJSWebStorage))
      {
         throw new TypeError(`'options.sessionStorage' is not an instance of TJSWebStorage.`);
      }

      // If no external web storage API instance is available, then create a TJSSessionStorage instance.
      this.#sessionStorage = optionsSessionStorage !== void 0 ? optionsSessionStorage : new TJSSessionStorage();
   }

   /**
    * Initializes reactive support. Package private for internal use.
    *
    * @returns {import('./types-local').SvelteReactiveStores | undefined} Internal methods to interact with Svelte
    * stores.
    *
    * @package
    * @internal
    */
   initialize()
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      this.#storesInitialize();

      return {
         appOptionsUpdate: this.#storeAppOptionsUpdate,
         uiStateUpdate: this.#storeUIStateUpdate,
         subscribe: this.#storesSubscribe.bind(this),
         unsubscribe: this.#storesUnsubscribe.bind(this)
      };
   }

// Store getters -----------------------------------------------------------------------------------------------------

   /**
    * @returns {import('#runtime/svelte/store/web-storage').WebStorage} Returns WebStorage (session) instance.
    */
   get sessionStorage()
   {
      return this.#sessionStorage;
   }

   /**
    * Returns the store for app options.
    *
    * @returns {import('../../types').SvelteAppNS.API.Reactive.AppOptions} App options store.
    */
   get storeAppOptions() { return this.#storeAppOptions; }

   /**
    * Returns the store for UI options.
    *
    * @returns {import('../../types').SvelteAppNS.API.Reactive.UIState} UI options store.
    */
   get storeUIState() { return this.#storeUIState; }

// Only reactive getters ---------------------------------------------------------------------------------------------

   /**
    * Returns the current active CSS classes Set applied to the app window. This is reactive for any modifications.
    *
    * @returns {SvelteSet<string>} Active app CSS classes Set.
    */
   get activeClasses() { return this.#activeClasses; }

   /**
    * Returns the current active Window / WindowProxy UI state.
    *
    * @returns {Window} Active window UI state.
    */
   get activeWindow() { return this.#dataUIState.activeWindow ?? globalThis; }

   /**
    * Returns the current dragging UI state.
    *
    * @returns {boolean} Dragging UI state.
    */
   get dragging() { return this.#dataUIState.dragging; }

   /**
    * Returns whether the app is detached from the main browser window.
    *
    * @returns {boolean} App detached state.
    */
   get detached()
   {
      // UIState readable store for `detached` is a purely derived value. Evaluate value locally.
      return this.#dataUIState.activeWindow !== globalThis;
   }

   /**
    * Returns the current minimized UI state.
    *
    * @returns {boolean} Minimized UI state.
    */
   get minimized() { return this.#dataUIState.minimized; }

   /**
    * Returns the current resizing UI state.
    *
    * @returns {boolean} Resizing UI state.
    */
   get resizing() { return this.#dataUIState.resizing; }

   /**
    * Sets the current active Window / WindowProxy UI state.
    *
    * Note: This is protected usage and used internally.
    *
    * @param {Window} activeWindow - Active Window / WindowProxy UI state.
    *
    * @internal
    */
   set activeWindow(activeWindow)
   {
      // Note: when setting activeWindow to undefined `globalThis` is set. There isn't a great test for Window /
      // WindowProxy, so check `toString`.
      if (activeWindow === void 0 || activeWindow === null ||
       (Object.prototype.toString.call(activeWindow) === '[object Window]'))
      {
         this.#storeUIStateUpdate((options) => deepMerge(options, { activeWindow: activeWindow ?? globalThis }));
      }
   }

// Reactive getter / setters -----------------------------------------------------------------------------------------

   /**
    * Returns the alwaysOnTop app option.
    *
    * @returns {boolean} Always on top app option.
    */
   get alwaysOnTop() { return this.#application?.options?.alwaysOnTop; }

   /**
    * Returns the containerQueryType app option.
    *
    * @returns {string} App content container query app option.
    */
   get containerQueryType() { return this.#application?.options?.containerQueryType; }

   /**
    * Returns the draggable app option.
    *
    * @returns {boolean} Draggable app option.
    */
   get draggable() { return this.#application?.options?.draggable; }

   /**
    * Returns the focusAuto app option.
    *
    * @returns {boolean} When true auto-management of app focus is enabled.
    */
   get focusAuto() { return this.#application?.options?.focusAuto; }

   /**
    * Returns the focusKeep app option.
    *
    * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
    */
   get focusKeep() { return this.#application?.options?.focusKeep; }

   /**
    * Returns the focusTrap app option.
    *
    * @returns {boolean} When true focus trapping / wrapping is enabled keeping focus inside app.
    */
   get focusTrap() { return this.#application?.options?.focusTrap; }

   /**
    * Returns the headerButtonNoClose app option.
    *
    * @returns {boolean} Remove the close the button in header app option.
    */
   get headerButtonNoClose() { return this.#application?.options?.headerButtonNoClose; }

   /**
    * Returns the headerButtonNoLabel app option.
    *
    * @returns {boolean} Remove the labels from buttons in the header app option.
    */
   get headerButtonNoLabel() { return this.#application?.options?.headerButtonNoLabel; }

   /**
    * Returns the headerIcon app option.
    *
    * @returns {string | undefined} URL for header app icon.
    */
   get headerIcon() { return this.#application?.options?.headerIcon; }

   /**
    * Returns the headerNoTitleMinimized app option.
    *
    * @returns {boolean} When true removes the header title when minimized.
    */
   get headerNoTitleMinimized() { return this.#application?.options?.headerNoTitleMinimized; }

   /**
    * Returns the minimizable app option.
    *
    * @returns {boolean} Minimizable app option.
    */
   get minimizable() { return this.#application?.options?.minimizable; }

   /**
    * Returns the Foundry popOut state; {@link Application.popOut}
    *
    * @returns {boolean} Positionable app option.
    */
   get popOut() { return this.#application.popOut; }

   /**
    * Returns the positionable app option; {@link SvelteAppNS.Options.positionable}
    *
    * @returns {boolean} Positionable app option.
    */
   get positionable() { return this.#application?.options?.positionable; }

   /**
    * Returns the resizable option.
    *
    * @returns {boolean} Resizable app option.
    */
   get resizable() { return this.#application?.options?.resizable; }

   /**
    * Returns the explicit theme name option.
    *
    * @returns {string | undefined} Theme name option.
    */
   get themeName() { return this.#application?.options?.themeName; }

   /**
    * Returns the title accessor from the parent Application class; {@link Application.title}
    *
    * @privateRemarks
    * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.    *
    *
    * @returns {string} Title.
    */
   get title() { return this.#application.title; }

   /**
    * Sets `this.options.alwaysOnTop`, which is reactive for application shells.
    *
    * @param {boolean}  alwaysOnTop - Sets the `alwaysOnTop` option.
    */
   set alwaysOnTop(alwaysOnTop)
   {
      if (typeof alwaysOnTop === 'boolean') { this.setOptions('alwaysOnTop', alwaysOnTop); }
   }

   /**
    * Sets `this.options.containerQueryType`, which is reactive for application shells.
    *
    * @param {string}  containerQueryType - Sets the `containerQueryType` option.
    */
   set containerQueryType(containerQueryType)
   {
      if (containerQueryType === void 0 || containerQueryType === 'inline-size' || containerQueryType === 'size')
      {
         this.setOptions('containerQueryType', containerQueryType);
      }
   }

   /**
    * Sets `this.options.draggable`, which is reactive for application shells.
    *
    * @param {boolean}  draggable - Sets the draggable option.
    */
   set draggable(draggable)
   {
      if (typeof draggable === 'boolean') { this.setOptions('draggable', draggable); }
   }

   /**
    * Sets `this.options.focusAuto`, which is reactive for application shells.
    *
    * @param {boolean}  focusAuto - Sets the focusAuto option.
    */
   set focusAuto(focusAuto)
   {
      if (typeof focusAuto === 'boolean') { this.setOptions('focusAuto', focusAuto); }
   }

   /**
    * Sets `this.options.focusKeep`, which is reactive for application shells.
    *
    * @param {boolean}  focusKeep - Sets the focusKeep option.
    */
   set focusKeep(focusKeep)
   {
      if (typeof focusKeep === 'boolean') { this.setOptions('focusKeep', focusKeep); }
   }

   /**
    * Sets `this.options.focusTrap`, which is reactive for application shells.
    *
    * @param {boolean}  focusTrap - Sets the focusTrap option.
    */
   set focusTrap(focusTrap)
   {
      if (typeof focusTrap === 'boolean') { this.setOptions('focusTrap', focusTrap); }
   }

   /**
    * Sets `this.options.headerButtonNoClose`, which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
    */
   set headerButtonNoClose(headerButtonNoClose)
   {
      if (typeof headerButtonNoClose === 'boolean') { this.setOptions('headerButtonNoClose', headerButtonNoClose); }
   }

   /**
    * Sets `this.options.headerButtonNoLabel`, which is reactive for application shells.
    *
    * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
    */
   set headerButtonNoLabel(headerButtonNoLabel)
   {
      if (typeof headerButtonNoLabel === 'boolean') { this.setOptions('headerButtonNoLabel', headerButtonNoLabel); }
   }

   /**
    * Sets `this.options.headerIcon`, which is reactive for application shells.
    *
    * @param {string | undefined}  headerIcon - Sets the headerButtonNoLabel option.
    */
   set headerIcon(headerIcon)
   {
      if (headerIcon === void 0 || typeof headerIcon === 'string') { this.setOptions('headerIcon', headerIcon); }
   }

   /**
    * Sets `this.options.headerNoTitleMinimized`, which is reactive for application shells.
    *
    * @param {boolean}  headerNoTitleMinimized - Sets the headerNoTitleMinimized option.
    */
   set headerNoTitleMinimized(headerNoTitleMinimized)
   {
      if (typeof headerNoTitleMinimized === 'boolean')
      {
         this.setOptions('headerNoTitleMinimized', headerNoTitleMinimized);
      }
   }

   /**
    * Sets `this.options.minimizable`, which is reactive for application shells that are also pop out.
    *
    * @param {boolean}  minimizable - Sets the minimizable option.
    */
   set minimizable(minimizable)
   {
      if (typeof minimizable === 'boolean') { this.setOptions('minimizable', minimizable); }
   }

   /**
    * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
    * from `ui.windows` via the subscription set in `#storesSubscribe`.
    *
    * @param {boolean}  popOut - Sets the popOut option.
    */
   set popOut(popOut)
   {
      if (typeof popOut === 'boolean') { this.setOptions('popOut', popOut); }
   }

   /**
    * Sets `this.options.positionable`, enabling / disabling {@link SvelteApp.position}.
    *
    * @param {boolean}  positionable - Sets the positionable option.
    */
   set positionable(positionable)
   {
      if (typeof positionable === 'boolean') { this.setOptions('positionable', positionable); }
   }

   /**
    * Sets `this.options.resizable`, which is reactive for application shells.
    *
    * @param {boolean}  resizable - Sets the resizable option.
    */
   set resizable(resizable)
   {
      if (typeof resizable === 'boolean') { this.setOptions('resizable', resizable); }
   }

   /**
    * Sets `this.options.themeName`, which is reactive for application shells.
    *
    * @param {string | undefined}  themeName - Sets the themeName option.
    */
   set themeName(themeName)
   {
      if (themeName === void 0 || typeof themeName === 'string') { this.setOptions('themeName', themeName); }
   }

   /**
    * Sets `this.options.title`, which is reactive for application shells.
    *
    * Note: Will set empty string if title is undefined or null.
    *
    * @param {string | undefined | null}   title - Application title; will be localized, so a translation key is fine.
    */
   set title(title)
   {
      if (typeof title === 'string')
      {
         this.setOptions('title', title);
      }
      else if (title === void 0 || title === null)
      {
         this.setOptions('title', '');
      }
   }

   // Reactive Options API -------------------------------------------------------------------------------------------

   /**
    * Provides a way to safely get this applications options given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
    * to walk.
    *
    * @privateRemarks
    * TODO: DOCUMENT the accessor in more detail.
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
    * Provides a way to merge `options` into the application options and update the appOptions store.
    *
    * @param {object}   options - The options object to merge with `this.options`.
    */
   mergeOptions(options)
   {
      this.#storeAppOptionsUpdate((instanceOptions) => deepMerge(instanceOptions, options));
   }

   /**
    * Provides a way to safely set the application options given an accessor string which describes the
    * entries to walk. To access deeper entries into the object format, the accessor string with `.` between entries
    * to walk.
    *
    * Additionally, if an application shell Svelte component is mounted and exports the `appOptions` property, then
    * the application options are set to `appOptions` potentially updating the application shell / Svelte component.
    *
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {any}      value - Value to set.
    */
   setOptions(accessor, value)
   {
      const success = safeSet(this.#application.options, accessor, value, { createMissing: true });

      // If `this.options` modified, then update the app options store.
      if (success)
      {
         this.#storeAppOptionsUpdate(() => this.#application.options);
      }
   }

   /**
    * Serializes the main {@link SvelteAppNS.Options} for common application state.
    *
    * @returns {import('../../types').SvelteAppNS.API.Reactive.SerializedData} Common application state.
    */
   toJSON()
   {
      return {
         alwaysOnTop: this.#application?.options?.alwaysOnTop ?? false,
         draggable: this.#application?.options?.draggable ?? true,
         focusAuto: this.#application?.options?.focusAuto ?? true,
         focusKeep: this.#application?.options?.focusKeep ?? false,
         focusTrap: this.#application?.options?.focusTrap ?? true,
         headerButtonNoClose: this.#application?.options?.headerButtonNoClose ?? false,
         headerButtonNoLabel: this.#application?.options?.headerButtonNoLabel ?? false,
         headerNoTitleMinimized: this.#application?.options?.headerNoTitleMinimized ?? false,
         minimizable: this.#application?.options?.minimizable ?? true,
         positionable: this.#application?.options?.positionable ?? true,
         resizable: this.#application?.options?.resizable ?? true,
         themeName: this.#application?.options?.themeName ?? void 0
      };
   }

   /**
    * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
    * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
    * Hooks fired return a new button array, and the uiOptions store is updated, and the application shell will render
    * the new buttons.
    *
    * Optionally you can set in the SvelteApp app options {@link SvelteAppNS.Options.headerButtonNoClose}
    * to remove the close button from the header buttons.
    *
    * @param {object} [opts] - Optional parameters (for internal use)
    *
    * @param {boolean} [opts.headerButtonNoClose] - The value for `headerButtonNoClose`.
    */
   updateHeaderButtons({ headerButtonNoClose = this.#application.options.headerButtonNoClose } = {})
   {
      // The operation is queued just in case a developer mutates reactive state inside `_getHeaderButtons`.
      queueMicrotask(() =>
      {
         let buttons = this.#application._getHeaderButtons();

         // Remove close button if this.options.headerButtonNoClose is true;
         if (typeof headerButtonNoClose === 'boolean' && headerButtonNoClose)
         {
            buttons = buttons.filter((button) => button.class !== 'close');
         }

         // For AppV2 label compatibility for close button: `Close Window` instead of `Close`.
         const closeButton = buttons.find((button) => button.class === 'close');
         if (closeButton)
         {
            closeButton.keepMinimized = true;
            closeButton.label = 'APPLICATION.TOOLS.Close';
         }

         this.#storeUIStateUpdate((options) =>
         {
            options.headerButtons = buttons;
            return options;
         });
      });
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Initializes the Svelte stores and derived stores for the application options and UI state.
    *
    * While writable stores are created, the update method is stored in private variables locally and derived Readable
    * stores are provided for essential options which are commonly used.
    *
    * These stores are injected into all Svelte components mounted under the `external` context: `storeAppOptions` and
    * `storeUIState`.
    */
   #storesInitialize()
   {
      this.#activeClasses = new SvelteSet();

      for (const entry of this.#application.options?.classes ?? [])
      {
         if (typeof entry !== 'string') { continue; }

         // Ignore any AppV1 themes set.
         if (entry === 'themed' || entry.startsWith('theme-')) { continue; }

         this.#activeClasses.add(entry);
      }

      /** @type {import('svelte/store').Writable<import('../../types').SvelteAppNS.Options>} */
      const writableAppOptions = writable(this.#application.options);

      // Keep the update function locally, but make the store essentially readable.
      this.#storeAppOptionsUpdate = writableAppOptions.update;

      /**
       * Create custom store. The main subscribe method for all app options changes is provided along with derived
       * writable stores for all reactive options.
       *
       * @type {import('../../types').SvelteAppNS.API.Reactive.AppOptions}
       */
      const storeAppOptions = {
         subscribe: writableAppOptions.subscribe,

         alwaysOnTop: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'alwaysOnTop'),

         containerQueryType: /** @type {import('svelte/store').Writable<string>} */
          propertyStore(writableAppOptions, 'containerQueryType'),

         draggable: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'draggable'),

         focusAuto: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'focusAuto'),

         focusKeep: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'focusKeep'),

         focusTrap: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'focusTrap'),

         headerButtonNoClose: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'headerButtonNoClose'),

         headerButtonNoLabel: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'headerButtonNoLabel'),

         headerIcon: /** @type {import('svelte/store').Writable<string | undefined>} */
          propertyStore(writableAppOptions, 'headerIcon'),

         headerNoTitleMinimized: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'headerNoTitleMinimized'),

         minimizable: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'minimizable'),

         popOut: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'popOut'),

         positionable: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'positionable'),

         resizable: /** @type {import('svelte/store').Writable<boolean>} */
          propertyStore(writableAppOptions, 'resizable'),

         themeName: /** @type {import('svelte/store').Writable<string | undefined>} */
          propertyStore(writableAppOptions, 'themeName'),

         title: /** @type {import('svelte/store').Writable<string>} */
          propertyStore(writableAppOptions, 'title')
      };

      Object.freeze(storeAppOptions);

      this.#storeAppOptions = storeAppOptions;

      /**
       * Not all derived UIStateData is updated via `storeUIStateUpdate`. For instance `detached` is a pure derived
       * Readable and must be evaluated in `get detached()`.
       *
       * @type {import('../../types').SvelteAppNS.API.Reactive.UIStateData}
       */
      this.#dataUIState = {
         activeWindow: window,
         dragging: false,
         headerButtons: [],
         minimized: this.#application._minimized,
         resizing: false
      };

      /**
       * Create a store for UI state data.
       *
       * @type {import('svelte/store').Writable<import('../../types').SvelteAppNS.API.Reactive.UIStateData>}
       */
      const writableUIOptions = writable(this.#dataUIState);

      // Keep the update function locally, but make the store essentially readable.
      this.#storeUIStateUpdate = writableUIOptions.update;

      /**
       * @type {import('../../types').SvelteAppNS.API.Reactive.UIState}
       */
      const storeUIState = {
         subscribe: writableUIOptions.subscribe,

         activeWindow: /** @type {import('svelte/store').Readable<Window>} */
          derived(writableUIOptions, ($options, set) => set($options.activeWindow)),

         detached: /** @type {import('svelte/store').Readable<boolean>} */
          derived(writableUIOptions, ($options, set) => set($options.activeWindow !== globalThis)),

         dragging: /** @type {import('svelte/store').Readable<boolean>} */
          propertyStore(writableUIOptions, 'dragging'),

         headerButtons: /** @type {import('svelte/store').Readable<import('../../types').SvelteAppNS.HeaderButton>} */
          derived(writableUIOptions, ($options, set) => set($options.headerButtons)),

         minimized: /** @type {import('svelte/store').Readable<boolean>} */
          derived(writableUIOptions, ($options, set) => set($options.minimized)),

         resizing: /** @type {import('svelte/store').Readable<boolean>} */
          propertyStore(writableUIOptions, 'resizing')
      };

      Object.freeze(storeUIState);

      // Initialize the store with options set in the Application constructor.
      this.#storeUIState = storeUIState;
   }

   /**
    * Registers local store subscriptions for app options. `popOut` controls registering this app with `ui.windows`.
    *
    * @see SvelteApp._injectHTML
    */
   #storesSubscribe()
   {
      // Register local subscriptions.

      /**
       * Provides a way to easily remove the application from active window tracking setting `popOut` to false and
       * z-index to above the TJS dialog level effectively making the app always on top. When disabled, adds the
       * application back as a `popOut` window and brings it to the top of tracked windows.
       */
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.alwaysOnTop,
       (enabled) => handleAlwaysOnTop(this.#application, enabled, this.#initialPopOut)));

      // Handles updating header buttons to add / remove the close button.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoClose, (value) =>
       this.updateHeaderButtons({ headerButtonNoClose: value })));

      // Handles adding / removing this application from `ui.windows` when `popOut` changes.
      this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.popOut, (value) =>
      {
         if (value)
         {
            // Ensure that the app is tracked in current popout windows.
            if (globalThis?.ui?.windows?.[this.#application.appId] !== this.#application)
            {
               globalThis.ui.windows[this.#application.appId] = this.#application;
            }
         }
         else
         {
            // Remove app from global window tracking.
            if (globalThis?.ui?.activeWindow === this.#application) { globalThis.ui.activeWindow = null; }

            if (globalThis?.ui?.windows?.[this.#application.appId] === this.#application)
            {
               delete globalThis.ui.windows[this.#application.appId];
            }
         }
      }));
   }

   /**
    * Unsubscribes from any locally monitored stores.
    *
    * @see SvelteApp.close
    */
   #storesUnsubscribe()
   {
      this.#storeUnsubscribe.forEach((unsubscribe) => unsubscribe());
      this.#storeUnsubscribe = [];
   }
}
