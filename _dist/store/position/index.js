import { propertyStore, subscribeIgnoreFirst } from '@typhonjs-fvtt/svelte/store';
import { isObject, isPlainObject, isIterable, hasSetter } from '@typhonjs-svelte/runtime-base/util/object';
import { cubicOut, linear } from 'svelte/easing';
import { lerp } from '@typhonjs-svelte/runtime-base/math/interpolate';
import { writable } from 'svelte/store';
import { StyleParse } from '@typhonjs-svelte/runtime-base/util/browser';
import { Vec3, Mat4 } from '@typhonjs-svelte/runtime-base/math/gl-matrix';
import { nextAnimationFrame } from '@typhonjs-fvtt/svelte/animate';
import { degToRad, clamp } from '@typhonjs-svelte/runtime-base/math/util';

/**
 * Provides a TJSBasicAnimation implementation for TJSPosition animation.
 */
class AnimationControl
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

      // Set this control to animation data.
      if (isObject(animationData)) { animationData.control = this; }
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
    * Note: a delayed animation may not be started / active yet. Use {@link AnimationControl.isFinished} to determine
    * if an animation is actually finished.
    *
    * @returns {boolean} Animation active state.
    */
   get isActive() { return this.#animationData.active; }

   /**
    * Returns whether this animation is completely finished.
    *
    * @returns {boolean} Animation finished state.
    */
   get isFinished() { return this.#animationData.finished; }

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

/**
 * Provides animation management and scheduling allowing all TJSPosition instances to utilize one micro-task.
 */
class AnimationManager
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

      // Offset start time by delta between last rAF time. This allows continuous tween cycles to appear naturally as
      // starting from the instant they are added to the AnimationManager. This is what makes `draggable` smooth when
      // easing is enabled.
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
            const data = AnimationManager.newList[cntr];

            // If animation instance has been cancelled before start then remove it from new list and cleanup.
            if (data.cancelled)
            {
               AnimationManager.newList.splice(cntr, 1);
               data.cleanup(data);
            }

            // If data is active then process it now. Delayed animations start with `active` false.
            if (data.active)
            {
               // Remove from new list and add to active list.
               AnimationManager.newList.splice(cntr, 1);
               AnimationManager.activeList.push(data);
            }
         }
      }

      // Process active animations.
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];

         // Remove any animations that have been canceled.
         // Ensure that the element is still connected otherwise remove it from active list and continue.
         if (data.cancelled || (data.el !== void 0 && !data.el.isConnected))
         {
            AnimationManager.activeList.splice(cntr, 1);
            data.cleanup(data);
            continue;
         }

         data.current = current - data.start;

         // Remove this animation instance if current animating time exceeds duration.
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

         // Apply easing to create an eased time.
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
    * Cancels all animations for given TJSPosition instance.
    *
    * @param {import('../').TJSPosition} position - TJSPosition instance.
    */
   static cancel(position)
   {
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];
         if (data.position === position)
         {
            AnimationManager.activeList.splice(cntr, 1);
            data.cancelled = true;
            data.cleanup(data);
         }
      }

      for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
      {
         const data = AnimationManager.newList[cntr];
         if (data.position === position)
         {
            AnimationManager.newList.splice(cntr, 1);
            data.cancelled = true;
            data.cleanup(data);
         }
      }
   }

   /**
    * Cancels all active and delayed animations.
    */
   static cancelAll()
   {
      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];
         data.cancelled = true;
         data.cleanup(data);
      }

      for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
      {
         const data = AnimationManager.newList[cntr];
         data.cancelled = true;
         data.cleanup(data);
      }

      AnimationManager.activeList.length = 0;
      AnimationManager.newList.length = 0;
   }

   /**
    * Gets all {@link AnimationControl} instances for a given TJSPosition instance.
    *
    * @param {import('../').TJSPosition} position - TJSPosition instance.
    *
    * @returns {import('./AnimationControl').AnimationControl[]} All scheduled AnimationControl instances for the given
    *          TJSPosition instance.
    */
   static getScheduled(position)
   {
      const results = [];

      for (let cntr = AnimationManager.activeList.length; --cntr >= 0;)
      {
         const data = AnimationManager.activeList[cntr];
         if (data.position === position)
         {
            results.push(data.control);
         }
      }

      for (let cntr = AnimationManager.newList.length; --cntr >= 0;)
      {
         const data = AnimationManager.newList[cntr];
         if (data.position === position)
         {
            results.push(data.control);
         }
      }

      return results;
   }
}

// Start animation manager immediately. It constantly is running in background.
AnimationManager.animate();

/**
 * Stores the TJSPositionData properties that can be animated.
 *
 * @type {Set<string>}
 */
const animateKeys = new Set([
   // Main keys
   'left', 'top', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'width', 'height',
   'rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ', 'zIndex',

   // Aliases
   'rotation'
]);

/**
 * Defines the keys of TJSPositionData that are transform keys.
 *
 * @type {string[]}
 */
const transformKeys = ['rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ'];

Object.freeze(transformKeys);

/**
 * Parses a relative value string in the form of '+=', '-=', or '*=' and float / numeric value. IE '+=0.2'.
 *
 * @type {RegExp}
 */
const relativeRegex = /^([-+*])=(-?[\d]*\.?[\d]+)$/;

/**
 * Provides numeric defaults for all parameters. This is used by {@link TJSPosition.get} to optionally provide
 * numeric defaults.
 *
 * @type {{rotation: number, scale: number, minWidth: null, minHeight: null, translateZ: number, top: number, left: number, maxHeight: null, translateY: number, translateX: number, width: number, transformOrigin: null, rotateX: number, rotateY: number, height: number, maxWidth: null, zIndex: null, rotateZ: number}}
 */
const numericDefaults = {
   // Other keys
   height: 0,
   left: 0,
   maxHeight: null,
   maxWidth: null,
   minHeight: null,
   minWidth: null,
   top: 0,
   transformOrigin: null,
   width: 0,
   zIndex: null,

   rotateX: 0,
   rotateY: 0,
   rotateZ: 0,
   scale: 1,
   translateX: 0,
   translateY: 0,
   translateZ: 0,

   rotation: 0
};

Object.freeze(numericDefaults);

/**
 * Sets numeric defaults for a {@link TJSPositionData} like object.
 *
 * @param {object}   data - A TJSPositionData like object.
 */
function setNumericDefaults(data)
{
   // Transform keys
   if (data.rotateX === null) { data.rotateX = 0; }
   if (data.rotateY === null) { data.rotateY = 0; }
   if (data.rotateZ === null) { data.rotateZ = 0; }
   if (data.translateX === null) { data.translateX = 0; }
   if (data.translateY === null) { data.translateY = 0; }
   if (data.translateZ === null) { data.translateZ = 0; }
   if (data.scale === null) { data.scale = 1; }

   // Aliases
   if (data.rotation === null) { data.rotation = 0; }
}

/**
 * Defines bitwise keys for transforms used in {@link TJSTransforms.getMat4}.
 *
 * @type {object}
 */
const transformKeysBitwise = {
   rotateX: 1,
   rotateY: 2,
   rotateZ: 4,
   scale: 8,
   translateX: 16,
   translateY: 32,
   translateZ: 64
};

Object.freeze(transformKeysBitwise);

/**
 * Defines the default transform origin.
 *
 * @type {string}
 */
const transformOriginDefault = 'top left';

/**
 * Defines the valid transform origins.
 *
 * @type {string[]}
 */
const transformOrigins = ['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left',
 'bottom center', 'bottom right'];

Object.freeze(transformOrigins);

/**
 * Converts any relative string values for animatable keys to actual updates performed against current data.
 *
 * @param {import('./').TJSPositionDataExtended}    positionData - position data.
 *
 * @param {import('./').TJSPosition | import('./').TJSPositionData}   position - The source position instance.
 */
function convertRelative(positionData, position)
{
   for (const key in positionData)
   {
      // Key is animatable / numeric.
      if (animateKeys.has(key))
      {
         const value = positionData[key];

         if (typeof value !== 'string') { continue; }

         // Ignore 'auto' and 'inherit' string values.
         if (value === 'auto' || value === 'inherit') { continue; }

         const regexResults = relativeRegex.exec(value);

         if (!regexResults)
         {
            throw new Error(
             `convertRelative error: malformed relative key (${key}) with value (${value})`);
         }

         const current = position[key];

         switch (regexResults[1])
         {
            case '-':
               positionData[key] = current - parseFloat(regexResults[2]);
               break;

            case '+':
               positionData[key] = current + parseFloat(regexResults[2]);
               break;

            case '*':
               positionData[key] = current * parseFloat(regexResults[2]);
               break;
         }
      }
   }
}

class AnimationAPI
{
   /** @type {import('../').TJSPositionData} */
   #data;

   /** @type {import('../').TJSPosition} */
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

   /**
    * @param {import('../').TJSPosition}       position -
    *
    * @param {import('../').TJSPositionData}   data -
    */
   constructor(position, data)
   {
      this.#position = position;
      this.#data = data;

      this.#cleanup = this.#cleanupInstance.bind(this);
   }

   /**
    * Returns whether there are scheduled animations whether active or delayed for this TJSPosition.
    *
    * @returns {boolean} Are there active animation instances.
    */
   get isScheduled()
   {
      return this.#instanceCount > 0;
   }

   /**
    * Adds / schedules an animation w/ the AnimationManager. This contains the final steps common to all tweens.
    *
    * @param {object}      initial -
    *
    * @param {object}      destination -
    *
    * @param {number}      duration -
    *
    * @param {HTMLElement} el -
    *
    * @param {number}      delay -
    *
    * @param {Function}    ease -
    *
    * @param {Function}    interpolate -
    *
    * @returns {AnimationControl} The associated animation control.
    */
   #addAnimation(initial, destination, duration, el, delay, ease, interpolate)
   {
      // Set initial data for transform values that are often null by default.
      setNumericDefaults(initial);
      setNumericDefaults(destination);

      // Reject all initial data that is not a number.
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
         control: void 0,
         current: 0,
         destination,
         duration: duration * 1000, // Internally the AnimationManager works in ms.
         ease,
         el,
         finished: false,
         initial,
         interpolate,
         keys,
         newData,
         position: this.#position,
         resolve: void 0,
         start: void 0
      };

      if (delay > 0)
      {
         animationData.active = false;

         // Delay w/ setTimeout and schedule w/ AnimationManager if not already canceled
         setTimeout(() =>
         {
            if (!animationData.cancelled)
            {
               animationData.active = true;

               const now = performance.now();

               // Offset start time by delta between last rAF time. This allows a delayed tween to start from the
               // precise delayed time.
               animationData.start = now + (AnimationManager.current - now);
            }
         }, delay * 1000);
      }

      // Schedule immediately w/ AnimationManager
      this.#instanceCount++;
      AnimationManager.add(animationData);

