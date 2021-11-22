export { default as TJSComponentShell }      from './TJSComponentShell.svelte';
export { default as TJSContainer }           from './TJSContainer.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

export { default as ApplicationShell }       from './application/ApplicationShell.svelte';
export { default as TJSApplicationHeader }   from './application/TJSApplicationHeader.svelte';
export { default as TJSApplicationShell }    from './application/TJSApplicationShell.svelte';
export { default as TJSHeaderButton }        from './application/TJSHeaderButton.svelte';

export { default as TJSContextMenu }         from './contextmenu/TJSContextMenu.svelte';

export { default as DialogContent }          from './dialog/DialogContent.svelte';
export { default as DialogShell }            from './dialog/DialogShell.svelte';

/**
 * @typedef {object} TransformData
 *
 * @property {Function} transition - A transition applying to both in & out.
 *
 * @property {Function} inTransition - A transition applying to in.
 *
 * @property {Function} outTransition - A transition applying to out.
 *
 * @property {object}   transitionOptions - The options config object for in & out transitions.
 *
 * @property {object}   inTransitionOptions - The options config object for in transitions.
 *
 * @property {object}   outTransitionOptions - The options config object for out transitions.
 */
