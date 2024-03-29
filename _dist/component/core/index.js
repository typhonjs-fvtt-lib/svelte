import { cssVariables } from './cssVariables.js';

export { default as TJSGlassPane }        from './TJSGlassPane.svelte';
export *                                  from './application/index.js';

/**
 * Provides default CSS variables for core components.
 */
cssVariables.setProperties({
   // Anchor text shadow / header buttons
   '--tjs-default-text-shadow-focus-hover': '0 0 8px var(--color-shadow-primary)',

   // TJSApplicationShell app background.
   '--tjs-app-background': `url("${globalThis.foundry.utils.getRoute('/ui/denim075.png')}")`,
}, false);
