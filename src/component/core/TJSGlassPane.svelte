<script lang="ts">
   import {
      s_DEFAULT_TRANSITION,
      s_DEFAULT_TRANSITION_OPTIONS }   from '@typhonjs-fvtt/svelte/transition';

   export let id: string = void 0;
   export let zIndex: number | null = Number.MAX_SAFE_INTEGER;
   export let background: string = '#50505080';
   export let captureInput: boolean = true;
   export let preventDefault: boolean = true;
   export let stopPropagation: boolean = true;

   let glassPane: HTMLElement;

   $: if (glassPane)
   {
      glassPane.style.maxWidth = '100%';
      glassPane.style.maxHeight = '100%';
      glassPane.style.width = '100%';
      glassPane.style.height = '100%';
   }

   $: if (glassPane)
   {
      if (captureInput) { glassPane.focus(); }
      glassPane.style.pointerEvents = captureInput ? 'auto' : 'none';
   }

   $: if (glassPane) { glassPane.style.background = background; }
   $: if (glassPane)
   {
      // TODO TYPE: this probably has to be a string;
      // @ts-ignore
      glassPane.style.zIndex = zIndex;
   }

   // ---------------------------------------------------------------------------------------------------------------

   // The following block is somewhat complex, but allows transition options to be updated reactively during
   // runtime execution.

   // Exports properties to set a transition w/ in / out options.
   export let transition: Function = void 0;
   export let inTransition: Function = s_DEFAULT_TRANSITION;
   export let outTransition: Function = s_DEFAULT_TRANSITION;

   // Exports properties to set options for any transitions.
   export let transitionOptions: object = void 0;
   export let inTransitionOptions: object = s_DEFAULT_TRANSITION_OPTIONS;
   export let outTransitionOptions: object = s_DEFAULT_TRANSITION_OPTIONS;

   // Tracks last transition state.
   let oldTransition: Function = void 0;
   let oldTransitionOptions: object = void 0

   // Run this reactive block when the last transition state is not equal to the current state.
   $: if (oldTransition !== transition)
   {
      // If transition is defined and not the default transition then set it to both in and out transition otherwise
      // set the default transition to both in & out transitions.
      const newTransition: Function = s_DEFAULT_TRANSITION !== transition && typeof transition === 'function' ?
       transition : s_DEFAULT_TRANSITION;

      inTransition = newTransition;
      outTransition = newTransition;

      oldTransition = newTransition;
   }

   // Run this reactive block when the last transition options state is not equal to the current options state.
   $: if (oldTransitionOptions !== transitionOptions)
   {
      const newOptions: object = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS &&
       typeof transitionOptions === 'object' ? transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;

      inTransitionOptions = newOptions;
      outTransitionOptions = newOptions;

      oldTransitionOptions = newOptions;
   }

   // Handle cases if inTransition is unset; assign noop default transition function.
   $: if (typeof inTransition !== 'function') { inTransition = s_DEFAULT_TRANSITION; }

   // Handle cases if outTransition is unset; assign noop default transition function.
   $: if (typeof outTransition !== 'function') { outTransition = s_DEFAULT_TRANSITION; }

   // Handle cases if inTransitionOptions is unset; assign empty default transition options.
   $: if (typeof inTransitionOptions !== 'object') { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // Handle cases if outTransitionOptions is unset; assign empty default transition options.
   $: if (typeof outTransitionOptions !== 'object') { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS; }

   // ---------------------------------------------------------------------------------------------------------------

   function swallow(event)
   {
      if (captureInput)
      {
         if (preventDefault) { event.preventDefault(); }
         if (stopPropagation) { event.stopPropagation(); }
      }
   }
</script>

<svelte:options accessors={true}/>

<div id={id}
     bind:this={glassPane}
     tabindex=0
     class=tjs-glass-pane
     in:inTransition={inTransitionOptions}
     out:outTransition={outTransitionOptions}
     on:keydown={swallow}>
   <slot />
</div>

<style>
   .tjs-glass-pane {
      position: absolute;
      overflow: inherit;
   }
</style>
