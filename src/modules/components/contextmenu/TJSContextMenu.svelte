<script>
   import { createEventDispatcher, onDestroy }  from 'svelte';
   import { current_component }                 from 'svelte/internal';
   import { slideFade }                         from '@typhonjs-fvtt/svelte/transition';
   import { outroAndDestroy }                   from '@typhonjs-fvtt/svelte/util';

   export let x = 0;
   export let y = 0;
   export let items = [];

   const local = current_component;

   const dispatch = createEventDispatcher();

   const onClose = (event) =>
   {
      if (event.target === menuEl || menuEl.contains(event.target)) return;

      dispatch('close');
      console.log(`TJSContextMenu - onClose`)
      outroAndDestroy(local);
   }

   onDestroy(() =>
   {
      console.log('DESTROYED');
   })

   let menuEl;
</script>
<svelte:body on:click={onClose} />
<div class=menu transition:slideFade={{duration: 400}} bind:this={menuEl} style="top: {y}px; left: {x}px;">
    <ol>
        <li>SOME TEXT</li>
        <li>SOME TEXT</li>
        <li>SOME TEXT</li>
        {#each items as item}
            <li>SOME TEXT</li>
        {/each}
    </ol>
</div>

<style>
    .menu {
        position: fixed;
        width: fit-content;
        font-family: Signika sans-serif;
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
</style>