<script>
   import { onDestroy }          from 'svelte';
   import { current_component }  from 'svelte/internal';
   import { slideFade }          from '@typhonjs-fvtt/svelte/transition';
   import { outroAndDestroy }    from '@typhonjs-fvtt/svelte/util';

   export let x;
   export let y;

   const local = current_component;

   const onClose = (event) =>
   {
      if (event.target === menuEl || menuEl.contains(event.target)) return;
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