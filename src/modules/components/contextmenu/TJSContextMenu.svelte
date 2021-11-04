<script>
   import { createEventDispatcher } from 'svelte';
   import { current_component }     from 'svelte/internal';
   import { slideFade }             from '@typhonjs-fvtt/svelte/transition';
   import { outroAndDestroy }       from '@typhonjs-fvtt/svelte/util';

   import { localize }              from '../../helper';

   export let id = '';
   export let x = 0;
   export let y = 0;
   export let items = [];
   export let duration = 400;

   let menuEl;

   // Store this component reference.
   const local = current_component;

   const dispatch = createEventDispatcher();

   function onClick(callback)
   {
      if (typeof callback === 'function') { callback(); }

      dispatch('close');
      outroAndDestroy(local);
   }

   function onClose(event)
   {
      if (event.target === menuEl || menuEl.contains(event.target)) { return; }

      dispatch('close');
      outroAndDestroy(local);
   }
</script>
<svelte:body on:click={onClose}/>
<nav id={id} class=tjs-context-menu transition:slideFade={{duration}} bind:this={menuEl}
     style="top: {y}px; left: {x}px;">
    <ol class=tjs-context-items>
        {#each items as item}
            <li class=tjs-context-item on:click={() => onClick(item.onclick)}><i class={item.icon}></i>{localize(item.label)}</li>
        {/each}
    </ol>
</nav>

<style>
    .tjs-context-menu {
        position: fixed;
        width: fit-content;
        font-size: 14px;
        box-shadow: 0 0 10px #000;
        height: max-content;
        min-width: 150px;
        max-width: 360px;
        background: #23221d;
        border: 1px solid #000;
        border-radius: 5px;
        color: #EEE;
        z-index: 10000;
    }

    .tjs-context-menu.expand-down {
        top: calc(100% + 2px);
    }

    .tjs-context-menu.expand-up {
        bottom: calc(100% + 2px);
    }

    .tjs-context-menu ol.tjs-context-items {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .tjs-context-menu li.tjs-context-item {
        padding: 0 5px;
        line-height: 32px;
    }

    .tjs-context-menu li.tjs-context-item:hover {
        color: #FFF;
        text-shadow: 0 0 4px red;
    }

    .tjs-context-menu li.tjs-context-item > i {
        margin-right: 5px;
    }
</style>