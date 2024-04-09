import { TJSVelocityTrack }   from '#runtime/math/physics';

import { A11yHelper }         from '#runtime/util/browser';

import {
   isIterable,
   isObject,
   klona }                    from '#runtime/util/object';

import { GsapCompose }        from '../compose/GsapCompose.js';

// TODO: presently just use `to` instead of `quickTo`; more testing for `quickTo` required.
const s_HAS_QUICK_TO = false;
// const s_HAS_QUICK_TO = GsapCompose.hasMethod('quickTo');

/**
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `to` or `quickTo` to invoke `position.set`
 * on a given {@link TJSPosition} instance provided. You may provide a
 * `easeOptions` object sent to the tween to modify the duration / easing. When the attached boolean store state
 * changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+` for `quickTo` support.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {import('#runtime/svelte/store/position').TJSPosition}   params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {number}            [params.button=0] - MouseEvent button;
 *        {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}.
 *
 * @param {import('svelte/store').Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging"
 *        state.
 *
 * @param {boolean}           [params.tween=false] - When true tweening is enabled.
 *
 * @param {boolean}           [params.inertia=false] - When true inertia easing is enabled.
 *
 * @param {import('./types').GsapTweenOptions}  [params.tweenOptions] - Gsap `to / `quickTo` tween vars object.
 *
 * @param {import('./types').GsapInertiaOptions}   [params.inertiaOptions] - Inertia Options.
 *
 * @param {Iterable<string>}  [params.hasTargetClassList] - When defined any event targets that has any class in this
 *                                                          list are allowed.
 *
 * @param {Iterable<string>}  [params.ignoreTargetClassList] - When defined any event targets that have a class in this
 *                                                             list are ignored.
 *
 * @returns {import('svelte/action').ActionReturn<Record<string, any>>} Lifecycle functions.
 */
