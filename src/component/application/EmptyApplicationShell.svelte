<script>
   /**
    * Provides an empty application shell as a main top level slotted component.
    *
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
   import { isObject }                 from '#runtime/util/object';

   import { AppShellContextInternal }  from './AppShellContextInternal.js';
   import ResizableHandle              from './ResizableHandle.svelte';

   import TJSFocusWrap                 from '../internal/dom/TJSFocusWrap.svelte';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent = void 0;
   export let elementRoot = void 0;

   // Explicit style overrides for the main app and content elements. Uses action `applyStyles`.
   export let stylesApp = void 0;

   /**
    * Application reference.
    *
    * @type {SvelteApplication}
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

   // Assign elementRoot to elementContent.
   $: if (elementRoot) { elementContent = elementRoot; }

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

   // Focus `elementRoot` on mount to allow keyboard tab navigation of header buttons.
   onMount(() => elementRoot.focus());

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
    * the actively focused element then last focusable element is focused skipping `TJSFocusWrap`.
    *
    * @param {KeyboardEvent} event - Keyboard Event.
    */
   function onKeydown(event)
   {
      // TODO: Note this handling is specifically for Foundry v11+ as the platform KeyboardManager uses
      // `document.querySelector(':focus')` to short circuit keyboard handling internally to KeyboardManager.
      // ApplicationShell manages containing focus programmatically and this prevents the Foundry KeyboardManager from
      // activating. We need to check if this key event target is currently the `elementRoot` or `elementContent` and
      // the event matches any KeyboardManager actions and if so blur current focus.
      if ((event.target === elementRoot || event.target === elementContent) &&
       KeyboardManager && KeyboardManager?._getMatchingActions?.(
        KeyboardManager?.getKeyboardEventContext?.(event))?.length)
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
      if (typeof application?.options?.popOut === 'boolean' && application.options.popOut &&
       application !== globalThis.ui?.activeWindow)
      {
         application.bringToTop.call(application);
      }
   }

   /**
    * If the application is a popOut application then when clicked bring to top if not already the Foundry
    * `activeWindow`.
    *
    * @param {PointerEvent} event - A PointerEvent.
    */
   function onPointerdownApp(event)
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
               elementRoot.focus();
            }
            else
            {
               event.preventDefault();
            }
         }
         else
         {
            elementRoot.focus();
         }
      }

      if (typeof application?.options?.popOut === 'boolean' && application.options.popOut &&
       application !== globalThis.ui?.activeWindow)
      {
         application.bringToTop.call(application);
      }
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
         class={application.options.classes.join(' ')}
         data-appid={application.appId}
         bind:this={elementRoot}
         in:inTransition|global={inTransitionOptions}
         out:outTransition|global={outTransitionOptions}
         on:close:popup|preventDefault|stopPropagation={onClosePopup}
         on:keydown|capture={onKeydown}
         on:pointerdown={onPointerdownApp}
         use:applyStyles={stylesApp}
         use:dynamicAction={appResizeObserver}
         role=application
         tabindex=-1>
        <slot />
        <ResizableHandle />
        <TJSFocusWrap {elementRoot} enabled={focusWrapEnabled} />
    </div>
{:else}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div id={application.id}
         class={application.options.classes.join(' ')}
         data-appid={application.appId}
         bind:this={elementRoot}
         on:close:popup|preventDefault|stopPropagation={onClosePopup}
         on:keydown|capture={onKeydown}
         on:pointerdown={onPointerdownApp}
         use:applyStyles={stylesApp}
         use:dynamicAction={appResizeObserver}
         role=application
         tabindex=-1>
        <slot />
        <ResizableHandle />
        <TJSFocusWrap {elementRoot} enabled={focusWrapEnabled} />
    </div>
{/if}

<style>
    div {
        background: var(--tjs-empty-app-background, none);

        border-radius: var(--tjs-app-border-radius, 5px);
        box-shadow: var(--tjs-app-box-shadow, none);
        color: var(--tjs-app-color, inherit);
        display: var(--tjs-app-display, flex);
        flex-direction: var(--tjs-app-flex-direction, column);
        flex-wrap: var(--tjs-app-flex-wrap, nowrap);
        justify-content: var(--tjs-app-justify-content, flex-start);
        margin: var(--tjs-app-margin, 0);
        max-height: var(--tjs-app-max-height, 100%);
        overflow: var(--tjs-app-overflow, hidden);
        padding: var(--tjs-app-padding, 0);
        position: var(--tjs-app-position, absolute);
    }

    div:focus-visible {
        outline: var(--tjs-app-outline-focus-visible, var(--tjs-default-a11y-outline-focus-visible, 2px solid transparent));
    }
</style>
