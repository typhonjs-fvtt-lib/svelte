<script>
   import { getContext, setContext }   from 'svelte';

   import { TJSApplicationHeader }     from '@typhonjs-fvtt/svelte/component';
   import { TJSContainer }             from '@typhonjs-fvtt/svelte/component';

   export let title = void 0;
   export let zIndex = void 0

   let appTitle;
   let content, root;

   setContext('getElementContent', () => content);
   setContext('getElementRoot', () => root);

   const context = getContext('external');

   const foundryApp = context.foundryApp;
   const children = typeof context === 'object' ? context.children : void 0;

   $: appTitle = typeof title === 'string' ? title : foundryApp.title;
</script>

<svelte:options accessors={true}/>

<div id={foundryApp.id}
     class="typhonjs-app typhonjs-window-app {foundryApp.options.classes.join(' ')}"
     data-appid={foundryApp.appId}
     style="{Number.isInteger(zIndex) ? `z-index: ${zIndex}` : ''}"
     bind:this={root}>
    <TJSApplicationHeader title={appTitle} headerButtons={foundryApp._getHeaderButtons()} />
    <section class=window-content bind:this={content}>
        {#if Array.isArray(children)}
            <TJSContainer {children} />
        {:else}
            <slot />
        {/if}
    </section>
</div>

<style>
  /* Defines the styles for that mimics a popout Application. `:global` is used to preserve the unused CSS */
  :global(.typhonjs-app) {
    max-height: 100%;
    background: url(/ui/denim075.png) repeat;
    border-radius: 5px;
    box-shadow: 0 0 20px #000;
    margin: 3px 0;
    color: #f0f0e0;
    position: absolute;
  }

  :global(.typhonjs-window-app) {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding: 0;
    z-index: 99;
  }

  :global(.typhonjs-window-app .window-content) {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding: 8px;
    color: #191813;
    overflow-y: auto;
    overflow-x: hidden;
  }

  :global(.typhonjs-window-app .window-header) {
    flex: 0 0 30px;
    overflow: hidden;
    padding: 0 8px;
    line-height: 30px;
    border-bottom: 1px solid #000;
    pointer-events: auto;
  }

  :global(.typhonjs-window-app .window-header a) {
    flex: none;
    margin: 0 0 0 8px;
  }

  :global(.typhonjs-window-app .window-header h4) {
    font-family: Signika, sans-serif;
  }

  :global(.typhonjs-window-app .window-header i[class^=fa]) {
    margin-right: 3px;
  }

  :global(.typhonjs-window-app .window-header .window-title) {
    margin: 0;
    word-break: break-all;
  }

  :global(.typhonjs-window-app .window-resizable-handle) {
    width: 20px;
    height: 20px;
    position: absolute;
    bottom: -1px;
    right: 0;
    background: #444;
    padding: 2px;
    border: 1px solid #111;
    border-radius: 4px 0 0 0;
  }

  :global(.typhonjs-window-app .window-resizable-handle i.fas) {
    transform: rotate(45deg);
  }

  :global(.typhonjs-window-app.minimized .window-header) {
    border: 1px solid #000;
  }

  :global(.typhonjs-window-app.minimized .window-resizable-handle) {
    display: none;
  }
</style>