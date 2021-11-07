<script>
   import { getContext }        from 'svelte';

   import TJSApplicationHeader  from './TJSApplicationHeader.svelte';
   import TJSContainer          from '../TJSContainer.svelte';

   export let title = void 0;
   export let zIndex = void 0

   let appTitle;
   let content, root;

   const context = getContext('external');

   const foundryApp = context.foundryApp;
   const children = typeof context === 'object' ? context.children : void 0;

   $: appTitle = typeof title === 'string' ? title : foundryApp.title;
</script>

<svelte:options accessors={true}/>

<div id={foundryApp.id}
     class="app window-app {foundryApp.options.classes.join(' ')}"
     data-appid={foundryApp.appId}
     style="{Number.isInteger(zIndex) ? `z-index: ${zIndex}` : ''}"
     bind:this={root}>
    <TJSApplicationHeader title = {appTitle} headerButtons= {foundryApp._getHeaderButtons()} />
    <section class=window-content bind:this={content}>
        {#if Array.isArray(children)}
            <TJSContainer {children} />
        {:else}
            <slot />
        {/if}
    </section>
</div>