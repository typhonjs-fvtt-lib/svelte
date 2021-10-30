<script>
   export let children;
</script>

{#if Array.isArray(children)}
    {#each children as child}
        <svelte:component this={child.class} {...child.props} />
    {/each}
{:else}
    <p>Container warning: No children.</p>
{/if}

<style>
    p {
        color: red;
        font-size: 18px;
    }
</style>