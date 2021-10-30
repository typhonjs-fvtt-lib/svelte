<script>
   import { getContext, setContext }   from "svelte";

   import Container                    from "./Container.svelte";

   setContext('main', () => context);

   export let context;

   let children = getContext('main')().children;
</script>
<Container {children} />