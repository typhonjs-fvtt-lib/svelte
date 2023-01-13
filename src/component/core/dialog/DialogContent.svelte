<script>
   import {
      getContext,
      onDestroy }          from 'svelte';

   import { applyStyles }  from '@typhonjs-fvtt/svelte/action';
   import { localize }     from '@typhonjs-fvtt/svelte/helper';

   import {
      isObject,
      isSvelteComponent,
      parseSvelteConfig }  from '@typhonjs-fvtt/svelte/util';

   export let data = {};
   export let autoClose = true;
   export let modal = false;
   export let preventDefault = false;
   export let stopPropagation = false;

   export let dialogInstance = void 0;

   const s_REGEX_HTML = /^\s*<.*>$/;

   let buttons;

   /** @type {HTMLElement} */
   let buttonsEl;

   let content = void 0;
   let dialogComponent;
   let dialogProps = {};

   let application = getContext('external').application;
   let { autoFocus, elementRoot } = getContext('internal').stores;

   let currentButtonId = data.default;

   // Turn off autofocusing app shell / window content when modal.
   if (modal) { $autoFocus = false; }

   // Remove key listeners from elementRoot.
   onDestroy(() =>
   {
      const rootEl = $elementRoot;
      if (rootEl instanceof HTMLElement)
      {
         rootEl.removeEventListener('keydown', onKeydown)
         rootEl.removeEventListener('keyup', onKeyup)
      }
   })

   // Add key listeners to elementRoot when it is bound.
   $: if ($elementRoot)
   {
      const rootEl = $elementRoot;
      if (rootEl instanceof HTMLElement)
      {
         rootEl.addEventListener('keydown', onKeydown)
         rootEl.addEventListener('keyup', onKeyup)
      }
   }

   // Focus current button when `buttonsEl` is bound.
   $: if (buttonsEl instanceof HTMLElement)
   {
      const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
      if (buttonEl instanceof HTMLElement) { buttonEl.focus(); }
   }

   // If `data.buttons` is not an object then set an empty array otherwise reduce the button data.
   $:
   {
      buttons = !isObject(data.buttons) ? [] : Object.keys(data.buttons).reduce((array, key) =>
      {
         const b = data.buttons[key];

         // Handle icon and treat bare strings as the icon class; otherwise assume the icon is fully formed HTML.
         const icon = typeof b.icon !== 'string' ? void 0 : s_REGEX_HTML.test(b.icon) ? b.icon :
          `<i class="${b.icon}"></i>`;

         const label = typeof b.label === 'string' ? `${icon !== void 0 ? ' ' : ''}${localize(b.label)}` : '';

         const title = typeof b.title === 'string' ? localize(b.title) : void 0;

         // Test any condition supplied otherwise default to true.
         const condition = typeof b.condition === 'function' ? b.condition.call(b) : b.condition ?? true;

         if (condition) { array.push({ ...b, id: key, icon, label, title }); }

         return array;
      }, []);
   }

   /**
    * This reactivity block will trigger on arrow left / right key presses _and_ when buttons change. It is OK for it to
    * trigger on both.
    */
   $: if (!buttons.find((button) => button.id === currentButtonId)) { currentButtonId = void 0; }

   $: if (content !== data.content) // Only update the content if it has changed.
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
            const svelteConfig = parseSvelteConfig(content, application);
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

   /**
    * Handle button click.
    *
    * @param {object}   button - button data.
    *
    * @returns {*}
    */
   function onClick(button)
   {
      try
      {
         let result = null;

         // Accept either `onPress`, `callback`, `onClick` or `onclick` as the function / data to invoke.
         const invoke = button.onPress ?? button.callback ?? button.onClick ?? button.onclick;

         switch (typeof invoke)
         {
            case 'function':
               // Passing back the HTML element is to keep with the existing Foundry API, however second parameter is
               // the Svelte component instance.
               result = invoke(application.options.jQuery ? application.element : application.element[0],
                dialogInstance);
               break;

            case 'string':
               // Attempt lookup by function name in dialog instance component.
               if (dialogInstance !== void 0 && typeof dialogInstance[invoke] === 'function')
               {
                  result = dialogInstance[invoke](application.options.jQuery ? application.element :
                   application.element[0], dialogInstance);
               }
               break;
         }

         // Delay closing to next clock tick to be able to return result.
         if (autoClose) { setTimeout(() => application.close(), 0); }

         return result;
      }
      catch(err)
      {
         globalThis.ui.notifications.error(err);
         throw new Error(err);
      }
   }

   /**
    * Handles key down events for stopping propagation for arrow keys. Also handles tab / focus traversal with a timeout
    * to update `currentButtonId` on the next clock tick comparing against `document.activeElement`.
    *
    * @param {KeyboardEvent}  event - A KeyboardEvent.
    */
   function onKeydown(event)
   {
      switch (event.code)
      {
         case 'ArrowLeft':
         case 'ArrowRight':
         case 'Enter':
            event.stopPropagation();
            break;

         case 'Tab':
            event.stopPropagation();

            // Check `activeElement` on next tick to potentially update `currentButtonId` from tab / keyboard
            // navigation.
            setTimeout(() =>
            {
               const activeElement = document.activeElement;
               if (activeElement instanceof HTMLElement && buttonsEl instanceof HTMLElement &&
                buttonsEl.contains(activeElement))
               {
                  // Find class that isn't `dialog-button` or `default` and is a key in `data.buttons`.
                  for (let cntr = 0; cntr < activeElement.classList.length; cntr++)
                  {
                     const item = activeElement.classList.item(cntr);
                     if (item !== 'dialog-button' && item !== 'default' && typeof data.buttons[item] !== void 0)
                     {
                        currentButtonId = item;
                        break;
                     }
                  }
               }
            }, 0);
            break;

         default:
            if (preventDefault) { event.preventDefault(); }
            if (stopPropagation) { event.stopPropagation(); }
            break;
      }
   }

   /**
    * Handles key up events for arrow key button navigation.
    *
    * @param {KeyboardEvent}  event - A KeyboardEvent.
    */
   function onKeyup(event)
   {
      switch (event.code)
      {
         case 'ArrowLeft':
         {
            event.preventDefault();
            event.stopPropagation();

            const activeEl = document.activeElement;

            if (buttonsEl instanceof HTMLElement)
            {
               // Only advance button via arrow key if a button is already focused.
               if (activeEl instanceof HTMLElement && buttonsEl.contains(activeEl))
               {
                  const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
                  if (buttons.length && currentIndex > 0) { currentButtonId = buttons[currentIndex - 1].id; }
               }

               const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
               if (buttonEl instanceof HTMLElement) { buttonEl.focus(); }
            }
            break;
         }

         case 'ArrowRight':
         {
            event.preventDefault();
            event.stopPropagation();

            const activeEl = document.activeElement;

            if (buttonsEl instanceof HTMLElement)
            {
               // Only advance button via arrow key if a button is already focused  or there is no current button ID
               if (activeEl instanceof HTMLElement && (buttonsEl.contains(activeEl) || currentButtonId === void 0))
               {
                  const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
                  if (buttons.length && currentIndex < buttons.length - 1) { currentButtonId = buttons[currentIndex + 1].id; }
               }

               const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
               if (buttonEl instanceof HTMLElement) { buttonEl.focus(); }
            }
            break;
         }

         case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            break;

         default:
            if (preventDefault) { event.preventDefault(); }
            if (stopPropagation) { event.stopPropagation(); }
            break;
      }
   }
</script>

<main>
   <div class=dialog-content>
      {#if typeof content === 'string'}
         {@html content}
      {:else if dialogComponent}
         <svelte:component bind:this={dialogInstance} this={dialogComponent} {...dialogProps} />
      {/if}
   </div>

   {#if buttons.length}
   <div bind:this={buttonsEl} class=dialog-buttons>
      {#each buttons as button (button.id)}
      <button class="dialog-button {button.id}"
              on:click|preventDefault|stopPropagation={() => onClick(button)}
              on:focus={() => currentButtonId = button.id}
              use:applyStyles={button.styles}>
         <span title={button.title}>{#if button.icon}{@html button.icon}{/if}{button.label}</span>
      </button>
      {/each}
   </div>
   {/if}
</main>

<style>
   .dialog-buttons {
      padding-top: 8px;
   }
</style>
