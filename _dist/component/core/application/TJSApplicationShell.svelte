<script>
   import {
      getContext,
      onMount,
      setContext }                     from 'svelte';

   import { writable }                 from 'svelte/store';

   import {
      applyStyles,
      resizeObserver }                 from '@typhonjs-fvtt/svelte/action';

   import FocusWrap                    from './FocusWrap.svelte';
   import TJSApplicationHeader         from './TJSApplicationHeader.svelte';
   import TJSContainer                 from '../TJSContainer.svelte';
   import ResizableHandle              from './ResizableHandle.svelte';

   import {
      s_DEFAULT_TRANSITION,
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
   export let children = void 0;

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

   // Use a writable store to make `elementContent` and `elementRoot` accessible. A store is used in the case when
   // One root component with an `elementRoot` is replaced with another. Due to timing issues and the onDestroy / outro
   // transitions either of these may be set to null. I will investigate more and file a bug against Svelte.
   if (!getContext('storeElementContent')) { setContext('storeElementContent', writable(elementContent)); }
   if (!getContext('storeElementRoot')) { setContext('storeElementRoot', writable(elementRoot)); }

   // Only update the `elementContent` store if the new `elementContent` is not null or undefined.
   $: if (elementContent !== void 0 && elementContent !== null)
   {
      getContext('storeElementContent').set(elementContent);
   }

   // Only update the `elementRoot` store if the new `elementRoot` is not null or undefined.
   $: if (elementRoot !== void 0 && elementRoot !== null)
   {
      getContext('storeElementRoot').set(elementRoot);
   }

   const context = getContext('external');

   // Store Foundry Application reference.
   const application = context.application;

   // TODO: Make this generic / not Foundry specific.
   // Calculate background image w/ route prefix to set to '--tjs-app-background' CSS variable.
   const backgroundImg = `url(${foundry.utils.getRoute('/ui/denim075.png')})`;

   // This component can host multiple children defined via props or in the TyphonJS SvelteData configuration object
   // that are potentially mounted in the content area. If no children defined then this component mounts any slotted
   // child.
   const allChildren = Array.isArray(children) ? children :
    typeof context === 'object' ? context.children : void 0;

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition = void 0;
   export let inTransition = s_DEFAULT_TRANSITION;
   export let outTransition = s_DEFAULT_TRANSITION;

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
      const newTransition = s_DEFAULT_TRANSITION !== transition && typeof transition === 'function' ? transition :
       s_DEFAULT_TRANSITION;

      inTransition = newTransition;
      outTransition = newTransition;

      oldTransition = newTransition;
   }

   // Run this reactive block when the last transition options state is not equal to the current options state.
   $: if (oldTransitionOptions !== transitionOptions)
   {
      const newOptions = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === 'object' ?
       transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = s_DEFAULT_TRANSITION; }

   $:
   {
      // Handle cases if outTransition is unset; assign noop default transition function.
      if (typeof outTransition !== 'function') { outTransition = s_DEFAULT_TRANSITION; }

      // Set jquery close animation to either run or not when an out transition is changed.
      if (application && typeof application?.options?.defaultCloseAnimation === 'boolean')
      {
         application.options.defaultCloseAnimation = outTransition === s_DEFAULT_TRANSITION;
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
    * the actively focused element then the second to last focusable element if applicable is focused.
    *
    * @param {KeyboardEvent} event - Keyboard Event.
    */
   function onKeydown(event)
   {
      if (event.shiftKey && event.code === 'Tab')
      {
         // We only need to find the first tabindex element as app header buttons have a `tabindex`.
         const firstFocusEl = elementRoot.querySelector('[tabindex]:not([tabindex="-1"])');

         // Only cycle focus to the last keyboard focusable app element if `elementRoot` or first focusable element
         // is the active element.
         if (elementRoot === document.activeElement || firstFocusEl === document.activeElement)
         {
            // TODO: Consider non-tabindex focusable elements.
            const allFocusable = elementRoot.querySelectorAll('[tabindex]:not([tabindex="-1"])');

            if (allFocusable.length > 2)
            {
               // Select two elements back as the last focusable element is `FocusWrap`.
               const lastFocusable = allFocusable[allFocusable.length - 2];
               if (lastFocusable instanceof HTMLElement) { lastFocusable.focus(); }
            }

            event.preventDefault();
            event.stopPropagation();
         }
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
    * Focus `elementContent` if the active element is external to `elementContent`.
    */
   function onPointerdownContent()
   {
      if (!elementContent.contains(document.activeElement)) { elementContent.focus(); }
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
</script>

<svelte:options accessors={true}/>

<div id={application.id}
     class="tjs-app tjs-window-app {application.options.classes.join(' ')}"
     data-appid={application.appId}
     bind:this={elementRoot}
     in:inTransition={inTransitionOptions}
     out:outTransition={outTransitionOptions}
     on:keydown|capture={onKeydown}
     on:pointerdown={onPointerdownApp}
     use:applyStyles={stylesApp}
     use:appResizeObserver={resizeObservedApp}
     style:--tjs-app-background={backgroundImg}
     tabindex=-1>
   <TJSApplicationHeader {draggable} {draggableOptions} />
   <section class=window-content
            bind:this={elementContent}
            on:pointerdown={onPointerdownContent}
            use:applyStyles={stylesContent}
            use:contentResizeObserver={resizeObservedContent}
            tabindex=-1>
       {#if Array.isArray(allChildren)}
           <TJSContainer children={allChildren} />
       {:else}
           <slot />
       {/if}
   </section>
   <ResizableHandle />
   <FocusWrap {elementRoot} />
</div>

<style>
    /**
     * Defines styles that mimic a Foundry popout Application. `:global` is used to preserve the unused CSS in the
     * template above. A primary benefit of a separate application shell implementation is that the styles are not
     * overridden by any given game system / modules that might alter the standard Foundry Application CSS. This allows
     * separate and unique styles to be given to this application regardless of game system / module modifications.
     */

    .tjs-app {
        max-height: 100%;
        background: var(--tjs-app-background) repeat;
        border-radius: 5px;
        box-shadow: 0 0 20px #000;
        margin: 3px 0;
        padding: 0.5em;
        color: #f0f0e0;
        z-index: 95;
        overflow: inherit;
    }

    .tjs-window-app:focus-visible {
        outline: 2px solid transparent;
    }

    .tjs-window-app .window-content:focus-visible {
        outline: 2px solid transparent;
    }

    .tjs-window-app {
        /* Note: this is different than stock Foundry and allows rounded corners from .app core styles */
        overflow: hidden;

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        position: absolute;
        box-shadow: 0 0 20px #000;
        padding: 0;
        z-index: 95;
    }

    .tjs-window-app :global(> .flex0) {
        display: block;
        flex: 0;
    }

    .tjs-window-app :global(> .flex1) {
        flex: 1;
    }

    .tjs-window-app :global(> .flex2) {
        flex: 2;
    }

    .tjs-window-app :global(> .flex3) {
        flex: 3;
    }

    .tjs-window-app :global(.window-header) {
        flex: 0 0 30px;
        overflow: hidden;
        padding: 0 8px;
        line-height: 30px;
        border-bottom: 1px solid #000;
    }

    .tjs-window-app :global(.window-header .window-title) {
        margin: 0;
        word-break: break-all;
    }

    .tjs-window-app :global(.window-header a) {
        flex: none;
        margin: 0 0 0 8px;
    }

    .tjs-window-app :global(.window-header i[class^=fa]) {
        margin-right: 3px;
    }

    .tjs-window-app.minimized :global(.window-header) {
        border: 1px solid #000;
    }

    .tjs-window-app .window-content {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        flex: 1;
        justify-content: flex-start;
        background: none;
        padding: 8px;
        color: #191813;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .tjs-window-app :global(.window-resizable-handle) {
        width: 20px;
        height: 20px;
        position: absolute;
        bottom: -1px;
        right: 0;
        background: #444;
        padding: 2px;
        border: 1px solid #111;
        border-radius: 4px 0 0 0;
    }

    .tjs-window-app :global(.window-resizable-handle i.fas) {
        transform: rotate(45deg);
    }
</style>