      // Create animation control
      return new AnimationControl(animationData, true);
   }

   /**
    * Cancels all animation instances for this TJSPosition instance.
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
      data.finished = true;

      if (typeof data.resolve === 'function') { data.resolve(data.cancelled); }
   }

   /**
    * Returns all currently scheduled AnimationControl instances for this TJSPosition instance.
    *
    * @returns {AnimationControl[]} All currently scheduled animation controls for this TJSPosition instance.
    */
   getScheduled()
   {
      return AnimationManager.getScheduled(this.#position);
   }

   /**
    * Provides a tween from given position data to the current position.
    *
    * @param {import('../').TJSPositionDataExtended} fromData - The starting position.
    *
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
    *
    * @param {number}         [opts.duration=1] - Duration in seconds.
    *
    * @param {Function}       [opts.ease=cubicOut] - Easing function.
    *
    * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
    */
   from(fromData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp } = {})
   {
      if (!isObject(fromData))
      {
         throw new TypeError(`AnimationAPI.from error: 'fromData' is not an object.`);
      }

      const position = this.#position;
      const parent = position.parent;

      // Early out if the application is not positionable.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return AnimationControl.voidControl;
      }

      // Cache any target element allowing AnimationManager to stop animation if it becomes disconnected from DOM.
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      if (!Number.isFinite(delay) || delay < 0)
      {
         throw new TypeError(`AnimationAPI.from error: 'delay' is not a positive number.`);
      }

      if (!Number.isFinite(duration) || duration < 0)
      {
         throw new TypeError(`AnimationAPI.from error: 'duration' is not a positive number.`);
      }

      if (typeof ease !== 'function')
      {
         throw new TypeError(`AnimationAPI.from error: 'ease' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`AnimationAPI.from error: 'interpolate' is not a function.`);
      }

      const initial = {};
      const destination = {};

      const data = this.#data;

      // Set initial data if the key / data is defined and the end position is not equal to current data.
      for (const key in fromData)
      {
         if (data[key] !== void 0 && fromData[key] !== data[key])
         {
            initial[key] = fromData[key];
            destination[key] = data[key];
         }
      }

      convertRelative(initial, data);

      return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
   }

   /**
    * Provides a tween from given position data to the current position.
    *
    * @param {import('../').TJSPositionDataExtended} fromData - The starting position.
    *
    * @param {import('../').TJSPositionDataExtended} toData - The ending position.
    *
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
    *
    * @param {number}         [opts.duration=1] - Duration in seconds.
    *
    * @param {Function}       [opts.ease=cubicOut] - Easing function.
    *
    * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
    */
   fromTo(fromData, toData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp } = {})
   {
      if (!isObject(fromData))
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'fromData' is not an object.`);
      }

      if (!isObject(toData))
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'toData' is not an object.`);
      }

      const parent = this.#position.parent;

      // Early out if the application is not positionable.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return AnimationControl.voidControl;
      }

      // Cache any target element allowing AnimationManager to stop animation if it becomes disconnected from DOM.
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      if (!Number.isFinite(delay) || delay < 0)
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'delay' is not a positive number.`);
      }

      if (!Number.isFinite(duration) || duration < 0)
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'duration' is not a positive number.`);
      }

      if (typeof ease !== 'function')
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'ease' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`AnimationAPI.fromTo error: 'interpolate' is not a function.`);
      }

      const initial = {};
      const destination = {};

      const data = this.#data;

      // Set initial data if the key / data is defined and the end position is not equal to current data.
      for (const key in fromData)
      {
         if (toData[key] === void 0)
         {
            console.warn(
             `AnimationAPI.fromTo warning: key ('${key}') from 'fromData' missing in 'toData'; skipping this key.`);
            continue;
         }

         if (data[key] !== void 0)
         {
            initial[key] = fromData[key];
            destination[key] = toData[key];
         }
      }

      convertRelative(initial, data);
      convertRelative(destination, data);

      return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
   }

   /**
    * Provides a tween to given position data from the current position.
    *
    * @param {import('../').TJSPositionDataExtended} toData - The destination position.
    *
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
    *
    * @param {number}         [opts.duration=1] - Duration in seconds.
    *
    * @param {Function}       [opts.ease=cubicOut] - Easing function.
    *
    * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
    */
   to(toData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp } = {})
   {
      if (!isObject(toData))
      {
         throw new TypeError(`AnimationAPI.to error: 'toData' is not an object.`);
      }

      const parent = this.#position.parent;

      // Early out if the application is not positionable.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return AnimationControl.voidControl;
      }

      // Cache any target element allowing AnimationManager to stop animation if it becomes disconnected from DOM.
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      if (!Number.isFinite(delay) || delay < 0)
      {
         throw new TypeError(`AnimationAPI.to error: 'delay' is not a positive number.`);
      }

      if (!Number.isFinite(duration) || duration < 0)
      {
         throw new TypeError(`AnimationAPI.to error: 'duration' is not a positive number.`);
      }

      if (typeof ease !== 'function')
      {
         throw new TypeError(`AnimationAPI.to error: 'ease' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`AnimationAPI.to error: 'interpolate' is not a function.`);
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

      convertRelative(destination, data);

      return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
   }

   /**
    * Returns a function that provides an optimized way to constantly update a to-tween.
    *
    * @param {Iterable<string>}  keys - The keys for quickTo.
    *
    * @param {object}            [opts] - Optional parameters.
    *
    * @param {number}            [opts.duration=1] - Duration in seconds.
    *
    * @param {Function}          [opts.ease=cubicOut] - Easing function.
    *
    * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {import('../').quickToCallback} quick-to tween function.
    */
   quickTo(keys, { duration = 1, ease = cubicOut, interpolate = lerp } = {})
   {
      if (!isIterable(keys))
      {
         throw new TypeError(`AnimationAPI.quickTo error: 'keys' is not an iterable list.`);
      }

      const parent = this.#position.parent;

      // Early out if the application is not positionable.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         throw new Error(`AnimationAPI.quickTo error: 'parent' is not positionable.`);
      }

      if (!Number.isFinite(duration) || duration < 0)
      {
         throw new TypeError(`AnimationAPI.quickTo error: 'duration' is not a positive number.`);
      }

      if (typeof ease !== 'function')
      {
         throw new TypeError(`AnimationAPI.quickTo error: 'ease' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`AnimationAPI.quickTo error: 'interpolate' is not a function.`);
      }

      const initial = {};
      const destination = {};

      const data = this.#data;

      // Set initial data if the key / data is defined and the end position is not equal to current data.
      for (const key of keys)
      {
         if (typeof key !== 'string')
         {
            throw new TypeError(`AnimationAPI.quickTo error: key is not a string.`);
         }

         if (!animateKeys.has(key))
         {
            throw new Error(`AnimationAPI.quickTo error: key ('${key}') is not animatable.`);
         }

         if (data[key] !== void 0)
         {
            destination[key] = data[key];
            initial[key] = data[key];
         }
      }

      const keysArray = [...keys];

      Object.freeze(keysArray);

      const newData = Object.assign({ immediateElementUpdate: true }, initial);

      const animationData = {
         active: true,
         cleanup: this.#cleanup,
         cancelled: false,
         control: void 0,
         current: 0,
         destination,
         duration: duration * 1000, // Internally the AnimationManager works in ms.
         ease,
         el: void 0,
         finished: true, // Note: start in finished state to add to AnimationManager on first callback.
         initial,
         interpolate,
         keys,
         newData,
         position: this.#position,
         resolve: void 0,
         start: void 0
      };

      const quickToCB = (...args) =>
      {
         const argsLength = args.length;

         if (argsLength === 0) { return; }

         for (let cntr = keysArray.length; --cntr >= 0;)
         {
            const key = keysArray[cntr];
            if (data[key] !== void 0) { initial[key] = data[key]; }
         }

         // Handle case where the first arg is an object. Update all quickTo keys from data contained in the object.
         if (isObject(args[0]))
         {
            const objData = args[0];

            for (const key in objData)
            {
               if (destination[key] !== void 0) { destination[key] = objData[key]; }
            }
         }
         else // Assign each variable argument to the key specified in the initial `keys` array above.
         {
            for (let cntr = 0; cntr < argsLength && cntr < keysArray.length; cntr++)
            {
               const key = keysArray[cntr];
               if (destination[key] !== void 0) { destination[key] = args[cntr]; }
            }
         }

         convertRelative(destination, data);

         // Set initial data for transform values that are often null by default.
         setNumericDefaults(initial);
         setNumericDefaults(destination);

         // Set target element to animation data to track if it is removed from the DOM hence ending the animation.
         const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
         animationData.el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

         // Reschedule the quickTo animation with AnimationManager as it is finished.
         if (animationData.finished)
         {
            animationData.finished = false;
            animationData.active = true;
            animationData.current = 0;

            this.#instanceCount++;
            AnimationManager.add(animationData);
         }
         else // QuickTo animation is currently scheduled w/ AnimationManager so reset start and current time.
         {
            const now = performance.now();

            // Offset start time by delta between last rAF time. This allows a delayed tween to start from the
            // precise delayed time.
            animationData.start = now + (AnimationManager.current - now);
            animationData.current = 0;
         }
      };

      quickToCB.keys = keysArray;

      /**
       * Sets options of quickTo tween.
       *
       * @param {object}            [opts] - Optional parameters.
       *
       * @param {number}            [opts.duration] - Duration in seconds.
       *
       * @param {Function}          [opts.ease] - Easing function.
       *
       * @param {Function}          [opts.interpolate] - Interpolation function.
       *
       * @returns {import('../').quickToCallback} The quickTo callback.
       */
      quickToCB.options = ({ duration, ease, interpolate } = {}) => // eslint-disable-line no-shadow
      {
         if (duration !== void 0 && (!Number.isFinite(duration) || duration < 0))
         {
            throw new TypeError(`AnimationAPI.quickTo.options error: 'duration' is not a positive number.`);
         }

         if (ease !== void 0 && typeof ease !== 'function')
         {
            throw new TypeError(`AnimationAPI.quickTo.options error: 'ease' is not a function.`);
         }

         if (interpolate !== void 0 && typeof interpolate !== 'function')
         {
            throw new TypeError(`AnimationAPI.quickTo.options error: 'interpolate' is not a function.`);
         }

         if (duration >= 0) { animationData.duration = duration * 1000; }
         if (ease) { animationData.ease = ease; }
         if (interpolate) { animationData.interpolate = interpolate; }

         return quickToCB;
      };

      return quickToCB;
   }
}

/**
 * Provides a TJSBasicAnimation implementation for a TJSPosition animation for a group of TJSPosition instances.
 */
class AnimationGroupControl
{
   /** @type {import('./AnimationControl').AnimationControl[]} */
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
    * @param {import('./AnimationControl').AnimationControl[]} animationControls - An array of AnimationControl
    *        instances.
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
    * Returns whether there are active animation instances for this group.
    *
    * Note: a delayed animation may not be started / active yet. Use {@link AnimationGroupControl.isFinished} to
    * determine if all animations in the group are finished.
    *
    * @returns {boolean} Are there active animation instances.
    */
   get isActive()
   {
      const animationControls = this.#animationControls;

      if (animationControls === null || animationControls === void 0) { return false; }

      for (let cntr = animationControls.length; --cntr >= 0;)
      {
         if (animationControls[cntr].isActive) { return true; }
      }

      return false;
   }

   /**
    * Returns whether all animations in the group are finished.
    *
    * @returns {boolean} Are all animation instances finished.
    */
   get isFinished()
   {
      const animationControls = this.#animationControls;

      if (animationControls === null || animationControls === void 0) { return true; }

      for (let cntr = animationControls.length; --cntr >= 0;)
      {
         if (!animationControls[cntr].isFinished) { return false; }
      }

      return false;
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

/**
 * Provides a public API for grouping multiple {@link TJSPosition} animations together with the AnimationManager.
 *
 * Note: To remove cyclic dependencies as this class provides the TJSPosition static / group Animation API `instanceof`
 * checks are not done against TJSPosition. Instead, a check for the animate property being an instanceof
 * {@link AnimationAPI} is performed in {@link AnimationGroupAPI.#isPosition}.
 *
 * @see AnimationAPI
 */
class AnimationGroupAPI
{
   /**
    * Checks of the given object is a TJSPosition instance by checking for AnimationAPI.
    *
    * @param {*}  object - Any data.
    *
    * @returns {boolean} Is TJSPosition.
    */
   static #isPosition(object)
   {
      return isObject(object) && object.animate instanceof AnimationAPI;
   }

   /**
    * Cancels any animation for given TJSPosition data.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    */
   static cancel(position)
   {
      if (isIterable(position))
      {
         let index = -1;

         for (const entry of position)
         {
            index++;

            const actualPosition = this.#isPosition(entry) ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.cancel warning: No Position instance found at index: ${index}.`);
               continue;
            }

            AnimationManager.cancel(actualPosition);
         }
      }
      else
      {
         const actualPosition = this.#isPosition(position) ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.cancel warning: No Position instance found.`);
            return;
         }

         AnimationManager.cancel(actualPosition);
      }
   }

   /**
    * Cancels all TJSPosition animation.
    */
   static cancelAll() { AnimationManager.cancelAll(); }

   /**
    * Gets all animation controls for the given position data.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    *
    * @returns {{ position: import('../').TJSPosition, data: object | void, controls: import('./AnimationControl').AnimationControl[]}[]} Results array.
    */
   static getScheduled(position)
   {
      const results = [];

      if (isIterable(position))
      {
         let index = -1;

         for (const entry of position)
         {
            index++;

            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found at index: ${index}.`);
               continue;
            }

            const controls = AnimationManager.getScheduled(actualPosition);

            results.push({ position: actualPosition, data: isPosition ? void 0 : entry, controls });
         }
      }
      else
      {
         const isPosition = this.#isPosition(position);
         const actualPosition = isPosition ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found.`);
            return results;
         }

         const controls = AnimationManager.getScheduled(actualPosition);

         results.push({ position: actualPosition, data: isPosition ? void 0 : position, controls });
      }

      return results;
   }

   /**
    * Provides the `from` animation tween for one or more TJSPosition instances as a group.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    *
    * @param {object|Function}   fromData -
    *
    * @param {object|Function}   options -
    *
    * @returns {import('#svelte-lib/animate').TJSBasicAnimation} Basic animation control.
    */
   static from(position, fromData, options)
   {
      if (!isObject(fromData) && typeof fromData !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.from error: 'fromData' is not an object or function.`);
      }

      if (options !== void 0 && !isObject(options) && typeof options !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.from error: 'options' is not an object or function.`);
      }

      /**
       * @type {import('./AnimationControl').AnimationControl[]}
       */
      const animationControls = [];

      let index = -1;
      let callbackOptions;

      const hasDataCallback = typeof fromData === 'function';
      const hasOptionCallback = typeof options === 'function';
      const hasCallback = hasDataCallback || hasOptionCallback;

      if (hasCallback) { callbackOptions = { index, position: void 0, data: void 0 }; }

      let actualFromData = fromData;
      let actualOptions = options;

      if (isIterable(position))
      {
         for (const entry of position)
         {
            index++;

            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.from warning: No Position instance found at index: ${index}.`);
               continue;
            }

            if (hasCallback)
            {
               callbackOptions.index = index;
               callbackOptions.position = position;
               callbackOptions.data = isPosition ? void 0 : entry;
            }

            if (hasDataCallback)
            {
               actualFromData = fromData(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualFromData === null || actualFromData === void 0) { continue; }

               if (typeof actualFromData !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.from error: fromData callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            if (hasOptionCallback)
            {
               actualOptions = options(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualOptions === null || actualOptions === void 0) { continue; }

               if (typeof actualOptions !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.from error: options callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
         }
      }
      else
      {
         const isPosition = this.#isPosition(position);
         const actualPosition = isPosition ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.from warning: No Position instance found.`);
            return AnimationGroupControl.voidControl;
         }

         if (hasCallback)
         {
            callbackOptions.index = 0;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : position;
         }

         if (hasDataCallback)
         {
            actualFromData = fromData(callbackOptions);

            if (typeof actualFromData !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.from error: fromData callback function failed to return an object.`);
            }
         }

         if (hasOptionCallback)
         {
            actualOptions = options(callbackOptions);

            if (typeof actualOptions !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.from error: options callback function failed to return an object.`);
            }
         }

         animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
      }

      return new AnimationGroupControl(animationControls);
   }

   /**
    * Provides the `fromTo` animation tween for one or more TJSPosition instances as a group.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    *
    * @param {object|Function}   fromData -
    *
    * @param {object|Function}   toData -
    *
    * @param {object|Function}   options -
    *
    * @returns {import('#svelte-lib/animate').TJSBasicAnimation} Basic animation control.
    */
   static fromTo(position, fromData, toData, options)
   {
      if (!isObject(fromData) && typeof fromData !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.fromTo error: 'fromData' is not an object or function.`);
      }

      if (!isObject(toData) && typeof toData !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.fromTo error: 'toData' is not an object or function.`);
      }

      if (options !== void 0 && !isObject(options) && typeof options !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.fromTo error: 'options' is not an object or function.`);
      }

      /**
       * @type {import('./AnimationControl').AnimationControl[]}
       */
      const animationControls = [];

      let index = -1;
      let callbackOptions;

      const hasFromCallback = typeof fromData === 'function';
      const hasToCallback = typeof toData === 'function';
      const hasOptionCallback = typeof options === 'function';
      const hasCallback = hasFromCallback || hasToCallback || hasOptionCallback;

      if (hasCallback) { callbackOptions = { index, position: void 0, data: void 0 }; }

      let actualFromData = fromData;
      let actualToData = toData;
      let actualOptions = options;

      if (isIterable(position))
      {
         for (const entry of position)
         {
            index++;

            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found at index: ${index}.`);
               continue;
            }

            if (hasCallback)
            {
               callbackOptions.index = index;
               callbackOptions.position = position;
               callbackOptions.data = isPosition ? void 0 : entry;
            }

            if (hasFromCallback)
            {
               actualFromData = fromData(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualFromData === null || actualFromData === void 0) { continue; }

               if (typeof actualFromData !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.fromTo error: fromData callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            if (hasToCallback)
            {
               actualToData = toData(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualToData === null || actualToData === void 0) { continue; }

               if (typeof actualToData !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.fromTo error: toData callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            if (hasOptionCallback)
            {
               actualOptions = options(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualOptions === null || actualOptions === void 0) { continue; }

               if (typeof actualOptions !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.fromTo error: options callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
         }
      }
      else
      {
         const isPosition = this.#isPosition(position);
         const actualPosition = isPosition ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found.`);
            return AnimationGroupControl.voidControl;
         }

         if (hasCallback)
         {
            callbackOptions.index = 0;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : position;
         }

         if (hasFromCallback)
         {
            actualFromData = fromData(callbackOptions);

            if (typeof actualFromData !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.fromTo error: fromData callback function failed to return an object.`);
            }
         }

         if (hasToCallback)
         {
            actualToData = toData(callbackOptions);

            if (typeof actualToData !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.fromTo error: toData callback function failed to return an object.`);
            }
         }

         if (hasOptionCallback)
         {
            actualOptions = options(callbackOptions);

            if (typeof actualOptions !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.fromTo error: options callback function failed to return an object.`);
            }
         }

         animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
      }

      return new AnimationGroupControl(animationControls);
   }

   /**
    * Provides the `to` animation tween for one or more TJSPosition instances as a group.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    *
    * @param {object|Function}   toData -
    *
    * @param {object|Function}   options -
    *
    * @returns {import('#svelte-lib/animate').TJSBasicAnimation} Basic animation control.
    */
   static to(position, toData, options)
   {
      if (!isObject(toData) && typeof toData !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.to error: 'toData' is not an object or function.`);
      }

      if (options !== void 0 && !isObject(options) && typeof options !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.to error: 'options' is not an object or function.`);
      }

      /**
       * @type {import('./AnimationControl').AnimationControl[]}
       */
      const animationControls = [];

      let index = -1;
      let callbackOptions;

      const hasDataCallback = typeof toData === 'function';
      const hasOptionCallback = typeof options === 'function';
      const hasCallback = hasDataCallback || hasOptionCallback;

      if (hasCallback) { callbackOptions = { index, position: void 0, data: void 0 }; }

      let actualToData = toData;
      let actualOptions = options;

      if (isIterable(position))
      {
         for (const entry of position)
         {
            index++;

            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.to warning: No Position instance found at index: ${index}.`);
               continue;
            }

            if (hasCallback)
            {
               callbackOptions.index = index;
               callbackOptions.position = position;
               callbackOptions.data = isPosition ? void 0 : entry;
            }

            if (hasDataCallback)
            {
               actualToData = toData(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualToData === null || actualToData === void 0) { continue; }

               if (typeof actualToData !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.to error: toData callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            if (hasOptionCallback)
            {
               actualOptions = options(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualOptions === null || actualOptions === void 0) { continue; }

               if (typeof actualOptions !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.to error: options callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
         }
      }
      else
      {
         const isPosition = this.#isPosition(position);
         const actualPosition = isPosition ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.to warning: No Position instance found.`);
            return AnimationGroupControl.voidControl;
         }

         if (hasCallback)
         {
            callbackOptions.index = 0;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : position;
         }

         if (hasDataCallback)
         {
            actualToData = toData(callbackOptions);

            if (typeof actualToData !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.to error: toData callback function failed to return an object.`);
            }
         }

         if (hasOptionCallback)
         {
            actualOptions = options(callbackOptions);

            if (typeof actualOptions !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.to error: options callback function failed to return an object.`);
            }
         }

         animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
      }

      return new AnimationGroupControl(animationControls);
   }

   /**
    * Provides the `to` animation tween for one or more TJSPosition instances as a group.
    *
    * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
    *
    * @param {Iterable<string>}  keys -
    *
    * @param {object|Function}   options -
    *
    * @returns {import('../').quickToCallback} Basic animation control.
    */
   static quickTo(position, keys, options)
   {
      if (!isIterable(keys))
      {
         throw new TypeError(`AnimationGroupAPI.quickTo error: 'keys' is not an iterable list.`);
      }

      if (options !== void 0 && !isObject(options) && typeof options !== 'function')
      {
         throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
      }

      /**
       * @type {import('../').quickToCallback[]}
       */
      const quickToCallbacks = [];

      let index = -1;

      const hasOptionCallback = typeof options === 'function';

      const callbackOptions = { index, position: void 0, data: void 0 };

      let actualOptions = options;

      if (isIterable(position))
      {
         for (const entry of position)
         {
            index++;

            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;

            if (!this.#isPosition(actualPosition))
            {
               console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found at index: ${index}.`);
               continue;
            }

            callbackOptions.index = index;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : entry;

            if (hasOptionCallback)
            {
               actualOptions = options(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (actualOptions === null || actualOptions === void 0) { continue; }

               if (typeof actualOptions !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.quickTo error: options callback function iteration(${
                   index}) failed to return an object.`);
               }
            }

            quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
         }
      }
      else
      {
         const isPosition = this.#isPosition(position);
         const actualPosition = isPosition ? position : position.position;

         if (!this.#isPosition(actualPosition))
         {
            console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found.`);
            return () => null;
         }

         callbackOptions.index = 0;
         callbackOptions.position = position;
         callbackOptions.data = isPosition ? void 0 : position;

         if (hasOptionCallback)
         {
            actualOptions = options(callbackOptions);

            if (typeof actualOptions !== 'object')
            {
               throw new TypeError(
                `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`);
            }
         }

         quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
      }

      const keysArray = [...keys];

      Object.freeze(keysArray);

      const quickToCB = (...args) =>
      {
         const argsLength = args.length;

         if (argsLength === 0) { return; }

         if (typeof args[0] === 'function')
         {
            const dataCallback = args[0];

            index = -1;
            let cntr = 0;

            if (isIterable(position))
            {
               for (const entry of position)
               {
                  index++;

                  const isPosition = this.#isPosition(entry);
                  const actualPosition = isPosition ? entry : entry.position;

                  if (!this.#isPosition(actualPosition)) { continue; }

                  callbackOptions.index = index;
                  callbackOptions.position = position;
                  callbackOptions.data = isPosition ? void 0 : entry;

                  const toData = dataCallback(callbackOptions);

                  // Returned data from callback is null / undefined, so skip this position instance.
                  if (toData === null || toData === void 0) { continue; }

                  /**
                   * @type {boolean}
                   */
                  const toDataIterable = isIterable(toData);

                  if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== 'object')
                  {
                     throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${
                      index}) failed to return a finite number, iterable list, or object.`);
                  }

                  if (toDataIterable)
                  {
                     quickToCallbacks[cntr++](...toData);
                  }
                  else
                  {
                     quickToCallbacks[cntr++](toData);
                  }
               }
            }
            else
            {
               const isPosition = this.#isPosition(position);
               const actualPosition = isPosition ? position : position.position;

               if (!this.#isPosition(actualPosition)) { return; }

               callbackOptions.index = 0;
               callbackOptions.position = position;
               callbackOptions.data = isPosition ? void 0 : position;

               const toData = dataCallback(callbackOptions);

               // Returned data from callback is null / undefined, so skip this position instance.
               if (toData === null || toData === void 0) { return; }

               const toDataIterable = isIterable(toData);

               if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== 'object')
               {
                  throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${
                   index}) failed to return a finite number, iterable list, or object.`);
               }

               if (toDataIterable)
               {
                  quickToCallbacks[cntr++](...toData);
               }
               else
               {
                  quickToCallbacks[cntr++](toData);
               }
            }
         }
         else
         {
            for (let cntr = quickToCallbacks.length; --cntr >= 0;)
            {
               quickToCallbacks[cntr](...args);
            }
         }
      };

      quickToCB.keys = keysArray;

      /**
       * Sets options of quickTo tween.
       *
       * @param {object|Function}   [options] - Optional parameters.
       *
       * @param {number}            [options.duration] - Duration in seconds.
       *
       * @param {Function}          [options.ease] - Easing function.
       *
       * @param {Function}          [options.interpolate] - Interpolation function.
       *
       * @returns {import('../').quickToCallback} The quickTo callback.
       */
      quickToCB.options = (options) => // eslint-disable-line no-shadow
      {
         if (options !== void 0 && !isObject(options) && typeof options !== 'function')
         {
            throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
         }

         // Set options object for each quickTo callback.
         if (isObject(options))
         {
            for (let cntr = quickToCallbacks.length; --cntr >= 0;) { quickToCallbacks[cntr].options(options); }
         }
         else if (typeof options === 'function')
         {
            if (isIterable(position))
            {
               index = -1;
               let cntr = 0;

               for (const entry of position)
               {
                  index++;

                  const isPosition = this.#isPosition(entry);
                  const actualPosition = isPosition ? entry : entry.position;

                  if (!this.#isPosition(actualPosition))
                  {
                     console.warn(
                      `AnimationGroupAPI.quickTo.options warning: No Position instance found at index: ${index}.`);
                     continue;
                  }

                  callbackOptions.index = index;
                  callbackOptions.position = position;
                  callbackOptions.data = isPosition ? void 0 : entry;

                  actualOptions = options(callbackOptions);

                  // Returned data from callback is null / undefined, so skip this position instance.
                  if (actualOptions === null || actualOptions === void 0) { continue; }

                  if (typeof actualOptions !== 'object')
                  {
                     throw new TypeError(
                      `AnimationGroupAPI.quickTo.options error: options callback function iteration(${
                       index}) failed to return an object.`);
                  }

                  quickToCallbacks[cntr++].options(actualOptions);
               }
            }
            else
            {
               const isPosition = this.#isPosition(position);
               const actualPosition = isPosition ? position : position.position;

               if (!this.#isPosition(actualPosition))
               {
                  console.warn(`AnimationGroupAPI.quickTo.options warning: No Position instance found.`);
                  return quickToCB;
               }

               callbackOptions.index = 0;
               callbackOptions.position = position;
               callbackOptions.data = isPosition ? void 0 : position;

               actualOptions = options(callbackOptions);

               if (typeof actualOptions !== 'object')
               {
                  throw new TypeError(
                   `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`);
               }

               quickToCallbacks[0].options(actualOptions);
            }
         }

         return quickToCB;
      };

      return quickToCB;
   }
}

class Centered
{
   /**
    * @type {HTMLElement}
    */
   #element;

   /**
    * Provides a manual setting of the element height. As things go `offsetHeight` causes a browser layout and is not
    * performance oriented. If manually set this height is used instead of `offsetHeight`.
    *
    * @type {number}
    */
   #height;

   /**
    * Set from an optional value in the constructor to lock accessors preventing modification.
    */
   #lock;

   /**
    * Provides a manual setting of the element width. As things go `offsetWidth` causes a browser layout and is not
    * performance oriented. If manually set this width is used instead of `offsetWidth`.
    *
    * @type {number}
    */
   #width;

   /**
    * @param {object}      [options] - Initial options.
    *
    * @param {HTMLElement} [options.element] - Target element.
    *
    * @param {boolean}     [options.lock=false] - Lock parameters from being set.
    *
    * @param {number}      [options.width] - Manual width.
    *
    * @param {number}      [options.height] - Manual height.
    */
   constructor({ element, lock = false, width, height } = {})
   {
      this.element = element;
      this.width = width;
      this.height = height;

      this.#lock = typeof lock === 'boolean' ? lock : false;
   }

   /**
    * @returns {HTMLElement|undefined|null} Target element.
    */
   get element() { return this.#element; }

   /**
    * @returns {number} Get manual height.
    */
   get height() { return this.#height; }

   /**
    * @returns {number} Get manual width.
    */
   get width() { return this.#width; }

   /**
    * @param {HTMLElement|undefined|null} element - Set target element.
    */
   set element(element)
   {
      if (this.#lock) { return; }

      if (element === void 0  || element === null || element instanceof HTMLElement)
      {
         this.#element = element;
      }
      else
      {
         throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
      }
   }

   /**
    * @param {number}   height - Set manual height.
    */
   set height(height)
   {
      if (this.#lock) { return; }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   /**
    * @param {number}   width - Set manual width.
    */
   set width(width)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }
   }

   /**
    * Set manual width & height.
    *
    * @param {number}   width - New manual width.
    *
    * @param {number}   height - New manual height.
    */
   setDimension(width, height)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   /**
    * Get the left constraint based on any manual target values or the browser inner width.
    *
    * @param {number}   width - Target width.
    *
    * @returns {number} Calculated left constraint.
    */
   getLeft(width)
   {
      // Determine containing bounds from manual values; or any element; lastly the browser width / height.
      const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;

      return (boundsWidth - width) / 2;
   }

   /**
    * Get the top constraint based on any manual target values or the browser inner height.
    *
    * @param {number}   height - Target height.
    *
    * @returns {number} Calculated top constraint.
    */
   getTop(height)
   {
      const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;

      return (boundsHeight - height) / 2;
   }
}

class PositionChangeSet
{
   constructor()
   {
      this.left = false;
      this.top = false;
      this.width = false;
      this.height = false;
      this.maxHeight = false;
      this.maxWidth = false;
      this.minHeight = false;
      this.minWidth = false;
      this.zIndex = false;
      this.transform = false;
      this.transformOrigin = false;
   }

   hasChange()
   {
      return this.left || this.top || this.width || this.height || this.maxHeight || this.maxWidth || this.minHeight ||
       this.minWidth || this.zIndex || this.transform || this.transformOrigin;
   }

   set(value)
   {
      this.left = value;
      this.top = value;
      this.width = value;
      this.height = value;
      this.maxHeight = value;
      this.maxWidth = value;
      this.minHeight = value;
      this.minWidth = value;
      this.zIndex = value;
      this.transform = value;
      this.transformOrigin = value;
   }
}

/**
 * Defines stored positional data.
 */
class TJSPositionData
{
   constructor({ height = null, left = null, maxHeight = null, maxWidth = null, minHeight = null, minWidth = null,
    rotateX = null, rotateY = null, rotateZ = null, scale = null, translateX = null, translateY = null,
     translateZ = null, top = null, transformOrigin = null, width = null, zIndex = null } = {})
   {
      /**
       * @type {number|'auto'|'inherit'|null}
       */
      this.height = height;

      /**
       * @type {number|null}
       */
      this.left = left;

      /**
       * @type {number|null}
       */
      this.maxHeight = maxHeight;

      /**
       * @type {number|null}
       */
      this.maxWidth = maxWidth;

      /**
       * @type {number|null}
       */
      this.minHeight = minHeight;

      /**
       * @type {number|null}
       */
      this.minWidth = minWidth;

      /**
       * @type {number|null}
       */
      this.rotateX = rotateX;

      /**
       * @type {number|null}
       */
      this.rotateY = rotateY;

      /**
       * @type {number|null}
       */
      this.rotateZ = rotateZ;

      /**
       * @type {number|null}
       */
      this.scale = scale;

      /**
       * @type {number|null}
       */
      this.top = top;

      /**
       * @type {string|null}
       */
      this.transformOrigin = transformOrigin;

      /**
       * @type {number|null}
       */
      this.translateX = translateX;

      /**
       * @type {number|null}
       */
      this.translateY = translateY;

      /**
       * @type {number|null}
       */
      this.translateZ = translateZ;

      /**
       * @type {number|'auto'|'inherit'|null}
       */
      this.width = width;

      /**
       * @type {number|null}
       */
      this.zIndex = zIndex;

      Object.seal(this);
   }

   /**
    * Copies given data to this instance.
    *
    * @param {TJSPositionData}   data - Copy from this instance.
    *
    * @returns {TJSPositionData} This instance.
    */
   copy(data)
   {
      this.height = data.height;
      this.left = data.left;
      this.maxHeight = data.maxHeight;
      this.maxWidth = data.maxWidth;
      this.minHeight = data.minHeight;
      this.minWidth = data.minWidth;
      this.rotateX = data.rotateX;
      this.rotateY = data.rotateY;
      this.rotateZ = data.rotateZ;
      this.scale = data.scale;
      this.top = data.top;
      this.transformOrigin = data.transformOrigin;
      this.translateX = data.translateX;
      this.translateY = data.translateY;
      this.translateZ = data.translateZ;
      this.width = data.width;
      this.zIndex = data.zIndex;

      return this;
   }
}

class PositionStateAPI
{
   /** @type {import('./TJSPositionData').TJSPositionData} */
   #data;

   /**
    * @type {Map<string, import('./').TJSPositionDataExtended>}
    */
   #dataSaved = new Map();

   /** @type {import('./').TJSPosition} */
   #position;

   /** @type {import('./transform').TJSTransforms} */
   #transforms;

   constructor(position, data, transforms)
   {
      this.#position = position;
      this.#data = data;
      this.#transforms = transforms;
   }

   /**
    * Returns any stored save state by name.
    *
    * @param {object}   options - Options
    *
    * @param {string}   options.name - Saved data set name.
    *
    * @returns {import('./').TJSPositionDataExtended} The saved data set.
    */
   get({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - getSave error: 'name' is not a string.`); }

      return this.#dataSaved.get(name);
   }

   /**
    * Returns any associated default data.
    *
    * @returns {import('./').TJSPositionDataExtended} Associated default data.
    */
   getDefault()
   {
      return this.#dataSaved.get('#defaultData');
   }

   /**
    * Removes and returns any position state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {import('./').TJSPositionDataExtended} Saved position data.
    */
   remove({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - remove: 'name' is not a string.`); }

      const data = this.#dataSaved.get(name);
      this.#dataSaved.delete(name);

      return data;
   }

   /**
    * Resets data to default values and invokes set.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.keepZIndex=false] - When true keeps current z-index.
    *
    * @param {boolean}  [opts.invokeSet=true] - When true invokes set method.
    *
    * @returns {boolean} Operation successful.
    */
   reset({ keepZIndex = false, invokeSet = true } = {})
   {
      const defaultData = this.#dataSaved.get('#defaultData');

      // Quit early if there is no saved default data.
      if (typeof defaultData !== 'object') { return false; }

      // Cancel all animations for TJSPosition if there are currently any scheduled.
      if (this.#position.animate.isScheduled)
      {
         this.#position.animate.cancel();
      }

      const zIndex = this.#position.zIndex;

      const data = Object.assign({}, defaultData);

      if (keepZIndex) { data.zIndex = zIndex; }

      // Reset the transform data.
      this.#transforms.reset(data);

      // If current minimized invoke `maximize`.
      if (this.#position.parent?.reactive?.minimized)
      {
         this.#position.parent?.maximize?.({ animate: false, duration: 0 });
      }

      // Note next clock tick scheduling.
      if (invokeSet) { setTimeout(() => this.#position.set(data), 0); }

      return true;
   }

   /**
    * Restores a saved positional state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
    * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
    * returned if awaiting the end of the animation.
    *
    * @param {object}            params - Parameters
    *
    * @param {string}            params.name - Saved data set name.
    *
    * @param {boolean}           [params.remove=false] - Remove data set.
    *
    * @param {Iterable<string>}  [params.properties] - Specific properties to set / animate.
    *
    * @param {boolean}           [params.silent] - Set position data directly; no store or style updates.
    *
    * @param {boolean}           [params.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [params.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [params.duration=0.1] - Duration in seconds.
    *
    * @param {Function}          [params.ease=linear] - Easing function.
    *
    * @param {Function}          [params.interpolate=lerp] - Interpolation function.
    *
    * @returns {import('./').TJSPositionDataExtended | Promise<import('./').TJSPositionDataExtended>} Saved position
    *          data.
    */
   restore({ name, remove = false, properties, silent = false, async = false, animateTo = false, duration = 0.1,
    ease = linear, interpolate = lerp })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - restore error: 'name' is not a string.`); }

      const dataSaved = this.#dataSaved.get(name);

      if (dataSaved)
      {
         if (remove) { this.#dataSaved.delete(name); }

         let data = dataSaved;

         if (isIterable(properties))
         {
            data = {};
            for (const property of properties) { data[property] = dataSaved[property]; }
         }

         // Update data directly with no store or inline style updates.
         if (silent)
         {
            for (const property in data) { this.#data[property] = data[property]; }
            return dataSaved;
         }
         else if (animateTo)  // Animate to saved data.
         {
            // Provide special handling to potentially change transform origin as this parameter is not animated.
            if (data.transformOrigin !== this.#position.transformOrigin)
            {
               this.#position.transformOrigin = data.transformOrigin;
            }

            // Return a Promise with saved data that resolves after animation ends.
            if (async)
            {
               return this.#position.animate.to(data, { duration, ease, interpolate }).finished.then(() => dataSaved);
            }
            else  // Animate synchronously.
            {
               this.#position.animate.to(data, { duration, ease, interpolate });
            }
         }
         else
         {
            // Default options is to set data for an immediate update.
            this.#position.set(data);
         }
      }

      return dataSaved;
   }

   /**
    * Saves current position state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   opts - Options.
    *
    * @param {string}   opts.name - name to index this saved data.
    *
    * @param {...*}     [opts.extra] - Extra data to add to saved data.
    *
    * @returns {import('./').TJSPositionData} Current position data
    */
   save({ name, ...extra })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - save error: 'name' is not a string.`); }

      const data = this.#position.get(extra);

      this.#dataSaved.set(name, data);

      return data;
   }

   /**
    * Directly sets a position state.
    *
    * @param {object}   opts - Options.
    *
    * @param {string}   opts.name - name to index this saved data.
    *
    * @param {...*}     [opts.data] - TJSPosition data to set.
    */
   set({ name, ...data })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - set error: 'name' is not a string.`); }

      this.#dataSaved.set(name, data);
   }
}

