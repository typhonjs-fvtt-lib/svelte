<script>
   import { getContext }   from 'svelte';

   import { draggable }    from '@typhonjs-fvtt/svelte/action';
   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import TJSHeaderButton  from './TJSHeaderButton.svelte';

   const foundryApp = getContext('external').foundryApp;

   const storeTitle = foundryApp.reactive.storeAppOptions.title;
   const storeDraggable = foundryApp.reactive.storeAppOptions.draggable;
   const storeDragging = foundryApp.reactive.storeUIOptions.dragging;
   const storeHeaderButtons = foundryApp.reactive.storeUIOptions.headerButtons;
   const storeMinimizable = foundryApp.reactive.storeAppOptions.minimizable;

   function minimizable(node, booleanStore)
   {
      const callback = foundryApp._onToggleMinimize.bind(foundryApp);

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
        use:draggable={{ positionable: foundryApp, active: $storeDraggable, storeDragging }}
        use:minimizable={$storeMinimizable}>
    <h4 class=window-title>{localize($storeTitle)}</h4>
    {#each $storeHeaderButtons as button}
        <TJSHeaderButton {button}/>
    {/each}
</header>
