<script>
   import {
      afterUpdate,
      getContext }               from 'svelte';
   import { quintInOut }         from 'svelte/easing';

   import { localize }           from '@typhonjs-fvtt/svelte/helper';
   import { slideFade }          from '@typhonjs-fvtt/svelte/transition';

   const s_DEFAULT_OFFSET = { x: 0, y: 0 };

   export let items = [];
   export let offset = s_DEFAULT_OFFSET;

   const getElementRoot = getContext('getElementRoot');

   // Bound to the nav element / menu.
   let menuEl;

   // Stores if this context menu is closed.
   let closed = false;

   afterUpdate(() =>
   {
      const elementRoot = getElementRoot();

      const elementRootRect = elementRoot.getBoundingClientRect();
      const elementRootRight = elementRootRect.x + elementRootRect.width;

      const menuRect = menuEl.getBoundingClientRect();
      const parentRect = menuEl.parentElement.getBoundingClientRect();

      const parentRight = parentRect.x + parentRect.width;

      const adjustedOffset = { ...s_DEFAULT_OFFSET, ...offset };

      menuEl.style.top = `${adjustedOffset.y + parentRect.top + parentRect.height - elementRootRect.top}px`;

      // Check to make sure that the menu width does not exceed the right side of the element root. If not open right.
      if (parentRect.x + menuRect.width < elementRootRight)
      {
         menuEl.style.left = `${adjustedOffset.x + parentRect.x - elementRootRect.x}px`;
         menuEl.style.removeProperty('right');
      }
      else // Open left.
      {
         menuEl.style.right = `${elementRootRight - parentRight}px`;
         menuEl.style.removeProperty('left');
      }
   });

   /**
    * Invokes a function on click of a menu item then fires the `close` event and automatically runs the outro
    * transition and destroys the component.
    *
    * @param {function} callback - Function to invoke on click.
    */
   function onClick(callback)
   {
      if (typeof callback === 'function') { callback(); }

      if (!closed)
      {
         menuEl.dispatchEvent(new CustomEvent('close', { bubbles: true }));
         closed = true;
      }
   }

   /**
    * Determines if a pointer pressed to the document body closes the menu. If the click occurs outside the
    * menu then fire the `close` event and run the outro transition then destroy the component.
    *
    * @param {PointerEvent}   event - Pointer event from document body click.
    */
   async function onClose(event)
   {
      // Early out if the pointer down is inside the menu element.
      if (event.target === menuEl || menuEl.contains(event.target)) { return; }

      if (event.target === menuEl.parentElement || menuEl.parentElement.contains(event.target)) { return; }

      if (!closed)
      {
         closed = true;
         menuEl.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      }
   }
</script>

<!-- bind to `document.body` to receive pointer down events to close the context menu. -->
<svelte:body on:pointerdown={onClose}/>

<nav class=tjs-menu bind:this={menuEl} transition:slideFade={{duration: 300, easing: quintInOut}}>
    <ol class=tjs-menu-items>
        {#each items as item}
            <li class=tjs-menu-item on:click={() => onClick(item.onclick)}>
                <i class={item.icon}></i>{localize(item.label)}
            </li>
        {/each}
    </ol>
</nav>

<style>
    nav {
        position: absolute;
        width: fit-content;
        height: auto;
    }

    .tjs-menu {
        box-shadow: 0 0 2px var(--color-shadow-dark, var(--typhonjs-color-shadow, #000));
        background: var(--typhonjs-color-content-window, #23221d);
        border: 1px solid var(--color-border-dark, var(--typhonjs-color-border, #000));
        border-radius: 5px;
        color: var(--color-text-light-primary, var(--typhonjs-color-text-secondary, #EEE));
    }

    .tjs-menu ol.tjs-menu-items {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .tjs-menu li.tjs-menu-item {
        padding: 0 5px;
        line-height: 32px;
    }

    .tjs-menu li.tjs-menu-item:hover {
        color: var(--typhonjs-color-text-primary, #FFF);
        text-shadow: 0 0 4px var(--color-text-hyperlink, var(--typhonjs-color-accent-tertiary, red));
    }

    .tjs-menu li.tjs-menu-item > i {
        margin-right: 5px;
    }
</style>
