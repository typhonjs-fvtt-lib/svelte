import { linear }             from 'svelte/easing';

import { lerp }               from '@typhonjs-fvtt/svelte/math';
import { isObject }           from '@typhonjs-fvtt/svelte/util';

import { AnimationControl }   from './AnimationControl.js';
import { AnimationManager }   from './AnimationManager.js';

export class AnimationAPI
{
   /** @type {PositionData} */
   #data;

   /** @type {Position} */
   #position;

   /**
    * Tracks the number of animation control instances that are active.
    *
    * @type {number}
    */
   #instanceCount = 0;

   /**
    * Provides a bound function to pass as data to AnimationManager to invoke
    *
    * @type {Function}
    * @see {AnimationAPI.#cleanupInstance}
    */
   #cleanup;

   constructor(position, data)
   {
      this.#position = position;
      this.#data = data;

      this.#cleanup = this.#cleanupInstance.bind(this);
   }

   /**
    * Returns whether there are active animation instances for this Position.
    *
    * @returns {boolean} Are there active animation instances.
    */
   get isActive()
   {
      return this.#instanceCount > 0;
   }

   /**
    * Cancels all animation instances for this Position instance.
    */
   cancel()
   {
      AnimationManager.cancel(this.#position);
   }

   /**
    * Cleans up an animation instance.
    *
    * @param {object}   data - Animation data for an animation instance.
    */
   #cleanupInstance(data)
   {
      this.#instanceCount--;

      data.active = false;

      if (typeof data.resolve === 'function') { data.resolve(data.cancelled); }
   }

   /**
    * Provides animation
    *
    * @param {PositionDataExtended} toData - The destination position.
    *
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {number}         [opts.delay] - Delay in seconds before animation starts.
    *
    * @param {number}         [opts.duration] - Duration in seconds.
    *
    * @param {Function}       [opts.ease=linear] - Easing function.
    *
    * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {TJSBasicAnimation}  A control object that can cancel animation and provides a `finished` Promise.
    */
   to(toData, { delay = 0, duration = 1, ease = linear, interpolate = lerp } = {})
   {
      if (!isObject(toData))
      {
         throw new TypeError(`Position.animate.to error: 'toData' is not an object.`);
      }

      const parent = this.#position.parent;

      // Early out if the application is not positionable.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return AnimationControl.voidControl;
      }

      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      if (!el) { return AnimationControl.voidControl; }

      if (!Number.isFinite(duration) || duration < 0)
      {
         throw new TypeError(`Position.animate.to error: 'duration' is not a positive number.`);
      }

      if (typeof ease !== 'function')
      {
         throw new TypeError(`Position.animate.to error: 'ease' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`Position.animate.to error: 'interpolate' is not a function.`);
      }

      const initial = {};
      const destination = {};

      const data = this.#data;

      // Set initial data if the key / data is defined and the end position is not equal to current data.
      for (const key in toData)
      {
         if (data[key] !== void 0 && toData[key] !== data[key])
         {
            destination[key] = toData[key];
            initial[key] = data[key];
         }
      }

      // Set initial data for transform values that are often null by default.
      if (initial.rotateX === null) { initial.rotateX = 0; }
      if (initial.rotateY === null) { initial.rotateY = 0; }
      if (initial.rotateZ === null) { initial.rotateZ = 0; }
      if (initial.translateX === null) { initial.translateX = 0; }
      if (initial.translateY === null) { initial.translateY = 0; }
      if (initial.translateZ === null) { initial.translateZ = 0; }
      if (initial.scale === null) { initial.scale = 1; }

      if (destination.rotateX === null) { destination.rotateX = 0; }
      if (destination.rotateY === null) { destination.rotateY = 0; }
      if (destination.rotateZ === null) { destination.rotateZ = 0; }
      if (destination.translateX === null) { destination.translateX = 0; }
      if (destination.translateY === null) { destination.translateY = 0; }
      if (destination.translateZ === null) { destination.translateZ = 0; }
      if (destination.scale === null) { destination.scale = 1; }

      // Reject all initial data that is not a number or is current animating.
      for (const key in initial)
      {
         if (!Number.isFinite(initial[key])) { delete initial[key]; }
      }

      const keys = Object.keys(initial);
      const newData = Object.assign({ immediateElementUpdate: true }, initial);

      // Nothing to animate, so return now.
      if (keys.length === 0) { return AnimationControl.voidControl; }

      const animationData = {
         active: true,
         cleanup: this.#cleanup,
         cancelled: false,
         current: 0,
         destination,
         duration: duration * 1000, // Internally the AnimationManager works in ms.
         ease,
         el,
         initial,
         interpolate,
         keys,
         newData,
         position: this.#position,
         resolve: void 0,
         start: void 0
      };

      if (Number.isFinite(delay) && delay > 0)
      {
         // Delay w/ setTimeout and schedule w/ AnimationManager if not already canceled
         setTimeout(() =>
         {
            if (!animationData.cancelled)
            {
               this.#instanceCount++;
               AnimationManager.add(animationData);
            }
            else
            {
               // Need to increment instanceCount even though it was cancelled as cleanupInstance will decrement the
               // count.
               this.#instanceCount++;

               this.#cleanupInstance(animationData);
            }
         }, delay * 1000);
      }
      else
      {
         // Schedule immediately w/ AnimationManager
         this.#instanceCount++;
         AnimationManager.add(animationData);
      }

      // Create animation control
      return new AnimationControl(animationData, true);
   }
}
