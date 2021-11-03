<script>
   import { getContext }    from 'svelte';

   import Container         from './Container.svelte';

   const context = getContext('external');
   const children = typeof context === 'object' ? context.children : void 0;
</script>
<Container {children} warn={true} />