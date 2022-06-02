/**
 * Provides a basic {@link TJSBasicAnimation} implementation for Position animation.
 */
export class AnimationControl
{
   /** @type {object} */
   #animationData;

   /** @type {Promise<void>} */
   #finishedPromise;

   #willFinish;

   /**
    * Defines a static empty / void animation control.
    *
    * @type {AnimationControl}
    */
   static #voidControl = new AnimationControl(null);

   /**
    * Provides a static void / undefined AnimationControl that is automatically resolved.
    *
    * @returns {AnimationControl} Void AnimationControl
    */
   static get voidControl() { return this.#voidControl; }

   /**
    * @param {object|null} [animationData] - Animation data from {@link AnimationAPI}.
    *
    * @param {boolean}     [willFinish] - Promise that tracks animation finished state.
    */
   constructor(animationData, willFinish = false)
   {
      this.#animationData = animationData;
      this.#willFinish = willFinish;
   }

   /**
    * Get a promise that resolves when animation is finished.
    *
    * @returns {Promise<void>}
    */
   get finished()
   {
      if (!(this.#finishedPromise instanceof Promise))
      {
         this.#finishedPromise = this.#willFinish ? new Promise((resolve) => this.#animationData.resolve = resolve) :
          Promise.resolve();
      }

      return this.#finishedPromise;
   }

   /**
    * Returns whether this animation is currently active / animating.
    *
    * @returns {boolean} Animation active state.
    */
   get isActive() { return this.#animationData.active; }

   /**
    * Cancels the animation.
    */
   cancel()
   {
      const animationData = this.#animationData;

      if (animationData === null || animationData === void 0) { return; }

      // Set cancelled state to true and this animation data instance will be removed from AnimationManager on next
      // update.
      animationData.cancelled = true;
   }
}
