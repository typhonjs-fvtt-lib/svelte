import { TJSVelocityTrack }   from '@typhonjs-fvtt/svelte/math';

import { GsapCompose }        from '../compose/GsapCompose.js';

// TODO: presently just use `to` instead of `quickTo`; more testing for `quickTo` required.
const s_HAS_QUICK_TO = false;
// const s_HAS_QUICK_TO = GsapCompose.hasMethod('quickTo');

/**
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `to` or `quickTo` to invoke `position.set`
 * on a given {@link Position} instance provided. You may provide a `easeOptions` object sent to the tween to modify the
 * duration / easing. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+` for `quickTo` support.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Position}          params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {number}            [params.button=0] - MouseEvent button; {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @param {boolean}           [params.ease=true] - When true easing is enabled.
 *
 * @param {boolean}           [params.inertia=false] - When true inertia easing is enabled.
 *
 * @param {object}            [params.easeOptions] - Gsap `to / `quickTo` vars object.
 *
 * @param {object}            [params.inertiaOptions] - Inertia Options.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggableGsap(node, { position, active = true, button = 0, storeDragging = void 0, ease = true, inertia = false,
 easeOptions = { duration: 0.1, ease: 'power3.out' },
  inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 } })
{
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
   const initialDragPoint = { x: 0, y: 0 };

   /**
    * Stores the current dragging state and gates the move pointer as the dragging store is not
    * set until the first pointer move.
    *
    * @type {boolean}
    */
   let dragging = false;

   /**
    * Stores the inertia GSAP tween.
    *
    * @type {object}
    */
   let inertiaTween;

   /**
    * Tracks velocity for inertia tween.
    */
   const velocityTrack = new TJSVelocityTrack();

   /**
    * Event handlers associated with this action for addition / removal.
    *
    * @type {object}
    */
   const handlers = {
      dragDown: ['pointerdown', (e) => onDragPointerDown(e), false],
      dragMove: ['pointermove', (e) => onDragPointerChange(e), false],
      dragUp: ['pointerup', (e) => onDragPointerUp(e), false]
   };

   /**
    * Stores the `quickTo` functions.
    *
    * @type {Function}
    */
   let quickLeft, quickTop;

   /**
    * Stores the ease tween.
    *
    * @type {object}
    */
   let tweenTo;

   if (s_HAS_QUICK_TO)
   {
      quickLeft = GsapCompose.quickTo(position, 'left', easeOptions);
      quickTop = GsapCompose.quickTo(position, 'top', easeOptions);
   }

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

      event.preventDefault();

      dragging = false;

      // Record initial position.
      initialPosition = position.get();
      initialDragPoint.x = event.clientX;
      initialDragPoint.y = event.clientY;

      // Reset velocity tracking when inertia is enabled.
      if (inertia)
      {
         // Reset any existing inertia tween.
         if (inertiaTween)
         {
            inertiaTween.kill();
            inertiaTween = void 0;
         }

         velocityTrack.reset(event.clientX, event.clientY);
      }

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

      if (inertia) { velocityTrack.update(event.clientX, event.clientY); }

      if (ease)
      {
         // Update application position.
         if (s_HAS_QUICK_TO)
         {
            quickLeft(newLeft);
            quickTop(newTop);
         }
         else
         {
            if (tweenTo) { tweenTo.kill(); }

            tweenTo = GsapCompose.to(position, { left: newLeft, top: newTop, ...easeOptions });
         }
      }
      else
      {
         s_POSITION_DATA.left = newLeft;
         s_POSITION_DATA.top = newTop;

         position.set(s_POSITION_DATA);
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

      if (inertia)
      {
         // Kill any existing ease / tween before inertia tween.
         if (s_HAS_QUICK_TO)
         {
            quickLeft.tween.kill();
            quickTop.tween.kill();
         }
         else
         {
            if (tweenTo)
            {
               tweenTo.kill();
               tweenTo = void 0;
            }
         }

         const opts = inertiaOptions;

         const velScale = opts.velocityScale ?? 1;
         const tweenDuration = opts.duration ?? { min: 0, max: 3 };
         const tweenEnd = opts.end ?? void 0;
         const tweenResistance = opts.resistance ?? 1000;

         const velocity = velocityTrack.update(event.clientX, event.clientY);

         inertiaTween = GsapCompose.to(position, {
            inertia: {
               left: Object.assign({ velocity: velocity.x * velScale }, tweenEnd ? { end: tweenEnd } : {}),
               top: Object.assign({ velocity: velocity.y * velScale }, tweenEnd ? { end: tweenEnd } : {}),
               duration: tweenDuration,
               resistance: tweenResistance,
               linkedProps: 'top,left'
            }
         }, s_INTERTIA_GC_OPTIONS);
      }
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

         if (typeof options.ease === 'boolean') { ease = options.ease; }
         if (typeof options.inertia === 'boolean') { inertia = options.inertia; }

         if (typeof options.easeOptions === 'object')
         {
            easeOptions = options.easeOptions;

            if (s_HAS_QUICK_TO)
            {
               quickLeft = GsapCompose.quickTo(position, 'left', easeOptions);
               quickTop = GsapCompose.quickTo(position, 'top', easeOptions);
            }
         }

         if (typeof options.inertiaOptions === 'object')
         {
            inertiaOptions = options.inertiaOptions;
         }
      },

      destroy: () => removeListeners()
   };
}

