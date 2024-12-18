import type { SvelteComponent } from 'svelte';

import type { TJSSvelteConfig } from '#runtime/svelte/util';

/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 */
declare interface GetSvelteData<ComponentInstance extends SvelteComponent>
{
   /**
    * Returns mounted application shell Svelte component.
    *
    * @returns Any mounted application shell.
    */
   get applicationShell(): ComponentInstance;
}

/**
 * Application shell contract for Svelte components.
 */
type MountedAppShell = {
   /**
    * The root element / exported prop.
    */
   elementRoot: HTMLElement;
   /**
    * The content element / exported prop.
    */
   elementContent?: HTMLElement;
   /**
    * The target element / exported prop.
    */
   elementTarget?: HTMLElement;
};

/**
 * Provides access to a mounted Svelte component.
 */
type SvelteData = {
   /**
    * The TJSSvelteConfig for this component.
    */
   config: TJSSvelteConfig;
   /**
    * The svelte component instance.
    */
   component: SvelteComponent;
   /**
    * The main bound element.
    */
   element: HTMLElement;
};

export { GetSvelteData, MountedAppShell, SvelteData }
