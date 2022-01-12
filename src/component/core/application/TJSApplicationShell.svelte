<script>
   import { getContext, setContext }    from 'svelte';
   import { writable }                  from 'svelte/store';
   import { applyStyles }               from '@typhonjs-fvtt/svelte/action';

   import TJSApplicationHeader          from './TJSApplicationHeader.svelte';
   import TJSContainer                  from '../TJSContainer.svelte';
   import ResizableHandle               from './ResizableHandle.svelte';

   import {
      s_DEFAULT_TRANSITION,
      s_DEFAULT_TRANSITION_OPTIONS }    from '@typhonjs-fvtt/svelte/transition';

   // Bound to the content and root elements. Can be used by parent components. SvelteApplication will also
   // use 'elementRoot' to set the element of the Application. You can also provide `elementContent` and
   // `elementTarget`. Please see SvelteApplication lifecycle documentation.
   export let elementContent;
   export let elementRoot;

   // The children array can be specified by a parent via prop or is read below from the external context.
   export let children = void 0;

   // If a parent component binds and sets `heightChanged` to true then it is bound to the content & root element
   // `clientHeight`.
   export let heightChanged = false;

   // Explicit style overrides for the main app and content elements. Uses action `applyStyles`.
   export let stylesApp;
   export let stylesContent;

   // Store the initial `heightChanged` state. If it is truthy then `clientHeight` for the content & root elements
   // are bound to `heightChanged` to signal to any parent component of any change to the client & root.
   const bindHeightChanged = !!heightChanged;

   // If the application is a popOut application then when clicked bring to top. Bound to on pointerdown.
   const bringToTop = () =>
   {
      if (typeof foundryApp.options.popOut === 'boolean' && foundryApp.options.popOut &&
       foundryApp !== ui?.activeWindow)
      {
         foundryApp.bringToTop.call(foundryApp);
      }
   }

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
   const foundryApp = context.foundryApp;

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
      if (foundryApp && typeof foundryApp?.options?.defaultCloseAnimation === 'boolean')
      {
         foundryApp.options.defaultCloseAnimation = outTransition === s_DEFAULT_TRANSITION;
      }
   }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (typeof inTransitionOptions !== 'object') { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (typeof outTransitionOptions !== 'object') { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }
</script>

<svelte:options accessors={true}/>

{#if bindHeightChanged}
   <div id={foundryApp.id}
        class="tjs-app tjs-window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:clientHeight={heightChanged}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}
        on:pointerdown|capture={bringToTop}
        use:applyStyles={stylesApp}>
       <TJSApplicationHeader />
       <section class=window-content
                bind:this={elementContent}
                bind:clientHeight={heightChanged}
                use:applyStyles={stylesContent}>
           {#if Array.isArray(allChildren)}
               <TJSContainer children={allChildren} />
           {:else}
               <slot />
           {/if}
       </section>
       <ResizableHandle />
   </div>
{:else}
   <div id={foundryApp.id}
        class="tjs-app tjs-window-app {foundryApp.options.classes.join(' ')}"
        data-appid={foundryApp.appId}
        bind:this={elementRoot}
        in:inTransition={inTransitionOptions}
        out:outTransition={outTransitionOptions}
        on:pointerdown|capture={bringToTop}
        use:applyStyles={stylesApp}>
       <TJSApplicationHeader />
       <section class=window-content bind:this={elementContent} use:applyStyles={stylesContent}>
           {#if Array.isArray(allChildren)}
               <TJSContainer children={allChildren} />
           {:else}
               <slot />
           {/if}
       </section>
      <ResizableHandle />
   </div>
{/if}


<style>
    /**
     * Defines styles that mimic a Foundry popout Application. `:global` is used to preserve the unused CSS in the
     * template above. A primary benefit of a separate application shell implementation is that the styles are not
     * overridden by any given game system / modules that might alter the standard Foundry Application CSS. This allows
     * separate and unique styles to be given to this application regardless of game system / module modifications.
     */
    :global(.tjs-app) {
        max-height: 100%;
        background: url(/ui/denim075.png) repeat;
        border-radius: 5px;
        box-shadow: 0 0 20px #000;
        margin: 3px 0;
        padding: 0.5em;
        color: #f0f0e0;
        z-index: 95;
        overflow: inherit;
    }

    :global(.tjs-window-app) {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        position: absolute;
        box-shadow: 0 0 20px #000;
        padding: 0;
        z-index: 95;
    }

    :global(.tjs-window-app > *) {
        flex: 1;
    }

    :global(.tjs-window-app > .flex0) {
        display: block;
        flex: 0;
    }

    :global(.tjs-window-app > .flex1) {
        flex: 1;
    }

    :global(.tjs-window-app > .flex2) {
        flex: 2;
    }

    :global(.tjs-window-app > .flex3) {
        flex: 3;
    }

    :global(.tjs-window-app .window-header) {
        flex: 0 0 30px;
        overflow: hidden;
        padding: 0 8px;
        line-height: 30px;
        border-bottom: 1px solid #000;
    }

    :global(.tjs-window-app .window-header .window-title) {
        margin: 0;
        word-break: break-all;
    }

    :global(.tjs-window-app .window-header a) {
        flex: none;
        margin: 0 0 0 8px;
    }

    :global(.tjs-window-app .window-header i[class^=fa]) {
        margin-right: 3px;
    }

    :global(.tjs-window-app.minimized .window-header) {
        border: 1px solid #000;
    }

    :global(.tjs-window-app .window-content) {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        padding: 8px;
        color: #191813;
        overflow-y: auto;
        overflow-x: hidden;
    }

    :global(.window-app .window-content > *) {
        flex: 1;
    }

    :global(.window-app .window-content > .flex0) {
        display: block;
        flex: 0;
    }

    :global(.window-app .window-content > .flex1) {
        flex: 1;
    }

    :global(.window-app .window-content > .flex2) {
        flex: 2;
    }

    :global(.window-app .window-content > .flex3) {
        flex: 3;
    }

    :global(.window-app.zhover) {
        z-index: calc(var(--z-index-window) + 1);
    }

    :global(.tjs-window-app .window-resizable-handle) {
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

    :global(.tjs-window-app .window-resizable-handle i.fas) {
        transform: rotate(45deg);
    }

    :global(.window-app.minimized .window-resizable-handle) {
        display: none;
    }
</style>
