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
   #data = { height: null, left: null, rotate: null, scale: null, top: null, width: null, zIndex: null };

   #store;

   /**
    * @type {StorePosition}
    */
   #stores;

   /**
    * The associated parent for positional data tracking. Used in validators.
    *
    * @type {object}
    */
   #parent;

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
    * @param {object}         [opts] - Optional parameters.
    *
    * @param {boolean}        [opts.applyStyles=true] - When false inline position styles are not updated.
    *
    * @returns {PositionData|null} The set position data after validation or null if rejected.
    */
   set(position = {}, { applyStyles = true } = {})
   {
      if (typeof position !== 'object') { return null; }

      const parent = this.#parent;

      // An early out to prevent `set` from taking effect if options `setPosition` is false.
      if (parent !== void 0 && typeof parent?.options?.setPosition === 'boolean' && !parent?.options?.setPosition)
      {
         return null;
      }

      const data = this.#data;
      const validators = this.#validators;

      let styles;

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

            if (position === null) { return null; }
         }
      }

      let modified = false;

      if (position.left === null || typeof position.left === 'number')
      {
         position.left = position.left === null ? null : Math.round(position.left);
         if (data.left !== position.left) { data.left = position.left; modified = true; }
      }

      if (typeof position.top === 'number')
      {
         position.top = Math.round(position.top);
         if (data.top !== position.top) { data.top = position.top; modified = true; }
      }

      if (typeof position.rotate === 'number')
      {
         if (data.rotate !== position.rotate) { data.rotate = position.rotate; modified = true; }
      }

      if (typeof position.scale === 'number')
      {
         position.scale = Math.max(0, Math.min(position.scale, 1000));
         if (data.scale !== position.scale) { data.scale = position.scale; modified = true; }
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
      }

      if (typeof position.height === 'number' || position.height === 'auto' || position.height === null)
      {
         position.height = typeof position.height === 'number' ? Math.round(position.height) : position.height;
         if (data.height !== position.height) { data.height = position.height; modified = true; }
      }

      if (applyStyles && el) { this.#updateInlineStyles(position, el); }

      // Notify main store subscribers.
      if (modified)
      {
         // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
         // support until 2023. IE not doing this will require several extra method calls otherwise.
         const subscriptions = this.#subscriptions;

         // Early out if there are no subscribers.
         if (subscriptions.length === 0) { return; }

         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](position); }
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

   #updatePosition({ left, top, width, height, rotate, scale, zIndex, ...rest } = {}, el, styles)
   {
      const currentPosition = this.get(rest);

      // If the new requested width or height is 'auto' or null set it immediately.
      if (width === 'auto' || width === null) { el.style.width = width; }
      if (height === 'auto' || height === null) { el.style.height = height; }

      // Set applyHeight to false when `el.style.height` is `auto` preventing setting height to a finite value.
      const applyHeight = el.style.height !== 'auto';

      // Set applyWidth to false when `el.style.width` is `auto` preventing setting width to a finite value.
      const applyWidth = el.style.width !== 'auto';

      // Update width if an explicit value is passed, or if no width value is set on the element.
      if (el.style.width === '' || width)
      {
         const tarW = width || el.offsetWidth;
         const minW = styleParsePixels(styles.minWidth) || MIN_WINDOW_WIDTH;
         const maxW = styleParsePixels(styles.maxWidth) || el.style.maxWidth || globalThis.innerWidth;
         currentPosition.width = width = Math.clamped(tarW, minW, maxW);

         // Must set el.style.width if currently undefined.
         if (el.style.width === '' || applyWidth) { el.style.width = `${width}px`; }
         if ((width + left) > globalThis.innerWidth) { left = currentPosition.left; }
      }
      width = el.offsetWidth;

      // Update height if an explicit value is passed, or if no height value is set on the element.
      if (el.style.height === '' || height)
      {
         const tarH = height || (el.offsetHeight + 1);
         const minH = styleParsePixels(styles.minHeight) || MIN_WINDOW_HEIGHT;
         const maxH = styleParsePixels(styles.maxHeight) || el.style.maxHeight || globalThis.innerHeight;
         currentPosition.height = height = Math.clamped(tarH, minH, maxH);

         // Must set el.style.height if currently undefined.
         if (el.style.height === '' || applyHeight) { el.style.height = `${height}px`; }
         if ((height + currentPosition.top) > globalThis.innerHeight + 1) { top = currentPosition.top - 1; }
      }
      height = el.offsetHeight;

      // Update left
      if (el.style.left === '' || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = left = Math.clamped(tarL, 0, maxL);
      }

      // Update top
      if (el.style.top === '' || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = top = Math.clamped(tarT, 0, maxT);
      }

      // Update rotate, scale, z-index
      if (rotate) { currentPosition.rotate = rotate; }
      if (scale) { currentPosition.scale = Math.max(scale, 0); }
      if (zIndex) { currentPosition.zIndex = zIndex; }

      // If auto is set for width / height then provide the correct value.
      if (!applyWidth) { currentPosition.width = 'auto'; }
      if (!applyHeight) { currentPosition.height = 'auto'; }

      // Return the updated position object.
      return currentPosition;
   }

   #updateInlineStyles(position, el)
   {
      // Set applyHeight to false when `el.style.height` is `auto` preventing setting height to a finite value.
      const applyHeight = el.style.height !== 'auto';

      // Set applyWidth to false when `el.style.width` is `auto` preventing setting width to a finite value.
      const applyWidth = el.style.width !== 'auto';

      // If defined / not null apply `currentPosition` to inline styles.
      if (applyWidth) { el.style.width = `${position.width}px`; }
      if (applyHeight) { el.style.height = `${position.height}px`; }
      el.style.left = `${position.left}px`;
      el.style.top = `${position.top}px`;

      let rotate, scale;

      if (position.rotate)
      {
         if (position.rotate % 360 === 0) { rotate = ''; }
         else { rotate = `rotate(${position.rotate}deg)`; }
      }

      if (position.scale)
      {
         if (position.scale === 1) { scale = ''; }
         else { scale = `scale(${position.scale})`; }
      }

      if (scale || rotate)
      {
         el.style.transform = `${rotate}${rotate ? ' ' : ''}${scale}`;
      }
   }
}
