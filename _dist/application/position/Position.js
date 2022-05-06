import { linear }                from 'svelte/easing';

import { lerp }                  from '@typhonjs-fvtt/svelte/math';
import {
   propertyStore,
   subscribeIgnoreFirst }        from '@typhonjs-fvtt/svelte/store';
import { isIterable }            from '@typhonjs-fvtt/svelte/util';

import { AnimationManager }      from './animation/AnimationManager.js';
import * as constants            from './constants.js';
import * as positionInitial      from './initial/index.js';
import { PositionChangeSet }     from './PositionChangeSet.js';
import { PositionData }          from './PositionData.js';
import { StyleCache }            from './StyleCache.js';
import { TransformData }         from './transform/TransformData.js';
import { AdapterValidators }     from './validators/AdapterValidators.js';
import * as positionValidators   from './validators/index.js';
import { Transforms }            from './transform/Transforms.js';
import { UpdateElementData }     from './update/UpdateElementData.js';
import { UpdateElementManager }  from './update/UpdateElementManager.js';

/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
export class Position
{
   /**
    * @type {PositionData}
    */
   #data = new PositionData();

   /**
    * Stores current animation keys.
    *
    * @type {Set<string>}
    */
   #currentAnimationKeys = new Set();

   /**
    * @type {Map<string, PositionData>}
    */
   #dataSaved = new Map();

   /**
    * @type {PositionData}
    */
   #defaultData;

   /**
    * Stores the style attributes that changed on update.
    *
    * @type {PositionChangeSet}
    */
   #positionChangeSet = new PositionChangeSet();

