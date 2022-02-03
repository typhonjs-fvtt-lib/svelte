<script>
   import { getContext }   from 'svelte';

   import {
      isSvelteComponent,
      parseSvelteConfig }  from '@typhonjs-fvtt/svelte/util';

   export let data = {};
   export let preventDefault = false;
   export let stopPropagation = false;

   export let dialogInstance = void 0;

   let buttons;
   let content;
   let dialogComponent;
   let dialogProps = {};

   let foundryApp = getContext('external').foundryApp;

   // If `data.buttons` is not an object then set an empty array otherwise reduce the button data.
   $: buttons = typeof data.buttons !== 'object' ? [] : Object.keys(data.buttons).reduce((obj, key) =>
   {
      const b = data.buttons[key];
      if (b.condition !== false)
      {
         obj.push({
            ...b,
            id: key,
            cssClass: [key, data.default === key ? 'default' : ''].filterJoin(' ')
         })
      }
      return obj;
   }, []);

   $:
   {
      content = data.content;

      try
      {
         if (isSvelteComponent(content))
         {
            dialogComponent = content;
            dialogProps = {};
         }
         else if (typeof content === 'object')
         {
            const svelteConfig = parseSvelteConfig(content, foundryApp);
            dialogComponent = svelteConfig.class;
            dialogProps = svelteConfig.props ?? {};

            // Check for any children parsed and added to the external context.
            const children = svelteConfig?.context?.get('external')?.children;

            // If so add to dialogProps.
            if (Array.isArray(children)) { dialogProps.children = children; }
         }
         else
         {
            dialogComponent = void 0;
            dialogProps = {};
         }
      }
      catch (err)
      {
         dialogComponent = void 0;
         dialogProps = {};

         content = err.message;
         console.error(err);
      }
   }

   async function onClick(button)
   {
      try
      {
         let result = null;

         // Passing back the element is to keep with the existing Foundry API.
         if (typeof button.callback === 'function')
         {
            result = await button.callback(foundryApp.options.jQuery ? foundryApp.element : foundryApp.element[0]);
         }

         // Delay closing to next clock tick to be able to return result.
         setTimeout(() => foundryApp.close(), 0);

         return result;
      }
      catch(err)
      {
         ui.notifications.error(err);
         throw new Error(err);
      }
   }

   function onKeydown(event)
   {
      switch (event.key)
      {
         case 'Escape':
            event.preventDefault();
            event.stopPropagation();
            return foundryApp.close();

         case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            onClick(data.buttons[data.default]);
            break;

         default:
            if (preventDefault) { event.preventDefault(); }
            if (stopPropagation) { event.stopPropagation(); }
            break;
      }
   }
</script>

<svelte:body on:keydown={onKeydown} />

<div class="dialog-content">
   {#if typeof content === 'string'}
      {@html content}
   {:else if dialogComponent}
      <svelte:component bind:this={dialogInstance} this={dialogComponent} {...dialogProps} />
   {/if}
</div>

{#if buttons.length}
<div class="dialog-buttons">
   {#each buttons as button (button.id)}
   <button class="dialog-button {button.cssClass}" on:click={() => onClick(button)}>
      {@html button.icon}
      {@html button.label}
   </button>
   {/each}
</div>
{/if}

<style>
   div.dialog-buttons {
      padding-top: 8px;
   }
</style>
