<script>
   import { getContext }        from 'svelte';

   import { draggable }         from '@typhonjs-fvtt/svelte/action';
   import { localize }          from '@typhonjs-fvtt/svelte/helper';
   import { isSvelteComponent } from '@typhonjs-fvtt/svelte/util';

   import TJSHeaderButton       from './TJSHeaderButton.svelte';

   const application = getContext('external').application;

   const storeTitle = application.reactive.storeAppOptions.title;
   const storeDraggable = application.reactive.storeAppOptions.draggable;
   const storeDragging = application.reactive.storeUIState.dragging;
   const storeHeaderButtons = application.reactive.storeUIState.headerButtons;
   const storeHeaderNoTitleMinimized = application.reactive.storeAppOptions.headerNoTitleMinimized;
   const storeMinimizable = application.reactive.storeAppOptions.minimizable;
   const storeMinimized = application.reactive.storeUIState.minimized;

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
      const callback = application._onToggleMinimize.bind(application);

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
</script>

<header class="window-header flexrow"
        use:draggable={{ position: application.position, active: $storeDraggable, storeDragging }}
        use:minimizable={$storeMinimizable}>
    <h4 class=window-title style:display={displayHeaderTitle}>{localize($storeTitle)}</h4>
    {#each buttons as button}
        <svelte:component this={button.class} {...button.props} />
    {/each}
</header>