   /**
    * Stores ongoing options that are set in the constructor or by transform store subscription.
    *
    * @type {PositionOptions}
    */
   #options = {
      calculateTransform: false,
      initialHelper: void 0,
      ortho: false,
      transformSubscribed: false
   };

   /**
    * The associated parent for positional data tracking. Used in validators.
    *
    * @type {PositionParent}
    */
   #parent;

   /**
    * @type {StorePosition}
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
    * @type {(function(PositionData): void)[]}
    */
   #subscriptions = [];

   /**
    * @type {Transforms}
    */
   #transforms = new Transforms();

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
    * @type {ValidatorData[]}
    */
   #validatorData;

   /**
    * @returns {{browserCentered?: Centered, Centered?: *}} Initial position helpers.
    */
   static get Initial() { return positionInitial; }

   /**
    * Returns TransformData class / constructor.
    *
    * @returns {TransformData} TransformData class / constructor.
    */
   static get TransformData() { return TransformData; }

   /**
    * Returns default validators.
    *
    * Note: `basicWindow` and `BasicBounds` will eventually be removed.
    *
    * @returns {{basicWindow?: BasicBounds, transformWindow?: TransformBounds, TransformBounds?: *, BasicBounds?: *}}
    *  Available validators.
    */
   static get Validators() { return positionValidators; }

   /**
    * @param {PositionParent} parent - The associated parent for positional data tracking. Used in validators.
    *
    * @param {object}         options - Default values.
    */
   constructor(parent, options = {})
   {
      this.#parent = parent;

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

      if (typeof options === 'object')
      {
         // Set Position options
         if (typeof options.calculateTransform === 'boolean')
         {
            this.#options.calculateTransform = options.calculateTransform;
         }

         if (typeof options.ortho === 'boolean')
         {
            this.#options.ortho = options.ortho;
         }

         // Set default values from options.

         if (Number.isFinite(options.height) || options.height === 'auto' || options.height === null)
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
            data.transformOrigin = constants.transformOrigins.includes(options.transformOrigin) ?
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

         if (Number.isFinite(options.width) || options.width === 'auto' || options.width === null)
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
         // The main properties for manipulating Position.
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

      this.#stores.transformOrigin.values = constants.transformOrigins;

      Object.freeze(this.#stores);

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
    * Returns the dimension data for the readable store.
    *
    * @returns {{width: number | 'auto', height: number | 'auto'}} Dimension data.
    */
   get dimension()
   {
      return this.#updateElementData.dimensionData;
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
    * Returns the associated {@link PositionParent} instance.
    *
    * @returns {PositionParent} The PositionParent instance.
    */
   get parent() { return this.#parent; }

   /**
    * Returns the derived writable stores for individual data variables.
    *
    * @returns {StorePosition} Derived / writable stores.
    */
   get stores() { return this.#stores; }

   /**
    * Returns the transform data for the readable store.
    *
    * @returns {TransformData} Transform Data.
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
    * Sets the associated {@link PositionParent} instance. Resets the style cache and default data.
    *
    * @param {PositionParent} parent - A PositionParent instance.
    */
   set parent(parent)
   {
      this.#parent = parent;

      // Reset any stored default data & the style cache.
      this.#defaultData = void 0;
      this.#styleCache.reset();

      this.set(this.#data);
   }

// Data accessors ----------------------------------------------------------------------------------------------------

   /**
    * @returns {number|'auto'|null} height
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
    * @returns {number|'auto'|null} width
    */
   get width() { return this.#data.width; }

   /**
    * @returns {number|null} z-index
    */
   get zIndex() { return this.#data.zIndex; }

   /**
    * @param {number|'auto'|null} height -
    */
   set height(height)
   {
      this.#stores.height.set(height);
   }

   /**
    * @param {number|null} left -
    */
   set left(left)
   {
      this.#stores.left.set(left);
   }

   /**
    * @param {number|null} maxHeight -
    */
   set maxHeight(maxHeight)
   {
      this.#stores.maxHeight.set(maxHeight);
   }

   /**
    * @param {number|null} maxWidth -
    */
   set maxWidth(maxWidth)
   {
      this.#stores.maxWidth.set(maxWidth);
   }

   /**
    * @param {number|null} minHeight -
    */
   set minHeight(minHeight)
   {
      this.#stores.minHeight.set(minHeight);
   }

   /**
    * @param {number|null} minWidth -
    */
   set minWidth(minWidth)
   {
      this.#stores.minWidth.set(minWidth);
   }

   /**
    * @param {number|null} rotateX -
    */
   set rotateX(rotateX)
   {
      this.#stores.rotateX.set(rotateX);
   }

   /**
    * @param {number|null} rotateY -
    */
   set rotateY(rotateY)
   {
      this.#stores.rotateY.set(rotateY);
   }

   /**
    * @param {number|null} rotateZ -
    */
   set rotateZ(rotateZ)
   {
      this.#stores.rotateZ.set(rotateZ);
   }

   /**
    * @param {number|null} rotateZ - alias for rotateZ
    */
   set rotation(rotateZ)
   {
      this.#stores.rotateZ.set(rotateZ);
   }

   /**
    * @param {number|null} scale -
    */
   set scale(scale)
   {
      this.#stores.scale.set(scale);
   }

   /**
    * @param {number|null} top -
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
      if (constants.transformOrigins.includes(transformOrigin)) { this.#stores.transformOrigin.set(transformOrigin); }
   }

   /**
    * @param {number|null} translateX -
    */
   set translateX(translateX)
   {
      this.#stores.translateX.set(translateX);
   }

   /**
    * @param {number|null} translateY -
    */
   set translateY(translateY)
   {
      this.#stores.translateY.set(translateY);
   }

   /**
    * @param {number|null} translateZ -
    */
   set translateZ(translateZ)
   {
      this.#stores.translateZ.set(translateZ);
   }

   /**
    * @param {number|'auto'|null} width -
    */
   set width(width)
   {
      this.#stores.width.set(width);
   }

   /**
    * @param {number|null} zIndex -
    */
   set zIndex(zIndex)
   {
      this.#stores.zIndex.set(zIndex);
   }

   /**
    * Provides animation
    *
    * @param {PositionDataExtended} position - The destination position.
    *
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {number}         [opts.duration] - Duration in milliseconds.
    *
    * @param {Function}       [opts.easing=linear] - Easing function.
    *
    * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {Promise<void>} Promise that is resolved when animation completes.
    */
   async animateTo(position, { duration = 1000, easing = linear, interpolate = lerp } = {})
   {
      if (typeof position !== 'object')
      {
         throw new TypeError(`Position - animateTo error: 'position' is not an object.`);
      }

      // Early out if the application is not positionable.
      const parent = this.#parent;
      if (parent !== void 0 && typeof parent?.options?.positionable === 'boolean' && !parent?.options?.positionable)
      {
         return;
      }

      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;

      if (!el) { return; }

      if (!Number.isInteger(duration) || duration < 0)
      {
         throw new TypeError(`Position - animateTo error: 'duration' is not a positive integer.`);
      }

      if (typeof easing !== 'function')
      {
         throw new TypeError(`Position - animateTo error: 'easing' is not a function.`);
      }

      if (typeof interpolate !== 'function')
      {
         throw new TypeError(`Position - animateTo error: 'interpolate' is not a function.`);
      }

      const data = this.#data;
      const currentAnimationKeys = this.#currentAnimationKeys;
      const initial = {};
      const destination = {};

      // Set initial data if the key / data is defined and the end position is not equal to current data.
      for (const key in position)
      {
         if (data[key] !== void 0 && position[key] !== data[key])
         {
            destination[key] = position[key];
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
      // Add all keys that pass to `currentAnimationKeys`.
      for (const key in initial)
      {
         if (!Number.isFinite(initial[key]) || currentAnimationKeys.has(key)) { delete initial[key]; }
         else { currentAnimationKeys.add(key); }
      }

      const newData = Object.assign({}, initial);
      const keys = Object.keys(newData);

      // Nothing to animate, so return now.
      if (keys.length === 0) { return; }

      const animationData = {
         current: 0,
         currentAnimationKeys,
         destination,
         duration,
         easing,
         el,
         initial,
         interpolate,
         keys,
         newData,
         position: this
      };

      const promise = new Promise((resolve) => animationData.resolve = resolve);

      AnimationManager.add(animationData);

      // Schedule w/ animation manager.
      return promise;
   }

   /**
    * Assigns current position to object passed into method.
    *
    * @param {object|PositionData}  [position] - Target to assign current position data.
    *
    * @param {Iterable<string>}     [keys] - When provided only these keys are copied.
    *
    * @returns {PositionData} Passed in object with current position data.
    */
   get(position = {}, keys = void 0)
   {
      const data = this.#data;

      if (isIterable(keys))
      {
         for (const key of keys) { position[key] = data[key]; }
         return position;
      }
      else
      {
         return Object.assign(position, data);
      }
   }

   /**
    * Returns any stored save state by name.
    *
    * @param {string}   name - Saved data set name.
    *
    * @returns {PositionData} The saved data set.
    */
   getSave({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - getSave error: 'name' is not a string.`); }

      return this.#dataSaved.get(name);
   }

   /**
    * @returns {PositionData} Current position data.
    */
   toJSON()
   {
      return Object.assign({}, this.#data);
   }

   /**
    * Resets data to default values and invokes set. Check options, but by default current z-index is maintained.
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
      if (typeof this.#defaultData !== 'object') { return false; }

      if (this.#currentAnimationKeys.size) { return false; }

      const zIndex = this.#data.zIndex;

      const data = Object.assign({}, this.#defaultData);

      if (keepZIndex) { data.zIndex = zIndex; }

      // Remove any keys that are currently animating.
      for (const key of this.#currentAnimationKeys) { delete data[key]; }

      // Reset the transform data.
      this.#transforms.reset(data);

      // If current minimized invoke `maximize`.
      if (this.#parent?.reactive?.minimized) { this.#parent?.maximize?.({ animate: false, duration: 0 }); }

      if (invokeSet) { this.set(data); }

      return true;
   }

   /**
    * Removes and returns any position state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {PositionData} Saved position data.
    */
   remove({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - remove: 'name' is not a string.`); }

      const data = this.#dataSaved.get(name);
      this.#dataSaved.delete(name);

      return data;
   }

   /**
    * Restores a saved positional state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link Position.animateTo} allows
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
    * @param {number}            [params.duration=100] - Duration in milliseconds.
    *
    * @param {Function}          [params.easing=linear] - Easing function.
    *
    * @param {Function}          [params.interpolate=lerp] - Interpolation function.
    *
    * @returns {PositionData} Saved position data.
    */
   restore({ name, remove = false, properties, silent = false, async = false, animateTo = false, duration = 100,
    easing = linear, interpolate = lerp })
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
            if (data.transformOrigin !== this.transformOrigin)
            {
               this.transformOrigin = data.transformOrigin;
            }

            // Return a Promise with saved data that resolves after animation ends.
            if (async)
            {
               return this.animateTo(data, { duration, easing, interpolate }).then(() => dataSaved);
            }
            else  // Animate synchronously.
            {
               this.animateTo(data, { duration, easing, interpolate });
            }
         }
         else
         {
            // Default options is to set data for an immediate update.
            this.set(data);
         }
      }

      return dataSaved;
   }

   /**
    * Saves current position state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - name to index this saved data.
    *
    * @param {...*}     [options.extra] - Extra data to add to saved data.
    *
    * @returns {PositionData} Current position data
    */
   save({ name, ...extra })
   {
      if (typeof name !== 'string') { throw new TypeError(`Position - save error: 'name' is not a string.`); }

      const data = this.get(extra);

      this.#dataSaved.set(name, data);

      return data;
   }

   /**
    * All calculation and updates of position are implemented in {@link Position}. This allows position to be fully
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
    * Updates to any target element are decoupled from the underlying Position data. This method returns this instance
    * that you can then await on the target element inline style update by using {@link Position.elementUpdated}.
    *
    * @param {PositionDataExtended} [position] - Position data to set.
    *
    * @returns {Position} This Position instance.
    */
   set(position = {})
   {
      if (typeof position !== 'object') { throw new TypeError(`Position - set error: 'position' is not an object.`); }

      const parent = this.#parent;

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
            {
               el.style.willChange = this.#options.ortho ? 'transform' : 'top, left, transform';
            }

            // Update all properties / clear queued state.
            changeSet.set(true);
            this.#updateElementData.queued = false;
         }

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

      if ((typeof position.transformOrigin === 'string' && constants.transformOrigins.includes(
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

      if (Number.isFinite(position.width) || position.width === 'auto' || position.width === null)
      {
         position.width = typeof position.width === 'number' ? Math.round(position.width) : position.width;

         if (data.width !== position.width) { data.width = position.width; changeSet.width = true; }
      }

      if (Number.isFinite(position.height) || position.height === 'auto' || position.height === null)
      {
         position.height = typeof position.height === 'number' ? Math.round(position.height) : position.height;

         if (data.height !== position.height) { data.height = position.height; changeSet.height = true; }
      }

      if (el)
      {
         // Set default data after first set operation that has a target element.
         if (typeof this.#defaultData !== 'object') { this.#defaultData = Object.assign({}, data); }

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
    * @param {function(PositionData): void} handler - Callback function that is invoked on update / changes. Receives
    *                                                 a copy of the PositionData.
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
    * @param {PositionDataExtended} opts -
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
    * @returns {null|PositionData} Updated position data or null if validation fails.
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

      // Handle alias for rotateZ first then check rotateZ.
      if (Number.isFinite(rotation) || rotation === null) { currentPosition.rotateZ = rotation; }
      else if (Number.isFinite(rotateZ) || rotateZ === null) { currentPosition.rotateZ = rotateZ; }

      if (Number.isFinite(translateX) || translateX === null) { currentPosition.translateX = translateX; }
      if (Number.isFinite(translateY) || translateY === null) { currentPosition.translateY = translateY; }
      if (Number.isFinite(translateZ) || translateZ === null) { currentPosition.translateZ = translateZ; }

      if (Number.isFinite(scale) || scale === null)
      {
         currentPosition.scale = typeof scale === 'number' ? Math.max(0, Math.min(scale, 1000)) : null;
      }

      if (typeof transformOrigin === 'string' || transformOrigin === null)
      {
         currentPosition.transformOrigin = constants.transformOrigins.includes(transformOrigin) ? transformOrigin :
          null;
      }

      if (Number.isFinite(zIndex) || zIndex === null)
      {
         currentPosition.zIndex = typeof zIndex === 'number' ? Math.round(zIndex) : zIndex;
      }

      const validatorData = this.#validatorData;

      // If there are any validators allow them to potentially modify position data or reject the update.
      if (validatorData.length)
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

         // Note the use of || for accessing the style cache as the left hand is ignored w/ falsy values such as '0'.
         s_VALIDATION_DATA.minHeight = styleCache.minHeight || (currentPosition.minHeight ?? 0);
         s_VALIDATION_DATA.minWidth = styleCache.minWidth || (currentPosition.minWidth ?? 0);

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

const s_DATA_UPDATE = new PositionData();

/**
 * @type {ValidationData}
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
 * @typedef {object} InitialHelper
 *
 * @property {Function} getLeft - A function that takes the width parameter and returns the left position.
 *
 * @property {Function} getTop - A function that takes the height parameter and returns the top position.
 */

/**
 * @typedef {PositionData} PositionDataExtended
 *
 * @property {boolean} [immediateElementUpdate] - When true any associated element is updated immediately.
 *
 * @property {number|null} [rotation] - Alias for `rotateZ`.
 */

/**
 * @typedef {object} PositionOptions - Options set in constructor.
 *
 * @property {boolean} calculateTransform - When true always calculate transform data.
 *
 * @property {InitialHelper} initialHelper - Provides a helper for setting initial position data.
 *
 * @property {boolean} ortho - Sets Position to orthographic mode using just transform / matrix3d for positioning.
 *
 * @property {boolean} transformSubscribed - Set to true when there are subscribers to the readable transform store.
 */

/**
 * @typedef {HTMLElement | object} PositionParent
 *
 * @property {Function} [elementTarget] - Potentially returns any parent object.
 */

/**
 * @typedef {object} ResizeObserverData
 *
 * @property {number|undefined} contentHeight -
 *
 * @property {number|undefined} contentWidth -
 *
 * @property {number|undefined} offsetHeight -
 *
 * @property {number|undefined} offsetWidth -
 */

/**
 * @typedef {object} StorePosition - Provides individual writable stores for {@link Position}.
 *
 * @property {import('svelte/store').Readable<{width: number, height: number}>} dimension - Readable store for dimension
 *                                                                                          data.
 *
 * @property {import('svelte/store').Readable<HTMLElement>} element - Readable store for current element.
 *
 * @property {import('svelte/store').Writable<number|null>} left - Derived store for `left` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} top - Derived store for `top` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} width - Derived store for `width` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} height - Derived store for `height` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} maxHeight - Derived store for `maxHeight` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} maxWidth - Derived store for `maxWidth` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} minHeight - Derived store for `minHeight` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} minWidth - Derived store for `minWidth` updates.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeContentHeight - Readable store for `contentHeight`.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeContentWidth - Readable store for `contentWidth`.
 *
 * @property {import('svelte/store').Writable<ResizeObserverData>} resizeObserved - Protected store for resize observer updates.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeOffsetHeight - Readable store for `offsetHeight`.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeOffsetWidth - Readable store for `offsetWidth`.
 *
 * @property {import('svelte/store').Writable<number|null>} rotate - Derived store for `rotate` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateX - Derived store for `rotateX` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateY - Derived store for `rotateY` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateZ - Derived store for `rotateZ` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} scale - Derived store for `scale` updates.
 *
 * @property {import('svelte/store').Readable<TransformData>} transform - Readable store for transform data.
 *
 * @property {import('svelte/store').Writable<string>} transformOrigin - Derived store for `transformOrigin`.
 *
 * @property {import('svelte/store').Writable<number|null>} translateX - Derived store for `translateX` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} translateY - Derived store for `translateY` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} translateZ - Derived store for `translateZ` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} zIndex - Derived store for `zIndex` updates.
 */

/**
 * @typedef {object} ValidationData
 *
 * @property {PositionData} position -
 *
 * @property {PositionParent} parent -
 *
 * @property {HTMLElement} el -
 *
 * @property {CSSStyleDeclaration} computed -
 *
 * @property {Transforms} transforms -
 *
 * @property {number} height -
 *
 * @property {number} width -
 *
 * @property {number|undefined} marginLeft -
 *
 * @property {number|undefined} marginTop -
 *
 * @property {number|undefined} maxHeight -
 *
 * @property {number|undefined} maxWidth -
 *
 * @property {number|undefined} minHeight -
 *
 * @property {number|undefined} minWidth -
 *
 * @property {object} rest - The rest of any data submitted to {@link Position.set}
 */
