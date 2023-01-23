<script>
   import { getContext }            from 'svelte';
   import { cubicOut }              from 'svelte/easing';

   import {
      draggable as dragDefault }    from '@typhonjs-fvtt/svelte/action';

   import { localize }              from '@typhonjs-fvtt/svelte/helper';

   import {
      isObject,
      isSvelteComponent }           from '@typhonjs-fvtt/svelte/util';

   import TJSHeaderButton           from './TJSHeaderButton.svelte';

   export let draggable = void 0;
   export let draggableOptions = void 0;

   const application = getContext('#external').application;

   const { autoFocus, elementRoot } = getContext('#internal').stores;

   const storeTitle = application.reactive.storeAppOptions.title;
   const storeDraggable = application.reactive.storeAppOptions.draggable;
   const storeDragging = application.reactive.storeUIState.dragging;
   const storeHeaderButtons = application.reactive.storeUIState.headerButtons;
   const storeHeaderIcon = application.reactive.storeAppOptions.headerIcon;
   const storeHeaderNoTitleMinimized = application.reactive.storeAppOptions.headerNoTitleMinimized;
   const storeMinimizable = application.reactive.storeAppOptions.minimizable;
   const storeMinimized = application.reactive.storeUIState.minimized;

   let dragOptions;

   $: draggable = typeof draggable === 'function' ? draggable : dragDefault;

   // Combines external options with defaults for TJSApplicationHeader. By default, easing is turned on w/ duration of
   // 0.08 seconds and cubicOut, but can be overridden by any provided `draggableOptions`. `position`, `active`, and
   // `storeDragging` are always overridden by application position / stores.
   $: dragOptions = Object.assign({}, { ease: true, easeOptions: { duration: 0.08, ease: cubicOut } },
    isObject(draggableOptions) ? draggableOptions : {}, { position: application.position, active:
     $storeDraggable, storeDragging, hasTargetClassList: ['window-header', 'window-title'] });

   let displayHeaderTitle;

   $: displayHeaderTitle = $storeHeaderNoTitleMinimized && $storeMinimized ? 'none' : null;

   let buttons;

   $:
   {
      buttons = $storeHeaderButtons.reduce((array, button) =>
      {
         // If the button is a SvelteComponent set it as the class otherwise use `TJSHeaderButton` w/ button as props.
         array.push(isSvelteComponent(button) ? { class: button, props: {} } :
          { class: TJSHeaderButton, props: { button } });

         return array;
      }, []);
   }

   function minimizable(node, booleanStore)
   {
      const callback = (event) =>
      {
         // Only toggle minimize state if window title or header is the event target. Also allow toggle state if the
         // event target has 'keep-minimized' class.
         if (event.target.classList.contains('window-title') || event.target.classList.contains('window-header') ||
           event.target.classList.contains('keep-minimized'))
         {
            application._onToggleMinimize(event);
         }
      }

      function activateListeners() { node.addEventListener('dblclick', callback); }
      function removeListeners() { node.removeEventListener('dblclick', callback); }

      if (booleanStore) { activateListeners(); }

      return {
         update: (booleanStore) =>  // eslint-disable-line no-shadow
         {
            if (booleanStore) { activateListeners(); }
            else { removeListeners(); }
         },

         destroy: () => removeListeners()
      };
   }

   /**
    * Explicitly focus `elementRoot` if pointer event is not consumed by header buttons / components. This allows
    * keyboard tab navigation to select header buttons.
    *
    * Note: if `autoFocus` internal store is set to false `elementRoot` is not focused.
    */
   function onPointerdown(event)
   {
      if ($autoFocus && $elementRoot?.isConnected)
      {
         $elementRoot.focus();
      }
      else
      {
         event.preventDefault();
      }
   }
</script>

{#key draggable}
   <header class="window-header flexrow"
           use:draggable={dragOptions}
           use:minimizable={$storeMinimizable}
           on:pointerdown={onPointerdown}
   >
      {#if typeof $storeHeaderIcon === 'string'}
         <img class="tjs-app-icon keep-minimized" src={$storeHeaderIcon} alt=icon>
      {/if}
      <h4 class=window-title style:display={displayHeaderTitle}>{localize($storeTitle)}</h4>
      {#each buttons as button}
         <svelte:component this={button.class} {...button.props} />
      {/each}
   </header>
{/key}

<style>
   .window-header {
      flex: var(--tjs-app-header-flex, 0 0 30px);
      gap: var(--tjs-app-header-gap, 5px);
      padding: var(--tjs-app-header-padding, 0 4px);
   }

   .window-header .tjs-app-icon {
      align-self: center;
      border-radius: var(--tjs-app-header-icon-border-radius, 4px);
      height: var(--tjs-app-header-icon-height, 24px);
      flex: var(--tjs-app-header-icon-width, 0 0 24px);
   }

   .window-title {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
   }
</style>
