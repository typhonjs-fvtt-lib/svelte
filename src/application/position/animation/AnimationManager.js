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
    * @type {number}
    */
   static current;

   /**
    * Add animation data.
    *
    * @param {object}   data -
    */
   static add(data)
   {
      const now = performance.now();

      // Offset start time by delta between last rAF time.
      data.start = now + (AnimationManager.current - now);

      AnimationManager.newList.push(data);
   }

   /**
    * Manage all animation
    */
   static animate()
   {
      const current = AnimationManager.current = performance.now();

      // Early out of the rAF callback when there are no current animations.
      if (AnimationManager.activeList.length === 0 && AnimationManager.newList.length === 0)
      {
         globalThis.requestAnimationFrame(AnimationManager.animate);
         return;
      }

      if (AnimationManager.newList.length)
      {
         // Process new data
         for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
         {
            AnimationManager.activeList.push(AnimationManager.newList[cntr]);
         }

         AnimationManager.newList.length = 0;
      }

      // Process existing data.
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];

         // Handle any animations that have been canceled.
         // Ensure that the element is still connected otherwise remove it from active list and continue.
         if (data.finished || !data.el.isConnected)
         {
            AnimationManager.activeList.splice(cntr, 1);
            data.cleanup(data);
            continue;
         }

         data.current = current - data.start;

         // Remove this animation instance.
         if (data.current >= data.duration)
         {
            // Prepare final update with end position data.
            for (let dataCntr = data.keys.length; --dataCntr >= 0;)
            {
               const key = data.keys[dataCntr];
               data.newData[key] = data.destination[key];
            }

            data.position.set(data.newData);

            AnimationManager.activeList.splice(cntr, 1);
            data.cleanup(data);

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

      globalThis.requestAnimationFrame(AnimationManager.animate);
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
         data.cleanup(data);
      }

      for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
      {
         const data = AnimationManager.newList[cntr];
         data.cleanup(data);
      }

      AnimationManager.activeList.length = 0;
      AnimationManager.newList.length = 0;
   }
}

// Start animation manager immediately. It constantly is running in background.
AnimationManager.animate();
