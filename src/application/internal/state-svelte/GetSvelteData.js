/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 *
 * @template ComponentInstance
 */
export class GetSvelteData
{
   /** @type {ComponentInstance[] | null[]} */
   #applicationShellHolder;

   /** @type {import('./types').SvelteData[]} */
   #svelteData;

   /**
    * Keep a direct reference to the SvelteData array in an associated {@link SvelteApplication}.
    *
    * @param {ComponentInstance[] | null[]}  applicationShellHolder - A reference to the
    *        MountedAppShell array.
    *
    * @param {import('./types').SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
    */
   constructor(applicationShellHolder, svelteData)
   {
      this.#applicationShellHolder = applicationShellHolder;
      this.#svelteData = svelteData;
   }

   /**
    * Returns any mounted {@link MountedAppShell}.
    *
    * @returns {ComponentInstance} Any mounted application shell.
    */
   get applicationShell() { return this.#applicationShellHolder[0]; }
}