class StyleCache
{
   constructor()
   {
      /** @type {HTMLElement|undefined} */
      this.el = void 0;

      /** @type {CSSStyleDeclaration} */
      this.computed = void 0;

      /** @type {number|undefined} */
      this.marginLeft = void 0;

      /** @type {number|undefined} */
      this.marginTop = void 0;

      /** @type {number|undefined} */
      this.maxHeight = void 0;

      /** @type {number|undefined} */
      this.maxWidth = void 0;

      /** @type {number|undefined} */
      this.minHeight = void 0;

      /** @type {number|undefined} */
      this.minWidth = void 0;

      /** @type {boolean} */
      this.hasWillChange = false;

      /**
       * @type {import('./').ResizeObserverData}
       */
      this.resizeObserved = {
         contentHeight: void 0,
         contentWidth: void 0,
         offsetHeight: void 0,
         offsetWidth: void 0
      };

      /**
       * Provides a writable store to track offset & content width / height from an associated `resizeObserver` action.
       *
       * @type {import('#svelte/store').Writable<import('./').ResizeObserverData>}
       */
      const storeResizeObserved = writable(this.resizeObserved);

      this.stores = {
         element: writable(this.el),
         resizeContentHeight: propertyStore(storeResizeObserved, 'contentHeight'),
         resizeContentWidth: propertyStore(storeResizeObserved, 'contentWidth'),
         resizeObserved: storeResizeObserved,
         resizeOffsetHeight: propertyStore(storeResizeObserved, 'offsetHeight'),
         resizeOffsetWidth: propertyStore(storeResizeObserved, 'offsetWidth')
      };
   }

   /**
    * Returns the cached offsetHeight from any attached `resizeObserver` action otherwise gets the offsetHeight from
    * the element directly. The more optimized path is using `resizeObserver` as getting it from the element
    * directly is more expensive and alters the execution order of an animation frame.
    *
    * @returns {number} The element offsetHeight.
    */
   get offsetHeight()
   {
      if (this.el instanceof HTMLElement)
      {
         return this.resizeObserved.offsetHeight !== void 0 ? this.resizeObserved.offsetHeight : this.el.offsetHeight;
      }

      throw new Error(`StyleCache - get offsetHeight error: no element assigned.`);
   }

   /**
    * Returns the cached offsetWidth from any attached `resizeObserver` action otherwise gets the offsetWidth from
    * the element directly. The more optimized path is using `resizeObserver` as getting it from the element
    * directly is more expensive and alters the execution order of an animation frame.
    *
    * @returns {number} The element offsetHeight.
    */
   get offsetWidth()
   {
      if (this.el instanceof HTMLElement)
      {
         return this.resizeObserved.offsetWidth !== void 0 ? this.resizeObserved.offsetWidth : this.el.offsetWidth;
      }

      throw new Error(`StyleCache - get offsetWidth error: no element assigned.`);
   }

   /**
    * @param {HTMLElement} el -
    *
    * @returns {boolean} Does element match cached element.
    */
   hasData(el) { return this.el === el; }

   /**
    * Resets the style cache.
    */
   reset()
   {
      // Remove will-change inline style from previous element if it is still connected.
      if (this.el instanceof HTMLElement && this.el.isConnected && !this.hasWillChange)
      {
         this.el.style.willChange = null;
      }

      this.el = void 0;
      this.computed = void 0;
      this.marginLeft = void 0;
      this.marginTop = void 0;
      this.maxHeight = void 0;
      this.maxWidth = void 0;
      this.minHeight = void 0;
      this.minWidth = void 0;

      this.hasWillChange = false;

      // Silently reset `resizedObserved`; With proper usage the `resizeObserver` action issues an update on removal.
      this.resizeObserved.contentHeight = void 0;
      this.resizeObserved.contentWidth = void 0;
      this.resizeObserved.offsetHeight = void 0;
      this.resizeObserved.offsetWidth = void 0;

      // Reset the tracked element this TJSPosition instance is modifying.
      this.stores.element.set(void 0);
   }

   /**
    * Updates the style cache with new data from the given element.
    *
    * @param {HTMLElement} el - An HTML element.
    */
   update(el)
   {
      this.el = el;

      this.computed = globalThis.getComputedStyle(el);

      this.marginLeft = StyleParse.pixels(el.style.marginLeft) ?? StyleParse.pixels(this.computed.marginLeft);
      this.marginTop = StyleParse.pixels(el.style.marginTop) ?? StyleParse.pixels(this.computed.marginTop);
      this.maxHeight = StyleParse.pixels(el.style.maxHeight) ?? StyleParse.pixels(this.computed.maxHeight);
      this.maxWidth = StyleParse.pixels(el.style.maxWidth) ?? StyleParse.pixels(this.computed.maxWidth);

      // Note that the computed styles for below will always be 0px / 0 when no style is active.
      this.minHeight = StyleParse.pixels(el.style.minHeight) ?? StyleParse.pixels(this.computed.minHeight);
      this.minWidth = StyleParse.pixels(el.style.minWidth) ?? StyleParse.pixels(this.computed.minWidth);

      // Tracks if there already is a will-change property on the inline or computed styles.
      const willChange = el.style.willChange !== '' ? el.style.willChange : this.computed.willChange;

      this.hasWillChange = willChange !== '' && willChange !== 'auto';

      // Update the tracked element this TJSPosition instance is modifying.
      this.stores.element.set(el);
   }
}

/**
 * Provides the output data for {@link TJSTransforms.getData}.
 */
class TJSTransformData
{
   constructor()
   {
      Object.seal(this);
   }

   /**
    * Stores the calculated bounding rectangle.
    *
    * @type {DOMRect}
    */
   #boundingRect = new DOMRect();

   /**
    * Stores the individual transformed corner points of the window in screen space clockwise from:
    * top left -> top right -> bottom right -> bottom left.
    *
    * @type {import('#runtime/math/gl-matrix').Vec3[]}
    */
   #corners = [Vec3.create(), Vec3.create(), Vec3.create(), Vec3.create()];

   /**
    * Stores the current gl-matrix Mat4 data.
    *
    * @type {import('#runtime/math/gl-matrix').Mat4}
    */
   #mat4 = Mat4.create();

   /**
    * Stores the pre & post origin translations to apply to matrix transforms.
    *
    * @type {import('#runtime/math/gl-matrix').Mat4[]}
    */
   #originTranslations = [Mat4.create(), Mat4.create()];

