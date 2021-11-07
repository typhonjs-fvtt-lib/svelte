<script>
   import { getContext }    from 'svelte';

   import TJSContainer      from '@typhonjs-fvtt/svelte/component';

   const context = getContext('external');
   const children = typeof context === 'object' ? context.children : void 0;
</script>
<TJSContainer {children} warn={true} />