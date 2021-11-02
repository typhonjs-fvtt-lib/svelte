<script>
   import HeaderButton  from './HeaderButton.svelte';

   export let title = '';
   export let headerButtons = [];
</script>

<header class="window-header flexrow">
    <h4 class=window-title>{title}</h4>
    {#each headerButtons as button}
        <HeaderButton {button}/>
    {/each}
</header>