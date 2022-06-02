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
    * Defines a static empty / void animation control.
    *
    * @type {AnimationGroupControl}
    */
   static #voidControl = new AnimationGroupControl(null);

   /**
    * Provides a static void / undefined AnimationGroupControl that is automatically resolved.
    *
    * @returns {AnimationGroupControl} Void AnimationGroupControl
    */
   static get voidControl() { return this.#voidControl; }

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
    * @returns {Promise<Awaited<unknown>[]>|Promise<void>} Finished Promise for all animations.
    */
   get finished()
   {
      const animationControls = this.#animationControls;

      if (animationControls === null || animationControls === void 0) { return Promise.resolve(); }

      if (!(this.#finishedPromise instanceof Promise))
      {
         const promises = [];
         for (let cntr = animationControls.length; --cntr >= 0;)
         {
            promises.push(animationControls[cntr].finished);
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
