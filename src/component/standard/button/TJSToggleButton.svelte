<script>
   import { localize } from '@typhonjs-fvtt/svelte/helper';

   export let button;
   export let icon;
   export let title;
   export let store;

   export let efx = () => {};

   $: icon = typeof button === 'object' ? button.icon : typeof icon === 'string' ? icon : 'fas fa-ellipsis-v';
   $: title = typeof button === 'object' ? button.title : typeof title === 'string' ? title : '';
   $: store = typeof button === 'object' ? button.store : typeof store === 'object' ? store : void 0;

   let selected = false;

   $: if (store) { selected = $store; }

   function onClick()
   {
      selected = !selected;
      if (store) { store.set(selected); }
   }

   /**
    * Handles `close` event from any children elements.
    */
   function onClose()
   {
      selected = false;
      if (store) { store.set(false); }
   }
</script>

<div on:close|preventDefault|stopPropagation={onClose}>
    <a on:click={onClick} use:efx class:selected>
        <i class={icon} title={localize(title)}></i>
    </a>
    {#if selected}
        <slot/>
    {/if}
</div>

<style>
    div {
        display: block;
        --tjs-button-border-radius: 50%;
        --tjs-button-diameter: 27px;
        --tjs-button-background-hover: rgba(255, 255, 255, 0.05);
        --tjs-button-background-selected: rgba(255, 255, 255, 0.1);

        flex: 0 0 var(--tjs-button-diameter);
        height: var(--tjs-button-diameter);
        width: var(--tjs-button-diameter);
        align-self: center;
        text-align: center;
    }

    a {
        display: inline-block;

        --tjs-button-border-radius: 50%;
        --tjs-button-diameter: 27px;
        --tjs-button-background-hover: rgba(255, 255, 255, 0.05);
        --tjs-button-background-selected: rgba(255, 255, 255, 0.1);

        border-radius: var(--tjs-button-border-radius, 50%);

        position: relative;
        overflow: hidden;
        transform-style: preserve-3d;
        width: 100%;
        height: 100%;

        transition: background 200ms linear;
    }

    a:hover {
        background: var(--tjs-button-background-hover);
    }

    a.selected {
        background: var(--tjs-button-background-selected);
    }

    i {
        line-height: var(--tjs-button-diameter);
        transform: translateZ(1px);
    }
</style>