function draggableGsap(node, { position, active = true, button = 0, storeDragging = void 0, tween = false,
 inertia = false, tweenOptions = { duration: 1, ease: 'power3.out' },
  inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 },
   hasTargetClassList, ignoreTargetClassList })
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
      dragDown: ['pointerdown', onDragPointerDown, false],
      dragMove: ['pointermove', onDragPointerChange, false],
      dragUp: ['pointerup', onDragPointerUp, false]
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
      quickLeft = GsapCompose.quickTo(position, 'left', tweenOptions);
      quickTop = GsapCompose.quickTo(position, 'top', tweenOptions);
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

      // Do not process if the position system is not enabled.
      if (!position.enabled) { return; }

      // Potentially ignore this event if `ignoreTargetClassList` is defined and the `event.target` has a matching
      // class.
      if (ignoreTargetClassList !== void 0 && A11yHelper.isFocusTarget(event.target))
      {
         for (const targetClass of ignoreTargetClassList)
         {
            if (event.target.classList.contains(targetClass)) { return; }
         }
      }

      // Potentially ignore this event if `hasTargetClassList` is defined and the `event.target` does not have any
      // matching class from the list.
      if (hasTargetClassList !== void 0 && A11yHelper.isFocusTarget(event.target))
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

      if (tween)
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

            tweenTo = GsapCompose.to(position, { left: newLeft, top: newTop, ...tweenOptions });
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

         if (typeof options.tween === 'boolean') { tween = options.tween; }
         if (typeof options.inertia === 'boolean') { inertia = options.inertia; }

         if (isObject(options.tweenOptions))
         {
            tweenOptions = options.tweenOptions;

            if (s_HAS_QUICK_TO)
            {
               quickLeft = GsapCompose.quickTo(position, 'left', tweenOptions);
               quickTop = GsapCompose.quickTo(position, 'top', tweenOptions);
            }
         }

         if (isObject(options.inertiaOptions))
         {
            inertiaOptions = options.inertiaOptions;
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

/**
 * Provides an instance of the {@link draggableGsap} action options support / Readable store to make updating / setting
 * draggableGsap options much easier. When subscribing to the options instance returned by {@link draggableGsap.options}
 * the Subscriber handler receives the entire instance.
 *
 * @implements {import('./types').IDraggableGsapOptions}
 */
class DraggableGsapOptions
{
   /** @type {boolean} */
   #initialTween;

   /**
    * @type {import('./types').GsapTweenOptions}
    */
   #initialTweenOptions;

   /** @type {boolean} */
   #initialInertia;

   /**
    * @type {import('./types').GsapTweenInertiaOptions}
    */
   #initialInertiaOptions;

   /** @type {boolean} */
   #tween;

   #tweenOptions = { duration: 1, ease: 'power3.out' };

   /** @type {boolean} */
   #inertia;

   #inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 };

   /**
    * Stores the subscribers.
    *
    * @type {import('svelte/store').Subscriber<import('./types').IDraggableGsapOptions>[]}
    */
   #subscriptions = [];

   constructor({ tween = false, tweenOptions, inertia = false, inertiaOptions } = {})
   {
      // Define the following getters directly on this instance and make them enumerable. This allows them to be
      // picked up w/ `Object.assign`.

      Object.defineProperty(this, 'tween', {
         get: () => { return this.#tween; },
         set: (newTween) =>
         {
            if (typeof newTween !== 'boolean') { throw new TypeError(`'tween' is not a boolean.`); }

            this.#tween = newTween;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'tweenOptions', {
         get: () => { return this.#tweenOptions; },
         set: (newTweenOptions) =>
         {
            if (!isObject(newTweenOptions))
            {
               throw new TypeError(`'tweenOptions' is not an object.`);
            }

            if (newTweenOptions.duration !== void 0)
            {
               if (!Number.isFinite(newTweenOptions.duration))
               {
                  throw new TypeError(`'tweenOptions.duration' is not a finite number.`);
               }

               if (newTweenOptions.duration < 0) { throw new Error(`'tweenOptions.duration' is less than 0.`); }

               this.#tweenOptions.duration = newTweenOptions.duration;
            }

            if (newTweenOptions.ease !== void 0)
            {
               if (typeof newTweenOptions.ease !== 'function' && typeof newTweenOptions.ease !== 'string')
               {
                  throw new TypeError(`'tweenOptions.ease' is not a function or string.`);
               }

               this.#tweenOptions.ease = newTweenOptions.ease;
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
            if (!isObject(newInertiaOptions))
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
               if (!isObject(newInertiaOptions.duration))
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
      if (tween !== void 0) { this.tween = tween; }
      if (tweenOptions !== void 0) { this.tweenOptions = tweenOptions; }
      if (inertia !== void 0) { this.inertia = inertia; }
      if (inertiaOptions !== void 0) { this.inertiaOptions = inertiaOptions; }

      this.#initialTween = this.#tween;
      this.#initialTweenOptions = klona(this.#tweenOptions);
      this.#initialInertia = this.#inertia;
      this.#initialInertiaOptions = klona(this.#inertiaOptions);
   }

   /**
    * @returns {number} Get ease duration
    */
   get tweenDuration() { return this.#tweenOptions.duration; }

   /**
    * @returns {string|Function} Get easing function value.
    */
   get tweenEase() { return this.#tweenOptions.ease; }

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
    * @param {number}   duration - Set tween duration.
    */
   set tweenDuration(duration)
   {
      if (!Number.isFinite(duration))
      {
         throw new TypeError(`'duration' is not a finite number.`);
      }

      if (duration < 0) { throw new Error(`'duration' is less than 0.`); }

      this.#tweenOptions.duration = duration;
      this.#updateSubscribers();
   }

   /**
    * @param {string|import('svelte/transition').EasingFunction} value - Set tween easing function value.
    */
   set tweenEase(value)
   {
      if (typeof value !== 'function' && typeof value !== 'string')
      {
         throw new TypeError(`'value' is not a function or string.`);
      }

      this.#tweenOptions.ease = value;
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
      if (!isObject(duration) && !Number.isFinite(duration.min) && !Number.isFinite(duration.max))
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
    * Resets all options data to initial values.
    */
   reset()
   {
      this.#tween = this.#initialTween;
      this.#inertia = this.#initialInertia;
      this.#tweenOptions = klona(this.#initialTweenOptions);
      this.#inertiaOptions = klona(this.#initialInertiaOptions);
      this.#updateSubscribers();
   }

   /**
    * Resets tween enabled state to initial value.
    */
   resetTween()
   {
      this.#tween = this.#initialTween;
      this.#updateSubscribers();
   }

   /**
    * Resets tween options to initial values.
    */
   resetTweenOptions()
   {
      this.#tweenOptions = klona(this.#initialTweenOptions);
      this.#updateSubscribers();
   }

   /**
    * Resets inertia enabled state to initial value.
    */
   resetInertia()
   {
      this.#inertia = this.#initialInertia;
      this.#updateSubscribers();
   }

   /**
    * Resets inertia options to initial values.
    */
   resetInertiaOptions()
   {
      this.#inertiaOptions = klona(this.#initialInertiaOptions);
      this.#updateSubscribers();
   }

   /**
    * Store subscribe method.
    *
    * @param {import('svelte/store').Subscriber<import('./types').IDraggableGsapOptions>} handler - Callback function
    *        that is invoked on update / changes. Receives the IDraggableGsapOptions object / instance.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
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
 * Define a function to get an IDraggableGsapOptions instance.
 *
 * @param {({
 *    tween?: boolean,
 *    tweenOptions?: import('./types').GsapTweenOptions,
 *    inertia?: boolean,
 *    inertiaOptions?: import('./types').GsapInertiaOptions
 * })} options - Initial options for IDraggableGsapOptions.
 *
 * @returns {import('./types').IDraggableGsapOptions} A new options instance.
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
