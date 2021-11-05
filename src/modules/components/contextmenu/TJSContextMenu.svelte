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
   export let transitionOptions = void 0;

   // Bound to the nav element / menu.
   let menuEl;

   // Store this component reference.
   const local = current_component;

   const dispatch = createEventDispatcher();

   /**
    * Provides a custom animate callback allowing inspection of the element to change positioning styles based on the
    * height / width of the element and `document.body`. This allows the context menu to expand up when the menu
    * is outside the height bound of `document.body` and expand to the left if width is greater than `document.body`.
    *
    * @param {HTMLElement} node - nav element.
    *
    * @returns {object} Transition object.
    */
   function animate(node)
   {
      const expandUp = y + node.clientHeight > document.body.clientHeight
      const expandLeft = x + node.clientWidth > document.body.clientWidth

      node.style.top = expandUp ? null : `${y}px`;
      node.style.bottom = expandUp ? `${document.body.clientHeight - y}px` : null;

      node.style.left = expandLeft ? null : `${x}px`;
      node.style.right = expandLeft ? `${document.body.clientWidth - x}px` : null;

      return slideFade(node, transitionOptions);
   }

   /**
    * Invokes a function on click of a menu item then fires the `close` event and automatically runs the outro
    * transition and destroys the component.
    *
    * @param {function} callback - Function to invoke on click.
    */
   function onClick(callback)
   {
      if (typeof callback === 'function')
      { callback(); }

      dispatch('close');
      outroAndDestroy(local);
   }

   /**
    * Determines if a click to the document body closes the context menu. If the click occurs outside the context menu
    * then fire the `close` event and automatically run the outro transition and destroy the component.
    *
    * @param {PointerEvent}   event - Pointer event from document body click.
    */
   function onClose(event)
   {
      if (event.target === menuEl || menuEl.contains(event.target))
      { return; }

      dispatch('close');
      outroAndDestroy(local);
   }
</script>
<!-- bind to `document.body` to receive clicks to close the context menu. -->
<svelte:body on:click={onClose}/>

<nav id={id} class=tjs-context-menu transition:animate bind:this={menuEl}>
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