/**
 * Provides a store / object to make updating / setting draggableGsap options much easier.
 */
class DraggableGsapOptions
{
   #ease = false;

   #easeOptions = { duration: 0.1, ease: 'power3.out' };

   #inertia = false;

   #inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 };

   /**
    * Stores the subscribers.
    *
    * @type {(function(DraggableGsapOptions): void)[]}
    */
   #subscriptions = [];

   constructor({ ease, easeOptions, inertia, inertiaOptions } = {})
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

      Object.defineProperty(this, 'inertia', {
         get: () => { return this.#inertia; },
         set: (newInertia) =>
         {
            if (typeof newInertia !== 'boolean') { throw new TypeError(`'inertia' is not a boolean.`); }

            this.#inertia = newInertia;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'inertiaOptions', {
         get: () => { return this.#inertiaOptions; },
         set: (newInertiaOptions) =>
         {
            if (newInertiaOptions === null || typeof newInertiaOptions !== 'object')
            {
               throw new TypeError(`'inertiaOptions' is not an object.`);
            }

            if (newInertiaOptions.end !== void 0)
            {
               if (typeof newInertiaOptions.end !== 'function' && newInertiaOptions.end !== void 0)
               {
                  throw new TypeError(`'inertiaOptions.end' is not a function or undefined.`);
               }

               this.#inertiaOptions.end = newInertiaOptions.end;
            }

            if (newInertiaOptions.duration !== void 0)
            {
               if (newInertiaOptions.duration === null || typeof newInertiaOptions.duration !== 'object')
               {
                  throw new TypeError(`'inertiaOptions.duration' is not an object.`);
               }

               if (newInertiaOptions.duration.max !== void 0)
               {
                  if (!Number.isFinite(newInertiaOptions.duration.max))
                  {
                     throw new TypeError(`'inertiaOptions.duration.max' is not a finite number.`);
                  }

                  if (newInertiaOptions.duration.max < 0)
                  {
                     throw new Error(`'newInertiaOptions.duration.max' is less than 0.`);
                  }

                  this.#inertiaOptions.duration.max = newInertiaOptions.duration.max;
               }

               if (newInertiaOptions.duration.min !== void 0)
               {
                  if (!Number.isFinite(newInertiaOptions.duration.min))
                  {
                     throw new TypeError(`'inertiaOptions.duration.min' is not a finite number.`);
                  }

                  if (newInertiaOptions.duration.min < 0)
                  {
                     throw new Error(`'newInertiaOptions.duration.min' is less than 0.`);
                  }

                  this.#inertiaOptions.duration.min = newInertiaOptions.duration.min;
               }

               if (this.#inertiaOptions.duration.min > this.#inertiaOptions.duration.max)
               {
                  this.#inertiaOptions.duration.max = this.#inertiaOptions.duration.min;
               }

               if (this.#inertiaOptions.duration.max < this.#inertiaOptions.duration.min)
               {
                  this.#inertiaOptions.duration.min = this.#inertiaOptions.duration.max;
               }
            }

            if (newInertiaOptions.resistance !== void 0)
            {
               if (!Number.isFinite(newInertiaOptions.resistance))
               {
                  throw new TypeError(`'inertiaOptions.resistance' is not a finite number.`);
               }

               if (newInertiaOptions.resistance < 0) { throw new Error(`'inertiaOptions.resistance' is less than 0.`); }

               this.#inertiaOptions.resistance = newInertiaOptions.resistance;
            }

            if (newInertiaOptions.velocityScale !== void 0)
            {
               if (!Number.isFinite(newInertiaOptions.velocityScale))
               {
                  throw new TypeError(`'inertiaOptions.velocityScale' is not a finite number.`);
               }

               if (newInertiaOptions.velocityScale < 0)
               {
                  throw new Error(`'inertiaOptions.velocityScale' is less than 0.`);
               }

               this.#inertiaOptions.velocityScale = newInertiaOptions.velocityScale;
            }

            this.#updateSubscribers();
         },
         enumerable: true
      });

      // Set default options.
      if (ease !== void 0) { this.ease = ease; }
      if (easeOptions !== void 0) { this.easeOptions = easeOptions; }
      if (inertia !== void 0) { this.inertia = inertia; }
      if (inertiaOptions !== void 0) { this.inertiaOptions = inertiaOptions; }
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
    * @returns {number|Array|Function} Get inertia end.
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   get inertiaEnd() { return this.#inertiaOptions.end; }

   /**
    * @returns {number} Get inertia duration max time (seconds)
    */
   get inertiaDurationMax() { return this.#inertiaOptions.duration.max; }

   /**
    * @returns {number} Get inertia duration min time (seconds)
    */
   get inertiaDurationMin() { return this.#inertiaOptions.duration.min; }

   /**
    * @returns {number} Get inertia resistance (1000 is default).
    */
   get inertiaResistance() { return this.#inertiaOptions.resistance; }

   /**
    * @returns {number} Get inertia velocity scale.
    */
   get inertiaVelocityScale() { return this.#inertiaOptions.velocityScale; }

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
    * @param {number|Array|Function} end - Set inertia end.
    *
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   set inertiaEnd(end)
   {
      if (typeof end !== 'function' && end !== void 0) { throw new TypeError(`'end' is not a function or undefined.`); }

      this.#inertiaOptions.end = end;
      this.#updateSubscribers();
   }

   /**
    * @param {{min: number, max: number}} duration - Set inertia duration min & max.
    */
   set inertiaDuration(duration)
   {
      if (typeof duration !== 'object' && !Number.isFinite(duration.min) && !Number.isFinite(duration.max))
      {
         throw new TypeError(`'duration' is not an object with 'min' & 'max' properties as finite numbers.`);
      }

      if (duration.max < 0) { throw new Error(`'duration.max' is less than 0.`); }
      if (duration.min < 0) { throw new Error(`'duration.min' is less than 0.`); }

      // Automatically correct for when min / max are out of sync.
      if (duration.min > duration.max) { duration.max = duration.min; }
      if (duration.max < duration.min) { duration.min = duration.max; }

      this.#inertiaOptions.duration.max = duration.max;
      this.#inertiaOptions.duration.min = duration.min;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   max - Set inertia duration max.
    */
   set inertiaDurationMax(max)
   {
      if (!Number.isFinite(max)) { throw new TypeError(`'max' is not a finite number.`); }
      if (max < 0) { throw new Error(`'max' is less than 0.`); }

      if (max < this.#inertiaOptions.duration.min) { this.#inertiaOptions.duration.min = max; }

      this.#inertiaOptions.duration.max = max;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   min - Set inertia duration min.
    */
   set inertiaDurationMin(min)
   {
      if (!Number.isFinite(min)) { throw new TypeError(`'min' is not a finite number.`); }
      if (min < 0) { throw new Error(`'min' is less than 0.`); }

      if (min > this.#inertiaOptions.duration.max) { this.#inertiaOptions.duration.max = min; }

      this.#inertiaOptions.duration.min = min;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   resistance - Set inertia resistance. Default: 1000
    */
   set inertiaResistance(resistance)
   {
      if (!Number.isFinite(resistance)) { throw new TypeError(`'resistance' is not a finite number.`); }
      if (resistance < 0) { throw new Error(`'resistance' is less than 0.`); }

      this.#inertiaOptions.resistance = resistance;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   velocityScale - Set inertia velocity scale.
    */
   set inertiaVelocityScale(velocityScale)
   {
      if (!Number.isFinite(velocityScale)) { throw new TypeError(`'velocityScale' is not a finite number.`); }
      if (velocityScale < 0) { throw new Error(`'velocityScale' is less than 0.`); }

      this.#inertiaOptions.velocityScale = velocityScale;
      this.#updateSubscribers();
   }

   /**
    * Resets all options data to default values.
    */
   reset()
   {
      this.#ease = true;
      this.#inertia = false;
      this.#easeOptions = { duration: 0.1, ease: 'power3.out' };
      this.#inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 };
      this.#updateSubscribers();
   }

   /**
    * Resets easing options to default values.
    */
   resetEase()
   {
      this.#easeOptions = { duration: 0.1, ease: 'power3.out' };
      this.#updateSubscribers();
   }

   /**
    * Resets inertia options to default values.
    */
   resetInertia()
   {
      this.#inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 };
      this.#updateSubscribers();
   }

   /**
    * Store subscribe method.
    *
    * @param {function(DraggableGsapOptions): void} handler - Callback function that is invoked on update / changes.
    *                                                         Receives the DraggableOptions object / instance.
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

   /**
    * Update all subscribers.
    */
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
 * Define a function to get a DraggableGsapOptions instance.
 *
 * @returns {DraggableGsapOptions} A new options instance.
 */
draggableGsap.options = (options) => new DraggableGsapOptions(options);

export { draggableGsap };

/**
 * Extra options for GsapCompose.
 *
 * @type {{initialProps: string[]}}
 */
const s_INTERTIA_GC_OPTIONS = { initialProps: ['top', 'left'] };

/**
 * Used for direct call to `position.set`.
 *
 * @type {{top: number, left: number}}
 */
const s_POSITION_DATA = { left: 0, top: 0 };
