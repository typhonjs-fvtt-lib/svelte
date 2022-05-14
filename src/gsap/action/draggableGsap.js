import { lerp }         from '@typhonjs-fvtt/svelte/math';

import { GsapCompose }  from '../compose/GsapCompose.js';

const s_HAS_QUICK_TO = GsapCompose.hasMethod('quickTo');

/**
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `quickTo` to invoke `position.set` on a
 * given {@link Position} instance provided. You may provide a `vars` object sent to `quickTo` to modify the duration /
 * easing. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+`.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Position}          params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @param {boolean}           [params.ease=false] - When true easing is enabled.
 *
 * @param {boolean}           [params.inertia=false] - When true inertia easing is enabled.
 *
 * @param {object}            [params.easeOptions] - Gsap `to / `quickTo` vars object.
 *
 * @param {object}            [params.inertiaOptions] - Inertia Options.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggableGsap(node, { position, active = true, storeDragging = void 0, ease = true, inertia = false,
 easeOptions = { duration: 0.1, ease: 'power3.out' },
  inertiaOptions = { end: void 0, duration: { min: 0, max: 1 }, resistance: 1, velocity: 1 } })
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
   let initialDragPoint = {};

   /**
    * Stores the current dragging state and gates the move pointer as the dragging store is not
    * set until the first pointer move.
    *
    * @type {boolean}
    */
   let dragging = false;

   // Used to track current velocity and the inertia tween.
   let inertiaTween;
   let lastDragTime;
   const lastDragPoint = { x: 0, y: 0 };
   const velInstant = { x: 0, y: 0 };
   const velQuick = { x: 0, y: 0 };
   const velSmooth = { x: 0, y: 0 };
   const velUsed = { x: 0, y: 0 };

   /**
    * Remember event handlers associated with this action so they may be later unregistered.
    *
    * @type {object}
    */
   const handlers = {
      dragDown: ['pointerdown', (e) => onDragPointerDown(e), false],
      dragMove: ['pointermove', (e) => onDragPointerMove(e), false],
      dragUp: ['pointerup', (e) => onDragPointerUp(e), false]
   };

   let quickLeft, quickTop;
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
    * Calculates velocity of x / y while dragging.
    *
    * @param {number}   newX - New drag X
    *
    * @param {number}   newY - New drag Y
    *
    * @param {number}   scale - New scale
    *
    * @returns {{x: number, y: number}} current velocity.
    */
   function calcVelocity(newX, newY, scale = 1)
   {
      const currentTime = performance.now();
      const dTime = currentTime - lastDragTime + Number.EPSILON;
      lastDragTime = currentTime;

      // Set velocity to 0 due to time difference.
      if (dTime > 50)
      {
         velInstant.x = velQuick.x = velSmooth.x = velUsed.x = 0;
         velInstant.y = velQuick.y = velSmooth.y = velUsed.y = 0;
         lastDragPoint.x = newX;
         lastDragPoint.y = newY;
         return velUsed;
      }

      velInstant.x = (newX - lastDragPoint.x) / dTime;
      velInstant.y = (newY - lastDragPoint.y) / dTime;

      lastDragPoint.x = newX;
      lastDragPoint.y = newY;

      velQuick.x = lerp(velQuick.x, velInstant.x, 0.1);
      velQuick.y = lerp(velQuick.y, velInstant.y, 0.1);
      velSmooth.x = lerp(velSmooth.x, velInstant.x, 0.01);
      velSmooth.y = lerp(velSmooth.y, velInstant.y, 0.01);

      velUsed.x = lerp(velSmooth.x, velQuick.x, 0.5) * scale;
      velUsed.y = lerp(velSmooth.y, velQuick.y, 0.5) * scale;

      return velUsed;
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
      event.preventDefault();

      dragging = false;

      // Record initial position.
      initialPosition = position.get();
      initialDragPoint = { x: event.clientX, y: event.clientY };

      // Reset velocity tracking variables.
      lastDragTime = performance.now();
      lastDragPoint.x = event.clientX;
      lastDragPoint.y = event.clientY;
      velInstant.x = velQuick.x = velSmooth.x = velUsed.x = 0;
      velInstant.y = velQuick.y = velSmooth.y = velUsed.y = 0;

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
   function onDragPointerMove(event)
   {
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

      if (inertia)
      {
         if (inertiaTween)
         {
            inertiaTween.kill();
            inertiaTween = void 0;
         }

         calcVelocity(event.clientX, event.clientY);
      }

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

            // TODO: optimize w/ static object.
            tweenTo = GsapCompose.to(position, { left: newLeft, top: newTop, ...easeOptions });
         }
      }
      else
      {
         // TODO: optimize w/ static object.
         position.set({ left: newLeft, top: newTop });
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
         const opts = inertiaOptions;

         const velScale = opts.velocity ?? 1;
         const tweenDuration = opts.duration ?? { min: 0, max: 1 };
         const tweenEnd = opts.end ?? void 0;
         const tweenResistance = opts.resistance ?? 1;

         const velocity = calcVelocity(event.clientX, event.clientY, velScale * 1000); // Convert velScale to ms

         inertiaTween = GsapCompose.to(position, {
            inertia: {
               left: Object.assign({ velocity: velocity.x }, tweenEnd ? { end: tweenEnd } : {}),
               top: Object.assign({ velocity: velocity.y }, tweenEnd ? { end: tweenEnd } : {}),
               duration: tweenDuration,
               resistance: tweenResistance,
               linkedProps: 'top,left'
            }
         }, {
            initialProps: ['top', 'left']
         });
      }
   }

   return {
      // The default of active being true won't automatically add listeners twice.
      update: (options) =>  // eslint-disable-line no-shadow
      {
         if (typeof options.active === 'boolean')
         {
            active = options.active;
            if (active) { activateListeners(); }
            else { removeListeners(); }
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

class DraggableGsapOptions
{
   #ease = true;

   #inertia = false;

   #easeOptions = { duration: 0.1, ease: 'power3.out' };
   #inertiaOptions = { end: void 0, duration: { min: 0, max: 1 }, resistance: 1, velocity: 1 };

   /**
    * Stores the subscribers.
    *
    * @type {(function(DraggableGsapOptions): void)[]}
    */
   #subscriptions = [];

   constructor()
   {
      Object.defineProperty(this, 'ease', {
         get: () => { return this.#ease; },
         set: (ease) =>
         {
            if (typeof ease !== 'boolean') { throw new TypeError(`'ease' is not a boolean.`); }

            this.#ease = ease;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'easeOptions', {
         get: () => { return this.#easeOptions; },
         set: (easeOptions) => { this.#easeOptions = easeOptions; this.#updateSubscribers(); },
         enumerable: true
      });

      Object.defineProperty(this, 'inertia', {
         get: () => { return this.#inertia; },
         set: (inertia) =>
         {
            if (typeof inertia !== 'boolean') { throw new TypeError(`'inertia' is not a boolean.`); }

            this.#inertia = inertia;
            this.#updateSubscribers();
         },
         enumerable: true
      });


      Object.defineProperty(this, 'inertiaOptions', {
         get: () => { return this.#inertiaOptions; },
         set: (inertiaOptions) => { this.#inertiaOptions = inertiaOptions; this.#updateSubscribers(); },
         enumerable: true
      });
   }

   get easeDuration() { return this.#easeOptions.duration; }
   get easeValue() { return this.#easeOptions.ease; }

   get inertiaEnd() { return this.#inertiaOptions.end; }
   get inertiaDurationMin() { return this.#inertiaOptions.duration.min; }
   get inertiaDurationMax() { return this.#inertiaOptions.duration.max; }
   get inertiaResistance() { return this.#inertiaOptions.resistance; }
   get inertiaVelocity() { return this.#inertiaOptions.velocity; }

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

   set easeValue(value)
   {
      if (typeof value !== 'function' && typeof value !== 'string')
      {
         throw new TypeError(`'value' is not a function or string.`);
      }

      this.#easeOptions.ease = value;
      this.#updateSubscribers();
   }

   set inertiaEnd(end)
   {
      if (typeof end !== 'function' && end !== void 0) { throw new TypeError(`'end' is not a function or undefined.`); }

      this.#inertiaOptions.end = end;
      this.#updateSubscribers();
   }

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

   set inertiaDurationMax(max)
   {
      if (!Number.isFinite(max)) { throw new TypeError(`'max' is not a finite number.`); }
      if (max < 0) { throw new Error(`'max' is less than 0.`); }

      if (max < this.#inertiaOptions.duration.min) { this.#inertiaOptions.duration.min = max; }

      this.#inertiaOptions.duration.max = max;
      this.#updateSubscribers();
   }

   set inertiaDurationMin(min)
   {
      if (!Number.isFinite(min)) { throw new TypeError(`'min' is not a finite number.`); }
      if (min < 0) { throw new Error(`'min' is less than 0.`); }

      if (min > this.#inertiaOptions.duration.max) { this.#inertiaOptions.duration.max = min; }

      this.#inertiaOptions.duration.min = min;
      this.#updateSubscribers();
   }

   set inertiaResistance(resistance)
   {
      if (!Number.isFinite(resistance)) { throw new TypeError(`'resistance' is not a finite number.`); }
      // if (resistance < 0) { throw new Error(`'resistance' is less than 0.`); }

      this.#inertiaOptions.resistance = resistance;
      this.#updateSubscribers();
   }

   set inertiaVelocity(velocity)
   {
      if (!Number.isFinite(velocity)) { throw new TypeError(`'velocity' is not a finite number.`); }
      if (velocity < 0) { throw new Error(`'velocity' is less than 0.`); }

      this.#inertiaOptions.velocity = velocity;
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
      this.#inertiaOptions = { end: void 0, duration: { min: 0, max: 1 }, resistance: 1, velocity: 1 };
      this.#updateSubscribers();
   }

   /**
    * Resets easing options to default values.
    */
   resetEase()
   {
      this.#ease = true;
      this.#easeOptions = { duration: 0.1, ease: 'power3.out' };
      this.#updateSubscribers();
   }

   /**
    * Resets inertia options to default values.
    */
   resetInertia()
   {
      this.#inertia = false;
      this.#inertiaOptions = { end: void 0, duration: { min: 0, max: 1 }, resistance: 1, velocity: 1 };
      this.#updateSubscribers();
   }

   /**
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
draggableGsap.options = () => new DraggableGsapOptions();

export { draggableGsap };

/**
 * @typedef {object} DraggableInertiaOptions
 *
 * @property {Function} [end] -
 *
 * @property {Function} [end] -
 */
