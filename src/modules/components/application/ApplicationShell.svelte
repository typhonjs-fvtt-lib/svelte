<script>
   import { getContext, setContext }   from "svelte";

   import ApplicationHeader            from './ApplicationHeader.svelte';
   import Container                    from "../Container.svelte";

   // import '#stylesAppShell';

   setContext('external', () => context);

   export let context;

   let children = getContext('external')().children;
   let foundryApp = getContext('external')().foundryApp;
</script>

<div id="{foundryApp.id}" class="typhonjs-app typhonjs-window-app" data-appid="{foundryApp.appId}">
    <ApplicationHeader title = {foundryApp.title} headerButtons= {foundryApp._getHeaderButtons()} />
    <section class="window-content">
        <Container {children} />
    </section>
</div>

<style lang="scss">
  // Defines the styles for that mimics a popout Application. Used by QuestTracker to appear like a
  // popout app, but be managed directly.
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

    .window-content {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: flex-start;
      padding: 8px;
      color: #191813;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .window-header {
      flex: 0 0 30px;
      overflow: hidden;
      padding: 0 8px;
      line-height: 30px;
      border-bottom: 1px solid #000;
      pointer-events: auto;

      a {
        flex: none;
        margin: 0 0 0 8px;
      }

      h4 {
        font-family: Signika, sans-serif;
      }

      i[class^=fa] {
        margin-right: 3px;
      }

      .window-title {
        margin: 0;
        word-break: break-all;
      }
    }

    .window-resizable-handle {
      width: 20px;
      height: 20px;
      position: absolute;
      bottom: -1px;
      right: 0;
      background: #444;
      padding: 2px;
      border: 1px solid #111;
      border-radius: 4px 0 0 0;

      i.fas {
        transform: rotate(45deg);
      }
    }

    &.minimized {
      .window-header {
        border: 1px solid #000;
      }

      .window-resizable-handle {
        display: none;
      }
    }
  }
</style>