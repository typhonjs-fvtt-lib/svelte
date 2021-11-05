<script>
   import { getContext }    from 'svelte';

   import TJSContainer         from './TJSContainer.svelte';

   const context = getContext('external');
   const children = typeof context === 'object' ? context.children : void 0;
</script>
<TJSContainer {children} warn={true} />