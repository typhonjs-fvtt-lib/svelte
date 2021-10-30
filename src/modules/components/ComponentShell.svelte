<script>
   import { getContext, setContext }   from "svelte";

   import Container                    from "./Container.svelte";

   setContext('external', () => context);

   export let context;

   let children = getContext('external')().children;
</script>
<Container {children} />