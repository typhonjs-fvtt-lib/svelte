<script>
   import { getContext }   from 'svelte';

   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import {
      isObject,
      isSvelteComponent,
      parseSvelteConfig }  from '@typhonjs-fvtt/svelte/util';

   export let data = {};
   export let preventDefault = false;
   export let stopPropagation = false;

   export let dialogInstance = void 0;

   const s_REGEX_ICON = /^\s*<.*>$/;

   let buttons;
   let content;
   let dialogComponent;
   let dialogProps = {};

   let foundryApp = getContext('external').foundryApp;

   let currentButtonId = data.default;

   // If `data.buttons` is not an object then set an empty array otherwise reduce the button data.
   $:
   {
      buttons = typeof data.buttons !== 'object' ? [] : Object.keys(data.buttons).reduce((obj, key, index) =>
      {
         const b = data.buttons[key];

         // Test any condition supplied otherwise default to true.
         const condition = typeof b.condition === 'function' ? b.condition.call(b) : b.condition ?? true;

         // Handle icon and treat bare strings as the icon class; otherwise assume the icon is fully formed HTML.
         const icon = typeof b.icon !== 'string' ? void 0 : s_REGEX_ICON.test(b.icon) ? b.icon :
          `<i class="${b.icon}"></i>`;

         const label = typeof b.label === 'string' ? localize(b.label) : '';

         if (condition)
         {
            obj.push({
               ...b,
               icon,
               label,
               id: key,
            })
         }
         return obj;
      }, []);
   }

   /**
    * This reactivity block will trigger on arrow left / right key presses _and_ when buttons change. It is OK for it to
    * trigger on both.
    */
   $: if (!buttons.find((button) => button.id === currentButtonId)) { currentButtonId = void 0; }

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

         // Accept either callback or onclick as the function / data to invoke.
         const invoke = button.callback ?? button.onclick;

         switch (typeof invoke)
         {
            case 'function':
               // Passing back the HTML element is to keep with the existing Foundry API, however second parameter is
               // the Svelte component instance.
               result = await invoke(foundryApp.options.jQuery ? foundryApp.element : foundryApp.element[0],
                dialogInstance);
               break;

            case 'string':
               // Attempt lookup by function name in dialog instance component.
               if (dialogInstance !== void 0 && typeof dialogInstance[invoke] === 'function')
               {
                  result = await dialogInstance[invoke]();
               }
               break;
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
      /**
       * If this dialog is not the activeWindow then return immediately. See {@link SvelteApplication.bringToTop} as
       * SvelteApplication overrides core Foundry and always sets the activeWindow when `bringToTop` is invoked.
       */
      if (event.key !== 'Escape' && ui.activeWindow !== foundryApp) { return; }

      switch (event.key)
      {
         case 'ArrowLeft':
         {
            event.preventDefault();
            event.stopPropagation();

            const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
            if (buttons.length && currentIndex > 0)
            {
               currentButtonId = buttons[currentIndex - 1].id;
            }
            break;
         }

         case 'ArrowRight':
         {
            event.preventDefault();
            event.stopPropagation();

            const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
            if (buttons.length && currentIndex < buttons.length - 1)
            {
               currentButtonId = buttons[currentIndex + 1].id;
            }
            break;
         }

         case 'Escape':
            event.preventDefault();
            event.stopPropagation();
            return foundryApp.close();

         case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            if (currentButtonId && isObject(data.buttons) && currentButtonId in data.buttons)
            {
               onClick(data.buttons[currentButtonId]);
            }
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
   <button class="dialog-button {button.id}"
           on:click={() => onClick(button)}
           class:default={button.id === currentButtonId}>
      {#if button.icon}{@html button.icon}{/if}{button.label}
   </button>
   {/each}
</div>
{/if}

<style>
   div.dialog-buttons {
      padding-top: 8px;
   }
</style>
