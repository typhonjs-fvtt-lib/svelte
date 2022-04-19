import { nextAnimationFrame }    from '@typhonjs-fvtt/svelte/animate';

const s_MAP = new Map();
let s_PROMISE;

/**
 * Decouples updates to any parent target HTMLElement inline styles. Invoke {@link Position.elementUpdated} to await
 * on the returned promise that is resolved with the current render time via `nextAnimationFrame` /
 * `requestAnimationFrame`. This allows the underlying data model to be updated immediately while updates to the
 * element are in sync with the browser and potentially in the future be further throttled.
 *
 * @param {HTMLElement} el - The target HTMLElement.
 */
export class UpdateElementManager
{
   static get promise() { return s_PROMISE; }

   /**
    * Potentially adds the given element and callback to the map.
    *
    * @param {HTMLElement} el - An HTMLElement instance.
    *
    * @param {Function}    callback - The callback to invoke on next animation frame.
    *
    * @returns {Promise<number>} The unified next frame update promise. Returns `currentTime`.
    */
   static add(el, callback)
   {
      if (s_MAP.has(el)) { return s_PROMISE; }

      s_MAP.set(el, callback);

      if (!s_PROMISE) { s_PROMISE = this.wait(); }

      return s_PROMISE;
   }

   /**
    * Await on `nextAnimationFrame` and iterate over map invoking callback function.s
    *
    * @returns {Promise<number>} The next frame Promise / currentTime from nextAnimationFrame.
    */
   static async wait()
   {
      // Await the next animation frame. In the future this can be extended to multiple frames to divide update rate.
      const currentTime = await nextAnimationFrame();

      s_PROMISE = void 0;

      for (const el of s_MAP.keys()) { s_MAP.get(el)(el); }

      s_MAP.clear();

      return currentTime;
   }
}
