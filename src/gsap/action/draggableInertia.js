import { lerp }         from '@typhonjs-fvtt/svelte/math';

import { GsapCompose }  from '../compose/GsapCompose.js';

/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `position.set` on a given {@link Position}
 * instance provided. When the attached boolean store state changes the draggable action is enabled or disabled.
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
 * @param {number|number[]|Function}   [params.tweenEnd] - Defines the tween end position.
 *
 * @param {number|{min: number, max: number}} [params.tweenDuration] Duration of inertia tween; constant or provide
 *                                                                   min / max object.
 *
 * @param {number}            [params.tweenResistance=1] - Resistance per second for the inertia tween.
 *
 * @param {number}            [params.velScale=1] - Scales velocity calculation.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
export function draggableInertia(node, { position, active = true, storeDragging = void 0, tweenEnd,
 tweenDuration = { min: 0, max: 1 }, tweenResistance = 1, velScale = 1 })
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
    * @type {{x: number, y: number}}
    */
   const initialDragPoint = { x: 0, y: 0 };

   // Used to track current velocity and the inertia tween.
   let currentTween;
   let lastDragTime;
   const lastDragPoint = { x: 0, y: 0 };
   const velInstant = { x: 0, y: 0 };
   const velQuick = { x: 0, y: 0 };
   const velSmooth = { x: 0, y: 0 };
   const velUsed = { x: 0, y: 0 };

   /**
    * Stores the current dragging state and gates the move pointer as the dragging store is not
    * set until the first pointer move.
    *
    * @type {boolean}
    */
   let dragging = false;

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
    * Remember event handlers associated with this action so they may be later unregistered.
    *
    * @type {object}
    */
   const handlers = {
      dragDown: ['pointerdown', (e) => onDragPointerDown(e), false],
      dragMove: ['pointermove', (e) => onDragPointerMove(e), false],
      dragUp: ['pointerup', (e) => onDragPointerUp(e), false]
   };

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
      event.preventDefault();

      dragging = false;

      if (currentTween !== void 0)
      {
         currentTween.kill();
         currentTween = void 0;
      }

      // Record initial position.
      initialPosition = position.get();

      initialDragPoint.x = event.clientX;
      initialDragPoint.y = event.clientY;

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

      calcVelocity(event.clientX, event.clientY);

      // Update application position.
      position.set({
         left: initialPosition.left + (event.clientX - initialDragPoint.x),
         top: initialPosition.top + (event.clientY - initialDragPoint.y)
      });
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

      const velocity = calcVelocity(event.clientX, event.clientY, velScale * 1000); // Convert velScale to ms

      currentTween = GsapCompose.to(position, {
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

   return {
      // The default of active being true won't automatically add listeners twice.
      update: ({ active = true }) =>  // eslint-disable-line no-shadow
      {
         if (active) { activateListeners(); }
         else { removeListeners(); }
      },

      destroy: () => removeListeners()
   };
}
