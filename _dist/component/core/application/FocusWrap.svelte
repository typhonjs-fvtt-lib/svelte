<script>
   /** @type {HTMLElement} */
   export let elementRoot = void 0;

   function onFocus()
   {
      if (elementRoot instanceof HTMLElement)
      {
         const firstFocusEl = elementRoot.querySelector('[tabindex]:not([tabindex="-1"])');

         if (firstFocusEl instanceof HTMLElement) { firstFocusEl.focus(); }
      }
   }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class=tjs-focus-wrap tabindex=0 on:focus={onFocus} />

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
