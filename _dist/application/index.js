import { isObject, deepMerge, safeAccess, safeSet, hasGetter, klona } from '@typhonjs-svelte/runtime-base/util/object';
import { writable, derived } from 'svelte/store';
import { subscribeIgnoreFirst } from '@typhonjs-svelte/runtime-base/svelte/store/util';
import { TJSWebStorage, TJSSessionStorage } from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';
import { propertyStore } from '@typhonjs-svelte/runtime-base/svelte/store/writable-derived';
import { TJSSvelteConfigUtil, TJSSvelteUtil } from '@typhonjs-svelte/runtime-base/svelte/util';
import { CrossWindow } from '@typhonjs-svelte/runtime-base/util/browser';
import { TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { A11yHelper } from '@typhonjs-svelte/runtime-base/util/a11y';
import { DialogShell } from '@typhonjs-fvtt/svelte/component/internal';
import { ManagedPromise } from '@typhonjs-svelte/runtime-base/util/async';

/**
 * Provides the ability the save / restore / serialize application state for positional and UI state such as minimized
 * status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
class ApplicationState
{
   /** @type {object} */
   #application;

   /**
    * Stores the current save state key being restored by animating. When a restore is already being animated with the
    * same name the subsequent restore animation is ignored.
    *
    * @type {string | undefined}
    */
   #currentRestoreKey;

   /** @type {Map<string, import('./types').ApplicationStateData>} */
   #dataSaved = new Map();

   /**
    * @param {object}   application - The application.
    */
   constructor(application)
   {
      this.#application = application;

      Object.seal(this);
   }

   /**
    * Clears all saved application state.
    */
   clear()
   {
      this.#dataSaved.clear();
   }

   /**
    * Returns current application state along with any extra data passed into method.
    *
    * @param {object} [extra] - Extra data to add to application state.
    *
    * @returns {import('./types').ApplicationStateData} Passed in object with current application state.
    */
   current(extra = {})
   {
      return Object.assign(extra, {
         position: this.#application?.position?.get(),
         beforeMinimized: this.#application?.position?.state.get({ name: '#beforeMinimized' }),
         options: this.#application?.reactive?.toJSON(),
         ui: { minimized: this.#application?.reactive?.minimized }
      });
   }

   /**
    * Gets any saved application state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Saved data set name.
    *
    * @returns {import('./types').ApplicationStateData | undefined} Any saved application state.
    */
   get({ name })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - get error: 'name' is not a string.`);
      }

      return this.#dataSaved.get(name);
   }

   /**
    * @returns {IterableIterator<string>} The saved application state names / keys.
    */
   keys()
   {
      return this.#dataSaved.keys();
   }

   /**
    * Removes and returns any saved application state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {import('./types').ApplicationStateData | undefined} Any saved application state.
    */
   remove({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`ApplicationState - remove: 'name' is not a string.`); }

      const data = this.#dataSaved.get(name);
      this.#dataSaved.delete(name);

      return data;
   }

   /**
    * Restores a previously saved application state by `name` returning the data. Several optional parameters are
    * available to animate / tween to the new state. When `animateTo` is true an animation is scheduled via
    * {@link AnimationAPI.to} and the duration and easing name or function may be specified.
    *
    * @param {object}            options - Options.
    *
    * @param {string}            options.name - Saved data set name.
    *
    * @param {boolean}           [options.remove=false] - Remove data set.
    *
    * @param {boolean}           [options.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [options.duration=0.1] - Duration in seconds.
    *
    * @param {import('#runtime/svelte/easing').EasingReference} [options.ease='linear'] - Easing function or easing
    *        function name.
    *
    * @returns {import('./types').ApplicationStateData | undefined} Any saved application state.
    */
   restore({ name, remove = false, animateTo = false, duration = 0.1, ease = 'linear' })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - restore error: 'name' is not a string.`);
      }

      const dataSaved = this.#dataSaved.get(name);

      if (dataSaved)
      {
         if (remove) { this.#dataSaved.delete(name); }

         // Multiple invocations for animated restores are skipped when one is already in progress.
         if (animateTo && name !== this.#currentRestoreKey)
         {
            // Track current restore key name.
            this.#currentRestoreKey = name;

            this.#setImpl(dataSaved, {
               animateTo,
               async: true,
               duration,
               ease
            }).then(() =>
            {
               // Reset current restore key name for animation if the same as initial animation initiation.
               if (name === this.#currentRestoreKey) { this.#currentRestoreKey = void 0; }
            });
         }
      }

      return dataSaved;
   }

   /**
    * Saves current application state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to index this saved state.
    *
    * @returns {import('./types').ApplicationStateData} Current saved application state.
    */
   save({ name, ...extra })
   {
      if (typeof name !== 'string') { throw new TypeError(`ApplicationState - save error: 'name' is not a string.`); }

      const data = this.current(extra);

      this.#dataSaved.set(name, data);

      return data;
   }

   /**
    * Sets application state from the given {@link ApplicationStateData} instance. Several optional parameters are
    * available to animate / tween to the new state. When `animateTo` is true an animation is scheduled via
    * {@link AnimationAPI.to} and the duration and easing name or function may be specified.
    *
    * Note: If serializing application state any minimized apps will use the before minimized state on initial render
    * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
    *
    * @param {import('./types').ApplicationStateData}   data - Saved data set name.
    *
    * @param {object}         [options] - Optional parameters
    *
    * @param {boolean}        [options.animateTo=false] - Animate to restore data.
    *
    * @param {number}         [options.duration=0.1] - Duration in seconds.
    *
    * @param {import('#runtime/svelte/easing').EasingReference} [options.ease='linear'] - Easing function or easing
    *        function name.
    */
   set(data, options = {})
   {
      this.#setImpl(data, { ...options, async: false });
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Sets application state from the given {@link ApplicationStateData} instance. Several optional parameters are
    * available to animate / tween to the new state. When `animateTo` is true an animation is scheduled via
    * {@link AnimationAPI.to} and the duration and easing name or function may be specified.
    *
    * Note: If serializing application state any minimized apps will use the before minimized state on initial render
    * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
    *
    * @privateRemarks
    * TODO: THIS METHOD NEEDS TO BE REFACTORED WHEN TRL IS MADE INTO A STANDALONE FRAMEWORK.
    *
    * @param {import('./types').ApplicationStateData}   data - Saved data set name.
    *
    * @param {object}            [opts] - Optional parameters
    *
    * @param {boolean}           [opts.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [opts.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [opts.duration=0.1] - Duration in seconds.
    *
    * @param {import('#runtime/svelte/easing').EasingReference} [opts.ease='linear'] - Easing function or easing
    *        function name.
    *
    * @returns {undefined | Promise<void>} When asynchronous the animation Promise.
    */
   #setImpl(data, { async = false, animateTo = false, duration = 0.1, ease = 'linear' } = {})
   {
      if (!isObject(data))
      {
         throw new TypeError(`ApplicationState - restore error: 'data' is not an object.`);
      }

      const application = this.#application;

      if (!isObject(data?.position))
      {
         console.warn(`ApplicationState.set warning: 'data.position' is not an object.`);
         return;
      }

      // TODO: TAKE NOTE THAT WE ARE ACCESSING A FOUNDRY APP v1 GETTER HERE TO DETERMINE IF APPLICATION IS RENDERED.
      // TODO: THIS NEEDS TO BE REFACTORED WHEN CONVERTING TRL TO A GENERIC FRAMEWORK.
      const rendered = application.rendered;

      // Update data directly with no store or inline style updates.
      if (animateTo)  // Animate to saved data.
      {
         if (!rendered)
         {
            console.warn(`ApplicationState.set warning: Application is not rendered and 'animateTo' is true.`);
            return;
         }

         // Provide special handling to potentially change transform origin as this parameter is not animated.
         if (data.position.transformOrigin !== application.position.transformOrigin)
         {
            application.position.transformOrigin = data.position.transformOrigin;
         }

         if (isObject(data?.ui))
         {
            const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

            if (application?.reactive?.minimized && !minimized)
            {
               application.maximize({ animate: false, duration: 0 });
            }
         }

         const promise = application.position.animate.to(data.position, {
            duration,
            ease,
            strategy: 'cancelAll'
         }).finished.then(({ cancelled }) =>
         {
            if (cancelled) { return; }

            // Merge in saved options to application.
            if (isObject(data?.options))
            {
               application?.reactive.mergeOptions(data.options);
            }

            if (isObject(data?.ui))
            {
               const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

               // Application is currently minimized and stored state is not, so reset minimized state without
               // animation.
               if (!application?.reactive?.minimized && minimized)
               {
                  application.minimize({ animate: false, duration: 0 });
               }
            }

            if (isObject(data?.beforeMinimized))
            {
               application.position.state.set({ name: '#beforeMinimized', ...data.beforeMinimized });
            }
         });

         // Return a Promise with the application that resolves after animation ends.
         if (async) { return promise; }
      }
      else
      {
         if (rendered)
         {
            // Merge in saved options to application.
            if (isObject(data?.options))
            {
               application?.reactive.mergeOptions(data.options);
            }

            if (isObject(data?.ui))
            {
               const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

               // Application is currently minimized and stored state is not, so reset minimized state without
               // animation.
               if (application?.reactive?.minimized && !minimized)
               {
                  application.maximize({ animate: false, duration: 0 });
               }
               else if (!application?.reactive?.minimized && minimized)
               {
                  application.minimize({ animate: false, duration });
               }
            }

            if (isObject(data?.beforeMinimized))
            {
               application.position.state.set({ name: '#beforeMinimized', ...data.beforeMinimized });
            }

            // Default options is to set data for an immediate update.
            application.position.set(data.position);
         }
         else
         {
            // When not rendered set position to the 'beforeMinimized' data if it exists otherwise set w/ 'position'.
            // Currently, w/ Foundry core Application API it is impossible to initially render an app in the minimized
            // state.

            let positionData = data.position;

            if (isObject(data.beforeMinimized))
            {
               // Take before minimized data.
               positionData = data.beforeMinimized;

               // Apply position left / top to before minimized data. This covers the case when an app is minimized,
               // but then moved. This allows restoration of the before minimized parameters w/ the last position
               // location.
               positionData.left = data.position.left;
               positionData.top = data.position.top;
            }

            application.position.set(positionData);
         }
      }
   }
}

/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 */
class GetSvelteData
{
   /** @type {import('./types').MountedAppShell[] | null[]} */
   #applicationShellHolder;

   /** @type {import('./types').SvelteData[]} */
   #svelteData;

   /**
    * Keep a direct reference to the SvelteData array in an associated {@link SvelteApplication}.
    *
    * @param {import('./types').MountedAppShell[] | null[]}  applicationShellHolder - A reference to the
    *        MountedAppShell array.
    *
    * @param {import('./types').SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
    */
   constructor(applicationShellHolder, svelteData)
   {
      this.#applicationShellHolder = applicationShellHolder;
      this.#svelteData = svelteData;
   }

   /**
    * Returns any mounted {@link MountedAppShell}.
    *
    * @returns {import('./types').MountedAppShell | null} Any mounted application shell.
    */
   get applicationShell() { return this.#applicationShellHolder[0]; }

   /**
    * Returns the indexed Svelte component.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte component.
    */
   component(index)
   {
      const data = this.#svelteData[index];
      return data?.component ?? void 0;
   }

   /**
    * Returns the Svelte component entries iterator.
    *
    * @returns {IterableIterator<[number, import('svelte').SvelteComponent]>} Svelte component entries iterator.
    * @yields
    */
   *componentEntries()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield [cntr, this.#svelteData[cntr].component];
      }
   }

   /**
    * Returns the Svelte component values iterator.
    *
    * @returns {IterableIterator<import('svelte').SvelteComponent>} Svelte component values iterator.
    * @yields
    */
   *componentValues()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield this.#svelteData[cntr].component;
      }
   }

   /**
    * Returns the indexed SvelteData entry.
    *
    * @param {number}   index - The index of SvelteData instance to retrieve.
    *
    * @returns {import('./types').SvelteData} The loaded Svelte config + component.
    */
   data(index)
   {
      return this.#svelteData[index];
   }

   /**
    * Returns the {@link SvelteData} instance for a given component.
    *
    * @param {import('svelte').SvelteComponent} component - Svelte component.
    *
    * @returns {import('./types').SvelteData} -  The loaded Svelte config + component.
    */
   dataByComponent(component)
   {
      for (const data of this.#svelteData)
      {
         if (data.component === component) { return data; }
      }

      return void 0;
   }

   /**
    * Returns the SvelteData entries iterator.
    *
    * @returns {IterableIterator<[number, import('./types').SvelteData]>} SvelteData entries iterator.
    */
   dataEntries()
   {
      return this.#svelteData.entries();
   }

   /**
    * Returns the SvelteData values iterator.
    *
    * @returns {IterableIterator<import('./types').SvelteData>} SvelteData values iterator.
    */
   dataValues()
   {
      return this.#svelteData.values();
   }

   /**
    * Returns the length of the mounted Svelte component list.
    *
    * @returns {number} Length of mounted Svelte component list.
    */
   get length()
   {
      return this.#svelteData.length;
   }
}

/**
 * Contains the reactive functionality / Svelte stores associated with SvelteApplication and retrievable by
 * {@link SvelteApplication.reactive}.
 *
 * There are several reactive getters for UI state such and for two-way bindings / stores see
 * {@link SvelteReactive.storeUIState}:
 * - {@link SvelteReactive.dragging}
 * - {@link SvelteReactive.minimized}
 * - {@link SvelteReactive.resizing}
 *
 * There are also reactive getters / setters for {@link SvelteApp.Options} and Foundry
 * `ApplicationOptions`. You can use the following as one way bindings and update the
 * associated stores. For two-way bindings / stores see {@link SvelteReactive.storeAppOptions}.
 *
 * - {@link SvelteReactive.draggable}
 * - {@link SvelteReactive.focusAuto}
 * - {@link SvelteReactive.focusKeep}
 * - {@link SvelteReactive.focusTrap}
 * - {@link SvelteReactive.headerButtonNoClose}
 * - {@link SvelteReactive.headerButtonNoLabel}
 * - {@link SvelteReactive.headerIcon}
 * - {@link SvelteReactive.headerNoTitleMinimized}
 * - {@link SvelteReactive.minimizable}
 * - {@link SvelteReactive.popOut}
 * - {@link SvelteReactive.positionable}
 * - {@link SvelteReactive.resizable}
 * - {@link SvelteReactive.title}
 *
 * An instance of TJSWebStorage (session) / TJSSessionStorage is accessible via {@link SvelteReactive.sessionStorage}.
 * Optionally you can pass in an existing TJSWebStorage instance that can be shared across multiple SvelteApplications
 * by setting {@link SvelteApp.Options.sessionStorage}.
 *
 * -------------------------------------------------------------------------------------------------------------------
 *
 * This API is not sealed, and it is recommended that you extend it with accessors to get / set data that is reactive
 * in your application. An example of setting an exported prop `document` from the main mounted application shell.
 *
 * @example
 * import { hasSetter } from '@typhonjs-fvtt/runtime/svelte/util';
 *
 * // Note: make a normal comment.
 * //  * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
 * //  *                             Document with the mounted application shell Svelte component.
 * //  *
 * //  * @memberof SvelteReactive#
 * //  *
 * Object.defineProperty(this.reactive, 'document', {
 *    get: () => this.svelte?.applicationShell?.document,
 *    set: (document) =>
 *    {
 *       const component = this.svelte?.applicationShell;
 *       if (hasSetter(component, 'document')) { component.document = document; }
 *    }
 * });
 */
class SvelteReactive
{
   /**
    * @type {import('../SvelteApplication').SvelteApplication}
    */
   #application;

   /**
    * @type {boolean}
    */
   #initialized = false;

   /** @type {import('#runtime/svelte/store/web-storage').WebStorage} */
   #sessionStorage;

   /**
    * The Application option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {import('./types').StoreAppOptions}
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
    * @type {object}
    */
   #dataUIState;

   /**
    * The UI option store which is injected into mounted Svelte component context under the `external` key.
    *
    * @type {import('./types').StoreUIOptions}
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
    * @param {import('../SvelteApplication').SvelteApplication} application - The host Foundry application.
    */
   constructor(application)
   {
      this.#application = application;
      const optionsSessionStorage = application?.options?.sessionStorage;

      if (optionsSessionStorage !== void 0 && !(optionsSessionStorage instanceof TJSWebStorage))
      {
         throw new TypeError(`'options.sessionStorage' is not an instance of TJSWebStorage.`);
      }

      // If no external web storage API instance is available then create a TJSSessionStorage instance.
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
    * @returns {import('./types').StoreAppOptions} App options store.
    */
   get storeAppOptions() { return this.#storeAppOptions; }

   /**
    * Returns the store for UI options.
    *
    * @returns {import('./types').StoreUIOptions} UI options store.
    */
   get storeUIState() { return this.#storeUIState; }

// Only reactive getters ---------------------------------------------------------------------------------------------

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
    * @returns {boolean} Remove the labels from buttons in header app option.
    */
   get headerButtonNoLabel() { return this.#application?.options?.headerButtonNoLabel; }

   /**
    * Returns the headerIcon app option.
    *
    * @returns {string|void} URL for header app icon.
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
    * Returns the positionable app option; {@link SvelteApp.Options.positionable}
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
    * Returns the title accessor from the parent Application class; {@link Application.title}
    *
    * @privateRemarks
    * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.    *
    *
    * @returns {string} Title.
    */
   get title() { return this.#application.title; }

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
    * Sets `this.options.focusAuto` which is reactive for application shells.
    *
    * @param {boolean}  focusAuto - Sets the focusAuto option.
    */
   set focusAuto(focusAuto)
   {
      if (typeof focusAuto === 'boolean') { this.setOptions('focusAuto', focusAuto); }
   }

   /**
    * Sets `this.options.focusKeep` which is reactive for application shells.
    *
    * @param {boolean}  focusKeep - Sets the focusKeep option.
    */
   set focusKeep(focusKeep)
   {
      if (typeof focusKeep === 'boolean') { this.setOptions('focusKeep', focusKeep); }
   }

   /**
    * Sets `this.options.focusTrap` which is reactive for application shells.
    *
    * @param {boolean}  focusTrap - Sets the focusTrap option.
    */
   set focusTrap(focusTrap)
   {
      if (typeof focusTrap === 'boolean') { this.setOptions('focusTrap', focusTrap); }
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
    * Sets `this.options.headerIcon` which is reactive for application shells.
    *
    * @param {string | undefined}  headerIcon - Sets the headerButtonNoLabel option.
    */
   set headerIcon(headerIcon)
   {
      if (headerIcon === void 0 || typeof headerIcon === 'string') { this.setOptions('headerIcon', headerIcon); }
   }

   /**
    * Sets `this.options.headerNoTitleMinimized` which is reactive for application shells.
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
    * Sets `this.options.positionable` enabling / disabling {@link SvelteApplication.position}.
    *
    * @param {boolean}  positionable - Sets the positionable option.
    */
   set positionable(positionable)
   {
      if (typeof positionable === 'boolean') { this.setOptions('positionable', positionable); }
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
      this.#storeAppOptionsUpdate((instanceOptions) => deepMerge(instanceOptions, options));
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
    * @param {any}      value - Value to set.
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
    * Serializes the main {@link SvelteApp.Options} for common application state.
    *
    * @returns {import('./types').SvelteReactiveData} Common application state.
    */
   toJSON()
   {
      return {
         draggable: this.#application?.options?.draggable ?? true,
         focusAuto: this.#application?.options?.focusAuto ?? true,
         focusKeep: this.#application?.options?.focusKeep ?? false,
         focusTrap: this.#application?.options?.focusTrap ?? true,
         headerButtonNoClose: this.#application?.options?.headerButtonNoClose ?? false,
         headerButtonNoLabel: this.#application?.options?.headerButtonNoLabel ?? false,
         headerNoTitleMinimized: this.#application?.options?.headerNoTitleMinimized ?? false,
         minimizable: this.#application?.options?.minimizable ?? true,
         positionable: this.#application?.options?.positionable ?? true,
         resizable: this.#application?.options?.resizable ?? true
      };
   }

   /**
    * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
    * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
    * Hooks fired return a new button array and the uiOptions store is updated and the application shell will render
    * the new buttons.
    *
    * Optionally you can set in the SvelteApplication app options {@link SvelteApp.Options.headerButtonNoClose}
    * to remove the close button and {@link SvelteApp.Options.headerButtonNoLabel} to true and labels will be
    * removed from the header buttons.
    *
    * @param {object} [opts] - Optional parameters (for internal use)
    *
    * @param {boolean} [opts.headerButtonNoClose] - The value for `headerButtonNoClose`.
    *
    * @param {boolean} [opts.headerButtonNoLabel] - The value for `headerButtonNoLabel`.
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

      this.#storeUIStateUpdate((options) =>
      {
         options.headerButtons = buttons;
         return options;
      });
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Initializes the Svelte stores and derived stores for the application options and UI state.
    *
    * While writable stores are created the update method is stored in private variables locally and derived Readable
    * stores are provided for essential options which are commonly used.
    *
    * These stores are injected into all Svelte components mounted under the `external` context: `storeAppOptions` and
    * `storeUIState`.
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
       * @type {import('./types').StoreAppOptions}
       */
      const storeAppOptions = {
         subscribe: writableAppOptions.subscribe,

         draggable: propertyStore(writableAppOptions, 'draggable'),
         focusAuto: propertyStore(writableAppOptions, 'focusAuto'),
         focusKeep: propertyStore(writableAppOptions, 'focusKeep'),
         focusTrap: propertyStore(writableAppOptions, 'focusTrap'),
         headerButtonNoClose: propertyStore(writableAppOptions, 'headerButtonNoClose'),
         headerButtonNoLabel: propertyStore(writableAppOptions, 'headerButtonNoLabel'),
         headerIcon: propertyStore(writableAppOptions, 'headerIcon'),
         headerNoTitleMinimized: propertyStore(writableAppOptions, 'headerNoTitleMinimized'),
         minimizable: propertyStore(writableAppOptions, 'minimizable'),
         popOut: propertyStore(writableAppOptions, 'popOut'),
         positionable: propertyStore(writableAppOptions, 'positionable'),
         resizable: propertyStore(writableAppOptions, 'resizable'),
         title: propertyStore(writableAppOptions, 'title')
      };

      Object.freeze(storeAppOptions);

      this.#storeAppOptions = storeAppOptions;

      this.#dataUIState = {
         activeWindow: globalThis,
         dragging: false,
         headerButtons: [],
         minimized: this.#application._minimized,
         resizing: false
      };

      // Create a store for UI state data.
      const writableUIOptions = writable(this.#dataUIState);

      // Keep the update function locally, but make the store essentially readable.
      this.#storeUIStateUpdate = writableUIOptions.update;

      /**
       * @type {import('./types').StoreUIOptions}
       */
      const storeUIState = {
         subscribe: writableUIOptions.subscribe,

         // activeWindow: propertyStore(writableUIOptions, 'activeWindow'),
         activeWindow: derived(writableUIOptions, ($options, set) => set($options.activeWindow)),
         dragging: propertyStore(writableUIOptions, 'dragging'),
         headerButtons: derived(writableUIOptions, ($options, set) => set($options.headerButtons)),
         minimized: derived(writableUIOptions, ($options, set) => set($options.minimized)),
         resizing: propertyStore(writableUIOptions, 'resizing')
      };

      Object.freeze(storeUIState);

      // Initialize the store with options set in the Application constructor.
      this.#storeUIState = storeUIState;
   }

   /**
    * Registers local store subscriptions for app options. `popOut` controls registering this app with `ui.windows`.
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
            globalThis.ui.windows[this.#application.appId] = this.#application;
         }
         else
         {
            delete globalThis.ui.windows[this.#application.appId];
         }
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
}

/**
 * Defines the application shell contract. If Svelte components export getter / setters for the following properties
 * then that component is considered an application shell.
 *
 * @type {string[]}
 */
const applicationShellContract = ['elementRoot'];

Object.freeze(applicationShellContract);

/**
 * Provides a method to determine if the passed in object / Svelte component follows the application shell contract.
 * This involves ensuring that the accessors defined in `applicationShellContract`.
 *
 * Note: A caveat is that when using Vite in a developer build components are wrapped in a proxy / ProxyComponent that
 * defines instance accessors versus on the prototype, so the check below ensures that all accessors in the contract are
 * either available on the prototype or directly on the instance.
 *
 * @param {*}  component - Object / component to test.
 *
 * @returns {boolean} Whether the component is a ApplicationShell or TJSApplicationShell.
 */
function isApplicationShell(component)
{
   if (component === null || component === void 0) { return false; }

   let compHasContract = true;
   let protoHasContract = true;

   // Check for accessors on the instance.
   for (const accessor of applicationShellContract)
   {
      const descriptor = Object.getOwnPropertyDescriptor(component, accessor);
      if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) { compHasContract = false; }
   }

   // Get the prototype which is the parent SvelteComponent that has any getter / setters.
   const prototype = Object.getPrototypeOf(component);

   // Verify the application shell contract. If the accessors (getters / setters) are defined for
   // `applicationShellContract`.
   for (const accessor of applicationShellContract)
   {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, accessor);
      if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) { protoHasContract = false; }
   }

   return compHasContract || protoHasContract;
}

/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {object}            [opts] - Optional parameters.
 *
 * @param {object}            [opts.app] - The target application
 *
 * @param {import('#runtime/svelte/util').TJSSvelteConfig}  [opts.config] - Svelte component options
 *
 * @param {Function}          [opts.elementRootUpdate] - A callback to assign to the external context.
 *
 * @returns {import('#svelte-fvtt/application').SvelteData} The config + instantiated Svelte component.
 */
function loadSvelteConfig({ app, config, elementRootUpdate } = {})
{
   let target;

   // A specific HTMLElement to append Svelte component.
   if (CrossWindow.isHTMLElement(config.target))
   {
      target = config.target;
   }
   else if (typeof config.target === 'string')
   {
      // Attempt to find target from query selector string.
      const activeWindow = app?.reactive?.activeWindow;
      target = activeWindow?.document?.querySelector(config.target);
   }

   if (!CrossWindow.isHTMLElement(target))
   {
      console.log(
       `%c[TRL] loadSvelteConfig error - Could not find target, '${config.target}', for config:\n`,
        'background: rgb(57,34,34)', config);

      throw new Error();
   }

   const NewSvelteComponent = config.class;

   const svelteConfig = TJSSvelteConfigUtil.parseConfig({ ...config, target }, app);

   const externalContext = svelteConfig.context.get('#external');

   // Inject the Foundry application instance and `elementRootUpdate` to the external context.
   externalContext.application = app;
   externalContext.elementRootUpdate = elementRootUpdate;
   externalContext.sessionStorage = app.reactive.sessionStorage;

   let eventbus;

   // Potentially inject any TyphonJS eventbus and track the proxy in the SvelteData instance.
   if (isObject(app._eventbus) && typeof app._eventbus.createProxy === 'function')
   {
      eventbus = app._eventbus.createProxy();
      externalContext.eventbus = eventbus;
   }

   // Seal external context so that it can't be extended.
   Object.seal(externalContext);

   // Create the Svelte component.
   /**
    * @type {import('svelte').SvelteComponent}
    */
   const component = new NewSvelteComponent(svelteConfig);

   // Set any eventbus to the config.
   svelteConfig.eventbus = eventbus;

   /**
    * @type {HTMLElement}
    */
   let element;

   // We can directly get the root element from components which follow the application store contract.
   if (isApplicationShell(component))
   {
      element = component.elementRoot;
   }

   if (!CrossWindow.isHTMLElement(element))
   {
      console.log(
       `%c[TRL] loadSvelteConfig error - No application shell contract found. Did you bind and export a HTMLElement ` +
        `as 'elementRoot' and include '<svelte:options accessors={true}/>'?\n` +
         `\nOffending config:\n`, 'background: rgb(57,34,34)', config);

      throw new Error();
   }

   return { config: svelteConfig, component, element };
}

/**
 * Provides an index of all visible rendered {@link SvelteApplication} instances in a given Svelte runtime. This allows
 * bulk operations to be performed across all apps.
 */
class TJSAppIndex
{
   /**
    * Stores all visible / rendered apps.
    *
    * @type {Map<string, import('#svelte-fvtt/application').SvelteApplication>}
    */
   static #visibleApps = new Map();

   /**
    * Adds a SvelteApplication to all visible apps tracked.
    *
    * @param {import('#svelte-fvtt/application').SvelteApplication} app - A SvelteApplication
    *
    * @package
    */
   static add(app)
   {
      this.#visibleApps.set(app.id, app);
   }

   /**
    * Removes a SvelteApplication from all visible apps tracked.
    *
    * @param {import('#svelte-fvtt/application').SvelteApplication} app - A SvelteApplication
    *
    * @package
    */
   static delete(app)
   {
      this.#visibleApps.delete(app.id);
   }

   /**
    * Gets a particular app by ID.
    *
    * @param {string}   key - App ID.
    *
    * @returns {import('#svelte-fvtt/application').SvelteApplication} Associated app.
    */
   static get(key)
   {
      return this.#visibleApps.get(key);
   }

   /**
    * Returns whether an associated app by ID is being tracked.
    *
    * @param {string}   key - App ID.
    *
    * @returns {boolean} The given App ID is visible.
    */
   static has(key)
   {
      return this.#visibleApps.has(key);
   }

   /**
    * @returns {IterableIterator<string>} All visible app IDs.
    */
   static keys()
   {
      return this.#visibleApps.keys();
   }

   /**
    * @returns {IterableIterator<import('#svelte-fvtt/application').SvelteApplication>} All visible apps.
    */
   static values()
   {
      return this.#visibleApps.values();
   }
}

class FoundryHMRSupport
{
   static initialize()
   {
      if (import.meta.hot)
      {
         Hooks.on('hotReload', (data) =>
         {
            // Only handle JSON hot reload presumably specified in package manifest for language translation files.
            if (data?.extension === 'json')
            {
               // Postpone until next clock tick to allow Foundry to update localization first.
               setTimeout(() =>
               {
                  for (const app of TJSAppIndex.values())
                  {
                     const appShell = app.svelte.applicationShell;

                     // Retrieve the original `svelte-hmr` instrumented HMR component / not the proxy.
                     const hmrComponent = appShell?.$$?.hmr_cmp;

                     if (appShell && typeof hmrComponent?.$replace === 'function')
                     {
                        const svelteData = app.svelte.dataByComponent(appShell);
                        if (svelteData)
                        {
                           try
                           {
                              // Replace with self; this will invoke `on_hmr` callback in associated SvelteApplication.
                              hmrComponent.$replace(hmrComponent.constructor, {
                                 target: svelteData.config.target,
                                 anchor: svelteData.config.anchor,
                                 preserveLocalState: true,
                                 conservative: true
                              });
                           }
                           catch (error)
                           {
                              const name = hmrComponent?.constructor?.name ?? 'Unknown';
                              console.error(`TyphonJS Runtime Library error; Could not hot reload component: '${name}'`);
                              console.error(error);
                           }
                        }
                     }
                  }
               }, 0);
            }

            return true;
         });
      }
   }
}

/**
 * Provides a Svelte aware extension to the Foundry {@link Application} class to manage the app lifecycle
 * appropriately. You can declaratively load one or more components from `defaultOptions` using a
 * {@link #runtime/svelte/util|TJSSvelteConfig} object in the {@link SvelteApp.Options.svelte} property.
 *
 * @template [Options = import('./types').SvelteApp.Options]
 * @augments {Application<Options>}
 *
 * @implements {import('#runtime/svelte/store/position').TJSPositionTypes.Positionable}
 */
class SvelteApplication extends Application
{
   /**
    * Stores the first mounted component which follows the application shell contract.
    *
    * @type {import('./internal/state-svelte/types').MountedAppShell[] | null[]} Application shell.
    */
   #applicationShellHolder = [null];

   /**
    * Stores and manages application state for saving / restoring / serializing.
    *
    * @type {ApplicationState}
    */
   #applicationState;

   /**
    * Stores the target element which may not necessarily be the main element.
    *
    * @type {HTMLElement}
    */
   #elementTarget = null;

   /**
    * Stores the content element which is set for application shells.
    *
    * @type {HTMLElement}
    */
   #elementContent = null;

   /**
    * On initial render gating of `setPosition` invoked by `Application._render` occurs, so that percentage values
    * can correctly be positioned with initial helper constraints (centered).
    *
    * @type {boolean}
    */
   #gateSetPosition = false;

   /**
    * Stores initial z-index from `_renderOuter` to set to target element / Svelte component.
    *
    * @type {number}
    */
   #initialZIndex = 95;

   /**
    * Stores on mount state which is checked in _render to trigger onSvelteMount callback.
    *
    * @type {boolean}
    */
   #onMount = false;

   /**
    * The position store.
    *
    * @type {TJSPosition}
    */
   #position;

   /**
    * Contains the Svelte stores and reactive accessors.
    *
    * @type {SvelteReactive}
    */
   #reactive;

   /**
    * Stores SvelteData entries with instantiated Svelte components.
    *
    * @type {import('./internal/state-svelte/types').SvelteData[]}
    */
   #svelteData = [];

   /**
    * Provides a helper class that combines multiple methods for interacting with the mounted components tracked in
    * #svelteData.
    *
    * @type {GetSvelteData}
    */
   #getSvelteData = new GetSvelteData(this.#applicationShellHolder, this.#svelteData);

   /**
    * Contains methods to interact with the Svelte stores.
    *
    * @type {import('./internal/state-reactive/types-local').SvelteReactiveStores}
    */
   #stores;

   /**
    * @param {Partial<Options>} [options] - The options for the application.
    */
   constructor(options = {})
   {
      super(options);

      if (!isObject(this.options.svelte))
      {
         throw new Error(`SvelteApplication - constructor - No Svelte configuration object found in 'options'.`);
      }

      /** @type {ApplicationState} */
      this.#applicationState = new ApplicationState(this);

      // Initialize TJSPosition with the position object set by Application.
      this.#position = new TJSPosition(this, {
         ...this.position,
         ...this.options,
         initial: this.options.positionInitial,
         ortho: this.options.positionOrtho,
         validator: this.options.positionValidator
      });

      // Remove old position field.
      delete this.position;

      /**
       * Define accessors to retrieve TJSPosition by `this.position`.
       *
       * @member {TJSPosition} position - Adds accessors to SvelteApplication to get / set the position data.
       *
       * @memberof SvelteApplication#
       */
      Object.defineProperty(this, 'position', {
         get: () => this.#position,
         set: (position) => { if (isObject(position)) { this.#position.set(position); } }
      });

      this.#reactive = new SvelteReactive(this);

      this.#stores = this.#reactive.initialize();
   }

   /**
    * Specifies the default options that SvelteApplication supports.
    *
    * @returns {import('./types').SvelteApp.Options} options - Application options.
    * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
    */
   static get defaultOptions()
   {
      return /** @type {import('./types').SvelteApp.Options} */ deepMerge(super.defaultOptions, {
         defaultCloseAnimation: true,     // If false the default slide close animation is not run.
         draggable: true,                 // If true then application shells are draggable.
         focusAuto: true,                 // When true auto-management of app focus is enabled.
         focusKeep: false,                // When `focusAuto` and `focusKeep` is true; keeps internal focus.
         focusSource: void 0,             // Stores any A11yFocusSource data that is applied when app is closed.
         focusTrap: true,                 // When true focus trapping / wrapping is enabled keeping focus inside app.
         headerButtonNoClose: false,      // If true then the close header button is removed.
         headerButtonNoLabel: false,      // If true then header button labels are removed for application shells.
         headerIcon: void 0,              // Sets a header icon given an image URL.
         headerNoTitleMinimized: false,   // If true then header title is hidden when application is minimized.
         minHeight: MIN_WINDOW_HEIGHT,    // Assigned to position. Number specifying minimum window height.
         minWidth: MIN_WINDOW_WIDTH,      // Assigned to position. Number specifying minimum window width.
         positionable: true,              // If false then `position.set` does not take effect.
         positionInitial: TJSPosition.Initial.browserCentered,      // A helper for initial position placement.
         positionOrtho: true,             // When true TJSPosition is optimized for orthographic use.
         positionValidator: TJSPosition.Validators.transformWindow, // A function providing the default validator.
         sessionStorage: void 0,          // An instance of WebStorage (session) to share across SvelteApplications.
         svelte: void 0,                  // A Svelte configuration object.
         transformOrigin: 'top left'      // By default, 'top / left' respects rotation when minimizing.
      });
   }

   /**
    * Returns the content element if an application shell is mounted.
    *
    * @returns {HTMLElement} Content element.
    */
   get elementContent() { return this.#elementContent; }

   /**
    * Returns the target element or main element if no target defined.
    *
    * @returns {HTMLElement} Target element.
    */
   get elementTarget() { return this.#elementTarget; }

   /**
    * Returns the reactive accessors & Svelte stores for SvelteApplication.
    *
    * @returns {import('./internal/state-reactive/types').SvelteReactive} The reactive accessors & Svelte stores.
    */
   get reactive() { return this.#reactive; }

   /**
    * Returns the application state manager.
    *
    * @returns {import('./internal/state-app/types').ApplicationState} The application state manager.
    */
   get state() { return this.#applicationState; }

   /**
    * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
    *
    * @returns {import('./internal/state-svelte/types').GetSvelteData} GetSvelteData
    */
   get svelte() { return this.#getSvelteData; }

   /**
    * In this case of when a template is defined in app options `html` references the inner HTML / template. However,
    * to activate classic v1 tabs for a Svelte component the element target is passed as an array simulating JQuery as
    * the element is retrieved immediately and the core listeners use standard DOM queries.
    *
    * @protected
    * @ignore
    * @internal
    */
   _activateCoreListeners(html)
   {
      super._activateCoreListeners(typeof this.options.template === 'string' ? html :
       [this.popOut ? this.#elementTarget?.firstChild : this.#elementTarget]);
   }

   /**
    * Provide an override to set this application as the active window regardless of z-index. Changes behaviour from
    * Foundry core.
    *
    * @param {object} [opts] - Optional parameters.
    *
    * @param {boolean} [opts.focus=true] - When true and the active element is not contained in the app `elementTarget`
    *        is focused..
    *
    * @param {boolean} [opts.force=false] - Force bring to top; will increment z-index by popOut order.
    *
    * @ignore
    * @internal
    */
   bringToTop({ focus = true, force = false } = {})
   {
      // Only perform bring to top when the active window is the main Foundry window instance.
      if (this.reactive.activeWindow !== globalThis) { return; }

      if (force || this.popOut) { super.bringToTop(); }

      const elementTarget = this.elementTarget;
      const activeElement = document.activeElement;

      // If the activeElement is not contained in this app via elementTarget then blur the current active element
      // and make elementTarget focused.
      if (focus && elementTarget && activeElement !== elementTarget && !elementTarget?.contains(activeElement))
      {
         // Blur current active element.
         if (A11yHelper.isFocusTarget(activeElement))
         {
            activeElement.blur();
         }

         elementTarget?.focus();
      }

      globalThis.ui.activeWindow = this;
   }

   /**
    * Note: This method is fully overridden and duplicated as Svelte components need to be destroyed manually and the
    * best visual result is to destroy them after the default slide up animation occurs, but before the element
    * is removed from the DOM.
    *
    * If you destroy the Svelte components before the slide up animation the Svelte elements are removed immediately
    * from the DOM. The purpose of overriding ensures the slide up animation is always completed before
    * the Svelte components are destroyed and then the element is removed from the DOM.
    *
    * Close the application and unregisters references to it within UI mappings.
    * This function returns a Promise which resolves once the window closing animation concludes.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {boolean}  [options.force] - Force close regardless of render state.
    *
    * @returns {Promise<void>}    A Promise which resolves once the application is closed.
    *
    * @ignore
    * @internal
    */
   async close(options = {})
   {
      const states = Application.RENDER_STATES;

      if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) { return; }

      /**
       * Get the element.
       *
       * @type {HTMLElement}
       */
      const el = this.#elementTarget;
      if (!el)
      {
         /**
          * @ignore
          * @internal
          */
         this._state = states.CLOSED;

         return;
      }

      // Support for PopOut! module; `close` is double invoked; once before the element is rejoined to the main window.
      // Reject close invocations when the element window is not the main originating window / globalThis.
      if (CrossWindow.getWindow(el, { throws: false }) !== globalThis) { return; }

      /**
       * @ignore
       * @internal
       */
      this._state = states.CLOSING;

      // Unsubscribe from any local stores.
      this.#stores.unsubscribe();

      // Make any window content overflow hidden to avoid any scrollbars appearing in default or Svelte outro
      // transitions.
      const content = el.querySelector('.window-content');
      if (content)
      {
         content.style.overflow = 'hidden';

         // Set all children of content to overflow hidden as if there is going to be additional scrolling elements
         // they are likely one level deep.
         for (let cntr = content.children.length; --cntr >= 0;)
         {
            content.children[cntr].style.overflow = 'hidden';
         }
      }

      // Dispatch Hooks for closing the base and subclass applications
      for (const cls of this.constructor._getInheritanceChain())
      {
         /**
          * A hook event that fires whenever this Application is closed.
          *
          * Note: JQuery wrapping as Foundry event arguments uses JQuery.
          */
         Hooks.call(`close${cls.name}`, this, $(el));
      }

      // If options `defaultCloseAnimation` is false then do not execute the standard slide up animation.
      // This allows Svelte components to provide any out transition. Application shells will automatically set
      // `defaultCloseAnimation` based on any out transition set or unset.
      const animate = typeof this.options.defaultCloseAnimation === 'boolean' ? this.options.defaultCloseAnimation :
       true;

      if (animate)
      {
         // Set min height for full slide.
         el.style.minHeight = '0';

         const { paddingBottom, paddingTop } = globalThis.getComputedStyle(el);

         // Slide-up application.
         await el.animate([
            { maxHeight: `${el.clientHeight}px`, paddingTop, paddingBottom },
            { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
         ], { duration: 250, easing: 'ease-in', fill: 'forwards' }).finished;
      }

      // Stores the Promises returned from running outro transitions and destroying each Svelte component.
      const svelteDestroyPromises = [];

      // Manually invoke the destroy callbacks for all Svelte components.
      for (const entry of this.#svelteData)
      {
         // Use `outroAndDestroy` to run outro transitions before destroying.
         svelteDestroyPromises.push(TJSSvelteUtil.outroAndDestroy(entry.component));

         // If any proxy eventbus has been added then remove all event registrations from the component.
         const eventbus = entry.config.eventbus;
         if (isObject(eventbus) && typeof eventbus.off === 'function')
         {
            eventbus.off();
            entry.config.eventbus = void 0;
         }
      }

      // Await all Svelte components to destroy.
      await Promise.allSettled(svelteDestroyPromises);

      // Remove from all visible apps tracked.
      TJSAppIndex.delete(this);

      // Reset SvelteData like this to maintain reference to GetSvelteData / `this.svelte`.
      this.#svelteData.length = 0;

      // Remove element from the DOM. Most SvelteComponents have already removed it.
      el.remove();

      // Silently restore any width / height state before minimized as applicable.
      this.position.state.restore({
         name: '#beforeMinimized',
         properties: ['width', 'height'],
         silent: true,
         remove: true
      });

      // Clean up data
      this.#applicationShellHolder[0] = null;

      /**
       * @ignore
       * @internal
       */
      this._element = null;
      this.#elementContent = null;
      this.#elementTarget = null;

      delete globalThis.ui.windows[this.appId];

      /**
       * @ignore
       * @internal
       */
      this._minimized = false;

      /**
       * @ignore
       * @internal
       */
      this._scrollPositions = null;

      /**
       * @ignore
       * @internal
       */
      this._state = states.CLOSED;

      this.#onMount = false;

      // Update the minimized UI store state.
      this.#stores.uiStateUpdate((storeOptions) => deepMerge(storeOptions, { minimized: this._minimized }));

      // Apply any stored focus options and then remove them from options.
      A11yHelper.applyFocusSource(this.options.focusSource);

      delete this.options.focusSource;
   }

   /**
    * Inject the Svelte components defined in `this.options.svelte`. The Svelte component can attach to the existing
    * pop-out of Application or provide no template and render into a document fragment which is then attached to the
    * DOM.
    *
    * @protected
    * @ignore
    * @internal
    */
   _injectHTML()
   {
      // Make sure the store is updated with the latest header buttons. Also allows filtering buttons before display.
      this.reactive.updateHeaderButtons();

      // Create a function to generate a callback for Svelte components to invoke to update the tracked elements for
      // application shells in the rare cases that the main element root changes. The update is only triggered on
      // successive changes of `elementRoot`. Returns a boolean to indicate the element roots are updated.
      const elementRootUpdate = () =>
      {
         let cntr = 0;

         return (elementRoot) =>
         {
            if (elementRoot !== null && elementRoot !== void 0 && cntr++ > 0)
            {
               this.#updateApplicationShell();
               return true;
            }

            return false;
         };
      };

      // A sanity check; absence should be detected in constructor.
      if (!isObject(this.options.svelte))
      {
         throw new Error(`SvelteApplication - _injectHTML - No Svelte configuration object found in 'options'.`);
      }

      const svelteData = loadSvelteConfig({
         app: this,
         config: this.options.svelte,
         elementRootUpdate
      });

      // A sanity check as shouldn't hit this case as only one component is being mounted.
      if (this.svelte.applicationShell !== null)
      {
         throw new Error(
          `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:\n` +
           `${JSON.stringify(this.options.svelte)}`);
      }

      this.#applicationShellHolder[0] = svelteData.component;

      // If Vite / HMR / svelte_hmr is enabled then add a hook to receive callbacks when the ProxyComponent
      // refreshes. Update the element root accordingly and force an update to TJSPosition.
      // See this issue for info about `on_hmr`:
      // https://github.com/sveltejs/svelte-hmr/issues/57
      if (TJSSvelteUtil.isHMRProxy(svelteData.component) && Array.isArray(svelteData.component?.$$?.on_hmr))
      {
         svelteData.component.$$.on_hmr.push(() => () => this.#updateApplicationShell());
      }

      this.#svelteData.push(svelteData);

      // Wrap `elementRoot` as a JQuery object and set to AppV1 / Application element.
      this._element = $(this.svelte.applicationShell.elementRoot);

      // Detect if the application shell exports an `elementContent` accessor.
      this.#elementContent = hasGetter(this.svelte.applicationShell, 'elementContent') ?
       this.svelte.applicationShell.elementContent : null;

      // Detect if the application shell exports an `elementTarget` accessor if not set `elementTarget` to
      // `elementRoot`.
      this.#elementTarget = hasGetter(this.svelte.applicationShell, 'elementTarget') ?
       this.svelte.applicationShell.elementTarget : this.svelte.applicationShell.elementRoot;

      // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
      // in `this.#initialZIndex`.
      if (typeof this.options.positionable === 'boolean' && this.options.positionable)
      {
         this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
          this.#initialZIndex ?? 95;
      }

      // Subscribe to local store handling.
      this.#stores.subscribe();
   }

   /**
    * Provides a mechanism to update the UI options store for maximized.
    *
    * Note: the sanity check is duplicated from {@link Application.maximize} the store is updated _before_
    * performing the rest of animations. This allows application shells to remove / show any resize handlers
    * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
    * to animate the content area.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.animate=true] - When true perform default maximizing animation.
    *
    * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
    */
   async maximize({ animate = true, duration = 0.1 } = {})
   {
      if (!this.popOut || [false, null].includes(this._minimized)) { return; }

      this._minimized = null;

      const durationMS = duration * 1000; // For WAAPI.

      // Get content
      const element = this.elementTarget;
      const header = element.querySelector('.window-header');
      const content = element.querySelector('.window-content');

      // Get the complete position before minimized. Used to reset min width & height to initial values later.
      const positionBefore = this.position.state.get({ name: '#beforeMinimized' });

      // First animate / restore width / async.
      if (animate)
      {
         await this.position.state.restore({
            name: '#beforeMinimized',
            async: true,
            animateTo: true,
            properties: ['width'],
            duration: 0.1
         });
      }

      element.classList.remove('minimized');

      // Reset display none on all children of header.
      for (let cntr = header.children.length; --cntr >= 0;) { header.children[cntr].style.display = null; }

      content.style.display = null;

      let constraints;

      if (animate)
      {
         // Next animate / restore height synchronously and remove key. Retrieve constraints data for slide up animation
         // below.
         ({ constraints } = this.position.state.restore({
            name: '#beforeMinimized',
            animateTo: true,
            properties: ['height'],
            remove: true,
            duration
         }));
      }
      else
      {
         ({ constraints } = this.position.state.remove({ name: '#beforeMinimized' }));
      }

      // Slide down content with stored constraints.
      await content.animate([
         { maxHeight: 0, paddingTop: 0, paddingBottom: 0, offset: 0 },
         { ...constraints, offset: 1 },
         { maxHeight: '100%', offset: 1 },
      ], { duration: durationMS, fill: 'forwards' }).finished; // WAAPI in ms.

      // Restore previous min width & height from saved data, app options, or default Foundry values.
      this.position.set({
         minHeight: positionBefore.minHeight ?? this.options?.minHeight ?? MIN_WINDOW_HEIGHT,
         minWidth: positionBefore.minWidth ?? this.options?.minWidth ?? MIN_WINDOW_WIDTH,
      });

      // Remove inline styles that override any styles assigned to the app.
      element.style.minWidth = null;
      element.style.minHeight = null;

      this._minimized = false;

      // Using a 50ms timeout prevents any instantaneous display of scrollbars with the above maximize animation.
      setTimeout(() =>
      {
         content.style.overflow = null;

         // Reset all children of content removing overflow hidden.
         for (let cntr = content.children.length; --cntr >= 0;)
         {
            content.children[cntr].style.overflow = null;
         }
      }, 50);

      this.#stores.uiStateUpdate((options) => deepMerge(options, { minimized: false }));
   }

   /**
    * Provides a mechanism to update the UI options store for minimized.
    *
    * Note: the sanity check is duplicated from {@link Application.minimize} the store is updated _before_
    * performing the rest of animations. This allows application shells to remove / show any resize handlers
    * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
    * to animate the content area.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.animate=true] - When true perform default minimizing animation.
    *
    * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
    */
   async minimize({ animate = true, duration = 0.1 } = {})
   {
      if (!this.rendered || !this.popOut || [true, null].includes(this._minimized)) { return; }

      this.#stores.uiStateUpdate((options) => deepMerge(options, { minimized: true }));

      this._minimized = null;

      const durationMS = duration * 1000; // For WAAPI.

      const element = this.elementTarget;

      // Get content
      const header = element.querySelector('.window-header');
      const content = element.querySelector('.window-content');

      // Save current max / min height & width.
      const beforeMinWidth = this.position.minWidth;
      const beforeMinHeight = this.position.minHeight;

      // Set minimized min width & height for header bar.
      this.position.set({ minWidth: 100, minHeight: 30 });

      // Also set inline styles to override any styles scoped to the app.
      element.style.minWidth = '100px';
      element.style.minHeight = '30px';

      if (content)
      {
         content.style.overflow = 'hidden';

         // Set all children of content to overflow hidden as if there is going to be additional scrolling elements
         // they are likely one level deep.
         for (let cntr = content.children.length; --cntr >= 0;)
         {
            content.children[cntr].style.overflow = 'hidden';
         }
      }

      const { paddingBottom, paddingTop } = globalThis.getComputedStyle(content);

      // Extra data that is saved with the current position. Used during `maximize`.
      const constraints = {
         maxHeight: `${content.clientHeight}px`,
         paddingTop,
         paddingBottom
      };

      // Slide-up content
      if (animate)
      {
         const animation = content.animate([
            constraints,
            { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
         ], { duration: durationMS, fill: 'forwards' }); // WAAPI in ms.

         // Set display style to none when animation finishes.
         animation.finished.then(() => content.style.display = 'none');
      }
      else
      {
         setTimeout(() => content.style.display = 'none', durationMS);
      }

      // Save current position state and add the constraint data to use in `maximize`.
      const saved = this.position.state.save({ name: '#beforeMinimized', constraints });

      // Set the initial before min width & height.
      saved.minWidth = beforeMinWidth;
      saved.minHeight = beforeMinHeight;

      const headerOffsetHeight = header.offsetHeight;

      // minHeight needs to be adjusted to header height.
      this.position.minHeight = headerOffsetHeight;

      if (animate)
      {
         // First await animation of height upward.
         await this.position.animate.to({ height: headerOffsetHeight }, { duration }).finished;
      }

      // Set all header buttons besides close and the window title to display none.
      for (let cntr = header.children.length; --cntr >= 0;)
      {
         const className = header.children[cntr].className;

         if (className.includes('window-title') || className.includes('close')) { continue; }

         // v10+ of Foundry core styles automatically hides anything besides the window title and close button, so
         // explicitly set display to block.
         if (className.includes('keep-minimized'))
         {
            header.children[cntr].style.display = 'block';
            continue;
         }

         header.children[cntr].style.display = 'none';
      }

      if (animate)
      {
         // Await animation of width to the left / minimum width.
         await this.position.animate.to({ width: MIN_WINDOW_WIDTH }, { duration: 0.1 }).finished;
      }

      element.classList.add('minimized');

      this._minimized = true;
   }

   /**
    * Provides a callback after all Svelte components are initialized.
    *
    * @param {import('./internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell
    *        elements.
    */
   onSvelteMount(mountedAppShell) {} // eslint-disable-line no-unused-vars

   /**
    * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
    * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
    * context.
    *
    * @param {import('./internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell
    *        elements.
    */
   onSvelteRemount(mountedAppShell) {} // eslint-disable-line no-unused-vars

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @protected
    * @ignore
    * @internal
    */
   _replaceHTML(element, html)  // eslint-disable-line no-unused-vars
   {
      if (!element.length) { return; }

      this.reactive.updateHeaderButtons();
   }

   /**
    * Provides an override verifying that a new Application being rendered for the first time doesn't have a
    * corresponding DOM element already loaded. This is a check that only occurs when `this._state` is
    * `Application.RENDER_STATES.NONE`. It is useful in particular when SvelteApplication has a static ID
    * explicitly set in `this.options.id` and long intro / outro transitions are assigned. If a new application
    * sharing this static ID attempts to open / render for the first time while an existing DOM element sharing
    * this static ID exists then the initial render is cancelled below rather than crashing later in the render
    * cycle {@link TJSPosition.set}.
    *
    * @protected
    * @ignore
    * @internal
    */
   async _render(force = false, options = {})
   {
      // Store any focusSource instance.
      if (isObject(options?.focusSource)) { this.options.focusSource = options.focusSource; }

      const activeWindow = this.reactive.activeWindow;

      try
      {
         if (this._state === Application.RENDER_STATES.NONE &&
          A11yHelper.isFocusTarget(activeWindow.document.querySelector(`#${this.id}`)))
         {
            console.warn(`SvelteApplication - _render: A DOM element already exists for CSS ID '${this.id
             }'. Cancelling initial render for new application with appId '${this.appId}'.`);

            return;
         }
      }
      catch (err)
      {
         console.warn(`SvelteApplication - _render: Potentially malformed application ID '${this.id
          }'. Cancelling initial render for new application with appId '${this.appId}'.`);

         return;
      }

      // On initial render gating of `setPosition` invoked by `Application._render` occurs, so that percentage values
      // can correctly be positioned with initial helper constraints (centered).
      this.#gateSetPosition = true;

      await super._render(force, options);

      this.#gateSetPosition = false;

      // Handle the same render exclusion tests that reject a render in Application.

      // Do not render under certain conditions.
      if ([Application.RENDER_STATES.CLOSING, Application.RENDER_STATES.RENDERING].includes(this._state)) { return; }

      // Applications which are not currently rendered must be forced.
      if (!force && (this._state <= Application.RENDER_STATES.NONE)) { return; }

      // It is necessary to directly invoke `position.set` as TJSPosition uses accessors and is not a bare object, so
      // the merging that occurs in `Application._render` does not take effect. Additionally, any of the main
      // positional properties that are defined as strings such as percentage values need to be set after the element
      // is mounted.
      if (!this._minimized)
      {
         this.#position.set({
            left: typeof this.options?.left === 'string' ? this.options.left : void 0,
            height: typeof this.options?.height === 'string' ? this.options.height : void 0,
            maxHeight: typeof this.options?.maxHeight === 'string' ? this.options.maxHeight : void 0,
            maxWidth: typeof this.options?.maxWidth === 'string' ? this.options.maxWidth : void 0,
            minHeight: typeof this.options?.minHeight === 'string' ? this.options.minHeight : void 0,
            minWidth: typeof this.options?.minWidth === 'string' ? this.options.minWidth : void 0,
            rotateX: typeof this.options?.rotateX === 'string' ? this.options.rotateX : void 0,
            rotateY: typeof this.options?.rotateY === 'string' ? this.options.rotateY : void 0,
            rotateZ: typeof this.options?.rotateZ === 'string' ? this.options.rotateZ : void 0,
            rotation: typeof this.options?.rotation === 'string' ? this.options.rotation : void 0,
            top: typeof this.options?.top === 'string' ? this.options.top : void 0,
            width: typeof this.options?.width === 'string' ? this.options.width : void 0,

            ...options
         });
      }

      if (!this.#onMount)
      {
         // Add to visible apps tracked.
         TJSAppIndex.add(this);

         this.onSvelteMount({
            elementRoot: /** @type {HTMLElement} */ this._element[0],
            elementContent: this.#elementContent,
            elementTarget: this.#elementTarget
         });

         this.#onMount = true;
      }
   }

   /**
    * Render the inner application content. Provide an empty JQuery element per the core Foundry API.
    *
    * @protected
    * @ignore
    * @internal
    */
   async _renderInner()
   {
      const activeWindow = this.reactive.activeWindow;

      const html = activeWindow.document.createDocumentFragment();

      return $(html);
   }

   /**
    * Stores the initial z-index set in `_renderOuter` which is used in `_injectHTML` to set the target element
    * z-index after the Svelte component is mounted.
    *
    * @protected
    * @ignore
    * @internal
    */
   async _renderOuter()
   {
      const html = await super._renderOuter();
      this.#initialZIndex = html[0].style.zIndex;
      return html;
   }

   /**
    * All calculation and updates of position are implemented in {@link TJSPosition.set}. This allows position to be
    * fully reactive and in control of updating inline styles for the application.
    *
    * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
    * to update to using the {@link TJSPosition.validators} / ValidatorAPI functionality.
    *
    * @param {import('#runtime/svelte/store/position').Data.TJSPositionDataRelative}   [position] - TJSPosition data.
    *
    * @returns {TJSPosition} The updated position object for the application containing the new values.
    * @ignore
    */
   setPosition(position)
   {
      return !this.#gateSetPosition ? this.position.set(position) : this.position;
   }

   /**
    * This method is invoked by the `elementRootUpdate` callback that is added to the external context passed to
    * Svelte components. When invoked it updates the local element roots tracked by SvelteApplication.
    *
    * This method may also be invoked by HMR / hot module replacement via `svelte-hmr`.
    */
   #updateApplicationShell()
   {
      const applicationShell = this.svelte.applicationShell;

      if (applicationShell !== null)
      {
         this._element = $(applicationShell.elementRoot);

         // Detect if the application shell exports an `elementContent` accessor.
         this.#elementContent = hasGetter(applicationShell, 'elementContent') ?
          applicationShell.elementContent : null;

         // Detect if the application shell exports an `elementTarget` accessor.
         this.#elementTarget = hasGetter(applicationShell, 'elementTarget') ?
          applicationShell.elementTarget : null;

         if (this.#elementTarget === null)
         {
            this.#elementTarget = typeof this.options.selectorTarget === 'string' ?
             this._element[0].querySelector(this.options.selectorTarget) : this._element[0];
         }

         // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
         // in `this.#initialZIndex`.
         if (typeof this.options.positionable === 'boolean' && this.options.positionable)
         {
            this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
             this.#initialZIndex ?? 95;

            super.bringToTop();

            // Ensure that new root element has inline position styles set.
            this.position.set(this.position.get());
         }

         super._activateCoreListeners([this.popOut ? this.#elementTarget?.firstChild : this.#elementTarget]);

         this.onSvelteRemount({
            elementRoot: /** @type {HTMLElement} */ this._element[0],
            elementContent: this.#elementContent,
            elementTarget: this.#elementTarget
         });
      }
   }
}

/**
 * Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
 */
class PopoutSupport
{
   static initialize()
   {
      Hooks.on('PopOut:loading', (app, popout) =>
      {
         if (app instanceof SvelteApplication)
         {
            // Disable app position system.
            app.position.enabled = false;

            // Save current `headerButtonNoClose` state.
            app.state.save({
               name: '#beforePopout',
               headerButtonNoClose: app.reactive.headerButtonNoClose
            });

            // Set the apps active window to the popout browser window.
            app.reactive.activeWindow = popout;

            // Disable the close button.
            app.reactive.headerButtonNoClose = true;
         }
      });

      Hooks.on('PopOut:popin', (app) => this.#handleRejoin(app));
      Hooks.on('PopOut:close', (app) => this.#handleRejoin(app));
   }

   /**
    * Handles rejoining the app to main browser window.
    *
    * @param {Application} app - The target app.
    */
   static #handleRejoin(app)
   {
      if (app instanceof SvelteApplication)
      {
         // Enable the app position system.
         app.position.enabled = true;

         // Restore the initial header button no close state.
         const beforeData = app.state.remove({ name: '#beforePopout' });
         if (beforeData) { app.reactive.headerButtonNoClose = beforeData?.headerButtonNoClose ?? false; }

         // Reset the apps active window to the main `globalThis` reference.
         app.reactive.activeWindow = void 0;
      }
   }
}

/**
 * Provides storage for all dialog options through individual accessors and `get`, `merge`, `replace` and `set` methods
 * that safely access and update data changed to the mounted DialogShell component reactively.
 */
class TJSDialogData
{
   /**
    * @type {import('../../index.js').SvelteApplication}
    */
   #application;

   /**
    * Stores the dialog options data.
    *
    * @type {import('./types').TJSDialogOptions}
    */
   #internal = {};

   /**
    * @param {import('../../index.js').SvelteApplication} application - The host Foundry application.
    */
   constructor(application)
   {
      this.#application = application;

      Object.seal(this);
   }

   /**
    * @returns {{ [key: string]: import('./types').TJSDialogButtonData }} The dialog button configuration.
    */
   get buttons()
   {
      return this.#internal.buttons;
   }

   /**
    * Set the dialog button configuration.
    *
    * @param {string} buttons - New dialog button configuration.
    */
   set buttons(buttons)
   {
      this.#internal.buttons = buttons;
      this.#updateComponent();
   }

   /**
    * @returns {import('#runtime/svelte/util').TJSSvelteConfig | string} The Svelte configuration object or HTML string
    *          content.
    */
   get content()
   {
      return this.#internal.content;
   }

   /**
    * Set the Svelte configuration object or HTML string content.
    *
    * @param {import('#runtime/svelte/util').TJSSvelteConfig | string} content - New Svelte configuration object or
    *        HTML string content.
    */
   set content(content)
   {
      this.#internal.content = content;
      this.#updateComponent();
   }

   /**
    * @returns {string} The default button ID to focus initially.
    */
   get default()
   {
      return this.#internal.default;
   }

   /**
    * Set the default button ID to focus initially.
    *
    * @param {string} newDefault - New default button ID to focus initially.
    */
   set default(newDefault)
   {
      this.#internal.default = newDefault;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} The dialog draggable state; draggable when true.
    */
   get draggable()
   {
      return this.#internal.draggable;
   }

   /**
    * Set the dialog state; draggable when true.
    *
    * @param {boolean} draggable - New dialog draggable state; draggable when true.
    */
   set draggable(draggable)
   {
      this.#internal.draggable = draggable;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true auto-management of app focus is enabled.
    */
   get focusAuto()
   {
      return this.#internal.focusAuto;
   }

   /**
    * Set the dialog auto-management of app focus.
    *
    * @param {boolean} focusAuto - New dialog auto-management of app focus.
    */
   set focusAuto(focusAuto)
   {
      this.#internal.focusAuto = focusAuto;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true the first focusable element that isn't a button is focused.
    */
   get focusFirst()
   {
      return this.#internal.focusFirst;
   }

   /**
    * Set the dialog first focusable element state.
    *
    * @param {boolean} focusFirst - New dialog first focusable element state.
    */
   set focusFirst(focusFirst)
   {
      this.#internal.focusFirst = focusFirst;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
    */
   get focusKeep()
   {
      return this.#internal.focusKeep;
   }

   /**
    * Set the dialog `focusKeep` state. When `focusAuto` and `focusKeep` is true; keeps internal focus.
    *
    * @param {boolean} focusKeep - New dialog `focusKeep` state.
    */
   set focusKeep(focusKeep)
   {
      this.#internal.focusKeep = focusKeep;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true the dialog is minimizable.
    */
   get minimizable()
   {
      return this.#internal.minimizable;
   }

   /**
    * Set the dialog `minimizable` state. When true the dialog is minimizable.
    *
    * @param {boolean} minimizable - New dialog `minimizable` state.
    */
   set minimizable(minimizable)
   {
      this.#internal.minimizable = minimizable;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true a modal dialog is displayed.
    */
   get modal()
   {
      return this.#internal.modal;
   }

   /**
    * Set the dialog `modal` state. When true a modal dialog is displayed.
    *
    * @param {boolean} modal - New dialog `modal` state.
    */
   set modal(modal)
   {
      this.#internal.modal = modal;
      this.#updateComponent();
   }

   /**
    * @returns {import('./types').TJSDialogModalOptions} Additional options for modal dialog display.
    */
   get modalOptions()
   {
      return this.#internal.modalOptions;
   }

   /**
    * Set additional options for modal dialog display.
    *
    * @param {import('./types').TJSDialogModalOptions} modalOptions - New additional options for modal dialog display.
    */
   set modalOptions(modalOptions)
   {
      this.#internal.modalOptions = modalOptions;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true and an error is raised in dialog callback functions post a UI error notification.
    */
   get notifyError()
   {
      return this.#internal.notifyError;
   }

   /**
    * Set the dialog `notifyError` state. When true and an error is raised in dialog callback functions post a UI error
    * notification.
    *
    * @param {boolean} notifyError - New dialog `notifyError` state.
    */
   set notifyError(notifyError)
   {
      this.#internal.notifyError = notifyError;
      this.#updateComponent();
   }

   /**
    * @returns {string | ((data?: { application?: import('../../index.js').TJSDialog }) => any)} Callback invoked when
    *          dialog is closed; no button option selected. When defined as a string any matching function by name
    *          exported from content Svelte component is invoked.
    */
   get onClose()
   {
      return this.#internal.onClose;
   }

   /**
    * Set callback invoked when dialog is closed; no button option selected. When defined as a string any matching
    * function by name exported from content Svelte component is invoked..
    *
    * @param {string | ((data?: { application?: import('../../index.js').TJSDialog }) => any)} onClose - New dialog
    *        `onClose` state.
    */
   set onClose(onClose)
   {
      this.#internal.onClose = onClose;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} Dialog `rejectClose` state. When true and a Promise has been created by {@link TJSDialog.wait}
    *          and the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
    *          function is invoked and any result that is undefined will cause the Promise to then be rejected..
    */
   get rejectClose()
   {
      return this.#internal.rejectClose;
   }

   /**
    * Set the dialog `rejectClose` state.
    *
    * @param {boolean} rejectClose - New dialog `rejectClose` state.
    */
   set rejectClose(rejectClose)
   {
      this.#internal.rejectClose = rejectClose;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true the dialog is resizable.
    */
   get resizable()
   {
      return this.#internal.resizable;
   }

   /**
    * Set the dialog `resizable` state. When true the dialog is resizable.
    *
    * @param {boolean} resizable - New dialog `resizable` state.
    */
   set resizable(resizable)
   {
      this.#internal.resizable = resizable;
      this.#updateComponent();
   }

   /**
    * @returns {boolean} When true and resolving any Promises and there are undefined results from any button callbacks
    *          the button ID is resolved.
    */
   get resolveId()
   {
      return this.#internal.resolveId;
   }

   /**
    * Set the dialog `resolveId` state. When true and resolving any Promises and there are undefined results from any
    * button callbacks the button ID is resolved.
    *
    * @param {boolean} resolveId - New dialog `resolveId` state.
    */
   set resolveId(resolveId)
   {
      this.#internal.resolveId = resolveId;
      this.#updateComponent();
   }

   /**
    * @returns {string} The dialog window title.
    */
   get title()
   {
      return this.#internal.title;
   }

   /**
    * Set the dialog window title.
    *
    * @param {string} title - New dialog window title.
    */
   set title(title)
   {
      this.#internal.title = title;
      this.#updateComponent();
   }

   /**
    * @returns {import('./types').TJSDialogTransitionOptions} Transition options for the dialog.
    */
   get transition()
   {
      return this.#internal.transition;
   }

   /**
    * Set transition options for the dialog.
    *
    * @param {import('./types').TJSDialogTransitionOptions} transition - New transition options for the dialog.
    */
   set transition(transition)
   {
      this.#internal.transition = transition;
      this.#updateComponent();
   }

   /**
    * @returns {number | null} A specific z-index for the dialog. Pass null for the dialog to act like other
    *          applications in regard bringing to top when activated.
    */
   get zIndex()
   {
      return this.#internal.zIndex;
   }

   /**
    * Set specific z-index for the dialog.
    *
    * @param {number | null} zIndex - New z-index for the dialog.
    */
   set zIndex(zIndex)
   {
      this.#internal.zIndex = zIndex;
      this.#updateComponent();
   }

   /**
    * Provides a cloned copy of the dialog data.
    * Note: The content attribute is not cloned as complex / props may be present.
    *
    * @returns {import('./types').TJSDialogOptions} A clone of the dialog data.
    */
   clone()
   {
      // Make a shallow copy of internally stored data.
      const shallowCopy = { ...this.#internal };

      // Remove the content parameter as it may contain complex props sent to the hosted dialog component.
      delete shallowCopy.content;

      // Clone the internal data and then set the content directly.
      const cData = klona(shallowCopy);
      cData.content = this.#internal.content;

      return cData;
   }

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
   get(accessor, defaultValue)
   {
      return safeAccess(this.#internal, accessor, defaultValue);
   }

   /**
    * @param {import('./types').TJSDialogOptions} data - Merge provided data object into Dialog data.
    */
   merge(data)
   {
      deepMerge(this.#internal, data);
      this.#updateComponent();
   }

   /**
    * Sets the dialog data; this is reactive.
    *
    * @param {import('./types').TJSDialogOptions}   data - Dialog data.
    */
   replace(data)
   {
      if (!isObject(data)) { throw new TypeError(`TJSDialogData replace error: 'data' is not an object'.`); }

      this.#internal = {};

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
    * @param {string}   accessor - The path / key to set. You can set multiple levels.
    *
    * @param {any}      value - Value to set.
    *
    * @returns {boolean} True if successful.
    */
   set(accessor, value)
   {
      const success = safeSet(this.#internal, accessor, value);

      // If `this.#internal` modified then update the app options store.
      if (success) { this.#updateComponent(); }

      return success;
   }

   /**
    * Updates the data in the Svelte dialog component.
    */
   #updateComponent()
   {
      const component = this.#application.svelte.component(0);
      if (component?.data) { component.data = this.clone(); }
   }
}

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
 * @template [Options = import('./types').SvelteApp.Options]
 * @augments {SvelteApplication<Options>}
 */
class TJSDialog extends SvelteApplication
{
   /** @type {TJSDialogData} */
   #data;

   /** @type {ManagedPromise} */
   #managedPromise;

   /**
    * @param {import('./internal/state-dialog/types').TJSDialogOptions} data - Dialog options.
    *
    * @param {Options}   [options] - SvelteApplication options.
    */
   constructor(data, options = {})
   {
      // Note: explicit setting of `popOutModuleDisable` to prevent the PopOut! module from acting on modal dialogs.
      // @ts-expect-error
      super({ popOutModuleDisable: data?.modal ?? false, ...options });

      this.#managedPromise = new ManagedPromise();

      this.#data = new TJSDialogData(this);
      this.#data.replace(data);

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
    * @returns {import('./types').SvelteApp.Options} Default options
    */
   static get defaultOptions()
   {
      return deepMerge(super.defaultOptions, {
         classes: ['dialog', 'tjs-dialog'],
         width: 400,
         height: 'auto',
         svelte: {
            class: DialogShell,
            intro: true,
            target: document.body,
            /**
             * `this` is the TJSDialog instance when invoked.
             *
             * @this {TJSDialog}
             *
             * @returns {{data: import('./types').TJSDialogOptions, managedPromise: ManagedPromise}} Props
             */
            props: function()
            {
               return {
                  data: this.#data.clone(),
                  managedPromise: this.#managedPromise
               };
            }
         }
      });
   }

   /**
    * Returns the dialog data.
    *
    * @returns {import('./internal/state-dialog/types').TJSDialogData} Dialog data.
    */
   get data() { return this.#data; }

   /**
    * @returns {import('#runtime/util/async').ManagedPromise} Returns the managed promise.
    */
   get managedPromise() { return this.#managedPromise; }

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
    * @param {import('./internal/state-dialog/types').TJSDialogOptions & {
    *    onYes?: string | ((data?: { application?: TJSDialog }) => any),
    *    onNo?: string | ((data?: { application?: TJSDialog }) => any)
    * }} [data] - Confirm dialog options.
    *
    * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onYes] - Callback function upon `yes`; may be
    *        an async function. When defined as a string any matching function by name exported from content Svelte
    *        component is invoked.
    *
    * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onNo] - Callback function upon `no`; may be an
    *        async function. When defined as a string any matching function by name exported from content Svelte
    *        component is invoked.
    *
    * @param {import('./types').SvelteApp.Options}  [options]  SvelteApplication options passed to the TJSDialog
    *        constructor.
    *
    * @returns {Promise<T>} A promise which resolves with result of yes / no callbacks or true / false.
    *
    * @example
    * const result = await TJSDialog.confirm({
    *  title: 'A Yes or No Question',
    *  content: '<p>Choose wisely.</p>',
    *  onYes: () => 'YES Result',
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
               onPress: ({ application }) => this.#invokeFn(onYes, application, true)
            },
            no: {
               onPress: ({ application }) => this.#invokeFn(onNo, application, false)
            }
         }),
         default: data.default ?? 'yes'
      }, options);
   }

   /**
    * A helper method to invoke a callback function directly or lookup an exported function with the same name from any
    * content Svelte component to invoke. This is used internally to apply default values for `confirm` and `prompt`.
    *
    * @param {string|((data?: { application?: TJSDialog }) => any)} callback - Callback function to invoke; may be an
    *        async function. When defined as a string any matching function by name exported from content Svelte
    *        component is invoked.
    *
    * @param {TJSDialog} application - TJSDialog instance passed to callback.
    *
    * @param {*} [defaultResult] - An optional default result to return; undefined if not specified.
    *
    * @returns {*} Result.
    *
    * @internal
    */
   static #invokeFn(callback, application, defaultResult = void 0)
   {
      let result = defaultResult;

      switch (typeof callback)
      {
         case 'function':
            // Pass the dialog instance to the callback.
            result = callback({ application });
            break;

         case 'string':
         {
            const dialogComponent = application?.svelte?.dialogComponent;

            // Attempt lookup by function name in dialog instance component.
            if (dialogComponent !== void 0 && typeof dialogComponent?.[callback] === 'function')
            {
               result = dialogComponent?.[callback]({ application });
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
    * @param {import('./internal/state-dialog/types').TJSDialogOptions & {
    *    onOk?: string | ((data?: { application?: TJSDialog }) => any),
    *    label?: string,
    *    icon?: string
    * }} [data] - Prompt dialog options that includes any TJSDialog options along with the following optional fields:
    *
    * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onOk] - Callback function upon `ok`; may be
    *        an async function. When defined as a string any matching function by name exported from content Svelte
    *        component is invoked.
    *
    * @param {string}   [data.label] - The OK prompt button text.
    *
    * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
    *
    * @param {import('./types').SvelteApp.Options}  [options]  SvelteApplication options passed to the TJSDialog
    *        constructor.
    *
    * @returns {Promise<T>} The returned value from the provided callback function or `true` if the button
    *          is pressed.
    *
    * @example
    * const result = await TJSDialog.prompt({
    *  title: 'Are you OK?',
    *  content: '<p>Are you OK?.</p>',
    *  label: 'Feeling Fine!',
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
               onPress: ({ application }) => this.#invokeFn(onOk, application, true)
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
    * @param {import('./internal/state-dialog/types').TJSDialogOptions}  data - Dialog data passed to the TJSDialog
    *        constructor.
    *
    * @param {import('./types').SvelteApp.Options}  [options]  SvelteApplication options passed to the TJSDialog
    *        constructor.
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

// Handle `hotReload` Foundry hook when running the Vite dev server.
if (import.meta.hot) { FoundryHMRSupport.initialize(); }

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
PopoutSupport.initialize();

export { SvelteApplication, TJSDialog };
//# sourceMappingURL=index.js.map
