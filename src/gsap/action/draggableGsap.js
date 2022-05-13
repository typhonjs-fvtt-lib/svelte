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
function draggableGsap(node, { position, active = true, storeDragging = void 0, ease = true, inertia = true,
 easeOptions = { duration: 0.1, ease: 'power3' },
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

         const velScale = opts.velScale ?? 1;
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
      update: ({ active = true, easeOptions }) =>  // eslint-disable-line no-shadow
      {
         if (typeof easeOptions === 'object')
         {
            if (s_HAS_QUICK_TO)
            {
               quickLeft = GsapCompose.quickTo(position, 'left', easeOptions);
               quickTop = GsapCompose.quickTo(position, 'top', easeOptions);
            }
         }

         if (active) { activateListeners(); }
         else { removeListeners(); }
      },

      destroy: () => removeListeners()
   };
}

export { draggableGsap };
