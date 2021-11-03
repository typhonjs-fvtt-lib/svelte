<script>
   import { getContext }    from 'svelte';

   import Container         from './Container.svelte';

   let children = getContext('external').children;
</script>
<Container {children} />