<script>
   /**
    * Provides an application shell is a main top level slotted component that provides a reactive
    * outer wrapper and header bar for the main content component.
    */

   import {
      getContext,
      onMount,
      setContext }                     from 'svelte';

   import {
      applyStyles,
      resizeObserver }                 from '@typhonjs-fvtt/svelte/action';

   import {
      A11yHelper,
      isObject }                       from '@typhonjs-fvtt/svelte/util';

   import { AppShellContextInternal }  from './AppShellContextInternal.js';
   import TJSApplicationHeader         from './TJSApplicationHeader.svelte';
   import TJSFocusWrap                 from './TJSFocusWrap.svelte';
   import ResizableHandle              from './ResizableHandle.svelte';

   import {
      s_DEFAULT_TRANSITION_OPTIONS }   from '@typhonjs-fvtt/svelte/transition';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent = void 0;
   export let elementRoot = void 0;

   // Allows custom draggable implementations to be forwarded to TJSApplicationHeader.
   export let draggable = void 0;
   export let draggableOptions = void 0;

   // The children array can be specified by a parent via prop or is read below from the external context.
   // export let children = void 0;

   // Explicit style overrides for the main app and content elements. Uses action `applyStyles`.
   export let stylesApp = void 0;
   export let stylesContent = void 0;

   // If a parent component binds and sets `appOffsetHeight` to true then a resizeObserver action is enabled on the
   // outer application `div`. Additionally, the SvelteApplication position resizeObserved store is updated.
   export let appOffsetHeight = false;
   export let appOffsetWidth = false;

   // Set to `resizeObserver` if either of the above props are truthy otherwise a null operation.
   const appResizeObserver = !!appOffsetHeight || !!appOffsetWidth ? resizeObserver : () => null;

   // If a parent component binds and sets `contentOffsetHeight` or `contentOffsetWidth` to true then a
   // resizeObserver action is enabled on the content `section`.
   export let contentOffsetHeight = false;
   export let contentOffsetWidth = false;

   // Set to `resizeObserver` if either of the above props are truthy otherwise a null operation.
   const contentResizeObserver = !!contentOffsetHeight || !!contentOffsetWidth ? resizeObserver : () => null;

   // Provides the internal context for data / stores of the application shell.
   const internal = new AppShellContextInternal();

   const autoFocus = internal.stores.autoFocus;

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

   const context = getContext('#external');

   // Store application reference.
   const application = context.application;

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition = void 0;
   export let inTransition = void 0;
   export let outTransition = void 0;

   // Exports properties to set options for any transitions.
   export let transitionOptions = void 0;
   export let inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;
   export let outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS;

   // Tracks last transition state.
   let oldTransition = void 0;
   let oldTransitionOptions = void 0

   // Run this reactive block when the last transition state is not equal to the current state.
   $: if (oldTransition !== transition)
   {
      // If transition is defined and not the default transition then set it to both in and out transition otherwise
      // set the default transition to both in & out transitions.
      const newTransition = typeof transition === 'function' ? transition : void 0;

      inTransition = newTransition;
      outTransition = newTransition;

      oldTransition = newTransition;
   }

   // Run this reactive block when the last transition options state is not equal to the current options state.
   $: if (oldTransitionOptions !== transitionOptions)
   {
      const newOptions = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && isObject(transitionOptions) ?
       transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = void 0; }

   $:
   {
      // Handle cases if outTransition is unset; assign noop default transition function.
      if (typeof outTransition !== 'function') { outTransition = void 0; }

      // Set jquery close animation to either run or not when an out transition is changed.
      if (application && typeof application?.options?.defaultCloseAnimation === 'boolean')
      {
         application.options.defaultCloseAnimation = outTransition === void 0;
      }
   }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (typeof inTransitionOptions !== 'object') { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (typeof outTransitionOptions !== 'object') { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // ---------------------------------------------------------------------------------------------------------------

   // Focus `elementRoot` on mount to allow keyboard tab navigation of header buttons.
   onMount(() => elementRoot.focus());

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * Provides focus cycling inside the application capturing `<Shift-Tab>` and if `elementRoot` or `firstFocusEl` is
    * the actively focused element then last focusable element is focused skipping `TJSFocusWrap`.
    *
    * Also, if a popout app all key down events will bring this application to the top such that when focus is trapped
    * the app is top most.
    *
    * @param {KeyboardEvent} event - Keyboard Event.
    */
   function onKeydown(event)
   {
      if (event.shiftKey && event.code === 'Tab')
      {
         // Collect all focusable elements from `elementRoot` and ignore TJSFocusWrap.
         const allFocusable = A11yHelper.getFocusableElements(elementRoot, s_IGNORE_CLASSES);

         // Find first and last focusable elements.
         const firstFocusEl = allFocusable.length > 0 ? allFocusable[0] : void 0;
         const lastFocusEl = allFocusable.length > 0 ? allFocusable[allFocusable.length - 1] : void 0;

         // Only cycle focus to the last keyboard focusable app element if `elementRoot` or first focusable element
         // is the active element.
         if (elementRoot === document.activeElement || firstFocusEl === document.activeElement)
         {
            if (lastFocusEl instanceof HTMLElement && firstFocusEl !== lastFocusEl) { lastFocusEl.focus(); }

            event.preventDefault();
            event.stopPropagation();
         }
      }

      // Make sure this application is top most when it receives keyboard events.
      if (typeof application.options.popOut === 'boolean' && application.options.popOut &&
       application !== globalThis.ui?.activeWindow)
      {
         application.bringToTop.call(application);
      }
   }

   /**
    * If the application is a popOut application then when clicked bring to top if not already the Foundry
    * `activeWindow`.
    */
   function onPointerdownApp()
   {
      if (typeof application.options.popOut === 'boolean' && application.options.popOut &&
       application !== globalThis.ui?.activeWindow)
      {
         application.bringToTop.call(application);
      }
   }

   /**
    * Focus `elementContent` if the event target is not focusable and `autoFocus` is enabled.
    *
    * Note: `autoFocus` is an internal store. This check is a bit tricky as `section.window-content` has a tabindex
    * of '-1', so it is focusable.
    */
   function onPointerdownContent(event)
   {
      const focusable = A11yHelper.isFocusable(event.target);

      if (!focusable)
      {
         if ($autoFocus)
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
         if (!$autoFocus && !focusable)
         {
            event.preventDefault();
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

{#if inTransition || outTransition}
   <div id={application.id}
        class="app window-app {application.options.classes.join(' ')}"
        data-appid={application.appId}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}
        on:keydown|capture={onKeydown}
        on:pointerdown={onPointerdownApp}
        use:applyStyles={stylesApp}
        use:appResizeObserver={resizeObservedApp}
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
   <div id={application.id}
        class="app window-app {application.options.classes.join(' ')}"
        data-appid={application.appId}
        bind:this={elementRoot}
        on:keydown|capture={onKeydown}
        on:pointerdown={onPointerdownApp}
        use:applyStyles={stylesApp}
        use:appResizeObserver={resizeObservedApp}
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
{/if}

<style>
   /* Note: this is different than stock Foundry and allows rounded corners from .app core styles */
   .window-app {
      overflow: var(--tjs-app-overflow, hidden);
   }

   .window-app:focus-visible {
      outline: var(--tjs-app-outline-focus, 2px solid transparent);
   }

   .window-content:focus-visible {
      outline: var(--tjs-app-content-outline-focus, 2px solid transparent);
   }

   /* Override Foundry default; adjust --tjs-app-header-gap to change gap size */
   .window-app :global(.window-header a) {
      flex: none;
      margin: 0;
   }

   /* Override Foundry default; See TJSHeaderButton for CSS variables */
   .window-app :global(.window-header i[class^=fa]) {
      margin: 0
   }
</style>
