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
    * @deprecated Use {@link GetSvelteData.appShell}; since `0.2.0` removal in `0.5.0`.
    *
    * @returns Any mounted application shell.
    */
   get applicationShell(): ComponentInstance | null;

   /**
    * Returns mounted application shell Svelte component.
    *
    * @returns Any mounted application shell.
    */
   get appShell(): ComponentInstance | null;

   /**
    * Returns mounted application shell data / config.
    */
   get appShellData(): SvelteData | null;
}

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

export { GetSvelteData, SvelteData }
