/**
 * Provides animation management and scheduling allowing all Position instances to utilize one micro-task.
 */
export class AnimationManager
{
   /**
    * @type {object[]}
    */
   static activeList = [];

   /**
    * @type {object[]}
    */
   static newList = [];

   /**
    * @type {boolean}
    */
   static animating = false;

   /**
    * Add animation data.
    *
    * @param {object}   data -
    */
   static add(data)
   {
      AnimationManager.newList.push(data);

      if (!AnimationManager.animating)
      {
         AnimationManager.animating = true;

         globalThis.requestAnimationFrame(AnimationManager.animate);
      }
   }

   /**
    * Manage all animation
    *
    * @param {DOMHighResTimeStamp} current - Current time from rAF callback.
    *
    */
   static animate(current)
   {
      if (AnimationManager.newList.length)
      {
         // Process new data
         for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
         {
            const data = AnimationManager.newList[cntr];
            data.start = current;
            data.current = 0;

            AnimationManager.activeList.push(data);
         }

         AnimationManager.newList.length = 0;
      }

      // Process existing data.
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];

         // Ensure that the element is still connected otherwise remove it from active list and continue.
         if (!data.el.isConnected)
         {
            AnimationManager.activeList.splice(cntr, 1);
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

            AnimationManager.activeList.splice(cntr, 1);
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

            AnimationManager.activeList.splice(cntr, 1);

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

      if (AnimationManager.activeList.length || AnimationManager.newList.length)
      {
         globalThis.requestAnimationFrame(AnimationManager.animate);
      }
      else
      {
         AnimationManager.animating = false;
      }
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
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];

         data.currentAnimationKeys.clear();
         data.finished = true;
         if (typeof data.resolve === 'function') { data.resolve(); }
      }

      for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
      {
         const data = AnimationManager.newList[cntr];

         data.currentAnimationKeys.clear();
         data.finished = true;
         if (typeof data.resolve === 'function') { data.resolve(); }
      }

      AnimationManager.activeList.length = 0;
      AnimationManager.newList.length = 0;
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
