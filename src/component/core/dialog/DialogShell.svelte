<script>
   import {
      getContext,
      onDestroy,
      onMount,
      setContext }         from 'svelte';

   import { fade }         from 'svelte/transition';

   import { isObject }     from '@typhonjs-fvtt/svelte/util';

   import ApplicationShell from '../application/ApplicationShell.svelte';
   import DialogContent    from './DialogContent.svelte';
   import TJSGlassPane     from '../TJSGlassPane.svelte';

   // ApplicationShell contract.
   export let elementContent = void 0;
   export let elementRoot = void 0;

   // The dialog data.
   export let data = {};

   export let dialogComponent = void 0;

   export let managedPromise = void 0;

   const application = getContext('external').application;

   setContext('#managedPromise', managedPromise);

   const s_MODAL_TRANSITION = fade;
   const s_MODAL_TRANSITION_OPTIONS = { duration: 200 };
   const s_MODAL_BACKGROUND = '#50505080'

   let modal = void 0;

   // Stores props for the ApplicationShell.
   const appProps = {
      // Stores any transition functions.
      transition: void 0,
      inTransition: void 0,
      outTransition: void 0,

      // Stores properties to set for options for any transitions.
      transitionOptions: void 0,
      inTransitionOptions: void 0,
      outTransitionOptions: void 0,

      // Stores any style overrides for application shell.
      stylesApp: void 0,
      stylesContent: void 0
   }

   const modalProps = {
      // Background CSS style string.
      background: void 0,
      slotSeparate: void 0,
      styles: void 0,

      // Stores any transition functions.
      transition: void 0,
      inTransition: void 0,
      outTransition: void 0,

      // Stores properties to set for options for any transitions.
      transitionOptions: void 0,
      inTransitionOptions: void 0,
      outTransitionOptions: void 0,
   }

   let zIndex = void 0;

   let minimizable = true;

   // Only set modal once on mount. You can't change between a modal an non-modal dialog during runtime.
   if (modal === void 0) { modal = typeof data?.modal === 'boolean' ? data.modal : false; }

   // Special modal handling -----------------------------------------------------------------------------------------

   if (modal)
   {
      // Add a capture listener on window keydown to act before any other event listener.
      onDestroy(() => window.removeEventListener('keydown', onKeydownModal, { capture: true }));
      onMount(() => window.addEventListener('keydown', onKeydownModal, { capture: true }));
   }
   else
   {
      // Add a listener on document keydown to act before or equal with other event listeners.
      onDestroy(() => document.removeEventListener('keydown', onKeydown));
      onMount(() => document.addEventListener('keydown', onKeydown));
   }

   // Aria Attributes ------------------------------------------------------------------------------------------------

   $: if (elementRoot instanceof HTMLElement)
   {
      elementRoot.setAttribute('role', 'dialog');

      if (modal) { elementRoot.setAttribute('aria-modal', 'true'); }
   }

   // SvelteApplication options --------------------------------------------------------------------------------------

   // Retrieve values from the DialogData object and also potentially set any SvelteApplication accessors.
   // Explicit checks are performed against existing local variables as the only externally reactive variable is `data`.
   // All of the checks below trigger when there are any external changes to the `data` prop.
   // Prevent any unnecessary changing of local & `application` variables unless actual changes occur.

   $: if (isObject(data))
   {
      const newZIndex = Number.isInteger(data.zIndex) || data.zIndex === null ? data.zIndex :
       modal ? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER - 1
      if (zIndex !== newZIndex) { zIndex = newZIndex; }

      // Update the main foundry options when data changes. Perform explicit checks against existing data in `application`.
      const newDraggable = data.draggable ?? true;
      if (application.reactive.draggable !== newDraggable) { application.reactive.draggable = newDraggable; }

      const newMinimizable = data.minimizable ?? true;
      if (application.reactive.minimizable !== newMinimizable) { application.reactive.minimizable = newMinimizable; }

      const newResizable = data.resizable ?? false;
      if (application.reactive.resizable !== newResizable) { application.reactive.resizable = newResizable; }

      // Note application.title from Application localizes `options.title`, so compare with `application.options.title`.
      const newTitle = data.title ?? 'Dialog';
      if (newTitle !== application?.options?.title) { application.reactive.title = newTitle; }

      if (application.position.zIndex !== zIndex) { application.position.zIndex = zIndex; }
   }

   // ApplicationShell transition options ----------------------------------------------------------------------------

   $: if (isObject(data?.transition))
   {
      // Store data.transitions to shorten statements below.
      const d = data.transition;

      if (d?.transition !== appProps.transition) { appProps.transition = d.transition; }
      if (d?.inTransition !== appProps.inTransition) { appProps.inTransition = d.inTransition; }
      if (d?.outTransition !== appProps.outTransition) { appProps.outTransition = d.outTransition; }
      if (d?.transitionOptions !== appProps.transitionOptions) { appProps.transitionOptions = d.transitionOptions; }

      if (d?.inTransitionOptions !== appProps.inTransitionOptions)
      {
         appProps.inTransitionOptions = d.inTransitionOptions;
      }

      if (d?.outTransitionOptions !== appProps.outTransitionOptions)
      {
         appProps.outTransitionOptions = d.outTransitionOptions;
      }
   }

   // Modal options --------------------------------------------------------------------------------------------------

   $:
   {
      const newModalBackground = typeof data?.modalOptions?.background === 'string' ? data.modalOptions.background :
       s_MODAL_BACKGROUND;

      if (newModalBackground !== modalProps.background) { modalProps.background = newModalBackground; }
   }

   $:
   {
      const newModalSlotSeparate = typeof data?.modalOptions?.slotSeparate === 'boolean' ?
       data.modalOptions.slotSeparate : void 0;

      if (newModalSlotSeparate !== modalProps.slotSeparate) { modalProps.slotSeparate = newModalSlotSeparate; }
   }

   $:
   {
      const newModalStyles = isObject(data?.modalOptions?.styles) ? data.modalOptions.styles : void 0;

      if (newModalStyles !== modalProps.styles) { modalProps.styles = newModalStyles; }
   }

   $: if (isObject(data?.modalOptions?.transition))
   {
      // Store data.transitions to shorten statements below.
      const d = data.modalOptions.transition;

      if (d?.transition !== modalProps.transition)
      {
         modalProps.transition = typeof d?.transition === 'function' ? d.transition : s_MODAL_TRANSITION;
      }

      if (d?.inTransition !== modalProps.inTransition) { modalProps.inTransition = d.inTransition; }
      if (d?.outTransition !== modalProps.outTransition) { modalProps.outTransition = d.outTransition; }

      // Provide default transition options if not defined.
      if (d?.transitionOptions !== modalProps.transitionOptions)
      {
         modalProps.transitionOptions = isObject(d?.transitionOptions) ? d.transitionOptions :
          s_MODAL_TRANSITION_OPTIONS;
      }

      if (d?.inTransitionOptions !== modalProps.inTransitionOptions)
      {
         modalProps.inTransitionOptions = d.inTransitionOptions;
      }

      if (d?.outTransitionOptions !== modalProps.outTransitionOptions)
      {
         modalProps.outTransitionOptions = d.outTransitionOptions;
      }
   }
   else  // Provide a fallback / default glass pane transition when `data.modalOptions.transition` is not defined.
   {
      const newModalTransition = typeof data?.modalOptions?.transition?.transition === 'function' ?
       data.modalOptions.transition.transition : s_MODAL_TRANSITION;

      if (newModalTransition !== modalProps.transition) { modalProps.transition = newModalTransition; }

      const newModalTransitionOptions = isObject(data?.modalOptions?.transitionOptions) ?
       data.modalOptions.transitionOptions : s_MODAL_TRANSITION_OPTIONS;

      if (newModalTransitionOptions !== modalProps.transitionOptions)
      {
         modalProps.transitionOptions = newModalTransitionOptions;
      }
   }

   /**
    * Handles closing all open TJSDialog instances when <Esc> key is pressed.
    *
    * @param {KeyboardEvent}  event - A KeyboardEvent.
    */
   function onKeydown(event)
   {
      if (event.code === 'Escape')
      {
         event.preventDefault();
         event.stopPropagation();
         application.close();
      }
   }

   /**
    * Handles closing any modal window and is assigned to `window` with capture acting before any other browser wide
    * event listeners stopping immediate propagation.
    *
    * @param {KeyboardEvent}  event - A KeyboardEvent.
    */
   function onKeydownModal(event)
   {
      if (event.code === 'Escape')
      {
         event.preventDefault();
         event.stopImmediatePropagation();
         application.close();
      }
   }
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={`${application.id}-glasspane`} {...modalProps} {zIndex}>
      <ApplicationShell bind:elementRoot bind:elementContent {...appProps} appOffsetHeight={true}>
         <DialogContent bind:dialogComponent {data} {modal} stopPropagation={true} />
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell bind:elementRoot bind:elementContent {...appProps} appOffsetHeight={true}>
      <DialogContent bind:dialogComponent {data} />
   </ApplicationShell>
{/if}
