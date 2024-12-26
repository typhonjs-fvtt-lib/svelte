<script>
   /**
    * @privateRemarks
    * TODO: Add description
    *
    * @componentDocumentation
    * @internal
    */
   import {
      getContext,
      onDestroy,
      onMount }               from '#svelte';

   import { applyStyles }     from '#runtime/svelte/action/dom/style';

   import {
      TJSSvelteConfigUtil,
      TJSSvelteUtil }         from '#runtime/svelte/util';

   import { A11yHelper }      from '#runtime/util/a11y';
   import { localize }        from '#runtime/util/i18n';
   import { isObject }        from '#runtime/util/object';

   export let data = void 0;
   export let preventDefault = false;
   export let stopPropagation = false;

   export let dialogComponent = void 0;

   const s_REGEX_HTML = /^\s*<.*>$/;

   const { elementRoot } = getContext('#internal').stores;

   /**
    * @type {TJSDialog}
    */
   const application = getContext('#external')?.application;

   const managedPromise = getContext('#managedPromise');

   let buttons;

   /** @type {HTMLDivElement} */
   let contentEl;

   /** @type {HTMLDivElement} */
   let buttonsEl;

   let content = void 0;
   let dialogClass;
   let dialogProps = {};

   let currentButtonId = data.default;

   // Remove key listeners from elementRoot.
   onDestroy(() =>
   {
      const rootEl = $elementRoot;
      if (A11yHelper.isFocusTarget(rootEl))
      {
         rootEl.removeEventListener('keydown', onKeydown)
         rootEl.removeEventListener('keyup', onKeyup)
      }
   })

   // If `focusFirst` is true then focus first focusable element iin dialog content.
   onMount(() =>
   {
      if (focusFirst)
      {
         const focusEl = A11yHelper.getFirstFocusableElement(contentEl);

         if (A11yHelper.isFocusTarget(focusEl))
         {
            // Focus on next macro task to allow application / dialog to mount to bypass ApplicationShell onMount focus
            // handling.
            setTimeout(() => focusEl.focus(), 0);
         }
      }
   });

   // Add key listeners to elementRoot when it is bound.
   $: if ($elementRoot)
   {
      const rootEl = $elementRoot;
      if (A11yHelper.isFocusTarget(rootEl))
      {
         rootEl.addEventListener('keydown', onKeydown)
         rootEl.addEventListener('keyup', onKeyup)
      }
   }

   // Automatically close the dialog on button click handler completion.
   $: autoClose = typeof data.autoClose === 'boolean' ? data.autoClose : true;

   // When true the first focusable element that isn't a button is focused.
   $: focusFirst = typeof data.focusFirst === 'boolean' ? data.focusFirst : false;

   // Focus current button when `buttonsEl` is bound.
   $: if (!focusFirst && A11yHelper.isFocusTarget(buttonsEl))
   {
      const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
      if (A11yHelper.isFocusTarget(buttonEl)) { buttonEl.focus(); }
   }

   // When false the dialog does not automatically close when button selected.
   $: resolveId = typeof data.resolveId === 'boolean' ? data.resolveId : false;

   // If `data.buttons` is not an object then set an empty array otherwise reduce the button data.
   $:
   {
      buttons = !isObject(data.buttons) ? [] : Object.keys(data.buttons).reduce((array, key) =>
      {
         const b = data.buttons[key];

         // Handle icon and treat bare strings as the icon class; otherwise assume the icon is fully formed HTML.
         const icon = typeof b.icon !== 'string' ? void 0 : s_REGEX_HTML.test(b.icon) ? b.icon :
          `<i class="${b.icon}"></i>`;

         const autoClose = typeof b.autoClose === 'boolean' ? b.autoClose : true;

         const disabled = typeof b.disabled === 'boolean' ? b.disabled : false;

         const label = typeof b.label === 'string' ? `${icon !== void 0 ? ' ' : ''}${localize(b.label)}` : '';

         const title = typeof b.title === 'string' ? localize(b.title) : void 0;

         // Test any condition supplied otherwise default to true.
         const condition = typeof b.condition === 'function' ? b.condition.call(b) : b.condition ?? true;

         if (condition) { array.push({ ...b, id: key, autoClose, icon, label, title, disabled }); }

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
         if (TJSSvelteUtil.isComponent(content))
         {
            dialogClass = content;
            dialogProps = {};
         }
         else if (TJSSvelteConfigUtil.isConfig(content))
         {
            const svelteConfig = TJSSvelteConfigUtil.parseConfig(content, { thisArg: application });
            dialogClass = svelteConfig.class;
            dialogProps = svelteConfig.props;
         }
         else
         {
            dialogClass = void 0;
            dialogProps = {};
         }
      }
      catch (err)
      {
         dialogClass = void 0;
         dialogProps = {};

         content = err.message;
         console.error(err);
      }
   }

   /**
    * Handle button click.
    *
    * @privateRemarks
    * TODO: When app eventbus is available send event for UI notification instead of Foundry API usage.
    *
    * @param {import('#runtime/svelte/application').TJSDialogButtonData}   button - button data.
    *
    * @returns {*}
    */
   function onClick(button)
   {
      try
      {
         let result = void 0;

         const callback = button?.onPress;

         switch (typeof callback)
         {
            case 'function':
               // Pass back the TJSDialog instance.
               result = callback({ application });
               break;

            case 'string':
               // Attempt lookup by function name in dialog instance component.
               if (dialogComponent !== void 0 && typeof dialogComponent[callback] === 'function')
               {
                  result = dialogComponent[callback]({ application });
               }
               else
               {
                  if (dialogComponent === void 0)
                  {
                     console.warn(`[TRL] TJSDialog warning: 'onPress' defined as a string with no associated ` +
                      `content Svelte component.`);
                  }
                  else if (typeof dialogComponent?.[callback] !== 'function')
                  {
                     console.warn(`[TRL] TJSDialog warning: The content Svelte component does not contain an ` +
                      `associated function '${callback}'. Did you remember to add ` +
                       `'<svelte:options accessors={true} />' and export the function?`);
                  }
               }
               break;
         }

         // By default, both 'button.autoClose' & autoClose are true, so skip auto-closing when either is false.
         if (button.autoClose && autoClose)
         {
            // If `resolveId` dialog option is true and current result is undefined then set result to the button ID.
            if (resolveId && result === void 0) { result = button.id; }

            managedPromise.resolve(result);
         }
      }
      catch(err)
      {
         const notifyError = typeof data.notifyError === 'boolean' ? data.notifyError : true;
         if (notifyError)
         {
            // TODO: When app eventbus is available send event for UI notification instead of Foundry API usage.
            globalThis.ui.notifications.error(err, { console: false });
         }

         // Attempt to first reject the error with any current managed Promise otherwise rethrow error.
         if (!managedPromise.reject(err)) { throw err; }
      }
      finally
      {
         // By default, both 'button.autoClose' & autoClose are true, so skip auto-closing when either is false.
         if (button.autoClose && autoClose) { application.close(); }
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

            // Check `activeElement` on next macro task to potentially update `currentButtonId` from tab / keyboard
            // navigation.
            setTimeout(() =>
            {
               const activeWindow = application.reactive.activeWindow;

               const activeElement = activeWindow.document.activeElement;
               if (A11yHelper.isFocusTarget(activeElement) && A11yHelper.isFocusTarget(buttonsEl) &&
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

            const activeWindow = application.reactive.activeWindow;
            const activeEl = activeWindow.document.activeElement;

            if (A11yHelper.isFocusTarget(buttonsEl))
            {
               // Only advance button via arrow key if a button is already focused.
               if (A11yHelper.isFocusTarget(activeEl) && buttonsEl.contains(activeEl))
               {
                  const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
                  if (buttons.length && currentIndex > 0) { currentButtonId = buttons[currentIndex - 1].id; }
               }

               const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
               if (A11yHelper.isFocusTarget(buttonEl)) { buttonEl.focus(); }
            }
            break;
         }

         case 'ArrowRight':
         {
            event.preventDefault();
            event.stopPropagation();

            const activeWindow = application.reactive.activeWindow;
            const activeEl = activeWindow.document.activeElement;

            if (A11yHelper.isFocusTarget(buttonsEl))
            {
               // Only advance button via arrow key if a button is already focused  or there is no current button ID
               if (A11yHelper.isFocusTarget(activeEl) && (buttonsEl.contains(activeEl) || currentButtonId === void 0))
               {
                  const currentIndex = buttons.findIndex((button) => button.id === currentButtonId);
                  if (buttons.length && currentIndex < buttons.length - 1) { currentButtonId = buttons[currentIndex + 1].id; }
               }

               const buttonEl = buttonsEl.querySelector(`.${currentButtonId}`);
               if (A11yHelper.isFocusTarget(buttonEl)) { buttonEl.focus(); }
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
   <div bind:this={contentEl} class=dialog-content>
      {#if typeof content === 'string'}
         {@html content}
      {:else if dialogClass}
         <svelte:component bind:this={dialogComponent} this={dialogClass} {...dialogProps} />
      {/if}
   </div>

   {#if buttons.length}
   <div bind:this={buttonsEl} class="dialog-buttons tjs-dialog-buttons">
      {#each buttons as button (button.id)}
      <button class="dialog-button tjs-dialog-button {button.id}"
              on:click|preventDefault|stopPropagation={() => onClick(button)}
              on:focus={() => currentButtonId = button.id}
              disabled={button.disabled}
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

   .tjs-dialog-button:hover {
      box-shadow: var(--tjs-dialog-button-box-shadow-focus-hover, var(--tjs-default-box-shadow-focus-hover));
      outline: var(--tjs-dialog-button-outline-focus-hover, var(--tjs-default-outline-focus-hover, revert));
      transition: var(--tjs-dialog-button-transition-focus-hover, var(--tjs-default-transition-focus-hover));
      text-shadow: var(--tjs-dialog-button-text-shadow-focus-hover, var(--tjs-default-text-shadow-focus-hover, inherit));
   }

   .tjs-dialog-button:focus-visible {
      box-shadow: var(--tjs-dialog-button-box-shadow-focus-visible, var(--tjs-default-box-shadow-focus-visible));
      outline: var(--tjs-dialog-button-outline-focus-visible, var(--tjs-default-outline-focus-visible, revert));
      transition: var(--tjs-dialog-button-transition-focus-visible, var(--tjs-default-transition-focus-visible));
      text-shadow: var(--tjs-dialog-button-text-shadow-focus-visible, var(--tjs-default-text-shadow-focus-hover, inherit));
   }
</style>
