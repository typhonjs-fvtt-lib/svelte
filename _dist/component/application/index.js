import { FVTTConfigure }                     from './FVTTConfigure.js';

export { default as ApplicationShell }       from './ApplicationShell.svelte';
export { default as EmptyApplicationShell }  from './EmptyApplicationShell.svelte';
export { default as TJSApplicationShell }    from './TJSApplicationShell.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

Hooks.once('init', () => FVTTConfigure.initialize());
