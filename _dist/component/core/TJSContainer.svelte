<script>
   import { getContext } from 'svelte';

   export let warn = false;
   export let children = void 0;

   const context = getContext('external');

   let allChildren;

   // This component can host multiple children defined via props or in the TyphonJS SvelteData configuration object
   // that are potentially mounted in the content area. If no children defined then this component mounts any slotted
   // child.
   $: allChildren = Array.isArray(children) ? children :
    typeof context === 'object' ? context.children : void 0;
</script>

{#if Array.isArray(allChildren)}
    {#each allChildren as child}
        <svelte:component this={child.class} {...child.props} />
    {/each}
{:else if warn}
    <p>Container warning: No children.</p>
{/if}

<style>
    p {
        color: red;
        font-size: 18px;
    }
</style>
