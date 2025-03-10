import { cssVariables } from './cssVariables.js';

export { default as ApplicationShell }       from './ApplicationShell.svelte';
export { default as EmptyApplicationShell }  from './EmptyApplicationShell.svelte';
export { default as TJSApplicationShell }    from './TJSApplicationShell.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

/**
 * Provides default CSS variables for core components.
 */
cssVariables.setProperties({
   // TJSApplicationShell app background.
   '--tjs-app-background-default': `url("${globalThis.foundry.utils.getRoute('/ui/denim075.png')}")`,

   '--tjs-app-resize-handle-background': `transparent url("${globalThis.foundry.utils.getRoute('/ui/resize-handle.webp')}") no-repeat center / contain`,
}, false);
