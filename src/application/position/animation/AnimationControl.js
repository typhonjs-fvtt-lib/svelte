/**
 * Provides a basic {@link TJSBasicAnimation} implementation for Position animation.
 */
class AnimationControl
{
   /** @type {object} */
   #animationData;

   /** @type {Promise<void>} */
   #finishedPromise;

   /**
    * Provides a static void / undefined AnimationControl that is automatically resolved.
    *
    * @returns {AnimationControl} Void AnimationControl
    */
   static get voidControl() { return s_VOID_CONTROL; }

   /**
    * @param {object|null} [animationData] - Animation data from {@link Position.animateTo}.
    *
    * @param {Promise}     [finishedPromise] - Promise that tracks animation finished state.
    */
   constructor(animationData, finishedPromise)
   {
      this.#animationData = typeof animationData === 'object' ? animationData : null;
      this.#finishedPromise = animationData === null ? Promise.resolve() : finishedPromise;
   }

   /**
    * Get a promise that resolves when animation is finished.
    *
    * @returns {Promise<void>}
    */
   get finished() { return this.#finishedPromise; }

   /**
    * Cancels the animation.
    */
   cancel()
   {
      const animationData = this.#animationData;

      if (animationData === null || animationData === void 0) { return; }

      const keys = animationData.keys;
      const currentAnimationKeys = animationData.currentAnimationKeys;

      // Immediately remove any keys from currentAnimationKeys / #currentAnimationKeys.
      for (let cntr = keys.length; --cntr >= 0;)
      {
         const key = keys[cntr];
         currentAnimationKeys.delete(key);
      }

      // Set finished state to true and this animation data instance will be removed from AnimationManager on next
      // update.
      animationData.finished = true;
   }
}

const s_VOID_CONTROL = new AnimationControl();

export { AnimationControl };
