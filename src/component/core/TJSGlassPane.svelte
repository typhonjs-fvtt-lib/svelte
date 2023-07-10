<script>
   import { applyStyles }              from '#runtime/svelte/action/dom';
   import { TJSDefaultTransition }     from '#runtime/svelte/transition';
   import { isObject }                 from '#runtime/util/object';

   /** @type {string} */
   export let background = '#50505080';

   /** @type {boolean} */
   export let captureInput = true;

   /** @type {string} */
   export let id = void 0;

   /** @type {boolean} */
   export let slotSeparate = void 0;

   /** @type {Record<string, string>} */
   export let styles = void 0;

   /** @type {number} */
   export let zIndex = Number.MAX_SAFE_INTEGER;

   /** @type {HTMLDivElement} */
   let backgroundEl, containerEl, glassPaneEl;

   $: slotSeparate = typeof slotSeparate === 'boolean' ? slotSeparate : false;

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition = void 0;
   export let inTransition = void 0;
   export let outTransition = void 0;

   // Exports properties to set options for any transitions.
   export let transitionOptions = void 0;
   export let inTransitionOptions = TJSDefaultTransition.options;
   export let outTransitionOptions = TJSDefaultTransition.options;

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
      const newOptions = transitionOptions !== TJSDefaultTransition.options && isObject(transitionOptions) ?
       transitionOptions : TJSDefaultTransition.options;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = void 0; }

   // Handle cases if outTransition is unset; assign noop default transition function.
   $: if (typeof outTransition !== 'function') { outTransition = void 0; }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (!isObject(inTransitionOptions)) { inTransitionOptions = TJSDefaultTransition.options; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (!isObject(outTransitionOptions)) { outTransitionOptions = TJSDefaultTransition.options; }

   // ---------------------------------------------------------------------------------------------------------------

   /**
    * Swallows / stops propagation for all events where the event target is not contained by the glass pane element.
    *
    * @param {Event} event - The event to swallow.
    */
   function swallow(event)
   {
      const targetEl = event.target;

      if (targetEl !== glassPaneEl && targetEl !== backgroundEl  && targetEl !== containerEl &&
        glassPaneEl.contains(targetEl))
      {
         return;
      }

      if (captureInput)
      {
         event.preventDefault();
         event.stopImmediatePropagation();
      }
   }
</script>

<!-- Capture all input -->
<svelte:window
        on:contextmenu|capture={swallow}
        on:dblclick|capture={swallow}
        on:keydown|capture={swallow}
        on:keyup|capture={swallow}
        on:mousedown|capture={swallow}
        on:mousemove|capture={swallow}
        on:mouseup|capture={swallow}
        on:pointerdown|capture={swallow}
        on:pointermove|capture={swallow}
        on:pointerup|capture={swallow}
        on:touchend|capture={swallow}
        on:touchmove|capture={swallow}
        on:touchstart|capture={swallow}
        on:wheel|capture={swallow}
/>

<div id={id}
     bind:this={glassPaneEl}
     class=tjs-glass-pane
     style:z-index={zIndex}>

   {#if slotSeparate}
      <div class=tjs-glass-pane-background
           bind:this={backgroundEl}
           style:background={background}
           in:inTransition|global={inTransitionOptions}
           out:outTransition|global={outTransitionOptions}
           use:applyStyles={styles} />

      <div class=tjs-glass-pane-container bind:this={containerEl}>
         <slot />
      </div>
   {:else}
      <div class=tjs-glass-pane-background
           bind:this={backgroundEl}
           style:background={background}
           in:inTransition|global={inTransitionOptions}
           out:outTransition|global={outTransitionOptions}
           use:applyStyles={styles} >
         <slot />
      </div>
   {/if}
</div>

<style>
   .tjs-glass-pane, .tjs-glass-pane-background , .tjs-glass-pane-container {
      position: absolute;
      overflow: hidden;

      height: 100%;
      width: 100%;
      max-height: 100%;
      max-width: 100%;
   }
</style>
