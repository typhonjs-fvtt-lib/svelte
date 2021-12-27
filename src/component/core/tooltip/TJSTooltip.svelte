<script>
   import { createEventDispatcher } from 'svelte';
   import { current_component }     from 'svelte/internal';

   import { localize }              from '@typhonjs-fvtt/svelte/helper';
   import { slideFade }             from '@typhonjs-fvtt/svelte/transition';
   import { outroAndDestroy }       from '@typhonjs-fvtt/svelte/util';

   export let id = '';
   export let x = 0;
   export let y = 0;
   export let zIndex = 10000;
   export let transitionOptions = void 0;

   // Bound to the nav element / menu.
   let tooltipEl;

   // Store this component reference.
   const local = current_component;

   // Dispatches `close` event.
   const dispatch = createEventDispatcher();

   // Stores if this tooltip is closed.
   let closed = false;

   /**
    * Provides a custom animate callback allowing inspection of the element to change positioning styles based on the
    * height / width of the element and `document.body`. This allows the tooltip to expand up when
    * outside the height bound of `document.body` and expand to the left if width is greater than `document.body`.
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
    * Determines if a pointer pressed to the document body closes the context menu. If the click occurs outside the
    * context menu then fire the `close` event and run the outro transition then destroy the component.
    *
    * @param {PointerEvent}   event - Pointer event from document body click.
    */
   async function onClose(event)
   {
      // Early out if the pointer down is inside the menu element.
      if (event.target === tooltipEl || tooltipEl.contains(event.target)) { return; }

      // Early out if the event page X / Y is the same as this tooltip.
      if (Math.floor(event.pageX) === x && Math.floor(event.pageY) === y) { return; }

      if (!closed)
      {
         dispatch('close');
         closed = true;
         outroAndDestroy(local);
      }
   }
</script>
<!-- bind to `document.body` to receive pointer down events to close the context menu. -->
<svelte:body on:pointerdown={onClose}/>

<nav id={id} class=tjs-tooltip transition:animate bind:this={tooltipEl} style="z-index: {zIndex}">
</nav>

<style>
    .tjs-tooltip {
        position: fixed;
        width: fit-content;
        font-size: 14px;
        box-shadow: 0 0 10px var(--color-shadow-dark, var(--typhonjs-color-shadow, #000));
        height: max-content;
        min-width: 150px;
        max-width: 360px;
        background: var(--typhonjs-color-content-window, #23221d);
        border: 1px solid var(--color-border-dark, var(--typhonjs-color-border, #000));
        border-radius: 5px;
        color: var(--color-text-light-primary, var(--typhonjs-color-text-secondary, #EEE));
    }
</style>
