<script>
   import { getContext, setContext }   from "svelte";

   import ApplicationHeader            from './ApplicationHeader.svelte';
   import Container                    from "../Container.svelte";

   import '#stylesAppShell';

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
