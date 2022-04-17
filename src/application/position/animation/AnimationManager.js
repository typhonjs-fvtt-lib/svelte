import { nextAnimationFrame }    from '@typhonjs-fvtt/svelte/animate';

import { UpdateElementManager }  from '../UpdateElementManager.js';

/**
 * Provides animation management and scheduling allowing all Position instances to utilize one micro-task.
 */
export class AnimationManager
{
   static #list = [];

   static #newList = [];

   static #promise;

   /**
    * Add animation data.
    *
    * @param {object}   data -
    *
    * @returns {Promise<void>} Resolved when animation completes.
    */
   static add(data)
   {
      const promise = new Promise((resolve) => data.resolve = resolve);

      this.#newList.push(data);

      if (!this.#promise) { this.#promise = this.animate(); }

      return promise;
   }

   /**
    * Manage all animation
    *
    * @returns {Promise<void>}
    */
   static async animate()
   {
      let current = await nextAnimationFrame();

      const list = this.#list;
      const newList = this.#newList;

      while (list.length || newList.length)
      {
         if (newList.length)
         {
            // Process new data
            for (const data of newList)
            {
               data.start = current;
               data.current = 0;

               list.push(data);
            }

            newList.length = 0;
         }

         // Process existing data.
         for (let cntr = list.length; --cntr >= 0;)
         {
            const data = list[cntr];

            data.current = current - data.start;

            // Remove this animation instance.
            if (data.current >= data.duration)
            {
               // Prepare final update with end position data and remove keys from `currentAnimationKeys`.
               for (const key of data.keys)
               {
                  data.newData[key] = data.destination[key];
                  data.currentAnimationKeys.delete(key);
               }

               data.position.set(data.newData);

               list.splice(cntr, 1);

               data.resolve();
               continue;
            }

            const easedTime = data.easing(data.current / data.duration);

            for (const key of data.keys)
            {
               data.newData[key] = data.interpolate(data.initial[key], data.destination[key], easedTime);
            }

            data.position.set(data.newData);
         }

         const newCurrent = await UpdateElementManager.promise;

         // Must check that time has passed otherwise likely the element has been removed.
         if (!Number.isFinite(newCurrent) && newCurrent <= current)
         {
            // TODO: Temporary warning message
            // console.warn(`TRL - AnimationManager Warning - quitting animation: newCurrent <= current.`);

            for (const data of list)
            {
               for (const key of data.keys)
               {
                  data.newData[key] = data.destination[key];
                  data.currentAnimationKeys.delete(key);
               }

               data.position.set(data.newData);
               data.resolve();
            }

            list.length = 0;

            break;
         }

         current = newCurrent;
      }

      this.#promise = void 0;
   }
}
