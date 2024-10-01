import { cssVariables }                      from './cssVariables.js';

export { default as ApplicationShell }       from './ApplicationShell.svelte';
export { default as EmptyApplicationShell }  from './EmptyApplicationShell.svelte';
export { default as TJSApplicationShell }    from './TJSApplicationShell.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

/**
 * Provides default CSS variables for core components.
 */
cssVariables.setProperties({
   // Anchor text shadow / header buttons
   '--tjs-default-text-shadow-focus-hover': '0 0 8px var(--color-shadow-primary)',

   // TJSApplicationShell app background.
   '--tjs-app-background': `url("${globalThis.foundry.utils.getRoute('/ui/denim075.png')}")`,
}, false);
