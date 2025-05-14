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
   import { applyStyles }   from '@typhonjs-svelte/runtime-base/svelte/action/dom/style';
   import { localize }      from '@typhonjs-svelte/runtime-base/util/i18n';
   import { isObject }      from '@typhonjs-svelte/runtime-base/util/object';

   export let button = void 0;

   export let storeHeaderButtonNoLabel = void 0;

   $: icon = isObject(button) && typeof button.icon === 'string' ? button.icon : void 0;

   $: label = isObject(button) && typeof button.label === 'string' ? localize(button.label) : void 0;

   $: keepMinimized = isObject(button) && typeof button.keepMinimized === 'boolean' ? button.keepMinimized : false;

   $: keyCode = isObject(button) && typeof button.keyCode === 'string' ? button.keyCode : 'Enter';

   $: styles = isObject(button) && isObject(button.styles) ? button.styles : void 0;

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
   on:click|preventDefault|stopPropagation={onClick}
   on:contextmenu|preventDefault|stopPropagation={onContextMenu}
   on:keydown={onKeydown}
   on:keyup={onKeyup}
   use:applyStyles={styles}
   class="header-control icon {icon} {button.class}"
   class:keep-minimized={keepMinimized}
   data-action={button.class}
   data-tooltip={$storeHeaderButtonNoLabel ? null : label}
   aria-label={label}>
</button>
