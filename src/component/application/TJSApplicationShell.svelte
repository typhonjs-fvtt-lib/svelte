<script>
   /**
    * Provides an alternate application shell that is scoped by slightly different CSS classes than
    * {@link ApplicationShell}. An application shell is a main top level slotted component that provides a reactive
    * outer wrapper and header bar for the main content component.
    *
    * Container queries are supported and the main app window container is named `tjs-app-window` and the window content
    * container is `tjs-app-window-content`.
    *
    * ### CSS variables
    *
    * ```
    * '--tjs-app-background': Controls the app background image; set in main `index.js`.
    * ```
    * @componentDocumentation
    */

   import {
      getContext,
      onMount,
      setContext }                     from '#svelte';

   import { resizeObserver }           from '#runtime/svelte/action/dom/observer';
   import { applyStyles }              from '#runtime/svelte/action/dom/style';
   import { dynamicAction }            from '#runtime/svelte/action/util';
   import { TJSDefaultTransition }     from '#runtime/svelte/transition';
   import { A11yHelper }               from '#runtime/util/a11y';
   import { ThemeObserver }            from '#runtime/util/dom/theme';
   import { isObject }                 from '#runtime/util/object';

   import { AppShellContextInternal }  from './AppShellContextInternal.js';
   import TJSApplicationHeader         from './TJSApplicationHeader.svelte';
   import ResizableHandle              from './ResizableHandle.svelte';

   import TJSFocusWrap                 from '../internal/dom/TJSFocusWrap.svelte';

   import { FVTTAppTheme }             from './data';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   /** @type {HTMLElement} */
   export let elementContent = void 0;
   /** @type {HTMLElement} */
   export let elementRoot = void 0;

   // Allows custom draggable implementations to be forwarded to TJSApplicationHeader.
   export let draggable = void 0;
   export let draggableOptions = void 0;

   // Explicit style overrides for the main app and content elements. Uses action `applyStyles`.
   export let stylesApp = void 0;
   export let stylesContent = void 0;

   /**
    * Application reference.
    *
    * @type {SvelteApp}
    */
   const application = getContext('#external')?.application;

   // Focus related app options stores.
   const { focusAuto, focusKeep, focusTrap } = application.reactive.storeAppOptions;

   const { minimized } = application.reactive.storeUIState;

   // Is the backing app TJSPosition instance a candidate for the `resizeObserver` action? IE `width` or `height is
   // `auto` or `inherit`.
   const { resizeObservable } = application.position.stores;

   // ----------------------------------------------------------------------------------------------------------------

   // If a parent component binds and sets `appOffsetHeight` or `appOffsetWidth` to a truthy value then the
   // `resizeObserver` action is enabled on the outer application `div`. Additionally, the SvelteApplication position
   // resizeObserved store is updated.
   export let appOffsetHeight = false;
   export let appOffsetWidth = false;

   // Tracks initial state if either of the above props are truthy otherwise a null operation.
   const initialAppResizeObserver = !!appOffsetHeight || !!appOffsetWidth;

   /**
    * Reactive statement to control any dynamic action to apply for the app resize observer. It is always enabled when
    * `initialAppResizeObserver` is true or when the position store `resizeObservable` is true when app position `width`
    * or `height` is `auto` or `inherit`.
    *
    * @type {undefined | import('#runtime/svelte/action/util').DynamicActionOptions}
    */
   $: appResizeObserver = initialAppResizeObserver || $resizeObservable ?
    { action: resizeObserver, data: resizeObservedApp } : void 0;

   // ----------------------------------------------------------------------------------------------------------------

   // If a parent component binds and sets `contentOffsetHeight` or `contentOffsetWidth` to true then a
   // resizeObserver action is enabled on the content `section`.
   export let contentOffsetHeight = false;
   export let contentOffsetWidth = false;

   // Set to `resizeObserver` if either of the above props are truthy otherwise a null operation.
   const contentResizeObserver = !!contentOffsetHeight || !!contentOffsetWidth ? resizeObserver : () => null;

   // ----------------------------------------------------------------------------------------------------------------

   // Provides the internal context for data / stores of the application shell.
   const internal = new AppShellContextInternal();

   // Provides options to `A11yHelper.getFocusableElements` to ignore TJSFocusWrap by CSS class.
   const s_IGNORE_CLASSES = { ignoreClasses: ['tjs-focus-wrap'] };

   // Internal context for `elementContent` / `elementRoot` stores.
   setContext('#internal', internal);

   // Only update the `elementContent` store if the new `elementContent` is not null or undefined.
   $: if (elementContent !== void 0 && elementContent !== null)
   {
      getContext('#internal').stores.elementContent.set(elementContent);
   }

   // Only update the `elementRoot` store if the new `elementRoot` is not null or undefined.
   $: if (elementRoot !== void 0 && elementRoot !== null)
   {
      getContext('#internal').stores.elementRoot.set(elementRoot);
   }

   let focusWrapEnabled;

   // Enable TJSFocusWrap component when focus trapping app option is true and app is not minimized.
   $: focusWrapEnabled = $focusAuto && $focusTrap && !$minimized;

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition = TJSDefaultTransition.default;
   export let inTransition = TJSDefaultTransition.default;
   export let outTransition = TJSDefaultTransition.default;

   // Exports properties to set options for any transitions.
   export let transitionOptions = void 0;
   export let inTransitionOptions = TJSDefaultTransition.options;
   export let outTransitionOptions = TJSDefaultTransition.options;

   // Tracks last transition state.
   let oldTransition = TJSDefaultTransition.default;
   let oldTransitionOptions = void 0

   // Run this reactive block when the last transition state is not equal to the current state.
   $: if (oldTransition !== transition)
   {
      // If transition is defined and not the default transition then set it to both in and out transition otherwise
      // set the default transition to both in & out transitions.
      const newTransition = typeof transition === 'function' ? transition : TJSDefaultTransition.default;

      inTransition = newTransition;
      outTransition = newTransition;

      oldTransition = newTransition;
   }

   // Run this reactive block when the last transition options state is not equal to the current options state.
   $: if (oldTransitionOptions !== transitionOptions)
   {
      const newOptions = transitionOptions !== TJSDefaultTransition.options && isObject(transitionOptions) ?
       transitionOptions : TJSDefaultTransition.options;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = TJSDefaultTransition.default; }

   $:
   {
      // Handle cases if outTransition is unset; assign noop default transition function.
      if (typeof outTransition !== 'function') { outTransition = TJSDefaultTransition.default; }

      // Set close animation to `false` / not run when an out transition is defined.
      const defaultCloseAnimation = application?.options?.defaultCloseAnimation;
      if (typeof defaultCloseAnimation === 'boolean' && defaultCloseAnimation &&
       outTransition !== TJSDefaultTransition.default)
      {
         application.options.defaultCloseAnimation = false;
      }
   }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (!isObject(inTransitionOptions)) { inTransitionOptions = TJSDefaultTransition.options; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (!isObject(outTransitionOptions)) { outTransitionOptions = TJSDefaultTransition.options; }

   // ---------------------------------------------------------------------------------------------------------------

   // Reactive observation of core theme.
   const themeTokenStore = ThemeObserver.stores.themeToken;

   // Reactive active app classes Set.
   const activeClasses = application.reactive.activeClasses;

   // Reactive explicit app theme name override.
   const appThemeName = application.reactive.storeAppOptions.themeName;

   // Apply current theme to optional app classes.
   $: appClasses = FVTTAppTheme.appClasses($activeClasses, $themeTokenStore, $appThemeName);

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * Adds the `mounted` class to the main app div from rAF in `onMount` enabling container queries on the main app
    * div and `.window-content`. This is necessary as browsers (Chrome / Firefox) defer layout calculations which
    * may affect app positioning via `TJSPosition` when width or height is set to `auto`.
    *
    * @type {boolean}
    */
   let mounted = false;

   // Focus `elementRoot` on mount to allow keyboard tab navigation of header buttons.
   onMount(() =>
   {
      if ($focusAuto) { elementRoot.focus(); }

      // Only enable container queries if width isn't 'auto'.
      if (application.position.width !== 'auto') { requestAnimationFrame(() => mounted = true); }
   });

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * Provides a handler for the custom `close:popup` event fired by `svelte-standard` components like TJSMenu. The
    * intention is to handle focus management of a component that is no longer connected in the DOM. If a target element
    * that is the source of the close event is attached attempt to resolve internal focus to the application.
    *
    * @param {CustomEvent}  event - A custom event for `close:popup`.
    */
   function onClosePopup(event)
   {
      // Early out as automatic focus management is not enabled.
      if (!$focusAuto) { return; }

      const targetEl = event?.detail?.target;

      // Early out if there is no target element.
      if (!A11yHelper.isFocusTarget(targetEl)) { return; }

      // Early out if the target element is focusable as it will gain focus naturally.
      if (A11yHelper.isFocusable(targetEl)) { return; }

      const elementRootContains = elementRoot.contains(targetEl);

      // First check for if the target is elementRoot or elementContent then fallback to contains checks.
      if (targetEl === elementRoot)
      {
         elementRoot.focus();
      }
      else if (targetEl === elementContent)
      {
         elementContent.focus();
      }
      else if (elementRootContains)
      {
         if (elementContent.contains(targetEl))
         {
            elementContent.focus();
         }
         else
         {
            elementRoot.focus();
         }
      }
   }

   /**
    * Provides focus cycling inside the application capturing `<Shift-Tab>` and if `elementRoot` or `firstFocusEl` is
    * the actively focused element then the second to last focusable element if applicable is focused.
    *
    * Also, if a popout app all key down events will bring this application to the top such that when focus is trapped
    * the app is top most.
    *
    * @param {KeyboardEvent} event - Keyboard Event.
    */
   function onKeydown(event)
   {
      const FVTTKeyboardManager = foundry.helpers.interaction.KeyboardManager;

      // TODO: Note this handling is specifically for Foundry v11+ as the platform KeyboardManager uses
      // `document.querySelector(':focus')` to short circuit keyboard handling internally to KeyboardManager.
      // ApplicationShell manages containing focus programmatically and this prevents the Foundry KeyboardManager from
      // activating. We need to check if this key event target is currently the `elementRoot` or `elementContent` and
      // the event matches any KeyboardManager actions and if so blur current focus.
      if ((event.target === elementRoot || event.target === elementContent) &&
       FVTTKeyboardManager && FVTTKeyboardManager?._getMatchingActions?.(
        FVTTKeyboardManager?.getKeyboardEventContext?.(event))?.length)
      {
         event.target?.blur();
         return;
      }

      if (focusWrapEnabled && event.shiftKey && event.code === 'Tab')
      {
         // Collect all focusable elements from `elementRoot` and ignore TJSFocusWrap.
         const allFocusable = A11yHelper.getFocusableElements(elementRoot, s_IGNORE_CLASSES);

         // Find first and last focusable elements.
         const firstFocusEl = allFocusable.length > 0 ? allFocusable[0] : void 0;
         const lastFocusEl = allFocusable.length > 0 ? allFocusable[allFocusable.length - 1] : void 0;

         const activeWindow = application.reactive.activeWindow;

         // Only cycle focus to the last keyboard focusable app element if `elementRoot` or first focusable element
         // is the active element.
         if (elementRoot === activeWindow.document.activeElement ||
          firstFocusEl === activeWindow.document.activeElement)
         {
            if (A11yHelper.isFocusTarget(lastFocusEl) && firstFocusEl !== lastFocusEl) { lastFocusEl.focus(); }

            event.preventDefault();
            event.stopPropagation();
         }
      }

      // Make sure this application is top most when it receives keyboard events.
      application.bringToTop.call(application);
   }

   /**
    * Invoke the app `bringToTop`.
    *
    * Note: `capture` is used so pointer down is always received. Be mindful as `onPointerdownAppCapture` should only
    * invoke `bringToTop`.
    */
   function onPointerdownAppCapture()
   {
      application.bringToTop.call(application);
   }

   /**
    * Focus `elementContent` if the event target is not focusable and `focusAuto` is enabled.
    *
    * Note: `focusAuto` is an app option store. This check is a bit tricky as `section.window-content` has a tabindex
    * of '-1', so it is focusable manually.
    */
   function onPointerdownContent(event)
   {
      // Note: the event target may not always be the element that will eventually receive focus.
      const focusable = A11yHelper.isFocusable(event.target);

      if (!focusable && $focusAuto)
      {
         if ($focusKeep)
         {
            const activeWindow = application.reactive.activeWindow;
            const focusOutside = !elementRoot.contains(activeWindow.document.activeElement);

            // Only focus the content element if the active element is outside the app; maintaining internal focused
            // element.
            if (focusOutside)
            {
               elementContent.focus();
            }
            else
            {
               event.preventDefault();
            }
         }
         else
         {
            elementContent.focus();
         }
      }
   }

   /**
    * Callback for content resizeObserver action. This is enabled when contentOffsetHeight or contentOffsetWidth is
    * bound.
    *
    * @param {number}   offsetWidth - Observed offsetWidth.
    *
    * @param {number}   offsetHeight - Observed offsetHeight
    */
   function resizeObservedContent(offsetWidth, offsetHeight)
   {
      contentOffsetWidth = offsetWidth;
      contentOffsetHeight = offsetHeight;
   }

   /**
    * Callback for app resizeObserver action. This is enabled when appOffsetHeight or appOffsetWidth is
    * bound. Additionally, the Application position resizeObserved store is updated.
    *
    * @param {number}   contentWidth - Observed contentWidth.
    * @param {number}   contentHeight - Observed contentHeight
    * @param {number}   offsetWidth - Observed offsetWidth.
    * @param {number}   offsetHeight - Observed offsetHeight
    */
   function resizeObservedApp(offsetWidth, offsetHeight, contentWidth, contentHeight)
   {
      application.position.stores.resizeObserved.update((object) =>
      {
         object.contentWidth = contentWidth;
         object.contentHeight = contentHeight;
         object.offsetWidth = offsetWidth;
         object.offsetHeight = offsetHeight;

         return object;
      });

      appOffsetHeight = offsetHeight;
      appOffsetWidth = offsetWidth;
   }

   /**
    * Transitions can cause side effects. Work around this issue by using an if conditional.
    * Due to timing issues and the onDestroy / outro transitions can cause elementRoot / elementContent to be set to
    * null when swapped dynamically. There is a feature request to allow transition functions to be undefined:
    *
    * @see: https://github.com/sveltejs/svelte/issues/6942
    */
</script>

<svelte:options accessors={true}/>

{#if inTransition !== TJSDefaultTransition.default || outTransition !== TJSDefaultTransition.default}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div id={application.id}
         class="tjs-app tjs-window-app {appClasses}"
         class:mounted={mounted}
         data-appid={application.appId}
         bind:this={elementRoot}
         in:inTransition|global={inTransitionOptions}
         out:outTransition|global={outTransitionOptions}
         on:close:popup|preventDefault|stopPropagation={onClosePopup}
         on:keydown={onKeydown}
         on:pointerdown|capture={onPointerdownAppCapture}
         use:applyStyles={stylesApp}
         use:dynamicAction={appResizeObserver}
         role=application
         tabindex=-1>
        <TJSApplicationHeader {draggable} {draggableOptions} />
        <section class=window-content
                 bind:this={elementContent}
                 on:pointerdown={onPointerdownContent}
                 use:applyStyles={stylesContent}
                 use:contentResizeObserver={resizeObservedContent}
                 tabindex=-1>
            <slot />
        </section>
        <ResizableHandle />
        <TJSFocusWrap {elementRoot} />
    </div>
{:else}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div id={application.id}
         class="tjs-app tjs-window-app {appClasses}"
         class:mounted={mounted}
         data-appid={application.appId}
         bind:this={elementRoot}
         on:close:popup|preventDefault|stopPropagation={onClosePopup}
         on:keydown={onKeydown}
         on:pointerdown|capture={onPointerdownAppCapture}
         use:applyStyles={stylesApp}
         use:dynamicAction={appResizeObserver}
         role=application
         tabindex=-1>
        <TJSApplicationHeader {draggable} {draggableOptions} />
        <section class=window-content
                 bind:this={elementContent}
                 on:pointerdown={onPointerdownContent}
                 use:applyStyles={stylesContent}
                 use:contentResizeObserver={resizeObservedContent}
                 tabindex=-1>
            <slot />
        </section>
        <ResizableHandle />
        <TJSFocusWrap {elementRoot} enabled={focusWrapEnabled} />
    </div>
{/if}

<style>
   .tjs-app :global(.tjs-draggable) {
      cursor: var(--tjs-cursor-grab, grab);
   }

   .tjs-app :global(.tjs-draggable:active) {
      cursor: var(--tjs-cursor-grabbing, var(--tjs-cursor-grab-down, grabbing));
   }

   .tjs-app :global(label) {
      cursor: var(--tjs-cursor-default, default);
   }

   /**
    * Defines styles that mimic a Foundry popout Application. `:global` is used to preserve the unused CSS in the
    * template above. A primary benefit of a separate application shell implementation is that the styles are not
    * overridden by any given game system / modules that might alter the standard Foundry Application CSS. This allows
    * separate and unique styles to be given to this application regardless of game system / module modifications.
    */

   .tjs-window-app {
      contain: layout style paint;

      background: var(--tjs-app-background);
      margin: var(--tjs-app-margin);
      padding: var(--tjs-app-padding);
      color: var(--tjs-app-color);
      font-size: var(--tjs-app-font-size, var(--font-size-14));
      font-family: var(--tjs-app-font-family, var(--font-sans)), "Signika", "Palatino Linotype", sans-serif;
      font-weight: var(--tjs-app-font-weight, inherit);

      max-width: var(--tjs-app-max-width, unset);
      max-height: var(--tjs-app-max-height, unset);

      min-width: var(--tjs-app-min-width, unset);
      min-height: var(--tjs-app-min-height, unset);

      overflow: var(--tjs-app-overflow, hidden);

      scrollbar-width: var(--tjs-app-scrollbar-width, thin);
      scrollbar-color: var(--tjs-app-scrollbar-color, var(--color-scrollbar) var(--color-scrollbar-track));
   }

   /* Small hack to defer setting CQ until after 1st rAF from `onMount`; see notes at `onMount` */
   .tjs-window-app.mounted {
      container: tjs-app-window / inline-size;
   }

   .tjs-window-app .window-content {
      background: var(--tjs-app-content-background, none);
      color: var(--tjs-app-content-color, inherit);
      overflow: var(--tjs-app-content-overflow, hidden);
      padding: var(--tjs-app-content-padding, 1rem);

      flex: var(--tjs-app-content-flex, 1);
      display: var(--tjs-app-content-display, flex);
      flex-direction: var(--tjs-app-content-flex-direction, column);
      flex-wrap: var(--tjs-app-content-flex-wrap, nowrap);
   }

   /* Small hack to defer setting CQ until after 1st rAF from `onMount`; see notes at `onMount` */
   .tjs-window-app.mounted .window-content {
      container: tjs-app-window-content / inline-size;
   }

   .tjs-window-app:focus-visible {
      outline: var(--tjs-app-content-outline-focus-visible, var(--tjs-default-a11y-outline-focus-visible, 2px solid transparent));
   }

   .tjs-window-app .window-content:focus-visible {
      outline: var(--tjs-app-content-outline-focus-visible, var(--tjs-default-a11y-outline-focus-visible, 2px solid transparent));
   }

   .tjs-window-app {
      --header-height: 36px; /* Set in `.application` */

      /* Note: this is different than stock Foundry and allows rounded corners from .app core styles */
      overflow: var(--tjs-app-overflow, hidden);

      display: var(--tjs-app-display, flex);
      flex-direction: var(--tjs-app-flex-direction, column);
      flex-wrap: var(--tjs-app-flex-wrap, nowrap);
      justify-content: var(--tjs-app-justify-content, flex-start);
      position: var(--tjs-app-position, absolute);
      border-radius: var(--tjs-app-border-radius, 6px);
      border: var(--tjs-app-border, 1px solid var(--color-cool-4));
      box-shadow: var(--tjs-app-box-shadow, 0 0 10px #000);
      padding: var(--tjs-app-padding, 0);
   }

   .tjs-window-app :global(.window-header) {
      --button-size: 24px;
      color: var(--tjs-app-header-color, var(--color-light-1));
   }

   .tjs-window-app :global(.window-header .window-title) {
      flex: 1;
      margin: 0;

      line-height: var(--header-height);
      border: none;
      overflow: hidden;
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: var(--tjs-app-header-color, var(--color-light-1));
   }

   .tjs-window-app :global(.window-header button.header-control) {
      --button-background-color: none;
      padding: 0;
      margin: 0;
      border: none;
   }

   /* ------------------------------- */

   /**
    * When the `themed` class is added to the application `classes` option core dark / light theming is enabled adding
    * `themed.theme-dark` and `themed.theme-light` classes to the main app div element. The following selectors provide
    * reasonable defaults for the app color, app header background color and resize handle filter.
    */

   .tjs-window-app:not(.themed) {
      /* Explicit not themed color */
      --tjs-app-color: var(--color-light-2);
   }

   /* Themed app color using core dark / light CSS var */
   .tjs-window-app:is(.themed) {
      --tjs-app-color: var(--color-text-primary);
   }

   .tjs-window-app:is(.themed.theme-dark) {
      --color-header-background: rgba(0, 0, 0, 0.5);
   }

   .tjs-window-app:is(.themed.theme-light) {
      --color-header-background: var(--color-dark-3);
   }
</style>
