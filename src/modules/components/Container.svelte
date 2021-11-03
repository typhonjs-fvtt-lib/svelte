<script>
   export let warn = false;
   export let children;
</script>

{#if Array.isArray(children)}
    {#each children as child}
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