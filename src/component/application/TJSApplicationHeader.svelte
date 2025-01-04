<script>
   /**
    * @privateRemarks
    * TODO: Add description
    *
    * @componentDocumentation
    * @internal
    */
   import { getContext }         from '#svelte';

   import { TJSSvelte }          from '#runtime/svelte/util';
   import { A11yHelper }         from '#runtime/util/a11y';
   import { localize }           from '#runtime/util/i18n';
   import { isObject }           from '#runtime/util/object';

   import {
      draggable as dragDefault } from '#runtime/svelte/store/position';

   import TJSHeaderButton        from './TJSHeaderButton.svelte';

   export let draggable = void 0;
   export let draggableOptions = void 0;

   /**
    * @type {SvelteApp}
    */
   const application = getContext('#external')?.application;

   // Focus related app options stores.
   const { focusAuto, focusKeep } = application.reactive.storeAppOptions;

   const { elementRoot } = getContext('#internal').stores;

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
   // 0.06 seconds and cubicOut, but can be overridden by any provided `draggableOptions`. `position`, `active`, and
   // `storeDragging` are always overridden by application position / stores.
   $: dragOptions = Object.assign({}, { tween: true, tweenOptions: { duration: 0.06, ease: 'cubicOut' } },
    isObject(draggableOptions) ? draggableOptions : {}, { position: application.position, enabled:
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

         // If the button contains a TJSSvelte.Config.Minimal object in the `svelte` attribute then use it otherwise use
         // `TJSHeaderButton` w/ button as props.
         buttonsList.push(TJSSvelte.config.isConfigEmbed(button?.svelte) ? { ...button.svelte } :
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
    * Note: if `focusKeep` app option store is set to true `elementRoot` is only focused if the current browser wide
    * active element is not contained inside the app element.
    */
   function onPointerdown(event)
   {
      const rootEl = $elementRoot;

      // Cancel any app animation in progress when dragging starts.
      application.position.animate.cancel();

      if ($focusAuto && A11yHelper.isFocusTarget(rootEl) && rootEl?.isConnected)
      {
         if ($focusKeep)
         {
            const activeWindow = application.reactive.activeWindow;

            const focusOutside = A11yHelper.isFocusTarget(activeWindow.document.activeElement) &&
             !rootEl.contains(activeWindow.document.activeElement);

            // Only focus the content element if the active element is outside the app; maintaining internal focused
            // element.
            if (focusOutside)
            {
               rootEl.focus();
            }
            else
            {
               event.preventDefault();
            }
         }
         else
         {
            rootEl.focus();
         }
      }
   }
</script>

{#key draggable}
   <header class="window-header flexrow"
           on:pointerdown={onPointerdown}
           use:draggable={dragOptions}
           use:minimizable={$storeMinimizable}>
      {#if typeof $storeHeaderIcon === 'string'}
         <img class="tjs-app-icon keep-minimized" src={$storeHeaderIcon} alt=icon>
      {/if}
      <h4 class=window-title style:display={displayHeaderTitle}>
         {localize($storeTitle)}
      </h4>
      {#each buttonsLeft as button}
         <svelte:component this={button.class} {...button.props} />
      {/each}
      <span class="tjs-window-header-spacer keep-minimized"></span>
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
      touch-action: none;
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
