<script>
   /**
    * Provides an app header button conforming to the {@link SvelteAppNS.HeaderButton} type.
    * Additionally, a `title` field is supported to give a tool tip for the button. For backward compatibility
    * `onclick` is supported, but for uniformity across TRL defining an `onPress` function is recommended. If defined
    * it is invoked when the button is clicked or `Enter` key pressed and state is updated accordingly.
    *
    * TRL also supports the following extra button data:
    *
    * - {keyCode='Enter'}           keyCode: A string conforming to `KeyboardEvent.code` to activate `onPress` callback.
    *
    * - {keepMinimized=false}       keepMinimized: When true the button is not removed when app minimized.
    *
    * - {Function}                  onContextMenu: Invoked when right mouse button or contextmenu key is pressed.
    *
    * - {Function}                  onPress: Invoked when left mouse button or `keyCode` key is pressed.
    *
    * - {{ [key: string]: string | null }}   styles: Additional inline styles to apply to button.
    *
    * @componentDocumentation
    * @internal
    */
   import { inlineSvg }       from '#runtime/svelte/action/dom/inline-svg';
   import { popoverTooltip }  from '#runtime/svelte/action/dom/tooltip';
   import { applyStyles }     from '#runtime/svelte/action/dom/style';
   import { AssetValidator }  from '#runtime/util/browser';
   import { localize }        from '#runtime/util/i18n';
   import { isObject }        from '#runtime/util/object';

   export let button = void 0;

   export let storeHeaderButtonNoLabel = void 0;

   $: icon = isObject(button) && typeof button.icon === 'string' ? button.icon : void 0;

   $: label = isObject(button) && typeof button.label === 'string' ? localize(button.label) : void 0;

   $: keepMinimized = isObject(button) && typeof button.keepMinimized === 'boolean' ? button.keepMinimized : false;

   $: keyCode = isObject(button) && typeof button.keyCode === 'string' ? button.keyCode : 'Enter';

   $: styles = isObject(button) && isObject(button.styles) ? button.styles : void 0;

   // ----------------------------------------------------------------------------------------------------------------

   let iconType;

   $:
   {
      const result = AssetValidator.parseMedia({ url: icon, mediaTypes: AssetValidator.MediaTypes.img_svg });
      iconType = result.valid ? result.elementType : 'font';
   }

   // ----------------------------------------------------------------------------------------------------------------

   function onClick(event)
   {
      // Accept `onPress or `onclick` as the function / data to invoke. `onclick` is from Foundry defined buttons.
      const invoke = button?.onPress ?? button?.onclick;

      if (typeof invoke === 'function')
      {
         invoke({ button, event });
         button = button; // This provides a reactive update if button data changes.
      }
   }

   function onContextMenu(event)
   {
      if (button?.onContextMenu === 'function')
      {
         button.onContextMenu({ button, event });
         button = button; // This provides a reactive update if button data changes.
      }
   }

   /**
    * Consume / stop propagation of key down when key codes match.
    *
    * @param {KeyboardEvent}    event -
    */
   function onKeydown(event)
   {
      if (event.code === keyCode)
      {
         event.preventDefault();
         event.stopPropagation();
      }
   }

   /**
    * Handle press event if key codes match.
    *
    * @param {KeyboardEvent}    event -
    */
   function onKeyup(event)
   {
      if (event.code === keyCode)
      {
         // Accept `onPress or `onclick` as the function / data to invoke. `onclick` is from Foundry defined buttons.
         const invoke = button.onPress ?? button.onclick;

         if (typeof invoke === 'function')
         {
            invoke({ button, event });
            button = button; // This provides a reactive update if button data changes.
         }

         event.preventDefault();
         event.stopPropagation();
      }
   }
</script>

<svelte:options accessors={true}/>

<button type=button
   class="header-control icon {button.class}"
   class:keep-minimized={keepMinimized}
   on:click|preventDefault|stopPropagation={onClick}
   on:contextmenu|preventDefault|stopPropagation={onContextMenu}
   on:keydown={onKeydown}
   on:keyup={onKeyup}
   use:applyStyles={styles}
   use:popoverTooltip={$storeHeaderButtonNoLabel ? null : label}
   data-action={button.class}
   aria-label={label}>

   {#if icon}
      {#if iconType === 'font'}
         <i class={icon}></i>
      {:else if iconType === 'img'}
         <img src={icon} alt="" class=icon-int>
      {:else if iconType === 'svg'}
         <svg use:inlineSvg={{ src: icon }} class=icon-int></svg>
      {/if}
   {/if}
</button>

<style>
   button {
      color: var(--tjs-app-header-button-color);
      flex: 0 0 var(--tjs-app-header-button-size);
      height: var(--tjs-app-header-button-size);
      margin: var(--tjs-app-header-button-margin);
      min-height: var(--tjs-app-header-button-size);
   }

   button:has(.icon-int) {
      padding: calc(var(--tjs-app-header-button-size) * 0.15);
   }

   .icon-int {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: calc(var(--tjs-app-header-button-size) * 0.75);
      height: calc(var(--tjs-app-header-button-size) * 0.75);
   }
</style>
