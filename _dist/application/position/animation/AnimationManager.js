import { nextAnimationFrame }    from '@typhonjs-fvtt/svelte/animate';

const s_ACTIVE_LIST = [];
const s_NEW_LIST = [];
let s_PROMISE;

/**
 * Provides animation management and scheduling allowing all Position instances to utilize one micro-task.
 */
export class AnimationManager
{
   /**
    * Add animation data.
    *
    * @param {object}   data -
    */
   static add(data)
   {
      s_NEW_LIST.push(data);

      if (!s_PROMISE) { s_PROMISE = this.animate(); }
   }

   /**
    * Manage all animation
    *
    * @returns {Promise<void>}
    */
   static async animate()
   {
      while (s_ACTIVE_LIST.length || s_NEW_LIST.length)
      {
         const current = await nextAnimationFrame();

         if (s_NEW_LIST.length)
         {
            // Process new data
            for (let cntr = s_NEW_LIST.length; --cntr >= 0;)
            {
               const data = s_NEW_LIST[cntr];
               data.start = current;
               data.current = 0;

               s_ACTIVE_LIST.push(data);
            }

            s_NEW_LIST.length = 0;
         }

         // Process existing data.
         for (let cntr = s_ACTIVE_LIST.length; --cntr >= 0;)
         {
            const data = s_ACTIVE_LIST[cntr];

            // Ensure that the element is still connected otherwise remove it from active list and continue.
            if (!data.el.isConnected)
            {
               s_ACTIVE_LIST.splice(cntr, 1);
               data.currentAnimationKeys.clear();
               if (typeof data.resolve === 'function') { data.resolve(); }
               continue;
            }

            // Handle any animations that have been canceled.
            if (data.finished)
            {
               // Remove animation keys.
               for (let dataCntr = data.keys.length; --dataCntr >= 0;)
               {
                  const key = data.keys[dataCntr];
                  data.currentAnimationKeys.delete(key);
               }

               s_ACTIVE_LIST.splice(cntr, 1);
               if (typeof data.resolve === 'function') { data.resolve(); }
               continue;
            }

            data.current = current - data.start;

            // Remove this animation instance.
            if (data.current >= data.duration)
            {
               // Prepare final update with end position data and remove keys from `currentAnimationKeys`.
               for (let dataCntr = data.keys.length; --dataCntr >= 0;)
               {
                  const key = data.keys[dataCntr];
                  data.newData[key] = data.destination[key];
                  data.currentAnimationKeys.delete(key);
               }

               data.position.set(data.newData);

               s_ACTIVE_LIST.splice(cntr, 1);

               data.finished = true;
               if (typeof data.resolve === 'function') { data.resolve(); }
               continue;
            }

            const easedTime = data.ease(data.current / data.duration);

            for (let dataCntr = data.keys.length; --dataCntr >= 0;)
            {
               const key = data.keys[dataCntr];
               data.newData[key] = data.interpolate(data.initial[key], data.destination[key], easedTime);
            }

            data.position.set(data.newData);
         }
      }

      s_PROMISE = void 0;
   }

   /**
    * Cancels any animation for given Position data.
    *
    * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} data -
    */
   static cancel(data)
   {

   }

   /**
    * Cancels all Position animation.
    */
   static cancelAll()
   {
      for (let cntr = s_ACTIVE_LIST.length; --cntr >= 0;)
      {
         const data = s_ACTIVE_LIST[cntr];

         data.currentAnimationKeys.clear();
         data.finished = true;
         data.resolve();
      }

      for (let cntr = s_NEW_LIST.length; --cntr >= 0;)
      {
         const data = s_NEW_LIST[cntr];

         data.currentAnimationKeys.clear();
         data.finished = true;
         data.resolve();
      }

      s_ACTIVE_LIST.length = 0;
      s_NEW_LIST.length = 0;
   }

   /**
    * Animates one or more Position instances as a group.
    *
    * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} data -
    *
    * @param {object|Function}   positionData -
    *
    * @param {object|Function}   options -
    *
    * @returns {TJSBasicAnimation} Basic animation control.
    */
   static to(data, positionData, options)
   {
      return void 0;
   }
}