   /**
    * @returns {DOMRect} The bounding rectangle.
    */
   get boundingRect() { return this.#boundingRect; }

   /**
    * @returns {import('#runtime/math/gl-matrix').Vec3[]} The transformed corner points as Vec3 in screen space.
    */
   get corners() { return this.#corners; }

   /**
    * @returns {string} Returns the CSS style string for the transform matrix.
    */
   get css() { return `matrix3d(${this.mat4.join(',')})`; }

   /**
    * @returns {import('#runtime/math/gl-matrix').Mat4} The transform matrix.
    */
   get mat4() { return this.#mat4; }

   /**
    * @returns {import('#runtime/math/gl-matrix').Mat4[]} The pre / post translation matrices for origin translation.
    */
   get originTranslations() { return this.#originTranslations; }
}

/** @type {number[]} */
const s_SCALE_VECTOR = [1, 1, 1];

/** @type {number[]} */
const s_TRANSLATE_VECTOR = [0, 0, 0];

/** @type {import('#runtime/math/gl-matrix').Mat4} */
const s_MAT4_RESULT = Mat4.create();

/** @type {import('#runtime/math/gl-matrix').Mat4} */
const s_MAT4_TEMP = Mat4.create();

/** @type {import('#runtime/math/gl-matrix').Vec3} */
const s_VEC3_TEMP = Vec3.create();

class TJSTransforms
{
   /**
    * Stores the transform keys in the order added.
    *
    * @type {string[]}
    */
   #orderList = [];

   constructor()
   {
      this._data = {};
   }

   /**
    * @returns {boolean} Whether there are active transforms in local data.
    */
   get isActive() { return this.#orderList.length > 0; }

   /**
    * @returns {number|undefined} Any local rotateX data.
    */
   get rotateX() { return this._data.rotateX; }

   /**
    * @returns {number|undefined} Any local rotateY data.
    */
   get rotateY() { return this._data.rotateY; }

   /**
    * @returns {number|undefined} Any local rotateZ data.
    */
   get rotateZ() { return this._data.rotateZ; }

   /**
    * @returns {number|undefined} Any local rotateZ scale.
    */
   get scale() { return this._data.scale; }

   /**
    * @returns {number|undefined} Any local translateZ data.
    */
   get translateX() { return this._data.translateX; }

   /**
    * @returns {number|undefined} Any local translateZ data.
    */
   get translateY() { return this._data.translateY; }

   /**
    * @returns {number|undefined} Any local translateZ data.
    */
   get translateZ() { return this._data.translateZ; }

   /**
    * Sets the local rotateX data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set rotateX(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.rotateX === void 0) { this.#orderList.push('rotateX'); }

         this._data.rotateX = value;
      }
      else
      {
         if (this._data.rotateX !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'rotateX');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.rotateX;
      }
   }

   /**
    * Sets the local rotateY data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set rotateY(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.rotateY === void 0) { this.#orderList.push('rotateY'); }

         this._data.rotateY = value;
      }
      else
      {
         if (this._data.rotateY !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'rotateY');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.rotateY;
      }
   }

   /**
    * Sets the local rotateZ data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set rotateZ(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.rotateZ === void 0) { this.#orderList.push('rotateZ'); }

         this._data.rotateZ = value;
      }

      else
      {
         if (this._data.rotateZ !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'rotateZ');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.rotateZ;
      }
   }

   /**
    * Sets the local scale data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set scale(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.scale === void 0) { this.#orderList.push('scale'); }

         this._data.scale = value;
      }
      else
      {
         if (this._data.scale !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'scale');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.scale;
      }
   }

   /**
    * Sets the local translateX data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set translateX(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.translateX === void 0) { this.#orderList.push('translateX'); }

         this._data.translateX = value;
      }

      else
      {
         if (this._data.translateX !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'translateX');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.translateX;
      }
   }

   /**
    * Sets the local translateY data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set translateY(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.translateY === void 0) { this.#orderList.push('translateY'); }

         this._data.translateY = value;
      }

      else
      {
         if (this._data.translateY !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'translateY');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.translateY;
      }
   }

   /**
    * Sets the local translateZ data if the value is a finite number otherwise removes the local data.
    *
    * @param {number|null|undefined}   value - A value to set.
    */
   set translateZ(value)
   {
      if (Number.isFinite(value))
      {
         if (this._data.translateZ === void 0) { this.#orderList.push('translateZ'); }

         this._data.translateZ = value;
      }

      else
      {
         if (this._data.translateZ !== void 0)
         {
            const index = this.#orderList.findIndex((entry) => entry === 'translateZ');
            if (index >= 0) { this.#orderList.splice(index, 1); }
         }

         delete this._data.translateZ;
      }
   }

   /**
    * Returns the matrix3d CSS transform for the given position / transform data.
    *
    * @param {object} [data] - Optional position data otherwise use local stored transform data.
    *
    * @returns {string} The CSS matrix3d string.
    */
   getCSS(data = this._data)
   {
      return `matrix3d(${this.getMat4(data, s_MAT4_RESULT).join(',')})`;
   }

   /**
    * Returns the matrix3d CSS transform for the given position / transform data.
    *
    * @param {object} [data] - Optional position data otherwise use local stored transform data.
    *
    * @returns {string} The CSS matrix3d string.
    */
   getCSSOrtho(data = this._data)
   {
      return `matrix3d(${this.getMat4Ortho(data, s_MAT4_RESULT).join(',')})`;
   }

   /**
    * Collects all data including a bounding rect, transform matrix, and points array of the given {@link TJSPositionData}
    * instance with the applied local transform data.
    *
    * @param {import('../').TJSPositionData} position - The position data to process.
    *
    * @param {TJSTransformData} [output] - Optional TJSTransformData output instance.
    *
    * @param {object} [validationData] - Optional validation data for adjustment parameters.
    *
    * @returns {TJSTransformData} The output TJSTransformData instance.
    */
   getData(position, output = new TJSTransformData(), validationData = {})
   {
      const valWidth = validationData.width ?? 0;
      const valHeight = validationData.height ?? 0;
      const valOffsetTop = validationData.offsetTop ?? validationData.marginTop ?? 0;
      const valOffsetLeft = validationData.offsetLeft ?? validationData.offsetLeft ?? 0;

      position.top += valOffsetTop;
      position.left += valOffsetLeft;

      const width = Number.isFinite(position.width) ? position.width : valWidth;
      const height = Number.isFinite(position.height) ? position.height : valHeight;

      const rect = output.corners;

      if (this.hasTransform(position))
      {
         rect[0][0] = rect[0][1] = rect[0][2] = 0;
         rect[1][0] = width;
         rect[1][1] = rect[1][2] = 0;
         rect[2][0] = width;
         rect[2][1] = height;
         rect[2][2] = 0;
         rect[3][0] = 0;
         rect[3][1] = height;
         rect[3][2] = 0;

         const matrix = this.getMat4(position, output.mat4);

         const translate = s_GET_ORIGIN_TRANSLATION(position.transformOrigin, width, height, output.originTranslations);

         if (transformOriginDefault === position.transformOrigin)
         {
            Vec3.transformMat4(rect[0], rect[0], matrix);
            Vec3.transformMat4(rect[1], rect[1], matrix);
            Vec3.transformMat4(rect[2], rect[2], matrix);
            Vec3.transformMat4(rect[3], rect[3], matrix);
         }
         else
         {
            Vec3.transformMat4(rect[0], rect[0], translate[0]);
            Vec3.transformMat4(rect[0], rect[0], matrix);
            Vec3.transformMat4(rect[0], rect[0], translate[1]);

            Vec3.transformMat4(rect[1], rect[1], translate[0]);
            Vec3.transformMat4(rect[1], rect[1], matrix);
            Vec3.transformMat4(rect[1], rect[1], translate[1]);

            Vec3.transformMat4(rect[2], rect[2], translate[0]);
            Vec3.transformMat4(rect[2], rect[2], matrix);
            Vec3.transformMat4(rect[2], rect[2], translate[1]);

            Vec3.transformMat4(rect[3], rect[3], translate[0]);
            Vec3.transformMat4(rect[3], rect[3], matrix);
            Vec3.transformMat4(rect[3], rect[3], translate[1]);
         }

         rect[0][0] = position.left + rect[0][0];
         rect[0][1] = position.top + rect[0][1];
         rect[1][0] = position.left + rect[1][0];
         rect[1][1] = position.top + rect[1][1];
         rect[2][0] = position.left + rect[2][0];
         rect[2][1] = position.top + rect[2][1];
         rect[3][0] = position.left + rect[3][0];
         rect[3][1] = position.top + rect[3][1];
      }
      else
      {
         rect[0][0] = position.left;
         rect[0][1] = position.top;
         rect[1][0] = position.left + width;
         rect[1][1] = position.top;
         rect[2][0] = position.left + width;
         rect[2][1] = position.top + height;
         rect[3][0] = position.left;
         rect[3][1] = position.top + height;

         Mat4.identity(output.mat4);
      }

      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;

      for (let cntr = 4; --cntr >= 0;)
      {
         if (rect[cntr][0] > maxX) { maxX = rect[cntr][0]; }
         if (rect[cntr][0] < minX) { minX = rect[cntr][0]; }
         if (rect[cntr][1] > maxY) { maxY = rect[cntr][1]; }
         if (rect[cntr][1] < minY) { minY = rect[cntr][1]; }
      }

      const boundingRect = output.boundingRect;
      boundingRect.x = minX;
      boundingRect.y = minY;
      boundingRect.width = maxX - minX;
      boundingRect.height = maxY - minY;

      position.top -= valOffsetTop;
      position.left -= valOffsetLeft;

      return output;
   }

   /**
    * Creates a transform matrix based on local data applied in order it was added.
    *
    * If no data object is provided then the source is the local transform data. If another data object is supplied
    * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
    * construction of a transform matrix in advance of setting local data and is useful in collision detection.
    *
    * @param {object}   [data] - TJSPositionData instance or local transform data.
    *
    * @param {import('#runtime/math/gl-matrix').Mat4}  [output] - The output mat4 instance.
    *
    * @returns {import('#runtime/math/gl-matrix').Mat4} Transform matrix.
    */
   getMat4(data = this._data, output = Mat4.create())
   {
      const matrix = Mat4.identity(output);

      // Bitwise tracks applied transform keys from local transform data.
      let seenKeys = 0;

      const orderList = this.#orderList;

      // First apply ordered transforms from local transform data.
      for (let cntr = 0; cntr < orderList.length; cntr++)
      {
         const key = orderList[cntr];

         switch (key)
         {
            case 'rotateX':
               seenKeys |= transformKeysBitwise.rotateX;
               Mat4.multiply(matrix, matrix, Mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateY':
               seenKeys |= transformKeysBitwise.rotateY;
               Mat4.multiply(matrix, matrix, Mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateZ':
               seenKeys |= transformKeysBitwise.rotateZ;
               Mat4.multiply(matrix, matrix, Mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'scale':
               seenKeys |= transformKeysBitwise.scale;
               s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
               Mat4.multiply(matrix, matrix, Mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
               break;

            case 'translateX':
               seenKeys |= transformKeysBitwise.translateX;
               s_TRANSLATE_VECTOR[0] = data.translateX;
               s_TRANSLATE_VECTOR[1] = 0;
               s_TRANSLATE_VECTOR[2] = 0;
               Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
               break;

            case 'translateY':
               seenKeys |= transformKeysBitwise.translateY;
               s_TRANSLATE_VECTOR[0] = 0;
               s_TRANSLATE_VECTOR[1] = data.translateY;
               s_TRANSLATE_VECTOR[2] = 0;
               Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
               break;

            case 'translateZ':
               seenKeys |= transformKeysBitwise.translateZ;
               s_TRANSLATE_VECTOR[0] = 0;
               s_TRANSLATE_VECTOR[1] = 0;
               s_TRANSLATE_VECTOR[2] = data.translateZ;
               Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
               break;
         }
      }

      // Now apply any new keys not set in local transform data that have not been applied yet.
      if (data !== this._data)
      {
         for (let cntr = 0; cntr < transformKeys.length; cntr++)
         {
            const key = transformKeys[cntr];

            // Reject bad / no data or if the key has already been applied.
            if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) { continue; }

            switch (key)
            {
               case 'rotateX':
                  Mat4.multiply(matrix, matrix, Mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;

               case 'rotateY':
                  Mat4.multiply(matrix, matrix, Mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;

               case 'rotateZ':
                  Mat4.multiply(matrix, matrix, Mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;

               case 'scale':
                  s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
                  Mat4.multiply(matrix, matrix, Mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
                  break;

               case 'translateX':
                  s_TRANSLATE_VECTOR[0] = data[key];
                  s_TRANSLATE_VECTOR[1] = 0;
                  s_TRANSLATE_VECTOR[2] = 0;
                  Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
                  break;

               case 'translateY':
                  s_TRANSLATE_VECTOR[0] = 0;
                  s_TRANSLATE_VECTOR[1] = data[key];
                  s_TRANSLATE_VECTOR[2] = 0;
                  Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
                  break;

               case 'translateZ':
                  s_TRANSLATE_VECTOR[0] = 0;
                  s_TRANSLATE_VECTOR[1] = 0;
                  s_TRANSLATE_VECTOR[2] = data[key];
                  Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
                  break;
            }
         }
      }

      return matrix;
   }

   /**
    * Provides an orthographic enhancement to convert left / top positional data to a translate operation.
    *
    * This transform matrix takes into account that the remaining operations are , but adds any left / top attributes from passed in data to
    * translate X / Y.
    *
    * If no data object is provided then the source is the local transform data. If another data object is supplied
    * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
    * construction of a transform matrix in advance of setting local data and is useful in collision detection.
    *
    * @param {object}   [data] - TJSPositionData instance or local transform data.
    *
    * @param {import('#runtime/math/gl-matrix').Mat4}  [output] - The output mat4 instance.
    *
    * @returns {import('#runtime/math/gl-matrix').Mat4} Transform matrix.
    */
   getMat4Ortho(data = this._data, output = Mat4.create())
   {
      const matrix = Mat4.identity(output);

      // Attempt to retrieve values from passed in data otherwise default to 0.
      // Always perform the translation last regardless of order added to local transform data.
      // Add data.left to translateX and data.top to translateY.
      s_TRANSLATE_VECTOR[0] = (data.left ?? 0) + (data.translateX ?? 0);
      s_TRANSLATE_VECTOR[1] = (data.top ?? 0) + (data.translateY ?? 0);
      s_TRANSLATE_VECTOR[2] = data.translateZ ?? 0;
      Mat4.multiply(matrix, matrix, Mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));

      // Scale can also be applied out of order.
      if (data.scale !== null)
      {
         s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data.scale;
         Mat4.multiply(matrix, matrix, Mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
      }

      // Early out if there is not rotation data.
      if (data.rotateX === null && data.rotateY === null && data.rotateZ === null) { return matrix; }

      // Rotation transforms must be applied in the order they are added.

      // Bitwise tracks applied transform keys from local transform data.
      let seenKeys = 0;

      const orderList = this.#orderList;

      // First apply ordered transforms from local transform data.
      for (let cntr = 0; cntr < orderList.length; cntr++)
      {
         const key = orderList[cntr];

         switch (key)
         {
            case 'rotateX':
               seenKeys |= transformKeysBitwise.rotateX;
               Mat4.multiply(matrix, matrix, Mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateY':
               seenKeys |= transformKeysBitwise.rotateY;
               Mat4.multiply(matrix, matrix, Mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateZ':
               seenKeys |= transformKeysBitwise.rotateZ;
               Mat4.multiply(matrix, matrix, Mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;
         }
      }

      // Now apply any new keys not set in local transform data that have not been applied yet.
      if (data !== this._data)
      {
         for (let cntr = 0; cntr < transformKeys.length; cntr++)
         {
            const key = transformKeys[cntr];

            // Reject bad / no data or if the key has already been applied.
            if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) { continue; }

            switch (key)
            {
               case 'rotateX':
                  Mat4.multiply(matrix, matrix, Mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;

               case 'rotateY':
                  Mat4.multiply(matrix, matrix, Mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;

               case 'rotateZ':
                  Mat4.multiply(matrix, matrix, Mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
                  break;
            }
         }
      }

      return matrix;
   }

   /**
    * Tests an object if it contains transform keys and the values are finite numbers.
    *
    * @param {object} data - An object to test for transform data.
    *
    * @returns {boolean} Whether the given TJSPositionData has transforms.
    */
   hasTransform(data)
   {
      for (const key of transformKeys)
      {
         if (Number.isFinite(data[key])) { return true; }
      }

      return false;
   }

   /**
    * Resets internal data from the given object containing valid transform keys.
    *
    * @param {object}   data - An object with transform data.
    */
   reset(data)
   {
      for (const key in data)
      {
         if (transformKeys.includes(key))
         {
            if (Number.isFinite(data[key]))
            {
               this._data[key] = data[key];
            }
            else
            {
               const index = this.#orderList.findIndex((entry) => entry === key);
               if (index >= 0) { this.#orderList.splice(index, 1); }

               delete this._data[key];
            }
         }
      }
   }
}

/**
 * Returns the translations necessary to translate a matrix operation based on the `transformOrigin` parameter of the
 * given position instance. The first entry / index 0 is the pre-translation and last entry / index 1 is the post-
 * translation.
 *
 * This method is used internally, but may be useful if you need the origin translation matrices to transform
 * bespoke points based on any `transformOrigin` set in {@link TJSPositionData}.
 *
 * @param {string}   transformOrigin - The transform origin attribute from TJSPositionData.
 *
 * @param {number}   width - The TJSPositionData width or validation data width when 'auto'.
 *
 * @param {number}   height - The TJSPositionData height or validation data height when 'auto'.
 *
 * @param {import('#runtime/math/gl-matrix').Mat4[]}   output - Output Mat4 array.
 *
 * @returns {import('#runtime/math/gl-matrix').Mat4[]} Output Mat4 array.
 */
function s_GET_ORIGIN_TRANSLATION(transformOrigin, width, height, output)
{
   const vector = s_VEC3_TEMP;

   switch (transformOrigin)
   {
      case 'top left':
         vector[0] = vector[1] = 0;
         Mat4.fromTranslation(output[0], vector);
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'top center':
         vector[0] = -width * 0.5;
         vector[1] = 0;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width * 0.5;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'top right':
         vector[0] = -width;
         vector[1] = 0;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'center left':
         vector[0] = 0;
         vector[1] = -height * 0.5;
         Mat4.fromTranslation(output[0], vector);
         vector[1] = height * 0.5;
         Mat4.fromTranslation(output[1], vector);
         break;

      case null: // By default null / no transform is center.
      case 'center':
         vector[0] = -width * 0.5;
         vector[1] = -height * 0.5;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width * 0.5;
         vector[1] = height * 0.5;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'center right':
         vector[0] = -width;
         vector[1] = -height * 0.5;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width;
         vector[1] = height * 0.5;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom left':
         vector[0] = 0;
         vector[1] = -height;
         Mat4.fromTranslation(output[0], vector);
         vector[1] = height;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom center':
         vector[0] = -width * 0.5;
         vector[1] = -height;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width * 0.5;
         vector[1] = height;
         Mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom right':
         vector[0] = -width;
         vector[1] = -height;
         Mat4.fromTranslation(output[0], vector);
         vector[0] = width;
         vector[1] = height;
         Mat4.fromTranslation(output[1], vector);
         break;

      // No valid transform origin parameter; set identity.
      default:
         Mat4.identity(output[0]);
         Mat4.identity(output[1]);
         break;
   }

   return output;
}

/**
 * Provides the storage and sequencing of managed position validators. Each validator added may be a bespoke function or
 * a {@link ValidatorData} object containing an `id`, `validator`, and `weight` attributes; `validator` is the only
 * required attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the validator; recommended strings or numbers. This
 * allows validators to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows validators to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted validator always
 * runs before a higher weighted validator. If no weight is specified the default of '1' is assigned and it is appended
 * to the end of the validators list.
 *
 * This class forms the public API which is accessible from the `.validators` getter in the main TJSPosition instance.
 * ```
 * const position = new TJSPosition(<TJSPositionData>);
 * position.validators.add(...);
 * position.validators.clear();
 * position.validators.length;
 * position.validators.remove(...);
 * position.validators.removeBy(...);
 * position.validators.removeById(...);
 * ```
 */
class AdapterValidators
{
   /** @type {boolean} */
   #enabled = true;

   /**
    * @type {import('../').ValidatorData[]}
    */
   #validatorData;

   #mapUnsubscribe = new Map();

   /**
    * @returns {[AdapterValidators, import('../').ValidatorData[]]} Returns this and internal storage for validator
    *          adapter.
    */
   constructor()
   {
      this.#validatorData = [];

      Object.seal(this);

      return [this, this.#validatorData];
   }

   /**
    * @returns {boolean} Returns the enabled state.s
    */
   get enabled() { return this.#enabled; }

   /**
    * @returns {number} Returns the length of the validators array.
    */
   get length() { return this.#validatorData.length; }

   /**
    * @param {boolean}  enabled - Sets enabled state.
    */
   set enabled(enabled)
   {
      if (typeof enabled !== 'boolean') { throw new TypeError(`'enabled' is not a boolean.`); }

      this.#enabled = enabled;
   }

   /**
    * Provides an iterator for validators.
    *
    * @yields {import('../').ValidatorData}
    */
   *[Symbol.iterator]()
   {
      if (this.#validatorData.length === 0) { return; }

      for (const entry of this.#validatorData)
      {
         yield { ...entry };
      }
   }

   /**
    * @param {...(import('../').ValidatorFn | import('../').ValidatorData)}   validators -
    */
   add(...validators)
   {
      /**
       * Tracks the number of validators added that have subscriber functionality.
       *
       * @type {number}
       */
      // let subscribeCount = 0;  // TODO: Currently unused

      for (const validator of validators)
      {
         const validatorType = typeof validator;

         if (validatorType !== 'function' && validatorType !== 'object' || validator === null)
         {
            throw new TypeError(`AdapterValidator error: 'validator' is not a function or object.`);
         }

         let data = void 0;
         let subscribeFn = void 0;

         switch (validatorType)
         {
            case 'function':
               data = {
                  id: void 0,
                  validator,
                  weight: 1
               };

               subscribeFn = validator.subscribe;
               break;

            case 'object':
               if (typeof validator.validator !== 'function')
               {
                  throw new TypeError(`AdapterValidator error: 'validator' attribute is not a function.`);
               }

               if (validator.weight !== void 0 && typeof validator.weight !== 'number' ||
                (validator.weight < 0 || validator.weight > 1))
               {
                  throw new TypeError(
                   `AdapterValidator error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
               }

               data = {
                  id: validator.id !== void 0 ? validator.id : void 0,
                  validator: validator.validator.bind(validator),
                  weight: validator.weight || 1,
                  instance: validator
               };

               subscribeFn = validator.validator.subscribe ?? validator.subscribe;
               break;
         }

         // Find the index to insert where data.weight is less than existing values weight.
         const index = this.#validatorData.findIndex((value) =>
         {
            return data.weight < value.weight;
         });

         // If an index was found insert at that location.
         if (index >= 0)
         {
            this.#validatorData.splice(index, 0, data);
         }
         else // push to end of validators.
         {
            this.#validatorData.push(data);
         }

         if (typeof subscribeFn === 'function')
         {
            // TODO: consider how to handle validator updates.
            const unsubscribe = subscribeFn();

            // Ensure that unsubscribe is a function.
            if (typeof unsubscribe !== 'function')
            {
               throw new TypeError(
                'AdapterValidator error: Filter has subscribe function, but no unsubscribe function is returned.');
            }

            // Ensure that the same validator is not subscribed to multiple times.
            if (this.#mapUnsubscribe.has(data.validator))
            {
               throw new Error(
                'AdapterValidator error: Filter added already has an unsubscribe function registered.');
            }

            this.#mapUnsubscribe.set(data.validator, unsubscribe);
            // subscribeCount++;  // TODO: Currently unused
         }
      }

      // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
      // subscriber count is less than the amount of validators added then automatically trigger an index update
      // manually.
      // TODO: handle validator updates.
      // if (subscribeCount < validators.length) { this.#indexUpdate(); }
   }

   clear()
   {
      this.#validatorData.length = 0;

      // Unsubscribe from all validators with subscription support.
      for (const unsubscribe of this.#mapUnsubscribe.values())
      {
         unsubscribe();
      }

      this.#mapUnsubscribe.clear();

      // TODO: handle validator updates.
      // this.#indexUpdate();
   }

   /**
    * @param {...(import('../').ValidatorFn | import('../').ValidatorData)}   validators -
    */
   remove(...validators)
   {
      const length = this.#validatorData.length;

      if (length === 0) { return; }

      for (const data of validators)
      {
         // Handle the case that the validator may either be a function or a validator entry / object.
         const actualValidator = typeof data === 'function' ? data : isObject(data) ? data.validator : void 0;

         if (!actualValidator) { continue; }

         for (let cntr = this.#validatorData.length; --cntr >= 0;)
         {
            if (this.#validatorData[cntr].validator === actualValidator)
            {
               this.#validatorData.splice(cntr, 1);

               // Invoke any unsubscribe function for given validator then remove from tracking.
               let unsubscribe = void 0;
               if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualValidator)) === 'function')
               {
                  unsubscribe();
                  this.#mapUnsubscribe.delete(actualValidator);
               }
            }
         }
      }

      // Update the index a validator was removed.
      // TODO: handle validator updates.
      // if (length !== this.#validatorData.length) { this.#indexUpdate(); }
   }

   /**
    * Remove validators by the provided callback. The callback takes 3 parameters: `id`, `validator`, and `weight`.
    * Any truthy value returned will remove that validator.
    *
    * @param {function(*, import('../').ValidatorFn, number): boolean} callback - Callback function to evaluate each
    *        validator entry.
    */
   removeBy(callback)
   {
      const length = this.#validatorData.length;

      if (length === 0) { return; }

      if (typeof callback !== 'function')
      {
         throw new TypeError(`AdapterValidator error: 'callback' is not a function.`);
      }

      this.#validatorData = this.#validatorData.filter((data) =>
      {
         const remove = callback.call(callback, { ...data });

         if (remove)
         {
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.validator);
            }
         }

         // Reverse remove boolean to properly validator / remove this validator.
         return !remove;
      });

      // TODO: handle validator updates.
      // if (length !== this.#validatorData.length) { this.#indexUpdate(); }
   }

   removeById(...ids)
   {
      const length = this.#validatorData.length;

      if (length === 0) { return; }

      this.#validatorData = this.#validatorData.filter((data) =>
      {
         let remove = false;

         for (const id of ids) { remove |= data.id === id; }

         // If not keeping invoke any unsubscribe function for given validator then remove from tracking.
         if (remove)
         {
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.validator);
            }
         }

         return !remove; // Swap here to actually remove the item via array validator method.
      });

      // TODO: handle validator updates.
      // if (length !== this.#validatorData.length) { this.#indexUpdate(); }
   }
}

class BasicBounds
{
   /**
    * When true constrains the min / max width or height to element.
    *
    * @type {boolean}
    */
   #constrain;

   /**
    * @type {HTMLElement}
    */
   #element;

   /**
    * When true the validator is active.
    *
    * @type {boolean}
    */
   #enabled;

   /**
    * Provides a manual setting of the element height. As things go `offsetHeight` causes a browser layout and is not
    * performance oriented. If manually set this height is used instead of `offsetHeight`.
    *
    * @type {number}
    */
   #height;

   /**
    * Set from an optional value in the constructor to lock accessors preventing modification.
    */
   #lock;

   /**
    * Provides a manual setting of the element width. As things go `offsetWidth` causes a browser layout and is not
    * performance oriented. If manually set this width is used instead of `offsetWidth`.
    *
    * @type {number}
    */
   #width;

   constructor({ constrain = true, element, enabled = true, lock = false, width, height } = {})
   {
      this.element = element;
      this.constrain = constrain;
      this.enabled = enabled;
      this.width = width;
      this.height = height;

      this.#lock = typeof lock === 'boolean' ? lock : false;
   }

   get constrain() { return this.#constrain; }

   get element() { return this.#element; }

   get enabled() { return this.#enabled; }

   get height() { return this.#height; }

   get width() { return this.#width; }

   set constrain(constrain)
   {
      if (this.#lock) { return; }

      if (typeof constrain !== 'boolean') { throw new TypeError(`'constrain' is not a boolean.`); }

      this.#constrain = constrain;
   }

   set element(element)
   {
      if (this.#lock) { return; }

      if (element === void 0  || element === null || element instanceof HTMLElement)
      {
         this.#element = element;
      }
      else
      {
         throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
      }
   }

   set enabled(enabled)
   {
      if (this.#lock) { return; }

      if (typeof enabled !== 'boolean') { throw new TypeError(`'enabled' is not a boolean.`); }

      this.#enabled = enabled;
   }

   set height(height)
   {
      if (this.#lock) { return; }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   set width(width)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }
   }

   setDimension(width, height)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   /**
    * Provides a validator that respects transforms in positional data constraining the position to within the target
    * elements bounds.
    *
    * @param {import('../').ValidationData}   valData - The associated validation data for position updates.
    *
    * @returns {import('../').TJSPositionData} Potentially adjusted position data.
    */
   validator(valData)
   {
      // Early out if element is undefined or local enabled state is false.
      if (!this.#enabled) { return valData.position; }

      // Determine containing bounds from manual values; or any element; lastly the browser width / height.
      const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
      const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;

      if (typeof valData.position.width === 'number')
      {
         const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
         valData.position.width = valData.width = clamp(valData.position.width, valData.minWidth, maxW);

         if ((valData.width + valData.position.left + valData.marginLeft) > boundsWidth)
         {
            valData.position.left = boundsWidth - valData.width - valData.marginLeft;
         }
      }

      if (typeof valData.position.height === 'number')
      {
         const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
         valData.position.height = valData.height = clamp(valData.position.height, valData.minHeight, maxH);

         if ((valData.height + valData.position.top + valData.marginTop) > boundsHeight)
         {
            valData.position.top = boundsHeight - valData.height - valData.marginTop;
         }
      }

      const maxL = Math.max(boundsWidth - valData.width - valData.marginLeft, 0);
      valData.position.left = Math.round(clamp(valData.position.left, 0, maxL));

      const maxT = Math.max(boundsHeight - valData.height - valData.marginTop, 0);
      valData.position.top = Math.round(clamp(valData.position.top, 0, maxT));

      return valData.position;
   }
}

const s_TRANSFORM_DATA = new TJSTransformData();

class TransformBounds
{
   /**
    * When true constrains the min / max width or height to element.
    *
    * @type {boolean}
    */
   #constrain;

   /**
    * @type {HTMLElement}
    */
   #element;

   /**
    * When true the validator is active.
    *
    * @type {boolean}
    */
   #enabled;

   /**
    * Provides a manual setting of the element height. As things go `offsetHeight` causes a browser layout and is not
    * performance oriented. If manually set this height is used instead of `offsetHeight`.
    *
    * @type {number}
    */
   #height;

   /**
    * Set from an optional value in the constructor to lock accessors preventing modification.
    */
   #lock;

   /**
    * Provides a manual setting of the element width. As things go `offsetWidth` causes a browser layout and is not
    * performance oriented. If manually set this width is used instead of `offsetWidth`.
    *
    * @type {number}
    */
   #width;

   constructor({ constrain = true, element, enabled = true, lock = false, width, height } = {})
   {
      this.element = element;
      this.constrain = constrain;
      this.enabled = enabled;
      this.width = width;
      this.height = height;

      this.#lock = typeof lock === 'boolean' ? lock : false;
   }

   get constrain() { return this.#constrain; }

   get element() { return this.#element; }

   get enabled() { return this.#enabled; }

   get height() { return this.#height; }

   get width() { return this.#width; }

   set constrain(constrain)
   {
      if (this.#lock) { return; }

      if (typeof constrain !== 'boolean') { throw new TypeError(`'constrain' is not a boolean.`); }

      this.#constrain = constrain;
   }

   set element(element)
   {
      if (this.#lock) { return; }

      if (element === void 0 || element === null || element instanceof HTMLElement)
      {
         this.#element = element;
      }
      else
      {
         throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
      }
   }

   set enabled(enabled)
   {
      if (this.#lock) { return; }

      if (typeof enabled !== 'boolean') { throw new TypeError(`'enabled' is not a boolean.`); }

      this.#enabled = enabled;
   }

   set height(height)
   {
      if (this.#lock) { return; }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   set width(width)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }
   }

   setDimension(width, height)
   {
      if (this.#lock) { return; }

      if (width === void 0 || Number.isFinite(width))
      {
         this.#width = width;
      }
      else
      {
         throw new TypeError(`'width' is not a finite number or undefined.`);
      }

      if (height === void 0 || Number.isFinite(height))
      {
         this.#height = height;
      }
      else
      {
         throw new TypeError(`'height' is not a finite number or undefined.`);
      }
   }

   /**
    * Provides a validator that respects transforms in positional data constraining the position to within the target
    * elements bounds.
    *
    * @param {import('../').ValidationData}   valData - The associated validation data for position updates.
    *
    * @returns {import('../').TJSPositionData} Potentially adjusted position data.
    */
   validator(valData)
   {
      // Early out if element is undefined or local enabled state is false.
      if (!this.#enabled) { return valData.position; }

      // Determine containing bounds from manual values; or any element; lastly the browser width / height.
      const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
      const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;

      // Ensure min / max width constraints when position width is a number; not 'auto' or 'inherit'. If constrain is
      // true cap width bounds.
      if (typeof valData.position.width === 'number')
      {
         const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
         valData.position.width = clamp(valData.width, valData.minWidth, maxW);
      }

      // Ensure min / max height constraints when position height is a number; not 'auto' or 'inherit'. If constrain
      // is true cap height bounds.
      if (typeof valData.position.height === 'number')
      {
         const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
         valData.position.height = clamp(valData.height, valData.minHeight, maxH);
      }

      // Get transform data. First set constraints including any margin top / left as offsets and width / height. Used
      // when position width / height is 'auto'.
      const data = valData.transforms.getData(valData.position, s_TRANSFORM_DATA, valData);

      // Check the bounding rectangle against browser height / width. Adjust position based on how far the overlap of
      // the bounding rect is outside the bounds height / width. The order below matters as the constraints are top /
      // left oriented, so perform those checks last.

      const initialX = data.boundingRect.x;
      const initialY = data.boundingRect.y;

      if (data.boundingRect.bottom + valData.marginTop > boundsHeight)
      {
         data.boundingRect.y += boundsHeight - data.boundingRect.bottom - valData.marginTop;
      }

      if (data.boundingRect.right + valData.marginLeft > boundsWidth)
      {
         data.boundingRect.x += boundsWidth - data.boundingRect.right - valData.marginLeft;
      }

      if (data.boundingRect.top - valData.marginTop < 0)
      {
         data.boundingRect.y += Math.abs(data.boundingRect.top - valData.marginTop);
      }

      if (data.boundingRect.left - valData.marginLeft < 0)
      {
         data.boundingRect.x += Math.abs(data.boundingRect.left - valData.marginLeft);
      }

      valData.position.left -= initialX - data.boundingRect.x;
      valData.position.top -= initialY - data.boundingRect.y;

      return valData.position;
   }
}

class UpdateElementData
{
   constructor()
   {
      /**
       * Stores the private data from TJSPosition.
       *
       * @type {TJSPositionData}
       */
      this.data = void 0;

      /**
       * Provides a copy of local data sent to subscribers.
       *
       * @type {TJSPositionData}
       */
      this.dataSubscribers = new TJSPositionData();

      /**
       * Stores the current dimension data used for the readable `dimension` store.
       *
       * @type {{width: number | 'auto', height: number | 'auto'}}
       */
      this.dimensionData = { width: 0, height: 0 };

      /**
       * @type {import('../PositionChangeSet').PositionChangeSet}
       */
      this.changeSet = void 0;

      /**
       * @type {import('../').TJSPositionOptions}
       */
      this.options = void 0;

      /**
       * Stores if this TJSPosition / update data is queued for update.
       *
       * @type {boolean}
       */
      this.queued = false;

      /**
       * @type {import('../StyleCache').StyleCache}
       */
      this.styleCache = void 0;

      /**
       * @type {import('../transform').TJSTransforms}
       */
      this.transforms = void 0;

      /**
       * Stores the current transform data used for the readable `transform` store. It is only active when there are
       * subscribers to the store or calculateTransform options is true.
       *
       * @type {TJSTransformData}
       */
      this.transformData = new TJSTransformData();

      /**
       * @type {(function(TJSPositionData): void)[]}
       */
      this.subscriptions = void 0;

      /**
       * @type {import('#svelte/store').Writable<{width: (number|"auto"), height: (number|"auto")}>}
       */
      this.storeDimension = writable(this.dimensionData);

      // When there are subscribers set option to calculate transform updates; set to false when no subscribers.

      /**
       * @type {import('#svelte/store').Writable<TJSTransformData>}
       */
      this.storeTransform = writable(this.transformData, () =>
      {
         this.options.transformSubscribed = true;
         return () => this.options.transformSubscribed = false;
      });

      /**
       * Stores the queued state for update element processing.
       *
       * @type {boolean}
       */
      this.queued = false;

      // Seal data backing readable stores.
      Object.seal(this.dimensionData);
   }
}

/**
 * Decouples updates to any parent target HTMLElement inline styles. Invoke {@link TJSPosition.elementUpdated} to await
 * on the returned promise that is resolved with the current render time via `nextAnimationFrame` /
 * `requestAnimationFrame`. This allows the underlying data model to be updated immediately while updates to the
 * element are in sync with the browser and potentially in the future be further throttled.
 *
 * @param {HTMLElement} el - The target HTMLElement.
 */
class UpdateElementManager
{
   static list = [];
   static listCntr = 0;

   static updatePromise;

   static get promise() { return this.updatePromise; }

   /**
    * Potentially adds the given element and internal updateData instance to the list.
    *
    * @param {HTMLElement}       el - An HTMLElement instance.
    *
    * @param {import('./UpdateElementData').UpdateElementData} updateData - An UpdateElementData instance.
    *
    * @returns {Promise<number>} The unified next frame update promise. Returns `currentTime`.
    */
   static add(el, updateData)
   {
      if (this.listCntr < this.list.length)
      {
         const entry = this.list[this.listCntr];
         entry[0] = el;
         entry[1] = updateData;
      }
      else
      {
         this.list.push([el, updateData]);
      }

      this.listCntr++;
      updateData.queued = true;

      if (!this.updatePromise) { this.updatePromise = this.wait(); }

      return this.updatePromise;
   }

   /**
    * Await on `nextAnimationFrame` and iterate over list map invoking callback functions.
    *
    * @returns {Promise<number>} The next frame Promise / currentTime from nextAnimationFrame.
    */
   static async wait()
   {
      // Await the next animation frame. In the future this can be extended to multiple frames to divide update rate.
      const currentTime = await nextAnimationFrame();

      this.updatePromise = void 0;

      for (let cntr = this.listCntr; --cntr >= 0;)
      {
         // Obtain data for entry.
         const entry = this.list[cntr];
         const el = entry[0];
         const updateData = entry[1];

         // Clear entry data.
         entry[0] = void 0;
         entry[1] = void 0;

         // Reset queued state.
         updateData.queued = false;

         // Early out if the element is no longer connected to the DOM / shadow root.
         // if (!el.isConnected || !updateData.changeSet.hasChange()) { continue; }
         if (!el.isConnected) { continue; }

         if (updateData.options.ortho)
         {
            s_UPDATE_ELEMENT_ORTHO(el, updateData);
         }
         else
         {
            s_UPDATE_ELEMENT(el, updateData);
         }

         // If calculate transform options is enabled then update the transform data and set the readable store.
         if (updateData.options.calculateTransform || updateData.options.transformSubscribed)
         {
            s_UPDATE_TRANSFORM(el, updateData);
         }

         // Update all subscribers with changed data.
         this.updateSubscribers(updateData);
      }

      this.listCntr = 0;

      return currentTime;
   }

   /**
    * Potentially immediately updates the given element.
    *
    * @param {HTMLElement}       el - An HTMLElement instance.
    *
    * @param {import('./UpdateElementData').UpdateElementData} updateData - An UpdateElementData instance.
    */
   static immediate(el, updateData)
   {
      // Early out if the element is no longer connected to the DOM / shadow root.
      // if (!el.isConnected || !updateData.changeSet.hasChange()) { continue; }
      if (!el.isConnected) { return; }

      if (updateData.options.ortho)
      {
         s_UPDATE_ELEMENT_ORTHO(el, updateData);
      }
      else
      {
         s_UPDATE_ELEMENT(el, updateData);
      }

      // If calculate transform options is enabled then update the transform data and set the readable store.
      if (updateData.options.calculateTransform || updateData.options.transformSubscribed)
      {
         s_UPDATE_TRANSFORM(el, updateData);
      }

      // Update all subscribers with changed data.
      this.updateSubscribers(updateData);
   }

   /**
    * @param {import('./UpdateElementData').UpdateElementData} updateData - Data change set.
    */
   static updateSubscribers(updateData)
   {
      const data = updateData.data;
      const changeSet = updateData.changeSet;

      if (!changeSet.hasChange()) { return; }

      // Make a copy of the data.
      const output = updateData.dataSubscribers.copy(data);

      const subscriptions = updateData.subscriptions;

      // Early out if there are no subscribers.
      if (subscriptions.length > 0)
      {
         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](output); }
      }

      // Update dimension data if width / height has changed.
      if (changeSet.width || changeSet.height)
      {
         updateData.dimensionData.width = data.width;
         updateData.dimensionData.height = data.height;
         updateData.storeDimension.set(updateData.dimensionData);
      }

      changeSet.set(false);
   }
}

/**
 * Decouples updates to any parent target HTMLElement inline styles. Invoke {@link TJSPosition.elementUpdated} to await
 * on the returned promise that is resolved with the current render time via `nextAnimationFrame` /
 * `requestAnimationFrame`. This allows the underlying data model to be updated immediately while updates to the
 * element are in sync with the browser and potentially in the future be further throttled.
 *
 * @param {HTMLElement} el - The target HTMLElement.
 *
 * @param {import('./UpdateElementData').UpdateElementData} updateData - Update data.
 */
function s_UPDATE_ELEMENT(el, updateData)
{
   const changeSet = updateData.changeSet;
   const data = updateData.data;

   if (changeSet.left)
   {
      el.style.left = `${data.left}px`;
   }

   if (changeSet.top)
   {
      el.style.top = `${data.top}px`;
   }

   if (changeSet.zIndex)
   {
      el.style.zIndex = typeof data.zIndex === 'number' ? `${data.zIndex}` : null;
   }

   if (changeSet.width)
   {
      el.style.width = typeof data.width === 'number' ? `${data.width}px` : data.width;
   }

   if (changeSet.height)
   {
      el.style.height = typeof data.height === 'number' ? `${data.height}px` : data.height;
   }

   if (changeSet.transformOrigin)
   {
      // When set to 'center' we can simply set the transform to null which is center by default.
      el.style.transformOrigin = data.transformOrigin === 'center' ? null : data.transformOrigin;
   }

   // Update all transforms in order added to transforms object.
   if (changeSet.transform)
   {
      el.style.transform = updateData.transforms.isActive ? updateData.transforms.getCSS() : null;
   }
}

/**
 * Decouples updates to any parent target HTMLElement inline styles. Invoke {@link TJSPosition.elementUpdated} to await
 * on the returned promise that is resolved with the current render time via `nextAnimationFrame` /
 * `requestAnimationFrame`. This allows the underlying data model to be updated immediately while updates to the
 * element are in sync with the browser and potentially in the future be further throttled.
 *
 * @param {HTMLElement} el - The target HTMLElement.
 *
 * @param {import('./UpdateElementData').UpdateElementData} updateData - Update data.
 */
function s_UPDATE_ELEMENT_ORTHO(el, updateData)
{
   const changeSet = updateData.changeSet;
   const data = updateData.data;

   if (changeSet.zIndex)
   {
      el.style.zIndex = typeof data.zIndex === 'number' ? `${data.zIndex}` : null;
   }

   if (changeSet.width)
   {
      el.style.width = typeof data.width === 'number' ? `${data.width}px` : data.width;
   }

   if (changeSet.height)
   {
      el.style.height = typeof data.height === 'number' ? `${data.height}px` : data.height;
   }

   if (changeSet.transformOrigin)
   {
      // When set to 'center' we can simply set the transform to null which is center by default.
      el.style.transformOrigin = data.transformOrigin === 'center' ? null : data.transformOrigin;
   }

   // Update all transforms in order added to transforms object.
   if (changeSet.left || changeSet.top || changeSet.transform)
   {
      el.style.transform = updateData.transforms.getCSSOrtho(data);
   }
}

/**
 * Updates the applied transform data and sets the readble `transform` store.
 *
 * @param {HTMLElement} el - The target HTMLElement.
 *
 * @param {import('./UpdateElementData').UpdateElementData} updateData - Update element data.
 */
function s_UPDATE_TRANSFORM(el, updateData)
{
   s_VALIDATION_DATA$1.height = updateData.data.height !== 'auto' ? updateData.data.height :
    updateData.styleCache.offsetHeight;

   s_VALIDATION_DATA$1.width = updateData.data.width !== 'auto' ? updateData.data.width :
    updateData.styleCache.offsetWidth;

   s_VALIDATION_DATA$1.marginLeft = updateData.styleCache.marginLeft;

   s_VALIDATION_DATA$1.marginTop = updateData.styleCache.marginTop;

   // Get transform data. First set constraints including any margin top / left as offsets and width / height. Used
   // when position width / height is 'auto'.
   updateData.transforms.getData(updateData.data, updateData.transformData, s_VALIDATION_DATA$1);

   updateData.storeTransform.set(updateData.transformData);
}

const s_VALIDATION_DATA$1 = {
   height: void 0,
   width: void 0,
   marginLeft: void 0,
   marginTop: void 0
};

/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
class TJSPosition
{
   /**
    * @type {{browserCentered: Centered, Centered: Centered}}
    */
   static #positionInitial = {
      browserCentered: new Centered({ lock: true }),
      Centered
   };

   /**
    * @type {{TransformBounds: TransformBounds, BasicBounds: BasicBounds, basicWindow: BasicBounds, transformWindow: TransformBounds}}
    */
   static #positionValidators = {
      basicWindow: new BasicBounds({ lock: true }),
      BasicBounds,
      transformWindow: new TransformBounds({ lock: true }),
      TransformBounds
   };

   /**
    * @type {TJSPositionData}
    */
   #data = new TJSPositionData();

   /**
    * Provides the animation API.
    *
    * @type {AnimationAPI}
    */
   #animate = new AnimationAPI(this, this.#data);

   /**
    * Provides a way to turn on / off the position handling.
    *
    * @type {boolean}
    */
   #enabled = true;

   /**
    * Stores ongoing options that are set in the constructor or by transform store subscription.
    *
    * @type {import('./').TJSPositionOptions}
    */
   #options = {
      calculateTransform: false,
      initialHelper: void 0,
      ortho: true,
      transformSubscribed: false
   };

   /**
    * The associated parent for positional data tracking. Used in validators.
    *
    * @type {import('./').TJSPositionParent}
    */
   #parent;

   /**
    * Stores the style attributes that changed on update.
    *
    * @type {PositionChangeSet}
    */
   #positionChangeSet = new PositionChangeSet();

   /**
    * @type {import('./').StorePosition}
    */
   #stores;

   /**
    * Stores an instance of the computer styles for the target element.
    *
    * @type {StyleCache}
    */
   #styleCache;

   /**
    * Stores the subscribers.
    *
    * @type {(function(TJSPositionData): void)[]}
    */
   #subscriptions = [];

   /**
    * @type {TJSTransforms}
    */
   #transforms = new TJSTransforms();

   /**
    * @type {UpdateElementData}
    */
   #updateElementData;

   /**
    * Stores the UpdateElementManager wait promise.
    *
    * @type {Promise}
    */
   #updateElementPromise;

   /**
    * @type {AdapterValidators}
    */
   #validators;

   /**
    * @type {import('./').ValidatorData[]}
    */
   #validatorData;

   /**
    * @type {PositionStateAPI}
    */
   #state = new PositionStateAPI(this, this.#data, this.#transforms);

   /**
    * @returns {AnimationGroupAPI} Public Animation API.
    */
   static get Animate() { return AnimationGroupAPI; }

   /**
    * @returns {{browserCentered: Centered, Centered: Centered}} TJSPosition initial API.
    */
   static get Initial() { return this.#positionInitial; }

   /**
    * Returns TJSTransformData class / constructor.
    *
    * @returns {TJSTransformData} TJSTransformData class / constructor.
    */
   static get TransformData() { return TJSTransformData; }

   /**
    * Returns default validators.
    *
    * Note: `basicWindow` and `BasicBounds` will eventually be removed.
    *
    * @returns {{TransformBounds: TransformBounds, BasicBounds: BasicBounds, basicWindow: BasicBounds, transformWindow: TransformBounds}}
    * Available validators.
    */
   static get Validators() { return this.#positionValidators; }

   /**
    * Returns a duplicate of a given position instance copying any options and validators.
    *
    * // TODO: Consider more safety over options processing.
    *
    * @param {TJSPosition}          position - A position instance.
    *
    * @param {import('./').TJSPositionOptions}   options - TJSPosition options.
    *
    * @returns {TJSPosition} A duplicate position instance.
    */
   static duplicate(position, options)
   {
      if (!(position instanceof TJSPosition)) { throw new TypeError(`'position' is not an instance of Position.`); }

      const newPosition = new TJSPosition(options);

      newPosition.#options = Object.assign({}, position.#options, options);
      newPosition.#validators.add(...position.#validators);

      newPosition.set(position.#data);

      return newPosition;
   }

   /**
    * @param {import('./').TJSPositionParent | import('./').TJSPositionOptionsAll}   [parent] - A potential parent
    *        element or object w/ `elementTarget` getter. May also be the TJSPositionOptions object w/ 1 argument.
    *
    * @param {import('./').TJSPositionOptionsAll}   [options] - Default values.
    */
   constructor(parent, options)
   {
      // Test if `parent` is a plain object; if so treat as options object.
      if (isPlainObject(parent))
      {
         options = parent;
      }
      else
      {
         this.#parent = parent;
      }

      const data = this.#data;
      const transforms = this.#transforms;

      this.#styleCache = new StyleCache();

      const updateData = new UpdateElementData();

      updateData.changeSet = this.#positionChangeSet;
      updateData.data = this.#data;
      updateData.options = this.#options;
      updateData.styleCache = this.#styleCache;
      updateData.subscriptions = this.#subscriptions;
      updateData.transforms = this.#transforms;

      this.#updateElementData = updateData;

      if (isObject(options))
      {
         // Set TJSPosition options
         if (typeof options.calculateTransform === 'boolean')
         {
            this.#options.calculateTransform = options.calculateTransform;
         }

         if (typeof options.ortho === 'boolean')
         {
            this.#options.ortho = options.ortho;
         }

         // Set default values from options.

         if (Number.isFinite(options.height) || options.height === 'auto' || options.height === 'inherit' ||
          options.height === null)
         {
            data.height = updateData.dimensionData.height = typeof options.height === 'number' ?
             Math.round(options.height) : options.height;
         }

         if (Number.isFinite(options.left) || options.left === null)
         {
            data.left = typeof options.left === 'number' ? Math.round(options.left) : options.left;
         }

         if (Number.isFinite(options.maxHeight) || options.maxHeight === null)
         {
            data.maxHeight = typeof options.maxHeight === 'number' ? Math.round(options.maxHeight) : options.maxHeight;
         }

         if (Number.isFinite(options.maxWidth) || options.maxWidth === null)
         {
            data.maxWidth = typeof options.maxWidth === 'number' ? Math.round(options.maxWidth) : options.maxWidth;
         }

         if (Number.isFinite(options.minHeight) || options.minHeight === null)
         {
            data.minHeight = typeof options.minHeight === 'number' ? Math.round(options.minHeight) : options.minHeight;
         }

         if (Number.isFinite(options.minWidth) || options.minWidth === null)
         {
            data.minWidth = typeof options.minWidth === 'number' ? Math.round(options.minWidth) : options.minWidth;
         }

         if (Number.isFinite(options.rotateX) || options.rotateX === null)
         {
            transforms.rotateX = data.rotateX = options.rotateX;
         }

         if (Number.isFinite(options.rotateY) || options.rotateY === null)
         {
            transforms.rotateY = data.rotateY = options.rotateY;
         }

         if (Number.isFinite(options.rotateZ) || options.rotateZ === null)
         {
            transforms.rotateZ = data.rotateZ = options.rotateZ;
         }

         if (Number.isFinite(options.scale) || options.scale === null)
         {
            transforms.scale = data.scale = options.scale;
         }

         if (Number.isFinite(options.top) || options.top === null)
         {
            data.top = typeof options.top === 'number' ? Math.round(options.top) : options.top;
         }

         if (typeof options.transformOrigin === 'string' || options.transformOrigin === null)
         {
            data.transformOrigin = transformOrigins.includes(options.transformOrigin) ?
             options.transformOrigin : null;
         }

         if (Number.isFinite(options.translateX) || options.translateX === null)
         {
            transforms.translateX = data.translateX = options.translateX;
         }

         if (Number.isFinite(options.translateY) || options.translateY === null)
         {
            transforms.translateY = data.translateY = options.translateY;
         }

         if (Number.isFinite(options.translateZ) || options.translateZ === null)
         {
            transforms.translateZ = data.translateZ = options.translateZ;
         }

         if (Number.isFinite(options.width) || options.width === 'auto' || options.width === 'inherit' ||
          options.width === null)
         {
            data.width = updateData.dimensionData.width = typeof options.width === 'number' ?
             Math.round(options.width) : options.width;
         }

         if (Number.isFinite(options.zIndex) || options.zIndex === null)
         {
            data.zIndex = typeof options.zIndex === 'number' ? Math.round(options.zIndex) : options.zIndex;
         }
      }

      this.#stores = {
         // The main properties for manipulating TJSPosition.
         height: propertyStore(this, 'height'),
         left: propertyStore(this, 'left'),
         rotateX: propertyStore(this, 'rotateX'),
         rotateY: propertyStore(this, 'rotateY'),
         rotateZ: propertyStore(this, 'rotateZ'),
         scale: propertyStore(this, 'scale'),
         top: propertyStore(this, 'top'),
         transformOrigin: propertyStore(this, 'transformOrigin'),
         translateX: propertyStore(this, 'translateX'),
         translateY: propertyStore(this, 'translateY'),
         translateZ: propertyStore(this, 'translateZ'),
         width: propertyStore(this, 'width'),
         zIndex: propertyStore(this, 'zIndex'),

         // Stores that control validation when width / height is not `auto`.
         maxHeight: propertyStore(this, 'maxHeight'),
         maxWidth: propertyStore(this, 'maxWidth'),
         minHeight: propertyStore(this, 'minHeight'),
         minWidth: propertyStore(this, 'minWidth'),

         // Readable stores based on updates or from resize observer changes.
         dimension: { subscribe: updateData.storeDimension.subscribe },
         element: { subscribe: this.#styleCache.stores.element.subscribe },
         resizeContentHeight: { subscribe: this.#styleCache.stores.resizeContentHeight.subscribe },
         resizeContentWidth: { subscribe: this.#styleCache.stores.resizeContentWidth.subscribe },
         resizeOffsetHeight: { subscribe: this.#styleCache.stores.resizeOffsetHeight.subscribe },
         resizeOffsetWidth: { subscribe: this.#styleCache.stores.resizeOffsetWidth.subscribe },
         transform: { subscribe: updateData.storeTransform.subscribe },

         // Protected store that should only be set by resizeObserver action.
         resizeObserved: this.#styleCache.stores.resizeObserved,
      };

      // When resize change from any applied resizeObserver action automatically set data for new validation run.
      // A resizeObserver prop should be set to true for ApplicationShell components or usage of resizeObserver action
      // to monitor for changes. This should only be used on elements that have 'auto' for width or height.
      subscribeIgnoreFirst(this.#stores.resizeObserved, (resizeData) =>
      {
         const parent = this.#parent;
         const el = parent instanceof HTMLElement ? parent : parent?.elementTarget;

         // Only invoke set if there is a target element and the resize data has a valid offset width & height.
         if (el instanceof HTMLElement && Number.isFinite(resizeData?.offsetWidth) &&
          Number.isFinite(resizeData?.offsetHeight))
         {
            this.set(data);
         }
      });

      this.#stores.transformOrigin.values = transformOrigins;

      [this.#validators, this.#validatorData] = new AdapterValidators();

      if (options?.initial || options?.positionInitial)
      {
         const initialHelper = options.initial ?? options.positionInitial;

         if (typeof initialHelper?.getLeft !== 'function' || typeof initialHelper?.getTop !== 'function')
         {
            throw new Error(
             `'options.initial' position helper does not contain 'getLeft' and / or 'getTop' functions.`);
         }

         this.#options.initialHelper = options.initial;
      }

      if (options?.validator)
      {
         if (isIterable(options?.validator)) { this.validators.add(...options.validator); }
         else { this.validators.add(options.validator); }
      }
   }

   /**
    * Returns the animation API.
    *
    * @returns {AnimationAPI} Animation API.
    */
   get animate()
   {
      return this.#animate;
   }

   /**
    * Returns the dimension data for the readable store.
    *
    * @returns {{width: number | 'auto', height: number | 'auto'}} Dimension data.
    */
   get dimension()
   {
      return this.#updateElementData.dimensionData;
   }

   /**
    * Returns the enabled state.
    *
    * @returns {boolean} Enabled state.
    */
   get enabled()
   {
      return this.#enabled;
   }

   /**
    * Returns the current HTMLElement being positioned.
    *
    * @returns {HTMLElement|undefined} Current HTMLElement being positioned.
    */
   get element()
   {
      return this.#styleCache.el;
   }

   /**
    * Returns a promise that is resolved on the next element update with the time of the update.
    *
    * @returns {Promise<number>} Promise resolved on element update.
    */
   get elementUpdated()
   {
      return this.#updateElementPromise;
   }

   /**
    * Returns the associated {@link TJSPositionParent} instance.
    *
    * @returns {import('./').TJSPositionParent} The TJSPositionParent instance.
    */
   get parent() { return this.#parent; }

   /**
    * Returns the state API.
    *
    * @returns {PositionStateAPI} TJSPosition state API.
    */
   get state() { return this.#state; }

   /**
    * Returns the derived writable stores for individual data variables.
    *
    * @returns {import('./').StorePosition} Derived / writable stores.
    */
   get stores() { return this.#stores; }

   /**
    * Returns the transform data for the readable store.
    *
    * @returns {TJSTransformData} Transform Data.
    */
   get transform()
   {
      return this.#updateElementData.transformData;
   }

   /**
    * Returns the validators.
    *
    * @returns {AdapterValidators} validators.
    */
   get validators() { return this.#validators; }

   /**
    * Sets the enabled state.
    *
    * @param {boolean}  enabled - New enabled state.
    */
   set enabled(enabled)
   {
      if (typeof enabled !== 'boolean')
      {
         throw new TypeError(`'enabled' is not a boolean.`);
      }

      this.#enabled = enabled;
   }

   /**
    * Sets the associated {@link TJSPositionParent} instance. Resets the style cache and default data.
    *
    * @param {import('./').TJSPositionParent | void} parent - A TJSPositionParent instance.
    */
   set parent(parent)
   {
      if (parent !== void 0 && !(parent instanceof HTMLElement) && !isObject(parent))
      {
         throw new TypeError(`'parent' is not an HTMLElement, object, or undefined.`);
      }

      this.#parent = parent;

      // Reset any stored default data & the style cache.
      this.#state.remove({ name: '#defaultData' });
      this.#styleCache.reset();

      // If a parent is defined then invoke set to update any parent element.
      if (parent) { this.set(this.#data); }
   }

// Data accessors ----------------------------------------------------------------------------------------------------

   /**
    * @returns {number|'auto'|'inherit'|null} height
    */
   get height() { return this.#data.height; }

   /**
    * @returns {number|null} left
    */
   get left() { return this.#data.left; }

   /**
    * @returns {number|null} maxHeight
    */
   get maxHeight() { return this.#data.maxHeight; }

   /**
    * @returns {number|null} maxWidth
    */
   get maxWidth() { return this.#data.maxWidth; }

   /**
    * @returns {number|null} minHeight
    */
   get minHeight() { return this.#data.minHeight; }

   /**
    * @returns {number|null} minWidth
    */
   get minWidth() { return this.#data.minWidth; }

   /**
    * @returns {number|null} rotateX
    */
   get rotateX() { return this.#data.rotateX; }

   /**
    * @returns {number|null} rotateY
    */
   get rotateY() { return this.#data.rotateY; }

   /**
    * @returns {number|null} rotateZ
    */
   get rotateZ() { return this.#data.rotateZ; }

   /**
    * @returns {number|null} alias for rotateZ
    */
   get rotation() { return this.#data.rotateZ; }

   /**
    * @returns {number|null} scale
    */
   get scale() { return this.#data.scale; }

   /**
    * @returns {number|null} top
    */
   get top() { return this.#data.top; }

   /**
    * @returns {string} transformOrigin
    */
   get transformOrigin() { return this.#data.transformOrigin; }

   /**
    * @returns {number|null} translateX
    */
   get translateX() { return this.#data.translateX; }

   /**
    * @returns {number|null} translateY
    */
   get translateY() { return this.#data.translateY; }

   /**
    * @returns {number|null} translateZ
    */
   get translateZ() { return this.#data.translateZ; }

   /**
    * @returns {number|'auto'|'inherit'|null} width
    */
   get width() { return this.#data.width; }

   /**
    * @returns {number|null} z-index
    */
   get zIndex() { return this.#data.zIndex; }

   /**
    * @param {number|string|null} height -
    */
   set height(height)
   {
      this.#stores.height.set(height);
   }

   /**
    * @param {number|string|null} left -
    */
   set left(left)
   {
      this.#stores.left.set(left);
   }

   /**
    * @param {number|string|null} maxHeight -
    */
   set maxHeight(maxHeight)
   {
      this.#stores.maxHeight.set(maxHeight);
   }

   /**
    * @param {number|string|null} maxWidth -
    */
   set maxWidth(maxWidth)
   {
      this.#stores.maxWidth.set(maxWidth);
   }

   /**
    * @param {number|string|null} minHeight -
    */
   set minHeight(minHeight)
   {
      this.#stores.minHeight.set(minHeight);
   }

   /**
    * @param {number|string|null} minWidth -
    */
   set minWidth(minWidth)
   {
      this.#stores.minWidth.set(minWidth);
   }

   /**
    * @param {number|string|null} rotateX -
    */
   set rotateX(rotateX)
   {
      this.#stores.rotateX.set(rotateX);
   }

   /**
    * @param {number|string|null} rotateY -
    */
   set rotateY(rotateY)
   {
      this.#stores.rotateY.set(rotateY);
   }

   /**
    * @param {number|string|null} rotateZ -
    */
   set rotateZ(rotateZ)
   {
      this.#stores.rotateZ.set(rotateZ);
   }

   /**
    * @param {number|string|null} rotateZ - alias for rotateZ
    */
   set rotation(rotateZ)
   {
      this.#stores.rotateZ.set(rotateZ);
   }

   /**
    * @param {number|string|null} scale -
    */
   set scale(scale)
   {
      this.#stores.scale.set(scale);
   }

   /**
    * @param {number|string|null} top -
    */
   set top(top)
   {
      this.#stores.top.set(top);
   }

   /**
    * @param {string} transformOrigin -
    */
   set transformOrigin(transformOrigin)
   {
      if (transformOrigins.includes(transformOrigin)) { this.#stores.transformOrigin.set(transformOrigin); }
   }

   /**
    * @param {number|string|null} translateX -
    */
   set translateX(translateX)
   {
      this.#stores.translateX.set(translateX);
   }

   /**
    * @param {number|string|null} translateY -
    */
   set translateY(translateY)
   {
      this.#stores.translateY.set(translateY);
   }

   /**
    * @param {number|string|null} translateZ -
    */
   set translateZ(translateZ)
   {
      this.#stores.translateZ.set(translateZ);
   }

   /**
    * @param {number|string|null} width -
    */
   set width(width)
   {
      this.#stores.width.set(width);
   }

   /**
    * @param {number|string|null} zIndex -
    */
   set zIndex(zIndex)
   {
      this.#stores.zIndex.set(zIndex);
   }

   /**
    * Assigns current position to object passed into method.
    *
    * @param {object|TJSPositionData}  [position] - Target to assign current position data.
    *
    * @param {import('./').TJSPositionGetOptions}   [options] - Defines options for specific keys and substituting null
    *        for numeric default values.
    *
    * @returns {TJSPositionData} Passed in object with current position data.
    */
   get(position = {}, options)
   {
      const keys = options?.keys;
      const excludeKeys = options?.exclude;
      const numeric = options?.numeric ?? false;

      if (isIterable(keys))
      {
         // Replace any null values potentially with numeric default values.
         if (numeric)
         {
            for (const key of keys) { position[key] = this[key] ?? numericDefaults[key]; }
         }
         else // Accept current values.
         {
            for (const key of keys) { position[key] = this[key]; }
         }

         // Remove any excluded keys.
         if (isIterable(excludeKeys))
         {
            for (const key of excludeKeys) { delete position[key]; }
         }

         return position;
      }
      else
      {
         const data = Object.assign(position, this.#data);

         // Remove any excluded keys.
         if (isIterable(excludeKeys))
         {
            for (const key of excludeKeys) { delete data[key]; }
         }

         // Potentially set numeric defaults.
         if (numeric) { setNumericDefaults(data); }

         return data;
      }
   }

   /**
    * @returns {TJSPositionData} Current position data.
    */
   toJSON()
   {
      return Object.assign({}, this.#data);
   }

   /**
    * All calculation and updates of position are implemented in {@link TJSPosition}. This allows position to be fully
    * reactive and in control of updating inline styles for the application.
    *
    * Note: the logic for updating position is improved and changes a few aspects from the default
    * {@link Application.setPosition}. The gate on `popOut` is removed, so to ensure no positional application occurs
    * popOut applications can set `this.options.positionable` to false ensuring no positional inline styles are
    * applied.
    *
    * The initial set call on an application with a target element will always set width / height as this is
    * necessary for correct calculations.
    *
    * When a target element is present updated styles are applied after validation. To modify the behavior of set
    * implement one or more validator functions and add them from the application via
    * `this.position.validators.add(<Function>)`.
    *
    * Updates to any target element are decoupled from the underlying TJSPosition data. This method returns this instance
    * that you can then await on the target element inline style update by using {@link TJSPosition.elementUpdated}.
    *
    * @param {import('./').TJSPositionDataExtended} [position] - TJSPosition data to set.
    *
    * @returns {TJSPosition} This TJSPosition instance.
    */
   set(position = {})
   {
      if (typeof position !== 'object') { throw new TypeError(`Position - set error: 'position' is not an object.`); }

      const parent = this.#parent;

      // An early out to prevent `set` from taking effect if not enabled.
      if (!this.#enabled)
      {
         return this;
      }

      // An early out to prevent `set` from taking effect if options `positionable` is false.
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return this;
      }

      // Callers can specify to immediately update an associated element. This is useful if set is called from
      // requestAnimationFrame / rAF. Library integrations like GSAP invoke set from rAF.
      const immediateElementUpdate = position.immediateElementUpdate === true;

      const data = this.#data;
      const transforms = this.#transforms;

      // Find the target HTML element and verify that it is connected storing it in `el`.
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      const changeSet = this.#positionChangeSet;
      const styleCache = this.#styleCache;

      if (el)
      {
         // Cache the computed styles of the element.
         if (!styleCache.hasData(el))
         {
            styleCache.update(el);

            // Add will-change property if not already set in inline or computed styles.
            if (!styleCache.hasWillChange)
            ;

            // Update all properties / clear queued state.
            changeSet.set(true);
            this.#updateElementData.queued = false;
         }

         // Converts any relative string position data to numeric inputs.
         convertRelative(position, this);

         position = this.#updatePosition(position, parent, el, styleCache);

         // Check if a validator cancelled the update.
         if (position === null) { return this; }
      }

      if (Number.isFinite(position.left))
      {
         position.left = Math.round(position.left);

         if (data.left !== position.left) { data.left = position.left; changeSet.left = true; }
      }

      if (Number.isFinite(position.top))
      {
         position.top = Math.round(position.top);

         if (data.top !== position.top) { data.top = position.top; changeSet.top = true; }
      }

      if (Number.isFinite(position.maxHeight) || position.maxHeight === null)
      {
         position.maxHeight = typeof position.maxHeight === 'number' ? Math.round(position.maxHeight) : null;

         if (data.maxHeight !== position.maxHeight) { data.maxHeight = position.maxHeight; changeSet.maxHeight = true; }
      }

      if (Number.isFinite(position.maxWidth) || position.maxWidth === null)
      {
         position.maxWidth = typeof position.maxWidth === 'number' ? Math.round(position.maxWidth) : null;

         if (data.maxWidth !== position.maxWidth) { data.maxWidth = position.maxWidth; changeSet.maxWidth = true; }
      }

      if (Number.isFinite(position.minHeight) || position.minHeight === null)
      {
         position.minHeight = typeof position.minHeight === 'number' ? Math.round(position.minHeight) : null;

         if (data.minHeight !== position.minHeight) { data.minHeight = position.minHeight; changeSet.minHeight = true; }
      }

      if (Number.isFinite(position.minWidth) || position.minWidth === null)
      {
         position.minWidth = typeof position.minWidth === 'number' ? Math.round(position.minWidth) : null;

         if (data.minWidth !== position.minWidth) { data.minWidth = position.minWidth; changeSet.minWidth = true; }
      }

      if (Number.isFinite(position.rotateX) || position.rotateX === null)
      {
         if (data.rotateX !== position.rotateX)
         {
            data.rotateX = transforms.rotateX = position.rotateX;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.rotateY) || position.rotateY === null)
      {
         if (data.rotateY !== position.rotateY)
         {
            data.rotateY = transforms.rotateY = position.rotateY;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.rotateZ) || position.rotateZ === null)
      {
         if (data.rotateZ !== position.rotateZ)
         {
            data.rotateZ = transforms.rotateZ = position.rotateZ;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.scale) || position.scale === null)
      {
         position.scale = typeof position.scale === 'number' ? Math.max(0, Math.min(position.scale, 1000)) : null;

         if (data.scale !== position.scale)
         {
            data.scale = transforms.scale = position.scale;
            changeSet.transform = true;
         }
      }

      if ((typeof position.transformOrigin === 'string' && transformOrigins.includes(
       position.transformOrigin)) || position.transformOrigin === null)
      {
         if (data.transformOrigin !== position.transformOrigin)
         {
            data.transformOrigin = position.transformOrigin;
            changeSet.transformOrigin = true;
         }
      }

      if (Number.isFinite(position.translateX) || position.translateX === null)
      {
         if (data.translateX !== position.translateX)
         {
            data.translateX = transforms.translateX = position.translateX;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.translateY) || position.translateY === null)
      {
         if (data.translateY !== position.translateY)
         {
            data.translateY = transforms.translateY = position.translateY;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.translateZ) || position.translateZ === null)
      {
         if (data.translateZ !== position.translateZ)
         {
            data.translateZ = transforms.translateZ = position.translateZ;
            changeSet.transform = true;
         }
      }

      if (Number.isFinite(position.zIndex))
      {
         position.zIndex = Math.round(position.zIndex);

         if (data.zIndex !== position.zIndex) { data.zIndex = position.zIndex; changeSet.zIndex = true; }
      }

      if (Number.isFinite(position.width) || position.width === 'auto' || position.width === 'inherit' ||
       position.width === null)
      {
         position.width = typeof position.width === 'number' ? Math.round(position.width) : position.width;

         if (data.width !== position.width) { data.width = position.width; changeSet.width = true; }
      }

      if (Number.isFinite(position.height) || position.height === 'auto' || position.height === 'inherit' ||
       position.height === null)
      {
         position.height = typeof position.height === 'number' ? Math.round(position.height) : position.height;

         if (data.height !== position.height) { data.height = position.height; changeSet.height = true; }
      }

      if (el)
      {
         const defaultData = this.#state.getDefault();

         // Set default data after first set operation that has a target element.
         if (typeof defaultData !== 'object')
         {
            this.#state.save({ name: '#defaultData', ...Object.assign({}, data) });
         }

         // If `immediateElementUpdate` is true in position data passed to `set` then update the element immediately.
         // This is for rAF based library integrations like GSAP.
         if (immediateElementUpdate)
         {
            UpdateElementManager.immediate(el, this.#updateElementData);
            this.#updateElementPromise = Promise.resolve(performance.now());
         }
         // Else if not queued then queue an update for the next rAF callback.
         else if (!this.#updateElementData.queued)
         {
            this.#updateElementPromise = UpdateElementManager.add(el, this.#updateElementData);
         }
      }
      else
      {
         // Notify main store subscribers.
         UpdateElementManager.updateSubscribers(this.#updateElementData);
      }

      return this;
   }

   /**
    *
    * @param {function(TJSPositionData): void} handler - Callback function that is invoked on update / changes. Receives
    *                                                 a copy of the TJSPositionData.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(Object.assign({}, this.#data));                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * @param {import('./').TJSPositionDataExtended} opts -
    *
    * @param {number|null} opts.left -
    *
    * @param {number|null} opts.top -
    *
    * @param {number|null} opts.maxHeight -
    *
    * @param {number|null} opts.maxWidth -
    *
    * @param {number|null} opts.minHeight -
    *
    * @param {number|null} opts.minWidth -
    *
    * @param {number|'auto'|null} opts.width -
    *
    * @param {number|'auto'|null} opts.height -
    *
    * @param {number|null} opts.rotateX -
    *
    * @param {number|null} opts.rotateY -
    *
    * @param {number|null} opts.rotateZ -
    *
    * @param {number|null} opts.scale -
    *
    * @param {string} opts.transformOrigin -
    *
    * @param {number|null} opts.translateX -
    *
    * @param {number|null} opts.translateY -
    *
    * @param {number|null} opts.translateZ -
    *
    * @param {number|null} opts.zIndex -
    *
    * @param {number|null} opts.rotation - alias for rotateZ
    *
    * @param {*} opts.rest -
    *
    * @param {object} parent -
    *
    * @param {HTMLElement} el -
    *
    * @param {StyleCache} styleCache -
    *
    * @returns {null|TJSPositionData} Updated position data or null if validation fails.
    */
   #updatePosition({
      // Directly supported parameters
      left, top, maxWidth, maxHeight, minWidth, minHeight, width, height, rotateX, rotateY, rotateZ, scale,
       transformOrigin, translateX, translateY, translateZ, zIndex,

      // Aliased parameters
      rotation,

      ...rest
   } = {}, parent, el, styleCache)
   {
      let currentPosition = s_DATA_UPDATE.copy(this.#data);

      // Update width if an explicit value is passed, or if no width value is set on the element.
      if (el.style.width === '' || width !== void 0)
      {
         if (width === 'auto' || (currentPosition.width === 'auto' && width !== null))
         {
            currentPosition.width = 'auto';
            width = styleCache.offsetWidth;
         }
         else if (width === 'inherit' || (currentPosition.width === 'inherit' && width !== null))
         {
            currentPosition.width = 'inherit';
            width = styleCache.offsetWidth;
         }
         else
         {
            const newWidth = Number.isFinite(width) ? width : currentPosition.width;
            currentPosition.width = width = Number.isFinite(newWidth) ? Math.round(newWidth) : styleCache.offsetWidth;
         }
      }
      else
      {
         width = Number.isFinite(currentPosition.width) ? currentPosition.width : styleCache.offsetWidth;
      }

      // Update height if an explicit value is passed, or if no height value is set on the element.
      if (el.style.height === '' || height !== void 0)
      {
         if (height === 'auto' || (currentPosition.height === 'auto' && height !== null))
         {
            currentPosition.height = 'auto';
            height = styleCache.offsetHeight;
         }
         else if (height === 'inherit' || (currentPosition.height === 'inherit' && height !== null))
         {
            currentPosition.height = 'inherit';
            height = styleCache.offsetHeight;
         }
         else
         {
            const newHeight = Number.isFinite(height) ? height : currentPosition.height;
            currentPosition.height = height = Number.isFinite(newHeight) ? Math.round(newHeight) :
             styleCache.offsetHeight;
         }
      }
      else
      {
         height = Number.isFinite(currentPosition.height) ? currentPosition.height : styleCache.offsetHeight;
      }

      // Update left
      if (Number.isFinite(left))
      {
         currentPosition.left = left;
      }
      else if (!Number.isFinite(currentPosition.left))
      {
         // Potentially use any initial position helper if available or set to 0.
         currentPosition.left = typeof this.#options.initialHelper?.getLeft === 'function' ?
          this.#options.initialHelper.getLeft(width) : 0;
      }

      // Update top
      if (Number.isFinite(top))
      {
         currentPosition.top = top;
      }
      else if (!Number.isFinite(currentPosition.top))
      {
         // Potentially use any initial position helper if available or set to 0.
         currentPosition.top = typeof this.#options.initialHelper?.getTop === 'function' ?
          this.#options.initialHelper.getTop(height) : 0;
      }

      if (Number.isFinite(maxHeight) || maxHeight === null)
      {
         currentPosition.maxHeight = Number.isFinite(maxHeight) ? Math.round(maxHeight) : null;
      }

      if (Number.isFinite(maxWidth) || maxWidth === null)
      {
         currentPosition.maxWidth = Number.isFinite(maxWidth) ? Math.round(maxWidth) : null;
      }

      if (Number.isFinite(minHeight) || minHeight === null)
      {
         currentPosition.minHeight = Number.isFinite(minHeight) ? Math.round(minHeight) : null;
      }

      if (Number.isFinite(minWidth) || minWidth === null)
      {
         currentPosition.minWidth = Number.isFinite(minWidth) ? Math.round(minWidth) : null;
      }

      // Update rotate X/Y/Z, scale, z-index
      if (Number.isFinite(rotateX) || rotateX === null) { currentPosition.rotateX = rotateX; }
      if (Number.isFinite(rotateY) || rotateY === null) { currentPosition.rotateY = rotateY; }

      // Handle alias for rotateZ. First check if `rotateZ` is valid and different from the current value. Next check if
      // `rotation` is valid and use it for `rotateZ`.
      if (rotateZ !== currentPosition.rotateZ && (Number.isFinite(rotateZ) || rotateZ === null))
      {
         currentPosition.rotateZ = rotateZ;
      }
      else if (rotation !== currentPosition.rotateZ && (Number.isFinite(rotation) || rotation === null))
      {
         currentPosition.rotateZ = rotation;
      }

      if (Number.isFinite(translateX) || translateX === null) { currentPosition.translateX = translateX; }
      if (Number.isFinite(translateY) || translateY === null) { currentPosition.translateY = translateY; }
      if (Number.isFinite(translateZ) || translateZ === null) { currentPosition.translateZ = translateZ; }

      if (Number.isFinite(scale) || scale === null)
      {
         currentPosition.scale = typeof scale === 'number' ? Math.max(0, Math.min(scale, 1000)) : null;
      }

      if (typeof transformOrigin === 'string' || transformOrigin === null)
      {
         currentPosition.transformOrigin = transformOrigins.includes(transformOrigin) ? transformOrigin :
          null;
      }

      if (Number.isFinite(zIndex) || zIndex === null)
      {
         currentPosition.zIndex = typeof zIndex === 'number' ? Math.round(zIndex) : zIndex;
      }

      const validatorData = this.#validatorData;

      // If there are any validators allow them to potentially modify position data or reject the update.
      if (this.#validators.enabled && validatorData.length)
      {
         s_VALIDATION_DATA.parent = parent;

         s_VALIDATION_DATA.el = el;

         s_VALIDATION_DATA.computed = styleCache.computed;

         s_VALIDATION_DATA.transforms = this.#transforms;

         s_VALIDATION_DATA.height = height;

         s_VALIDATION_DATA.width = width;

         s_VALIDATION_DATA.marginLeft = styleCache.marginLeft;

         s_VALIDATION_DATA.marginTop = styleCache.marginTop;

         s_VALIDATION_DATA.maxHeight = styleCache.maxHeight ?? currentPosition.maxHeight;

         s_VALIDATION_DATA.maxWidth = styleCache.maxWidth ?? currentPosition.maxWidth;

         // Given a parent w/ reactive state and is minimized ignore styleCache min-width/height.
         const isMinimized = parent?.reactive?.minimized ?? false;

         // Note the use of || for accessing the style cache as the left hand is ignored w/ falsy values such as '0'.
         s_VALIDATION_DATA.minHeight = isMinimized ? currentPosition.minHeight ?? 0 :
          styleCache.minHeight || (currentPosition.minHeight ?? 0);

         s_VALIDATION_DATA.minWidth = isMinimized ? currentPosition.minWidth ?? 0 :
          styleCache.minWidth || (currentPosition.minWidth ?? 0);

         for (let cntr = 0; cntr < validatorData.length; cntr++)
         {
            s_VALIDATION_DATA.position = currentPosition;
            s_VALIDATION_DATA.rest = rest;
            currentPosition = validatorData[cntr].validator(s_VALIDATION_DATA);

            if (currentPosition === null) { return null; }
         }
      }

      // Return the updated position object.
      return currentPosition;
   }
}

const s_DATA_UPDATE = new TJSPositionData();

/**
 * @type {import('./').ValidationData}
 */
const s_VALIDATION_DATA = {
   position: void 0,
   parent: void 0,
   el: void 0,
   computed: void 0,
   transforms: void 0,
   height: void 0,
   width: void 0,
   marginLeft: void 0,
   marginTop: void 0,
   maxHeight: void 0,
   maxWidth: void 0,
   minHeight: void 0,
   minWidth: void 0,
   rest: void 0
};

Object.seal(s_VALIDATION_DATA);

/**
 * Provides an action to apply a TJSPosition instance to a HTMLElement and invoke `position.parent`
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {import('..').TJSPosition}   position - A position instance.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function applyPosition(node, position)
{
   if (hasSetter(position, 'parent')) { position.parent = node; }

   return {
      update: (newPosition) =>
      {
         // Sanity case to short circuit update if positions are the same instance.
         if (newPosition === position && newPosition.parent === position.parent) { return; }

         if (hasSetter(position)) { position.parent = void 0; }

         position = newPosition;

         if (hasSetter(position, 'parent')) { position.parent = node; }
      },

      destroy: () => { if (hasSetter(position, 'parent')) { position.parent = void 0; } }
   };
}

/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `position.set` on a given
 * {@link TJSPosition} instance provided. When the attached boolean store state changes the draggable action is enabled
 * or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {import('..').TJSPosition}   params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {number}            [params.button=0] - MouseEvent button; {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}.
 *
 * @param {import('#svelte/store').Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging"
 *        state.
 *
 * @param {boolean}           [params.ease=true] - When true easing is enabled.
 *
 * @param {object}            [params.easeOptions] - Gsap `to / `quickTo` vars object.
 *
 * @param {Iterable<string>}  [params.hasTargetClassList] - When defined any event targets that have a class in this
 *        list are allowed.
 *
 * @param {Iterable<string>}  [params.ignoreTargetClassList] - When defined any event targets that have a class in this
 *        list are ignored.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggable(node, { position, active = true, button = 0, storeDragging = void 0, ease = false,
 easeOptions = { duration: 0.1, ease: cubicOut }, hasTargetClassList, ignoreTargetClassList })
{
   if (hasTargetClassList !== void 0 && !isIterable(hasTargetClassList))
   {
      throw new TypeError(`'hasTargetClassList' is not iterable.`);
   }

   if (ignoreTargetClassList !== void 0 && !isIterable(ignoreTargetClassList))
   {
      throw new TypeError(`'ignoreTargetClassList' is not iterable.`);
   }

   /**
    * Used for direct call to `position.set`.
    *
    * @type {{top: number, left: number}}
    */
   const positionData = { left: 0, top: 0 };

   /**
    * Duplicate the app / Positionable starting position to track differences.
    *
    * @type {object}
    */
   let initialPosition = null;

   /**
    * Stores the initial X / Y on drag down.
    *
    * @type {object}
    */
   let initialDragPoint = {};

   /**
    * Stores the current dragging state and gates the move pointer as the dragging store is not
    * set until the first pointer move.
    *
    * @type {boolean}
    */
   let dragging = false;

   /**
    * Stores the quickTo callback to use for optimized tweening when easing is enabled.
    *
    * @type {import('#svelte-lib/store/position').quickToCallback}
    */
   let quickTo = position.animate.quickTo(['top', 'left'], easeOptions);

   /**
    * Remember event handlers associated with this action, so they may be later unregistered.
    *
    * @type {({ [key: string]: [
    *    keyof HTMLElementEventMap,
    *    (this:HTMLElement, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any,
    *    boolean | AddEventListenerOptions]
    * })}
    */
   const handlers = {
      dragDown: ['pointerdown', onDragPointerDown, false],
      dragMove: ['pointermove', onDragPointerChange, false],
      dragUp: ['pointerup', onDragPointerUp, false]
   };

   /**
    * Activates listeners.
    */
   function activateListeners()
   {
      // Drag handlers
      node.addEventListener(...handlers.dragDown);
      node.classList.add('draggable');
   }

   /**
    * Removes listeners.
    */
   function removeListeners()
   {
      if (typeof storeDragging?.set === 'function') { storeDragging.set(false); }

      // Drag handlers
      node.removeEventListener(...handlers.dragDown);
      node.removeEventListener(...handlers.dragMove);
      node.removeEventListener(...handlers.dragUp);
      node.classList.remove('draggable');
   }

   if (active)
   {
      activateListeners();
   }

   /**
    * Handle the initial pointer down that activates dragging behavior for the positionable.
    *
    * @param {PointerEvent} event - The pointer down event.
    */
   function onDragPointerDown(event)
   {
      if (event.button !== button || !event.isPrimary) { return; }

      // Do not process if the position system is not enabled.
      if (!position.enabled) { return; }

      // Potentially ignore this event if `ignoreTargetClassList` is defined and the `event.target` has a matching
      // class.
      if (ignoreTargetClassList !== void 0 && event.target instanceof HTMLElement)
      {
         for (const targetClass of ignoreTargetClassList)
         {
            if (event.target.classList.contains(targetClass)) { return; }
         }
      }

      // Potentially ignore this event if `hasTargetClassList` is defined and the `event.target` does not have any
      // matching class from the list.
      if (hasTargetClassList !== void 0 && event.target instanceof HTMLElement)
      {
         let foundTarget = false;

         for (const targetClass of hasTargetClassList)
         {
            if (event.target.classList.contains(targetClass))
            {
               foundTarget = true;
               break;
            }
         }

         if (!foundTarget) { return; }
      }

      event.preventDefault();

      dragging = false;

      // Record initial position.
      initialPosition = position.get();
      initialDragPoint = { x: event.clientX, y: event.clientY };

      // Add move and pointer up handlers.
      node.addEventListener(...handlers.dragMove);
      node.addEventListener(...handlers.dragUp);

      node.setPointerCapture(event.pointerId);
   }

   /**
    * Move the positionable.
    *
    * @param {PointerEvent} event - The pointer move event.
    */
   function onDragPointerChange(event)
   {
      // See chorded button presses for pointer events:
      // https://www.w3.org/TR/pointerevents3/#chorded-button-interactions
      // TODO: Support different button configurations for PointerEvents.
      if ((event.buttons & 1) === 0)
      {
         onDragPointerUp(event);
         return;
      }

      if (event.button !== -1 || !event.isPrimary) { return; }

      event.preventDefault();

      // Only set store dragging on first move event.
      if (!dragging && typeof storeDragging?.set === 'function')
      {
         dragging = true;
         storeDragging.set(true);
      }

      /** @type {number} */
      const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
      /** @type {number} */
      const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);

      if (ease)
      {
         quickTo(newTop, newLeft);
      }
      else
      {
         positionData.left = newLeft;
         positionData.top = newTop;

         position.set(positionData);
      }
   }

   /**
    * Finish dragging and set the final position and removing listeners.
    *
    * @param {PointerEvent} event - The pointer up event.
    */
   function onDragPointerUp(event)
   {
      event.preventDefault();

      dragging = false;
      if (typeof storeDragging?.set === 'function') { storeDragging.set(false); }

      node.removeEventListener(...handlers.dragMove);
      node.removeEventListener(...handlers.dragUp);
   }

   return {
      // The default of active being true won't automatically add listeners twice.
      update: (options) =>
      {
         if (typeof options.active === 'boolean')
         {
            active = options.active;
            if (active) { activateListeners(); }
            else { removeListeners(); }
         }

         if (typeof options.button === 'number')
         {
            button = options.button;
         }

         if (options.position !== void 0 && options.position !== position)
         {
            position = options.position;
            quickTo = position.animate.quickTo(['top', 'left'], easeOptions);
         }

         if (typeof options.ease === 'boolean') { ease = options.ease; }

         if (isObject(options.easeOptions))
         {
            easeOptions = options.easeOptions;
            quickTo.options(easeOptions);
         }

         if (options.hasTargetClassList !== void 0)
         {
            if (!isIterable(options.hasTargetClassList))
            {
               throw new TypeError(`'hasTargetClassList' is not iterable.`);
            }
            else
            {
               hasTargetClassList = options.hasTargetClassList;
            }
         }

         if (options.ignoreTargetClassList !== void 0)
         {
            if (!isIterable(options.ignoreTargetClassList))
            {
               throw new TypeError(`'ignoreTargetClassList' is not iterable.`);
            }
            else
            {
               ignoreTargetClassList = options.ignoreTargetClassList;
            }
         }
      },

      destroy: () => removeListeners()
   };
}

class DraggableOptions
{
   #ease = false;

   /**
    * @type {{ duration: number, ease: (t: number) => number | string }}
    */
   #easeOptions = { duration: 0.1, ease: cubicOut };

   /**
    * Stores the subscribers.
    *
    * @type {(function(DraggableOptions): void)[]}
    */
   #subscriptions = [];

   /**
    *
    * @param {object} [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.ease] -
    *
    * @param {object}   [opts.easeOptions] -
    */
   constructor({ ease, easeOptions } = {})
   {
      // Define the following getters directly on this instance and make them enumerable. This allows them to be
      // picked up w/ `Object.assign`.
      Object.defineProperty(this, 'ease', {
         get: () => { return this.#ease; },
         set: (newEase) =>
         {
            if (typeof newEase !== 'boolean') { throw new TypeError(`'ease' is not a boolean.`); }

            this.#ease = newEase;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'easeOptions', {
         get: () => { return this.#easeOptions; },
         set: (newEaseOptions) =>
         {
            if (newEaseOptions === null || typeof newEaseOptions !== 'object')
            {
               throw new TypeError(`'easeOptions' is not an object.`);
            }

            if (newEaseOptions.duration !== void 0)
            {
               if (!Number.isFinite(newEaseOptions.duration))
               {
                  throw new TypeError(`'easeOptions.duration' is not a finite number.`);
               }

               if (newEaseOptions.duration < 0) { throw new Error(`'easeOptions.duration' is less than 0.`); }

               this.#easeOptions.duration = newEaseOptions.duration;
            }

            if (newEaseOptions.ease !== void 0)
            {
               if (typeof newEaseOptions.ease !== 'function' && typeof newEaseOptions.ease !== 'string')
               {
                  throw new TypeError(`'easeOptions.ease' is not a function or string.`);
               }

               this.#easeOptions.ease = newEaseOptions.ease;
            }

            this.#updateSubscribers();
         },
         enumerable: true
      });

      // Set default options.
      if (ease !== void 0) { this.ease = ease; }
      if (easeOptions !== void 0) { this.easeOptions = easeOptions; }
   }


   /**
    * @returns {number} Get ease duration
    */
   get easeDuration() { return this.#easeOptions.duration; }

   /**
    * @returns {string|Function} Get easing function value.
    */
   get easeValue() { return this.#easeOptions.ease; }


   /**
    * @param {number}   duration - Set ease duration.
    */
   set easeDuration(duration)
   {
      if (!Number.isFinite(duration))
      {
         throw new TypeError(`'duration' is not a finite number.`);
      }

      if (duration < 0) { throw new Error(`'duration' is less than 0.`); }

      this.#easeOptions.duration = duration;
      this.#updateSubscribers();
   }

   /**
    * @param {string|Function} value - Get easing function value.
    */
   set easeValue(value)
   {
      if (typeof value !== 'function' && typeof value !== 'string')
      {
         throw new TypeError(`'value' is not a function or string.`);
      }

      this.#easeOptions.ease = value;
      this.#updateSubscribers();
   }

   /**
    * Resets all options data to default values.
    */
   reset()
   {
      this.#ease = false;
      this.#easeOptions = { duration: 0.1, ease: cubicOut };
      this.#updateSubscribers();
   }

   /**
    * Resets easing options to default values.
    */
   resetEase()
   {
      this.#easeOptions = { duration: 0.1, ease: cubicOut };
      this.#updateSubscribers();
   }

   /**
    *
    * @param {function(DraggableOptions): void} handler - Callback function that is invoked on update / changes.
    *                                                 Receives the DraggableOptions object / instance.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   #updateSubscribers()
   {
      const subscriptions = this.#subscriptions;

      // Early out if there are no subscribers.
      if (subscriptions.length > 0)
      {
         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](this); }
      }
   }
}

/**
 * Define a function to get a DraggableOptions instance.
 *
 * @param {{ ease?: boolean, easeOptions?: object }} options - Draggable options.
 *
 * @returns {DraggableOptions} A new options instance.
 */
draggable.options = (options) => new DraggableOptions(options);

export { TJSPosition, TJSPositionData, TJSTransformData, TJSTransforms, applyPosition, draggable };
//# sourceMappingURL=index.js.map
