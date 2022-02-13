<script>
   import { getContext }   from 'svelte';

   import { draggable }    from '@typhonjs-fvtt/svelte/action';
   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import TJSHeaderButton  from './TJSHeaderButton.svelte';

   const application = getContext('external').application;

   const storeTitle = application.reactive.storeAppOptions.title;
   const storeDraggable = application.reactive.storeAppOptions.draggable;
   const storeDragging = application.reactive.storeUIState.dragging;
   const storeHeaderButtons = application.reactive.storeUIState.headerButtons;
   const storeMinimizable = application.reactive.storeAppOptions.minimizable;

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
        use:draggable={{ positionable: application, active: $storeDraggable, storeDragging }}
        use:minimizable={$storeMinimizable}>
    <h4 class=window-title>{localize($storeTitle)}</h4>
    {#each $storeHeaderButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>
