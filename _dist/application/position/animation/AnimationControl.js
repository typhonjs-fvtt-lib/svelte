export class AnimationControl
{
   /**
    * @type {Function}
    */
   #cancelCallback;

   /**
    * @type {Promise<void>}
    */
   #finishedPromise;

   constructor(cancelCallback, finishedPromise)
   {
      this.#cancelCallback = cancelCallback;
      this.#finishedPromise = finishedPromise;
   }

   get finished() { return this.#finishedPromise; }

   cancel()
   {
      this.#cancelCallback();
   }
}
