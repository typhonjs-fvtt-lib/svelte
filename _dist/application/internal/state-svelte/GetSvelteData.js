/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 */
export class GetSvelteData
{
   /** @type {import('./types').MountedAppShell[] | null[]} */
   #applicationShellHolder;

   /** @type {import('./types').SvelteData[]} */
   #svelteData;

   /**
    * Keep a direct reference to the SvelteData array in an associated {@link SvelteApplication}.
    *
    * @param {import('./types').MountedAppShell[] | null[]}  applicationShellHolder - A reference to the
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
    * @returns {import('./types').MountedAppShell | null} Any mounted application shell.
    */
   get applicationShell() { return this.#applicationShellHolder[0]; }

   /**
    * Returns the indexed Svelte component.
    *
    * @param {number}   index -
    *
    * @returns {object} The loaded Svelte component.
    */
   component(index)
   {
      const data = this.#svelteData[index];
      return data?.component ?? void 0;
   }

   /**
    * Returns the Svelte component entries iterator.
    *
    * @returns {IterableIterator<[number, import('svelte').SvelteComponent]>} Svelte component entries iterator.
    * @yields
    */
   *componentEntries()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield [cntr, this.#svelteData[cntr].component];
      }
   }

   /**
    * Returns the Svelte component values iterator.
    *
    * @returns {IterableIterator<import('svelte').SvelteComponent>} Svelte component values iterator.
    * @yields
    */
   *componentValues()
   {
      for (let cntr = 0; cntr < this.#svelteData.length; cntr++)
      {
         yield this.#svelteData[cntr].component;
      }
   }

   /**
    * Returns the indexed SvelteData entry.
    *
    * @param {number}   index - The index of SvelteData instance to retrieve.
    *
    * @returns {import('./types').SvelteData} The loaded Svelte config + component.
    */
   data(index)
   {
      return this.#svelteData[index];
   }

   /**
    * Returns the {@link SvelteData} instance for a given component.
    *
    * @param {import('svelte').SvelteComponent} component - Svelte component.
    *
    * @returns {import('./types').SvelteData} -  The loaded Svelte config + component.
    */
   dataByComponent(component)
   {
      for (const data of this.#svelteData)
      {
         if (data.component === component) { return data; }
      }

      return void 0;
   }

   /**
    * Returns the SvelteData entries iterator.
    *
    * @returns {IterableIterator<[number, import('./types').SvelteData]>} SvelteData entries iterator.
    */
   dataEntries()
   {
      return this.#svelteData.entries();
   }

   /**
    * Returns the SvelteData values iterator.
    *
    * @returns {IterableIterator<import('./types').SvelteData>} SvelteData values iterator.
    */
   dataValues()
   {
      return this.#svelteData.values();
   }

   /**
    * Returns the length of the mounted Svelte component list.
    *
    * @returns {number} Length of mounted Svelte component list.
    */
   get length()
   {
      return this.#svelteData.length;
   }
}
