<script>
   import { A11yHelper } from '@typhonjs-fvtt/svelte/util';

   /** @type {HTMLElement} */
   export let elementRoot = void 0;

   let ignoreElements, wrapEl;

   $: if (wrapEl) { ignoreElements = new Set([wrapEl]); }

   function onFocus()
   {
      if (elementRoot instanceof HTMLElement)
      {
         const firstFocusEl = A11yHelper.getFirstFocusableElement(elementRoot, ignoreElements);

         if (firstFocusEl instanceof HTMLElement && firstFocusEl !== wrapEl)
         {
            firstFocusEl.focus();
         }
         else
         {
            // No focus target found, so focus elementRoot.
            elementRoot.focus();
         }
      }
   }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div bind:this={wrapEl} class=tjs-focus-wrap tabindex=0 on:focus={onFocus} />

<style>
    div {
        width: 0;
        height: 0;
        flex: 0;
    }

    div:focus {
        outline: none;
    }
</style>
