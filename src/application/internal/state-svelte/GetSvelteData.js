/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 *
 * @implements {import('../../types').SvelteAppNS.API.Svelte}
 */
export class GetSvelteData
{
   /** @type {import('svelte').SvelteComponent[] | null[]} */
   #applicationShellHolder;

   /** @type {import('./types').SvelteData[]} */
   #svelteData;

   /**
    * Keep a direct reference to the SvelteData array in an associated {@link SvelteApp}.
    *
    * @param {import('svelte').SvelteComponent[] | null[]}  applicationShellHolder - A reference to the mounted app shell.
    *
    * @param {import('./types').SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
    */
   constructor(applicationShellHolder, svelteData)
   {
      this.#applicationShellHolder = applicationShellHolder;
      this.#svelteData = svelteData;
   }

   /**
    * Returns any mounted application shell.
    *
    * @returns {import('svelte').SvelteComponent} Any mounted application shell.
    */
   get appShell() { return this.#applicationShellHolder[0]; }

   /**
    * Returns any mounted application shell.
    *
    * @deprecated Use {@link GetSvelteData.appShell}; since `0.2.0` removal in `0.5.0`.
    *
    * @returns {import('svelte').SvelteComponent} Any mounted application shell.
    */
   get applicationShell() { return this.#applicationShellHolder[0]; }

   /**
    * Returns mounted application shell data / config.
    *
    * @internal
    *
    * @returns {import('./types').SvelteData} Any mounted application shell data.
    */
   get appShellData() { return this.#svelteData[0]; }
}
