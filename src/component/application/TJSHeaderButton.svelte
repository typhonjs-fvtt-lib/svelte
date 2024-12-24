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
    * - {string}                    title: Tooltip title.
    *
    * @componentDocumentation
    * @internal
    */
   import { applyStyles }   from '#runtime/svelte/action/dom/style';
   import { localize }      from '#runtime/util/i18n';
   import { isObject }      from '#runtime/util/object';

   export let button = void 0;

   const s_REGEX_HTML = /^\s*<.*>$/;

   $: title = isObject(button) && typeof button.title === 'string' ? localize(button.title) : '';

   // Handle icon and treat bare strings as the icon class; otherwise assume the icon is fully formed HTML.
   $: icon = isObject(button) && typeof button.icon !== 'string' ? void 0 : s_REGEX_HTML.test(button.icon) ?
    button.icon : `<i class="${button.icon}" title="${title}"></i>`;

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

<!-- svelte-ignore a11y-missing-attribute -->
<a on:click|preventDefault|stopPropagation={onClick}
   on:contextmenu|preventDefault|stopPropagation={onContextMenu}
   on:keydown={onKeydown}
   on:keyup={onKeyup}
   use:applyStyles={styles}
   class="header-button {button.class}"
   class:keep-minimized={keepMinimized}
   aria-label={label}
   tabindex=0
   role=button>
    {@html icon}{#if label}<span class:has-icon={icon !== void 0}>{label}</span>{/if}
</a>

<style>
   a {
      padding: var(--tjs-app-header-button-padding, 0 3px);
      user-select: none;
      -webkit-tap-highlight-color: var(--tjs-default-webkit-tap-highlight-color, revert);
   }

   a :global(i) {
      padding: var(--tjs-app-header-button-icon-padding, 0);
   }

   a:hover {
      text-shadow: var(--tjs-app-header-button-text-shadow-hover, var(--tjs-default-text-shadow-focus-hover, inherit));
   }

   a:focus-visible {
      box-shadow: var(--tjs-app-header-button-box-shadow-focus-visible, var(--tjs-default-box-shadow-focus-visible));
      outline: var(--tjs-app-header-button-outline-focus-visible, var(--tjs-default-outline-focus-visible, revert));
      transition: var(--tjs-app-header-button-transition-focus-visible, var(--tjs-default-transition-focus-visible));
      text-shadow: var(--tjs-app-header-button-text-shadow-focus-visible, var(--tjs-default-text-shadow-focus-hover, inherit));
   }

   span {
      padding: var(--tjs-app-header-button-label-padding, 0);
   }

   span.has-icon {
      padding: var(--tjs-app-header-button-label-padding, 0 0 0 3px);
   }
</style>
