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

   // These classes in the window header allow dragging.
   const s_DRAG_TARGET_CLASSLIST = Object.freeze(['tjs-app-icon', 'tjs-window-header-spacer',
    'window-header', 'window-title']);

   let dragOptions;

   $: draggable = typeof draggable === 'function' ? draggable : dragDefault;

   // Combines external options with defaults for TJSApplicationHeader. By default, easing is turned on w/ duration of
   // 0.08 seconds and cubicOut, but can be overridden by any provided `draggableOptions`. `position`, `active`, and
   // `storeDragging` are always overridden by application position / stores.
   $: dragOptions = Object.assign({}, { ease: true, easeOptions: { duration: 0.08, ease: cubicOut } },
    isObject(draggableOptions) ? draggableOptions : {}, { position: application.position, active:
     $storeDraggable, storeDragging, hasTargetClassList: s_DRAG_TARGET_CLASSLIST });

   let displayHeaderTitle;

   $: displayHeaderTitle = $storeHeaderNoTitleMinimized && $storeMinimized ? 'none' : null;

   let buttonsLeft;
   let buttonsRight;

   $:
   {
      buttonsLeft = [];
      buttonsRight = [];

      for (const button of $storeHeaderButtons)
      {
         const buttonsList = typeof button?.alignLeft === 'boolean' && button?.alignLeft ? buttonsLeft : buttonsRight;

         // If the button is a Svelte component set it as the class otherwise use `TJSHeaderButton` w/ button as props.
         buttonsList.push(isSvelteComponent(button) ? { class: button, props: {} } :
          { class: TJSHeaderButton, props: { button } });
      }
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
    * Note: if `autoFocus` internal store is set to false `elementRoot` is not focused unless the current browser wide
    * active element is not contained inside the app element.
    */
   function onPointerdown(event)
   {
      const rootEl = $elementRoot;

      if (rootEl instanceof HTMLElement && rootEl?.isConnected)
      {
         if ($autoFocus)
         {
            // When autofocus is enabled always focus the app on window header click.
            rootEl.focus();
         }
         else
         {
            // Only focus the app header if the active element is outside the app; maintaining internal focused element.
            if (document.activeElement instanceof HTMLElement && !rootEl.contains(document.activeElement))
            {
               rootEl.focus();
            }
            else
            {
               event.stopPropagation();
               event.preventDefault();
            }
         }
      }
      else
      {
         event.stopPropagation();
         event.preventDefault();
      }
   }
</script>

{#key draggable}
   <header class="window-header flexrow"
           use:draggable={dragOptions}
           use:minimizable={$storeMinimizable}
           on:pointerdown={onPointerdown}>
      {#if typeof $storeHeaderIcon === 'string'}
         <img class="tjs-app-icon keep-minimized" src={$storeHeaderIcon} alt=icon>
      {/if}
      <h4 class=window-title style:display={displayHeaderTitle}>
         {localize($storeTitle)}
      </h4>
      {#each buttonsLeft as button}
         <svelte:component this={button.class} {...button.props} />
      {/each}
      <span class=tjs-window-header-spacer />
      {#each buttonsRight as button}
         <svelte:component this={button.class} {...button.props} />
      {/each}
   </header>
{/key}

<style>
   /**
    * Provides a zero space element that expands to the right creating the gap between window title and left aligned
    * buttons and right aligned buttons. Note the use of a negative left margin to remove the gap between elements.
    */
   .tjs-window-header-spacer {
      flex: 0;
      margin-left: calc(-1 * var(--tjs-app-header-gap, 5px));
      margin-right: auto;
   }

   .window-header {
      flex: var(--tjs-app-header-flex, 0 0 30px);
      gap: var(--tjs-app-header-gap, 5px);
      padding: var(--tjs-app-header-padding, 0 4px);
   }

   .window-header .tjs-app-icon {
      align-self: center;
      border-radius: var(--tjs-app-header-icon-border-radius, 4px);
      flex: 0 0 var(--tjs-app-header-icon-width, 24px);
      height: var(--tjs-app-header-icon-height, 24px);
   }

   .window-title {
      gap: var(--tjs-app-header-gap, 5px);
      max-width: fit-content;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }
</style>
