import {
   hasGetter,
   isApplicationShell,
   outroAndDestroy }          from '@typhonjs-fvtt/svelte/util';

import {
   GetSvelteData,
   loadSvelteConfig,
   Position,
   SvelteReactive }           from './internal/index.js';

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately. You can declaratively
 * load one or more components from `defaultOptions`.
 */
export class SvelteApplication extends Application
{
   /**
    * Stores the first mounted component which follows the application shell contract.
    *
    * @type {MountedAppShell[]|null[]} Application shell.
    */
   #applicationShellHolder = [null];

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
    * Stores initial z-index from `_renderOuter` to set to target element / Svelte component.
    *
    * @type {number}
    */
   #initialZIndex = 95;

   /**
    * The position store.
    *
    * @type {Position}
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
    * @type {SvelteData[]}
    */
   #svelteData = [];

   /**
    * Provides a helper class that combines multiple methods for interacting with the mounted components tracked in
    * {@link SvelteData}.
    *
    * @type {GetSvelteData}
    */
   #getSvelteData = new GetSvelteData(this.#applicationShellHolder, this.#svelteData);

   /**
    * Contains methods to interact with the Svelte stores.
    *
    * @type {SvelteStores}
    */
   #stores;

   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);

      // Initialize Position with the position object set by Application.
      this.#position = new Position(this.position);

      // Remove old position field.
      delete this.position;

      /**
       * Define accessors to retrieve Position by `this.position`.
       *
       * @member {PositionData} position - Adds accessors to SvelteApplication to get / set the position data.
       *
       * @memberof SvelteApplication#
       */
      Object.defineProperty(this, 'position', {
         get: () => this.#position,
         set: (position) => { if (typeof position === 'object') { this.#position.set(position); } }
      });

      this.#reactive = new SvelteReactive(this);

      this.#stores = this.#reactive.initialize();
   }

   /**
    * Specifies the default options that SvelteApplication supports.
    *
    * @returns {object} options - Application options.
    * @see https://foundryvtt.com/api/Application.html#options
    */
   static get defaultOptions()
   {
      return foundry.utils.mergeObject(super.defaultOptions, {
         draggable: true,              // If true then application shells are draggable.
         headerButtonNoClose: false,   // If true then the close header button is removed.
         headerButtonNoLabel: false,   // If true then header button labels are removed for application shells.
         defaultCloseAnimation: true,  // If false the Foundry JQuery close animation is not run.
         setPosition: true,            // If false then `setPosition` does not take effect.
         zIndex: null                  // When set the zIndex is manually controlled.
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
    * @returns {SvelteReactive} The reactive accessors & Svelte stores.
    */
   get reactive() { return this.#reactive; }

   /**
    * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
    *
    * @returns {GetSvelteData} GetSvelteData
    */
   get svelte() { return this.#getSvelteData; }

   /**
    * In this case of when a template is defined in app options `html` references the inner HTML / template. However,
    * to activate classic v1 tabs for a Svelte component the element target is passed as an array simulating JQuery as
    * the element is retrieved immediately and the core listeners use standard DOM queries.
    *
    * @inheritDoc
    * @protected
    * @ignore
    */
   _activateCoreListeners(html)
   {
      super._activateCoreListeners(typeof this.options.template === 'string' ? html : [this.#elementTarget]);
   }

   /**
    * Provide an override to set reactive z-index after calling super method.
    */
   bringToTop()
   {
      super.bringToTop();

      const z = document.defaultView.getComputedStyle(this.element[0]).zIndex;

      this.reactive.zIndex = z === 'null' || z === null ? null : parseInt(z, 10);

      ui.activeWindow = this;
   }

   /**
    * Note: This method is fully overridden and duplicated as Svelte components need to be destroyed manually and the
    * best visual result is to destroy them after the default JQuery slide up animation occurs, but before the element
    * is removed from the DOM.
    *
    * If you destroy the Svelte components before the slide up animation the Svelte elements are removed immediately
    * from the DOM. The purpose of overriding ensures the slide up animation is always completed before
    * the Svelte components are destroyed and then the element is removed from the DOM.
    *
    * Close the application and un-register references to it within UI mappings.
    * This function returns a Promise which resolves once the window closing animation concludes
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {boolean}  [options.force] - Force close regardless of render state.
    *
    * @returns {Promise<void>}    A Promise which resolves once the application is closed.
    * @ignore
    */
   async close(options = {})
   {
      const states = Application.RENDER_STATES;
      if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) { return; }

      // Unsubscribe from any local stores.
      this.#stores.unsubscribe();

      /**
       * @ignore
       */
      this._state = states.CLOSING;

      /**
       * Get the element.
       *
       * @type {JQuery}
       */
      const el = $(this.#elementTarget);
      if (!el) { return this._state = states.CLOSED; }

      // Dispatch Hooks for closing the base and subclass applications
      for (const cls of this.constructor._getInheritanceChain())
      {
         /**
          * A hook event that fires whenever this Application is closed.
          *
          * @param {Application} app                     The Application instance being closed
          *
          * @param {jQuery[]} html                       The application HTML when it is closed
          *
          * @function closeApplication
          *
          * @memberof hookEvents
          */
         Hooks.call(`close${cls.name}`, this, el);
      }

      // If options `defaultCloseAnimation` is false then do not execute the standard JQuery slide up animation.
      // This allows Svelte components to provide any out transition. Application shells will automatically set
      // `defaultCloseAnimation` based on any out transition set or unset.
      const animate = typeof this.options.defaultCloseAnimation === 'boolean' ? this.options.defaultCloseAnimation :
       true;

      if (animate)
      {
         // Await on JQuery to slide up the main element.
         el[0].style.minHeight = '0';
         await new Promise((resolve) => { el.slideUp(200, () => resolve()); });
      }

      // Stores the Promises returned from running outro transitions and destroying each Svelte component.
      const svelteDestroyPromises = [];

      // Manually invoke the destroy callbacks for all Svelte components.
      for (const entry of this.#svelteData)
      {
         // Use `outroAndDestroy` to run outro transitions before destroying.
         svelteDestroyPromises.push(outroAndDestroy(entry.component));

         // If any proxy eventbus has been added then remove all event registrations from the component.
         const eventbus = entry.config.eventbus;
         if (typeof eventbus === 'object' && typeof eventbus.off === 'function')
         {
            eventbus.off();
            entry.config.eventbus = void 0;
         }
      }

      // Await all Svelte components to destroy.
      await Promise.all(svelteDestroyPromises);

      // Reset SvelteData like this to maintain reference to GetSvelteData / `this.svelte`.
      this.#svelteData.length = 0;

      // Use JQuery to remove `this._element` from the DOM. Most SvelteComponents have already removed it.
      el.remove();

      // Clean up data
      this.#applicationShellHolder[0] = null;
      /**
       * @ignore
       */
      this._element = null;
      this.#elementContent = null;
      this.#elementTarget = null;
      delete ui.windows[this.appId];
      /**
       * @ignore
       */
      this._minimized = false;
      /**
       * @ignore
       */
      this._scrollPositions = null;
      this._state = states.CLOSED;

      // Update the minimized UI store options.
      this.#stores.uiOptionsUpdate((storeOptions) => foundry.utils.mergeObject(storeOptions, {
         minimized: this._minimized
      }));
   }

   /**
    * Inject the Svelte components defined in `this.options.svelte`. The Svelte component can attach to the existing
    * pop-out of Application or provide no template and render into a document fragment which is then attached to the
    * DOM.
    *
    * @param {JQuery} html -
    *
    * @inheritDoc
    * @ignore
    */
   _injectHTML(html)
   {
      if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte))
      {
         throw new Error(
          'SvelteApplication - _injectHTML - A popout app with no template can only support one Svelte component.');
      }

      // Make sure the store is updated with the latest header buttons. Also allows filtering buttons before display.
      this.reactive.updateHeaderButtons();

      // Create a function to generate a callback for Svelte components to invoke to update the tracked elements for
      // application shells in the rare cases that the main element root changes. The update is only trigged on
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

      if (Array.isArray(this.options.svelte))
      {
         for (const svelteConfig of this.options.svelte)
         {
            const svelteData = loadSvelteConfig(this, html, svelteConfig, elementRootUpdate);

            if (isApplicationShell(svelteData.component))
            {
               if (this.svelte.applicationShell !== null)
               {
                  throw new Error(
                   `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                    ${JSON.stringify(svelteConfig)}`);
               }

               this.#applicationShellHolder[0] = svelteData.component;
            }

            this.#svelteData.push(svelteData);
         }
      }
      else if (typeof this.options.svelte === 'object')
      {
         const svelteData = loadSvelteConfig(this, html, this.options.svelte, elementRootUpdate);

         if (isApplicationShell(svelteData.component))
         {
            // A sanity check as shouldn't hit this case as only one component is being mounted.
            if (this.svelte.applicationShell !== null)
            {
               throw new Error(
                `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                 ${JSON.stringify(this.options.svelte)}`);
            }

            this.#applicationShellHolder[0] = svelteData.component;
         }

         this.#svelteData.push(svelteData);
      }

      // Detect if this is a synthesized DocumentFragment.
      const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;

      // If any of the Svelte components mounted directly targets an HTMLElement then do not inject HTML.
      let injectHTML = true;
      for (const svelteData of this.#svelteData)
      {
         if (!svelteData.injectHTML) { injectHTML = false; break; }
      }
      if (injectHTML) { super._injectHTML(html); }

      if (this.svelte.applicationShell !== null)
      {
         this._element = $(this.svelte.applicationShell.elementRoot);

         // Detect if the application shell exports an `elementContent` accessor.
         this.#elementContent = hasGetter(this.svelte.applicationShell, 'elementContent') ?
          this.svelte.applicationShell.elementContent : null;

         // Detect if the application shell exports an `elementTarget` accessor.
         this.#elementTarget = hasGetter(this.svelte.applicationShell, 'elementTarget') ?
          this.svelte.applicationShell.elementTarget : null;
      }
      else if (isDocumentFragment) // Set the element of the app to the first child element in order of Svelte components mounted.
      {
         for (const svelteData of this.#svelteData)
         {
            if (svelteData.element instanceof HTMLElement)
            {
               this._element = $(svelteData.element);
               break;
            }
         }
      }

      // Potentially retrieve a specific target element if `selectorTarget` is defined otherwise make the target the
      // main element.
      if (this.#elementTarget === null)
      {
         const element = typeof this.options.selectorTarget === 'string' ?
          this._element.find(this.options.selectorTarget) : this._element;

         this.#elementTarget = element[0];
      }

      // TODO VERIFY THIS CHECK ESPECIALLY `this.#elementTarget.length === 0`.
      if (this.#elementTarget === null || this.#elementTarget === void 0 || this.#elementTarget.length === 0)
      {
         throw new Error(`SvelteApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
      }

      // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
      // in `this.#initialZIndex`.
      if (typeof this.options.setPosition === 'boolean' && this.options.setPosition)
      {
         this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
          this.#initialZIndex ?? 95;
      }

      // Subscribe to local store handling.
      this.#stores.subscribe();

      this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget:
       this.#elementTarget });
   }

   /**
    * Provides a mechanism to update the UI options store for minimized.
    *
    * Note: the sanity check is duplicated from {@link Application.maximize} and the store is updated _before_
    * the actual parent method is invoked. This allows application shells to remove / show any resize handlers
    * correctly.
    *
    * @inheritDoc
    * @ignore
    */
   async maximize()
   {
      if (!this.popOut || [false, null].includes(this._minimized)) { return; }

      this.#stores.uiOptionsUpdate((options) => foundry.utils.mergeObject(options, { minimized: false }));

      return super.maximize();
   }

   /**
    * Provides a mechanism to update the UI options store for minimized.
    *
    * Note: the sanity check is duplicated from {@link Application.minimize} and the store is updated _before_
    * the actual parent method is invoked. This allows application shells to remove / show any resize handlers
    * correctly.
    *
    * @inheritDoc
    * @ignore
    */
   async minimize()
   {
      if (!this.rendered || !this.popOut || [true, null].includes(this._minimized)) { return; }

      this.#stores.uiOptionsUpdate((options) => foundry.utils.mergeObject(options, { minimized: true }));

      return super.minimize();
   }

   /**
    * Provides a callback after all Svelte components are initialized.
    *
    * @param {object}      [opts] - Optional parameters.
    *
    * @param {HTMLElement} [opts.element] - HTMLElement container for main application element.
    *
    * @param {HTMLElement} [opts.elementContent] - HTMLElement container for content area of application shells.
    *
    * @param {HTMLElement} [opts.elementTarget] - HTMLElement container for main application target element.
    */
   onSvelteMount({ element, elementContent, elementTarget }) {} // eslint-disable-line no-unused-vars

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @inheritDoc
    * @ignore
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
    * cycle (at setPosition).
    *
    * @inheritDoc
    * @protected
    * @ignore
    */
   async _render(force = false, options = {})
   {
      if (this._state === Application.RENDER_STATES.NONE &&
       document.querySelector(`#${this.id}`) instanceof HTMLElement)
      {
         console.warn(`SvelteApplication - _render: A DOM element already exists for CSS ID '${this.id
         }'. Cancelling initial render for new application with appId '${this.appId}'.`);

         return;
      }

      return super._render(force, options);
   }

   /**
    * Render the inner application content. Only render a template if one is defined otherwise provide an empty
    * JQuery element.
    *
    * @param {Object} data         The data used to render the inner template
    *
    * @returns {Promise.<JQuery>}   A promise resolving to the constructed jQuery object
    *
    * @protected
    * @ignore
    */
   async _renderInner(data)
   {
      const html = typeof this.template === 'string' ? await renderTemplate(this.template, data) :
       document.createDocumentFragment();

      return $(html);
   }

   /**
    * Stores the initial z-index set in `_renderOuter` which is used in `_injectHTML` to set the target element
    * z-index after the Svelte component is mounted.
    *
    * @returns {Promise<JQuery>} Outer frame / unused.
    * @protected
    * @ignore
    */
   async _renderOuter()
   {
      const html = await super._renderOuter();
      this.#initialZIndex = html.css('zIndex');
      return html;
   }

   /**
    * Modified Application `setPosition` which changes a few aspects from the default {@link Application.setPosition}.
    * The gate on `popOut` is removed, so if manually called popOut applications can set `this.options.setPosition` to
    * true.
    *
    * An added second parameter provides additional options. `apply` when set to false will not apply any position
    * changes. This is useful when providing overridden `setPosition` implementations as `this.position` is now a store
    * and this prevents multiple updates / notifications. The other two new options `noHeight` and `noWidth` that
    * respect `width` & `height` style options while still producing a correct position object in return. You may set
    * these options manually, but they are also automatically determined when not explicitly provided by checking if
    * the target element style for `height` or `width` is `auto`.
    *
    * @param {PositionData}         [pos] - Position data.
    *
    * @param {number|null}          [pos.left] - The left offset position in pixels
    *
    * @param {number|null}          [pos.top] - The top offset position in pixels
    *
    * @param {number|string|null}   [pos.width] - The application width in pixels
    *
    * @param {number|string|null}   [pos.height] - The application height in pixels
    *
    * @param {number|null}          [pos.scale] - The application scale as a numeric factor where 1.0 is default
    *
    * @returns {PositionData} The updated position object for the application containing the new values
    */
   setPosition({ left, top, width, height, scale } = {})
   {
      // An early out to prevent `setPosition` from taking effect.
      if (typeof this.options.setPosition === 'boolean' && !this.options.setPosition) { return; }

      const el = this.elementTarget;
      let currentPosition = this.position.get();
      const styles = globalThis.getComputedStyle(el);

      // Automatically determine if noHeight when `el.style.height` is `auto`.
      const noHeight = el.style.height === 'auto';

      // Automatically determine if noWidth when `el.style.width` is `auto`.
      const noWidth = el.style.width === 'auto';

      // Update width if an explicit value is passed, or if no width value is set on the element
      if (!el.style.width || width)
      {
         const tarW = width || el.offsetWidth;
         const minW = parseInt(styles.minWidth) || MIN_WINDOW_WIDTH;
         const maxW = parseInt(styles.maxWidth) || el.style.maxWidth || globalThis.innerWidth;
         currentPosition.width = width = Math.clamped(tarW, minW, maxW);

         if ((width + currentPosition.left) > globalThis.innerWidth) { left = currentPosition.left; }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element
      if (!el.style.height || height)
      {
         const tarH = height || (el.offsetHeight + 1);
         const minH = parseInt(styles.minHeight) || MIN_WINDOW_HEIGHT;
         const maxH = parseInt(styles.maxHeight) || el.style.maxHeight || globalThis.innerHeight;
         currentPosition.height = height = Math.clamped(tarH, minH, maxH);

         if ((height + currentPosition.top) > globalThis.innerHeight + 1) { top = currentPosition.top - 1; }
      }
      height = el.offsetHeight;

      // Update Left
      if ((!el.style.left) || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = left = Math.clamped(tarL, 0, maxL);
      }

      // Update Top
      if ((!el.style.top) || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = top = Math.clamped(tarT, 0, maxT);
      }

      // Update Scale
      if (scale)
      {
         currentPosition.scale = Math.max(scale, 0);
      }

      // Set the position and allow any validators to alter the position data.
      currentPosition = this.position.set(currentPosition);

      if (currentPosition)
      {
         if (!noWidth) { el.style.width = `${currentPosition.width}px`; }
         if (!noHeight) { el.style.height = `${currentPosition.height}px`; }
         el.style.left = `${currentPosition.left}px`;
         el.style.top = `${currentPosition.top}px`;

         if (currentPosition.scale)
         {
            if (currentPosition.scale === 1) { el.style.transform = ''; }
            else { el.style.transform = `scale(${currentPosition.scale})`; }
         }
      }

      // Return the updated position object
      return currentPosition;
   }

   /**
    * This method is only invoked by the `elementRootUpdate` callback that is added to the external context passed to
    * Svelte components. When invoked it updates the local element roots tracked by SvelteApplication.
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
            const element = typeof this.options.selectorTarget === 'string' ?
             this._element.find(this.options.selectorTarget) : this._element;

            this.#elementTarget = element[0];
         }

         // The initial zIndex may be set in application options or for popOut applications is stored by `_renderOuter`
         // in `this.#initialZIndex`.
         if (typeof this.options.setPosition === 'boolean' && this.options.setPosition)
         {
            this.#elementTarget.style.zIndex = typeof this.options.zIndex === 'number' ? this.options.zIndex :
             this.#initialZIndex ?? 95;

            super.bringToTop();

            this.setPosition(this.position);
         }

         super._activateCoreListeners([this.#elementTarget]);

         this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget:
          this.#elementTarget });
      }
   }
}

/**
 * @typedef {object} SvelteData
 *
 * @property {object}                           config -
 *
 * @property {import('svelte').SvelteComponent} component -
 *
 * @property {HTMLElement}                      element -
 *
 * @property {boolean}                          injectHTML -
 */

/**
 * @typedef {object} SvelteStores
 *
 * @property {import('svelte/store').Writable.update} appOptionsUpdate - Update function for app options store.
 *
 * @property {Function} subscribe - Subscribes to local stores.
 *
 * @property {import('svelte/store').Writable.update} uiOptionsUpdate - Update function for UI options store.
 *
 * @property {Function} unsubscribe - Unsubscribes from local stores.
 */
