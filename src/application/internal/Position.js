import { hashCode } from '@typhonjs-fvtt/svelte/util';

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
    * @param {PositionData}   position - Initial position data.
    */
   constructor(position)
   {
      this.set(position);
   }

   /**
    * @returns {number|string} height
    */
   get height() { return this.#data.height; }

   /**
    * Provides a boolean to check / verify that the given object is a Position instance.
    *
    * @returns {boolean} Is this a Position instance.
    */
   get isPosition() { return true; }

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
    * @param {number|string} height -
    */
   set height(height)
   {
      const type = typeof height;

      if (type === 'number' || type === 'string')
      {
         this.#data.height = height;
         this.#notify();
      }
   }

   /**
    * @param {number} left -
    */
   set left(left)
   {
      if (typeof left === 'number')
      {
         this.#data.left = left;
         this.#notify();
      }
   }

   /**
    * @param {number} scale -
    */
   set scale(scale)
   {
      if (typeof scale === 'number')
      {
         this.#data.scale = scale;
         this.#notify();
      }
   }

   /**
    * @param {number} top -
    */
   set top(top)
   {
      if (typeof top === 'number')
      {
         this.#data.top = top;
         this.#notify();
      }
   }

   /**
    * @param {number|string} width -
    */
   set width(width)
   {
      const type = typeof width;

      if (type === 'number' || type === 'string')
      {
         this.#data.width = width;
         this.#notify();
      }
   }

   /**
    * @param {number} zIndex -
    */
   set zIndex(zIndex)
   {
      if (typeof zIndex === 'number')
      {
         this.#data.zIndex = zIndex;
         this.#notify();
      }
   }

   /**
    * Assigns current position to object passed into method.
    *
    * @param {Object|PositionData} [position] - Target to assign current position data.
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

      const data = this.#data;

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
    */
   set(position, notify = true)
   {
      if (typeof position !== 'object') { return; }

      const data = this.#data;

      if (typeof position.left === 'number') { data.left = position.left; }
      if (typeof position.top === 'number') { data.top = position.top; }
      if (typeof position.scale === 'number') { data.scale = position.scale; }
      if (typeof position.zIndex === 'number') { data.zIndex = position.zIndex; }
      if (typeof position.width === 'number' || position.width === 'auto') { data.width = position.width; }
      if (typeof position.height === 'number' || position.height === 'auto') { data.height = position.height; }

      if (notify) { this.#notify(); }
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
