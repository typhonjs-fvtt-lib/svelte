<script>
   import { setContext }    from "svelte";
   import ApplicationHeader from './ApplicationHeader.svelte';

   setContext('foundryApp', () => _foundryApp);
   setContext('eventbus', () => _eventbus);

   export let _eventbus;
   export let _foundryApp;
   export let component;
</script>

<div id="{_foundryApp.id}" class="typhonjs-app typhonjs-window-app" data-appid="{_foundryApp.appId}">
    <ApplicationHeader title = {_foundryApp.title} headerButtons= {_foundryApp._getHeaderButtons()} />
    <section class="window-content">
        <svelte:component this={component} />
    </section>
</div>
