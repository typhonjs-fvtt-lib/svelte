/**
 * Provides a basic {@link TJSBasicAnimation} implementation for a Position animation for a group of Position instances.
 */
export class AnimationGroupControl
{
   /** @type {AnimationControl[]} */
   #animationControls;

   /** @type {Promise<Awaited<unknown>[]>} */
   #finishedPromise;

   /**
    * @param {AnimationControl[]} animationControls - An array of AnimationControl instances.
    */
   constructor(animationControls)
   {
      this.#animationControls = animationControls;
   }

   /**
    * Get a promise that resolves when all animations are finished.
    *
    * @returns {Promise<Awaited<unknown>[]>} Finished Promise for all animations.
    */
   get finished()
   {
      if (!(this.#finishedPromise instanceof Promise))
      {
         const promises = [];
         for (let cntr = this.#animationControls.length; --cntr >= 0;)
         {
            promises.push(this.#animationControls[cntr].finished)
         }

         this.#finishedPromise = Promise.all(promises);
      }

      return this.#finishedPromise;
   }

   /**
    * Cancels the all animations.
    */
   cancel()
   {
      const animationControls = this.#animationControls;

      if (animationControls === null || animationControls === void 0) { return; }

      for (let cntr = this.#animationControls.length; --cntr >= 0;)
      {
         this.#animationControls[cntr].cancel();
      }
   }
}
