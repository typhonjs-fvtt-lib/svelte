<script>
   /**
    * Provides an app header button conforming to the Foundry {@link ApplicationHeaderButton} type. Additionally a
    * `title` field is supported to give a tool tip for the button. The `onclick` function if defined is invoked when
    * the button is clicked and state is updated accordingly.
    */
   import { applyStyles }   from '@typhonjs-fvtt/svelte/action';
   import { localize }      from '@typhonjs-fvtt/svelte/helper';

   export let button = void 0;

   const s_REGEX_HTML = /^\s*<.*>$/;

   let icon, label, title, styles

   $: if (button)
   {
      title = typeof button.title === 'string' ? localize(button.title) : '';

      // Handle icon and treat bare strings as the icon class; otherwise assume the icon is fully formed HTML.
      icon = typeof button.icon !== 'string' ? void 0 : s_REGEX_HTML.test(button.icon) ? button.icon :
       `<i class="${button.icon}" title="${title}"></i>`;

      label = typeof button.label === 'string' ? localize(button.label) : void 0;

      styles = typeof button.styles === 'object' ? button.styles : void 0;
   }

   function onClick(event)
   {
      // Accept either callback or onclick as the function / data to invoke.
      const invoke = button.callback ?? button.onclick;

      if (typeof invoke === 'function')
      {
         invoke.call(button, event);
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
      if (event.code === 'Enter')
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
      if (event.code === 'Enter')
      {
         const invoke = button.callback ?? button.onclick;

         if (typeof invoke === 'function')
         {
            invoke.call(button, event);
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
   on:keydown={onKeydown}
   on:keyup={onKeyup}
   use:applyStyles={styles}
   class="header-button {button.class}"
   aria-label={label}
   tabindex=0
   role=button>
    {@html icon}{#if label}<span class:has-icon={icon !== void 0}>{label}</span>{/if}
</a>

<style>
   a {
      padding: var(--tjs-app-header-button-padding, 0 3px);
   }

   a :global(i) {
      padding: var(--tjs-app-header-button-icon-padding, 0);
   }

   a:focus-visible {
      outline: var(--tjs-app-header-button-outline-focus, var(--tjs-comp-outline-focus-visible, revert));
   }

   span {
      padding: var(--tjs-app-header-button-label-padding, 0);
   }

   span.has-icon {
      padding: var(--tjs-app-header-button-label-padding, 0 0 0 3px);
   }
</style>
