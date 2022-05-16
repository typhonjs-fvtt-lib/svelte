class AnimationControl
{
   #animationData;

   /**
    * @type {Promise<void>}
    */
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

   get finished() { return this.#finishedPromise; }

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

// export class AnimationControl
// {
//    /**
//     * @type {Function}
//     */
//    #cancelCallback;
//
//    /**
//     * @type {Promise<void>}
//     */
//    #finishedPromise;
//
//    constructor(cancelCallback, finishedPromise)
//    {
//       this.#cancelCallback = cancelCallback;
//       this.#finishedPromise = finishedPromise;
//    }
//
//    get finished() { return this.#finishedPromise; }
//
//    cancel()
//    {
//       this.#cancelCallback();
//    }
// }
