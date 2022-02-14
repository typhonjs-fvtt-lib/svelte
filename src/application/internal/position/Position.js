import { hashCode }           from '@typhonjs-fvtt/svelte/util';

import { AdapterValidators }  from './AdapterValidators.js';

/**
 * Provides a store for position following the subscriber protocol.
 */
export class Position
{
   #subscriptions = [];

   /**
    * @type {PositionData}
    */
   #data = { height: null, left: null, scale: null, top: null, width: null, zIndex: null };

   /**
    * Defines a hash by accumulating all values. Used to prevent notifications to subscribers when position data does
    * not change.
    *
    * @type {number}
    */
   #hash = 0;

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

      [this.#validators, this.#validatorsAdapter] = new AdapterValidators();

      this.set(position);
   }

   /**
    * Returns the validators.
    *
    * @returns {AdapterValidators} validators.
    */
   get validators() { return this.#validators; }

// Data accessors ----------------------------------------------------------------------------------------------------

   /**
    * @returns {number|string} height
    */
   get height() { return this.#data.height; }

   /**
    * @returns {number} left
    */
   get left() { return this.#data.left; }

   /**
    * @returns {number} scale
    */
   get scale() { return this.#data.scale; }

   /**
    * @returns {number} top
    */
   get top() { return this.#data.top; }

   /**
    * @returns {number|string} width
    */
   get width() { return this.#data.width; }

   /**
    * @returns {number} z-index
    */
   get zIndex() { return this.#data.zIndex; }

   /**
    * @param {number|string|null} height -
    */
   set height(height)
   {
      this.set({ ...this.#data, height });
   }

   /**
    * @param {number} left -
    */
   set left(left)
   {
      this.set({ ...this.#data, left });
   }

   /**
    * @param {number} scale -
    */
   set scale(scale)
   {
      this.set({ ...this.#data, scale });
   }

   /**
    * @param {number} top -
    */
   set top(top)
   {
      this.set({ ...this.#data, top });
   }

   /**
    * @param {number|string|null} width -
    */
   set width(width)
   {
      this.set({ ...this.#data, width });
   }

   /**
    * @param {number} zIndex -
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
    * Calculates a hash code for a PositionData instance.
    *
    * @param {PositionData}   data - PositionData instance.
    *
    * @returns {number} hash code.
    */
   hashCode(data = this.#data)
   {
      // Create hash with current values.
      let newHash = 37;

      newHash ^= (typeof data.left === 'number' ? data.left : 0) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
      newHash ^= (typeof data.top === 'number' ? data.top : 0) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
      newHash ^= (typeof data.scale === 'number' ? data.scale : 0) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
      newHash ^= (typeof data.zIndex === 'number' ? data.zIndex : 0) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
      newHash ^= (typeof data.width === 'number' ? data.width : hashCode(data.width)) + 0x9e3779b9 + (newHash << 6) +
       (newHash >> 2);
      newHash ^= (typeof data.height === 'number' ? data.height : hashCode(data.height)) + 0x9e3779b9 + (newHash << 6) +
       (newHash >> 2);

      return newHash;
   }

   /**
    * @returns {PositionData} Current position data.
    */
   toJSON()
   {
      return Object.assign({}, this.#data);
   }

   /**
    * Notifies any subscribers of changes; calculates a hashcode based on current position values. Only notifies
    * subscribers if the hash value has changed.
    */
   #notify()
   {
      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;

      // Early out if there are no subscribers.
      if (subscriptions.length === 0) { return; }

      // Create hash with current values.
      const newHash = this.hashCode();

      // Only notify subscribers if the hash is changed.
      if (newHash !== this.#hash)
      {
         const position = Object.assign({}, this.#data);

         this.#hash = newHash;

         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](position); }
      }
   }

   /**
    * @param {PositionData}   position - Position data to set.
    *
    * @param {boolean}        [notify=true] - Notify subscribers.
    *
    * @returns {PositionData|null} The set position data after validation or null if rejected.
    */
   set(position, notify = true)
   {
      if (typeof position !== 'object') { return null; }

      const data = this.#data;
      const parent = this.#parent;
      const validators = this.#validators;

      // If there are any validators allow them to potentially modify position data or reject the update.
      if (validators.length)
      {
         for (const validator of validators)
         {
            position = validator.validator(parent, position);

            if (position === null) { return null; }
         }
      }

      if (typeof position.left === 'number') { data.left = Math.round(position.left); }
      if (typeof position.top === 'number') { data.top = Math.round(position.top); }
      if (typeof position.scale === 'number') { data.scale = position.scale; }
      if (typeof position.zIndex === 'number') { data.zIndex = Math.round(position.zIndex); }
      if (typeof position.width === 'number' || position.width === 'auto')
      {
         data.width = typeof position.width === 'number' ? Math.round(position.width) : position.width;
      }
      if (typeof position.height === 'number' || position.height === 'auto')
      {
         data.height = typeof position.height === 'number' ? Math.round(position.height) : position.height;
      }

      if (notify) { this.#notify(); }

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
}

/**
 * @typedef PositionData - Defines the position data for a positionable element.
 *
 * @property {number|null}          left - The left offset position in pixels.
 *
 * @property {number|null}          top - The top offset position in pixels.
 *
 * @property {number|string|null}   width - The element width in pixels.
 *
 * @property {number|string|null}   height - The element height in pixels.
 *
 * @property {number|null}          scale - The element scale as a numeric factor where 1.0 is default.
 *
 * @property {number|null}          zIndex - The element z-index.
 */
