import { writable }           from 'svelte/store';
import { propertyStore }      from '@typhonjs-fvtt/svelte/store';

import { AdapterValidators }  from './AdapterValidators.js';
import { styleParsePixels }   from '../styleParsePixels.js';

/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
export class Position
{
   #subscriptions = [];

   /**
    * @type {PositionData}
    */
   #data = { height: null, left: null, rotate: null, rotateX: null, rotateY: null, rotateZ: null, scale: null,
      top: null, width: null, zIndex: null };

   /**
    * The associated parent for positional data tracking. Used in validators.
    *
    * @type {object}
    */
   #parent;

   #store;

   /**
    * @type {StorePosition}
    */
   #stores;

   #transforms = {};

   /**
    * @type {AdapterValidators}
    */
   #validators;

   /**
    * @type {ValidatorData[]}
    */
   #validatorsAdapter;

   /**
    * @param {object}         parent - The associated parent for positional data tracking. Used in validators.
    *
    * @param {PositionData}   position - Initial position data.
    */
   constructor(parent, position)
   {
      this.#parent = parent;

      this.#store = writable(this.#data);

      this.#stores = {
         height: propertyStore(this.#store, 'height'),
         left: propertyStore(this.#store, 'left'),
         rotate: propertyStore(this.#store, 'rotate'),
         rotateX: propertyStore(this.#store, 'rotateX'),
         rotateY: propertyStore(this.#store, 'rotateY'),
         rotateZ: propertyStore(this.#store, 'rotateZ'),
         scale: propertyStore(this.#store, 'scale'),
         top: propertyStore(this.#store, 'top'),
         width: propertyStore(this.#store, 'width'),
         zIndex: propertyStore(this.#store, 'zIndex')
      };

      [this.#validators, this.#validatorsAdapter] = new AdapterValidators();

      this.set(position);
   }

   /**
    * Returns the derived writable stores for individual data variables.
    *
    * @returns {StorePosition} Derived / writable stores.
    */
   get stores() { return this.#stores; }

   /**
    * Returns the validators.
    *
    * @returns {AdapterValidators} validators.
    */
   get validators() { return this.#validators; }

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
    * @returns {number|null} rotate
    */
   get rotate() { return this.#data.rotate; }

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
    * @returns {number|null} scale
    */
   get scale() { return this.#data.scale; }

   /**
    * @returns {number|null} top
    */
   get top() { return this.#data.top; }

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
      this.set({ ...this.#data, height });
   }

   /**
    * @param {number|null} left -
    */
   set left(left)
   {
      this.set({ ...this.#data, left });
   }

   /**
    * @param {number|null} rotate -
    */
   set rotate(rotate)
   {
      this.set({ ...this.#data, rotate });
   }

   /**
    * @param {number|null} rotateX -
    */
   set rotateX(rotateX)
   {
      this.set({ ...this.#data, rotateX });
   }

   /**
    * @param {number|null} rotateY -
    */
   set rotateY(rotateY)
   {
      this.set({ ...this.#data, rotateY });
   }

   /**
    * @param {number|null} rotateZ -
    */
   set rotateZ(rotateZ)
   {
      this.set({ ...this.#data, rotateZ });
   }

   /**
    * @param {number|null} scale -
    */
   set scale(scale)
   {
      this.set({ ...this.#data, scale });
   }

   /**
    * @param {number|null} top -
    */
   set top(top)
   {
      this.set({ ...this.#data, top });
   }

   /**
    * @param {number|'auto'|null} width -
    */
   set width(width)
   {
      this.set({ ...this.#data, width });
   }

   /**
    * @param {number|null} zIndex -
    */
   set zIndex(zIndex)
   {
      this.set({ ...this.#data, zIndex });
   }

   /**
    * Assigns current position to object passed into method.
    *
    * @param {object|PositionData} [position] - Target to assign current position data.
    *
    * @returns {PositionData} Passed in object with current position data.
    */
   get(position = {})
   {
      return Object.assign(position, this.#data);
   }

   /**
    * @returns {PositionData} Current position data.
    */
   toJSON()
   {
      return Object.assign({}, this.#data);
   }

   /**
    * All calculation and updates of position are implemented in {@link Position}. This allows position to be fully
    * reactive and in control of updating inline styles for the application.
    *
    * Note: the logic for updating position is improved and changes a few aspects from the default
    * {@link Application.setPosition}. The gate on `popOut` is removed, so to ensure no positional application occurs
    * popOut applications can set `this.options.setPosition` to false to ensure no positional inline styles are applied.
    *
    * `applyHeight` / `applyWidth` is set to true when el.style.height / width is not 'auto' and height & width is
    * applied.
    *
    * The initial set call on an application with a target element will always set width / height as this is
    * necessary for correct calculations.
    *
    * When a target element is present updated styles are applied after validation. To modify the behavior of set
    * implement one or more validator functions and add them from the application via
    * `this.position.validators.add(<Function>)`.
    *
    * @param {PositionData}   [position] - Position data to set.
    *
    * @returns {PositionData|null} The set position data after validation or null if rejected.
    */
   set(position = {})
   {
      if (typeof position !== 'object') { return this.get(); }

      const parent = this.#parent;

      // An early out to prevent `set` from taking effect if options `setPosition` is false.
      if (parent !== void 0 && typeof parent?.options?.setPosition === 'boolean' && !parent?.options?.setPosition)
      {
         return this.get();
      }

      const data = this.#data;
      const transforms = this.#transforms;
      const validators = this.#validators;

      let styles, updateTransform = false;

      const el = parent?.elementTarget;
      if (el)
      {
         styles = globalThis.getComputedStyle(el);
         position = this.#updatePosition(position, el, styles);
      }

      // If there are any validators allow them to potentially modify position data or reject the update.
      if (validators.length)
      {
         for (const validator of validators)
         {
            position = validator.validator(parent, position);

            if (position === null) { return this.get(); }
         }
      }

      let modified = false;

      if (typeof position.left === 'number')
      {
         position.left = Math.round(position.left);

         if (data.left !== position.left) { data.left = position.left; modified = true; }

         if (el) { el.style.left = `${position.left}px`; }
      }

      if (typeof position.top === 'number')
      {
         position.top = Math.round(position.top);

         if (data.top !== position.top) { data.top = position.top; modified = true; }

         if (el) { el.style.top = `${position.top}px`; }
      }

      if (typeof position.rotate === 'number' || position.rotate === null)
      {
         if (data.rotate !== position.rotate)
         {
            data.rotate = position.rotate;
            updateTransform = modified = true;

            if (typeof position.rotate === 'number') { transforms.rotate = `rotate(${position.rotate}deg)`; }
            else { delete transforms.rotate; }
         }
      }

      if (typeof position.rotateX === 'number' || position.rotateX === null)
      {
         if (data.rotateX !== position.rotateX)
         {
            data.rotateX = position.rotateX;
            updateTransform = modified = true;

            if (typeof position.rotateX === 'number') { transforms.rotateX = `rotateX(${position.rotateX}deg)`; }
            else { delete transforms.rotateX; }
         }
      }

      if (typeof position.rotateY === 'number' || position.rotateY === null)
      {
         if (data.rotateY !== position.rotateY)
         {
            data.rotateY = position.rotateY;
            updateTransform = modified = true;

            if (typeof position.rotateY === 'number') { transforms.rotateY = `rotateY(${position.rotateY}deg)`; }
            else { delete transforms.rotateY; }
         }
      }

      if (typeof position.rotateZ === 'number' || position.rotateZ === null)
      {
         if (data.rotateZ !== position.rotateZ)
         {
            data.rotateZ = position.rotateZ;
            updateTransform = modified = true;

            if (typeof position.rotateZ === 'number') { transforms.rotateZ = `rotateZ(${position.rotateZ}deg)`; }
            else { delete transforms.rotateZ; }
         }
      }

      if (typeof position.scale === 'number')
      {
         position.scale = Math.max(0, Math.min(position.scale, 1000));

         if (data.scale !== position.scale)
         {
            data.scale = position.scale;
            updateTransform = modified = true;

            if (typeof position.scale === 'number') { transforms.scale = `scale(${position.scale})`; }
            else { delete transforms.scale; }
         }
      }

      if (typeof position.zIndex === 'number')
      {
         position.zIndex = Math.round(position.zIndex);

         if (data.zIndex !== position.zIndex) { data.zIndex = position.zIndex; modified = true; }
      }

      if (typeof position.width === 'number' || position.width === 'auto' || position.width === null)
      {
         position.width = typeof position.width === 'number' ? Math.round(position.width) : position.width;

         if (data.width !== position.width) { data.width = position.width; modified = true; }

         if (el) { el.style.width = typeof data.width === 'number' ? `${data.width}px` : data.width; }
      }

      if (typeof position.height === 'number' || position.height === 'auto' || position.height === null)
      {
         position.height = typeof position.height === 'number' ? Math.round(position.height) : position.height;

         if (data.height !== position.height) { data.height = position.height; modified = true; }

         if (el) { el.style.height = typeof data.height === 'number' ? `${data.height}px` : data.height; }
      }

      // Update all transforms in order added to transforms object.
      if (el && updateTransform)
      {
         let transformString = '';

         for (const key in transforms) { transformString += transforms[key]; }

         el.style.transform = transformString;
      }

      // Notify main store subscribers.
      if (modified)
      {
         // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
         // support until 2023. IE not doing this will require several extra method calls otherwise.
         const subscriptions = this.#subscriptions;

         // Early out if there are no subscribers.
         if (subscriptions.length > 0)
         {
            for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](position); }
         }
      }

      // Update derived stores and notify.
      this.#store.set(data);

      return position;
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

   #updatePosition({ left, top, width, height, rotate, rotateX, rotateY, rotateZ, scale, zIndex, ...rest } = {}, el,
    styles)
   {
      const currentPosition = this.get(rest);

      // Update width if an explicit value is passed, or if no width value is set on the element.
      if (el.style.width === '' || width !== void 0)
      {
         if (width === 'auto' || (currentPosition.width === 'auto' && width !== null))
         {
            currentPosition.width = 'auto';
         }
         else
         {
            const tarW = typeof width === 'number' ? Math.round(width) : el.offsetWidth;
            const minW = styleParsePixels(styles.minWidth) || MIN_WINDOW_WIDTH;
            const maxW = styleParsePixels(styles.maxWidth) || el.style.maxWidth || globalThis.innerWidth;
            currentPosition.width = width = Math.clamped(tarW, minW, maxW);

            if ((width + left) > globalThis.innerWidth) { left = currentPosition.left; }
         }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element.
      if (el.style.height === '' || height !== void 0)
      {
         if (height === 'auto' || (currentPosition.height === 'auto' && height !== null))
         {
            currentPosition.height = 'auto';
         }
         else
         {
            const tarH = typeof height === 'number' ? Math.round(height) : el.offsetHeight + 1;
            const minH = styleParsePixels(styles.minHeight) || MIN_WINDOW_HEIGHT;
            const maxH = styleParsePixels(styles.maxHeight) || el.style.maxHeight || globalThis.innerHeight;
            currentPosition.height = height = Math.clamped(tarH, minH, maxH);

            if ((height + currentPosition.top) > globalThis.innerHeight + 1) { top = currentPosition.top - 1; }
         }
      }
      height = el.offsetHeight;

      // Update left
      if (el.style.left === '' || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = left = Math.round(Math.clamped(tarL, 0, maxL));
      }

      // Update top
      if (el.style.top === '' || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = top = Math.round(Math.clamped(tarT, 0, maxT));
      }

      // Update rotate, scale, z-index
      if (typeof rotate === 'number' || rotate === null) { currentPosition.rotate = rotate; }
      if (typeof rotateX === 'number' || rotateX === null) { currentPosition.rotateX = rotateX; }
      if (typeof rotateY === 'number' || rotateY === null) { currentPosition.rotateY = rotateY; }
      if (typeof rotateZ === 'number' || rotateZ === null) { currentPosition.rotateZ = rotateZ; }

      if (scale) { currentPosition.scale = Math.max(scale, 0); }

      if (zIndex) { currentPosition.zIndex = zIndex; }

      // Return the updated position object.
      return currentPosition;
   }
}
