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
   #data = { height: null, left: null, rotateX: null, rotateY: null, rotateZ: null, scale: null, top: null,
    width: null, zIndex: null };

   /**
    * @type {PositionData}
    */
   #defaultData;

   /**
    * The associated parent for positional data tracking. Used in validators.
    *
    * @type {object}
    */
   #parent;

   /**
    * @type {StorePosition}
    */
   #stores;

   /**
    * @type {Record<string, string>}
    */
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
    * @param {object}         options - Default values.
    */
   constructor(parent, options = {})
   {
      this.#parent = parent;

      const data = this.#data;

      // Set default value from options.
      if (typeof options === 'object')
      {
         if (Number.isFinite(options.height) || options.height === 'auto' || options.height === null)
         {
            data.height = typeof options.height === 'number' ? Math.round(options.height) : options.height;
         }

         if (Number.isFinite(options.left) || options.left === null)
         {
            data.left = typeof options.left === 'number' ? Math.round(options.left) : options.left;
         }

         if (Number.isFinite(options.rotateX) || options.rotateX === null)
         {
            data.rotateX = options.rotateX;
            if (Number.isFinite(data.rotateX)) { this.#transforms.rotateX = `rotateX(${data.rotateX}deg)`; }
         }

         if (Number.isFinite(options.rotateY) || options.rotateY === null)
         {
            data.rotateY = options.rotateY;
            if (Number.isFinite(data.rotateY)) { this.#transforms.rotateY = `rotateY(${data.rotateY}deg)`; }
         }

         if (Number.isFinite(options.rotateZ) || options.rotateZ === null)
         {
            data.rotateZ = options.rotateZ;
            if (Number.isFinite(data.rotateZ)) { this.#transforms.rotateZ = `rotateZ(${data.rotateZ}deg)`; }
         }

         if (Number.isFinite(options.scale) || options.scale === null)
         {
            data.scale = options.scale;
            if (Number.isFinite(data.scale)) { this.#transforms.scale = `scale(${data.scale})`; }
         }

         if (Number.isFinite(options.top) || options.top === null)
         {
            data.top = typeof options.top === 'number' ? Math.round(options.top) : options.top;
         }

         if (Number.isFinite(options.width) || options.width === 'auto' || options.width === null)
         {
            data.width = typeof options.width === 'number' ? Math.round(options.width) : options.width;
         }

         if (Number.isFinite(options.zIndex) || options.zIndex === null)
         {
            data.zIndex = typeof options.zIndex === 'number' ? Math.round(options.zIndex) : options.zIndex;
         }
      }

      this.#stores = {
         height: propertyStore(this, 'height'),
         left: propertyStore(this, 'left'),
         rotateX: propertyStore(this, 'rotateX'),
         rotateY: propertyStore(this, 'rotateY'),
         rotateZ: propertyStore(this, 'rotateZ'),
         scale: propertyStore(this, 'scale'),
         top: propertyStore(this, 'top'),
         width: propertyStore(this, 'width'),
         zIndex: propertyStore(this, 'zIndex')
      };

      [this.#validators, this.#validatorsAdapter] = new AdapterValidators();
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
    * Resets data to default values and invokes set. Check options, but by default current z-index is maintained.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.keepZIndex=true] - When true keeps current z-index.
    *
    * @param {boolean}  [opts.invokeSet=true] - When true invokes set method.
    *
    * @returns {boolean} Operation successful.
    */
   reset({ keepZIndex = true, invokeSet = true } = {})
   {
      if (typeof this.#defaultData !== 'object') { return false; }

      const zIndex = this.#data.zIndex;

      const data = Object.assign({}, this.#defaultData);

      if (keepZIndex) { data.zIndex = zIndex; }
      if (invokeSet) { this.set(data); }

      return true;
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

      let currentTransform = '', styles, updateTransform = false;

      const el = parent?.elementTarget;
      if (el)
      {
         currentTransform = el.style.transform ?? '';
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

      if (typeof position.rotateX === 'number' || position.rotateX === null)
      {
         if (data.rotateX !== position.rotateX)
         {
            data.rotateX = position.rotateX;
            updateTransform = modified = true;

            if (typeof position.rotateX === 'number') { transforms.rotateX = `rotateX(${position.rotateX}deg)`; }
            else { delete transforms.rotateX; }
         }
         else if (transforms.rotateX && !currentTransform.includes('rotateX('))
         {
            updateTransform = true;
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
         else if (transforms.rotateY && !currentTransform.includes('rotateY('))
         {
            updateTransform = true;
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
         else if (transforms.rotateZ && !currentTransform.includes('rotateZ('))
         {
            updateTransform = true;
         }
      }

      if (typeof position.scale === 'number' || position.scale === null)
      {
         position.scale = typeof position.scale === 'number' ? Math.max(0, Math.min(position.scale, 1000)) : null;

         if (data.scale !== position.scale)
         {
            data.scale = position.scale;
            updateTransform = modified = true;

            if (typeof position.scale === 'number') { transforms.scale = `scale(${position.scale})`; }
            else { delete transforms.scale; }
         }
         else if (transforms.scale && !currentTransform.includes('scale('))
         {
            updateTransform = true;
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

      // Set default data after first set operation that has a target element.
      if (el && typeof this.#defaultData !== 'object')
      {
         this.#defaultData = Object.assign({}, data);
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

   #updatePosition({ left, top, width, height, rotateX, rotateY, rotateZ, scale, zIndex, ...rest } = {}, el, styles)
   {
      const currentPosition = this.get(rest);

      // Update width if an explicit value is passed, or if no width value is set on the element.
      if (el.style.width === '' || width !== void 0)
      {
         if (width === 'auto' || (currentPosition.width === 'auto' && width !== null))
         {
            currentPosition.width = 'auto';
            width = el.offsetWidth;
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
      else
      {
         width = el.offsetWidth;
      }

      // Update height if an explicit value is passed, or if no height value is set on the element.
      if (el.style.height === '' || height !== void 0)
      {
         if (height === 'auto' || (currentPosition.height === 'auto' && height !== null))
         {
            currentPosition.height = 'auto';
            height = el.offsetHeight;
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
      else
      {
         height = el.offsetHeight;
      }

      // Update left
      if (el.style.left === '' || Number.isFinite(left))
      {
         const tarL = Number.isFinite(left) ? left : (globalThis.innerWidth - width) / 2;
         const maxL = Math.max(globalThis.innerWidth - width, 0);
         currentPosition.left = Math.round(Math.clamped(tarL, 0, maxL));
      }

      // Update top
      if (el.style.top === '' || Number.isFinite(top))
      {
         const tarT = Number.isFinite(top) ? top : (globalThis.innerHeight - height) / 2;
         const maxT = Math.max(globalThis.innerHeight - height, 0);
         currentPosition.top = Math.round(Math.clamped(tarT, 0, maxT));
      }

      // Update rotate X/Y/Z, scale, z-index
      if (typeof rotateX === 'number' || rotateX === null) { currentPosition.rotateX = rotateX; }
      if (typeof rotateY === 'number' || rotateY === null) { currentPosition.rotateY = rotateY; }
      if (typeof rotateZ === 'number' || rotateZ === null) { currentPosition.rotateZ = rotateZ; }

      if (typeof scale === 'number' || scale === null)
      {
         currentPosition.scale = typeof scale === 'number' ? Math.max(0, Math.min(scale, 1000)) : null;
      }

      if (zIndex) { currentPosition.zIndex = zIndex; }

      // Return the updated position object.
      return currentPosition;
   }
}
