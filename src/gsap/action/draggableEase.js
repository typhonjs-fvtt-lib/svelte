import { GsapCompose } from '../compose/GsapCompose.js';

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
 * @param {object}            params.vars - Gsap `quickTo` vars object.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
export function draggableEase(node, { position, vars = { duration: 0.4, ease: 'power3' }, active = true,
 storeDragging = void 0 })
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
      quickLeft = GsapCompose.quickTo(position, 'left', vars);
      quickTop = GsapCompose.quickTo(position, 'top', vars);
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
      event.preventDefault();

      dragging = false;

      // Record initial position.
      initialPosition = position.get();
      initialDragPoint = { x: event.clientX, y: event.clientY };

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

      const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
      const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);

      // Update application position.
      if (s_HAS_QUICK_TO)
      {
         quickLeft(newLeft);
         quickTop(newTop);
      }
      else
      {
         if (tweenTo) { tweenTo.kill(); }

         tweenTo = GsapCompose.to(position, { left: newLeft, top: newTop, ...vars });
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
   }

   return {
      // The default of active being true won't automatically add listeners twice.
      update: ({ active = true, vars }) =>  // eslint-disable-line no-shadow
      {
         if (typeof vars === 'object')
         {
            if (s_HAS_QUICK_TO)
            {
               quickLeft = GsapCompose.quickTo(position, 'left', vars);
               quickTop = GsapCompose.quickTo(position, 'top', vars);
            }
         }

         if (active) { activateListeners(); }
         else { removeListeners(); }
      },

      destroy: () => removeListeners()
   };
}
