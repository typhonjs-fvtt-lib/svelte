<script>
   /**
    * TODO: Add description
    *
    * @componentDocumentation
    * @internal
    */
   import {
      getContext,
      onDestroy,
      onMount,
      setContext }               from '#svelte';

   import { writable }           from '#svelte/store';

   import { fade }               from '#svelte/transition';

   import {
      ApplicationShell,
      TJSGlassPane }             from '#svelte-fvtt/component/application';

   import { A11yHelper }         from '#runtime/util/a11y';
   import { isObject }           from '#runtime/util/object';

   import DialogContent          from './DialogContent.svelte';

   // ApplicationShell contract.
   export let elementContent = void 0;
   export let elementRoot = void 0;

   // The dialog data.
   export let data = {};

   export let dialogComponent = void 0;

   export let managedPromise = void 0;

   /**
    * @type {TJSDialog}
    */
   const application = getContext('#external')?.application;

   const dialogOptions = writable({});

   setContext('#managedPromise', managedPromise);
   setContext('#dialogOptions', dialogOptions);

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

      // Close modal on glasspane input.
      closeOnInput: void 0,

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

   // Only set modal once on mount. You can't change between a modal an non-modal dialog during runtime.
   if (modal === void 0) { modal = typeof data?.modal === 'boolean' ? data.modal : false; }

   // Special modal handling -----------------------------------------------------------------------------------------

   const activeWindow = application.reactive.activeWindow;

   if (!modal)
   {
      // Add a listener on document keydown to act before or equal with other event listeners.
      onDestroy(() => activeWindow.document.removeEventListener('keydown', onKeydown));
      onMount(() => activeWindow.document.addEventListener('keydown', onKeydown));
   }

   // Aria Attributes ------------------------------------------------------------------------------------------------

   $: if (A11yHelper.isFocusTarget(elementRoot))
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
      // Update internal dialog options store / context with `data`.
      dialogOptions.set(data);

      const newZIndex = Number.isInteger(data.zIndex) || data.zIndex === null ? data.zIndex :
       modal ? 2 ** 31 : (2 ** 31) - 50
      if (zIndex !== newZIndex) { zIndex = newZIndex; }

      // Update the main foundry options when data changes. Perform explicit checks against existing data in `application`.
      const newDraggable = typeof data.draggable === 'boolean' ? data.draggable : void 0;
      if (newDraggable !== void 0 && application.reactive.draggable !== newDraggable)
      {
         application.reactive.draggable = newDraggable;
      }

      const newFocusAuto = typeof data.focusAuto === 'boolean' ? data.focusAuto : void 0;
      if (newFocusAuto !== void 0 && application.reactive.focusAuto !== newFocusAuto)
      {
         application.reactive.focusAuto = newFocusAuto;
      }

      const newFocusKeep = typeof data.focusKeep === 'boolean' ? data.focusKeep : void 0;
      if (newFocusKeep !== void 0 && application.reactive.focusKeep !== newFocusKeep)
      {
         application.reactive.focusKeep = newFocusKeep;
      }

      const newFocusTrap = typeof data.focusTrap === 'boolean' ? data.focusTrap : void 0;
      if (newFocusTrap !== void 0 && application.reactive.focusTrap !== newFocusTrap)
      {
         application.reactive.focusTrap = newFocusTrap;
      }

      const newMinimizable = typeof data.minimizable === 'boolean' ? data.minimizable : void 0;
      if (newMinimizable !== void 0 && application.reactive.minimizable !== newMinimizable)
      {
         application.reactive.minimizable = newMinimizable;
      }

      const newResizable = typeof data.resizable === 'boolean' ? data.resizable : void 0;
      if (newResizable !== void 0 && application.reactive.resizable !== newResizable)
      {
         application.reactive.resizable = newResizable;
      }

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

   $:
   {
      const newModalCloseOnInput = typeof data?.modalOptions?.closeOnInput === 'boolean' ?
       data.modalOptions.closeOnInput : void 0;

      if (newModalCloseOnInput !== modalProps.closeOnInput) { modalProps.closeOnInput = newModalCloseOnInput; }
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
</script>

<svelte:options accessors={true}/>

{#if modal}
   <TJSGlassPane id={`${application.id}-glasspane`} {...modalProps}
                 on:glasspane:close={() => application.close()}
                 on:glasspane:keydown:escape={() => application.close()}>
      <ApplicationShell bind:elementRoot bind:elementContent {...appProps}>
         <DialogContent bind:dialogComponent {data} stopPropagation={true} />
      </ApplicationShell>
   </TJSGlassPane>
{:else}
   <ApplicationShell bind:elementRoot bind:elementContent {...appProps}>
      <DialogContent bind:dialogComponent {data} />
   </ApplicationShell>
{/if}
