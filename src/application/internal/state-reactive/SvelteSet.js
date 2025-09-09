/**
 * @template T
 *
 * @privateRemarks
 * TODO: Replace with Svelte 5 reactive set implementation.
 *
 * @implements {import('svelte/store').Readable}
 *
 * @augments {Set<T>}
 */
export class SvelteSet extends Set
{
   /**
    * Stores the subscribers.
    *
    * @type {import('svelte/store').Subscriber<SvelteSet>[]}
    */
   #subscribers = [];

   /**
    * Appends a new element with a specified value to the end of the Set.
    *
    * @param {T} value - Value to add.
    *
    * @returns {this} This instance.
    */
   add(value)
   {
      super.add(value);

      this.#updateSubscribers();

      return this;
   }

   /**
    * Clears this set.
    */
   clear()
   {
      super.clear();

      this.#updateSubscribers();
   }

   /**
    * Removes a specified value from the Set.
    *
    * @param {T} value - Value to delete.
    *
    * @returns {boolean} Returns true if an element in the Set existed and has been removed, or false if the element
    *          does not exist.
    */
   delete(value)
   {
      const result = super.delete(value);

      this.#updateSubscribers();

      return result;
   }

   // Store subscriber implementation --------------------------------------------------------------------------------

   /**
    * @param {import('svelte/store').Subscriber<SvelteSet>} handler - Callback function that is invoked on update /
    *        changes.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      const currentIdx = this.#subscribers.findIndex((sub) => sub === handler);
      if (currentIdx === -1)
      {
         this.#subscribers.push(handler);
         handler(this);
      }

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscribers.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscribers.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers.
    */
   #updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscribers.length; cntr++) { this.#subscribers[cntr](this); }
   }
}
