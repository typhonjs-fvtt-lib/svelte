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
export class UpdateElementManagerOld
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
   static add(el, data)
   {
      if (s_MAP.has(el)) { return s_PROMISE; }

      s_MAP.set(el, data);

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

      for (const el of s_MAP.keys())
      {
         const updateData = s_MAP.get(el);

         // Early out if the element is no longer connected to the DOM / shadow root.
         if (!el.isConnected) { continue; }

         const changeSet = updateData.changeSet;
         const data = updateData.data;

         if (changeSet.zIndex)
         {
// console.log(`! Position - #updateElementNew - A`)
            el.style.zIndex = typeof data.zIndex === 'number' ? `${data.zIndex}` : null;
         }

         if (changeSet.width)
         {
// console.log(`! Position - #updateElementNew - B`)
            el.style.width = typeof data.width === 'number' ? `${data.width}px` : data.width;
         }

         if (changeSet.height)
         {
// console.log(`! Position - #updateElementNew - C`)
            el.style.height = typeof data.height === 'number' ? `${data.height}px` : data.height;
         }

         if (changeSet.transformOrigin)
         {
// console.log(`! Position - #updateElementNew - D`)

            // When set to 'center' we can simply set the transform to null which is center by default.
            el.style.transformOrigin = data.transformOrigin === 'center' ? null : data.transformOrigin;
         }

         // Update all transforms in order added to transforms object.
         if (changeSet.left || changeSet.top || changeSet.transform)
         {
// console.log(`! Position - #updateElementNew - E`)

// const css = this.#transforms.getCSSOrtho(data);
// console.log(css);
// console.log(`! Position - #updateElementNew - data.left: ${data.left}; data.top: ${data.top}`)

            el.style.transform = updateData.transforms.getCSSOrtho(data);
         }

         // If calculate transform options is enabled then update the transform data and set the readable store.
         if (updateData.calculateTransform)
         {
// console.log(`! Position - #updateElementNew - F`)
            updateData.updateTransform(el, data);
         }

         // Update all subscribers with changed data.
         updateData.updateSubscribers(data, changeSet);
      }

      s_MAP.clear();

      return currentTime;
   }
}
