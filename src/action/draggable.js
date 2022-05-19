import { cubicOut } from 'svelte/easing';

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
 * @param {boolean}           [params.ease=true] - When true easing is enabled.
 *
 * @param {object}            [params.easeOptions] - Gsap `to / `quickTo` vars object.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggable(node, { position, active = true, storeDragging = void 0, ease = false,
 easeOptions = { duration: 0.1, ease: cubicOut } })
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
    * Stores the ease tween.
    *
    * @type {TJSBasicAnimation}
    */
   let tweenTo;

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

      /** @type {number} */
      const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
      /** @type {number} */
      const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);

      if (ease)
      {
         if (tweenTo) { tweenTo.cancel(); }

         tweenTo = position.animateTo({ left: newLeft, top: newTop }, easeOptions);
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

         if (typeof options.ease === 'boolean') { ease = options.ease; }

         if (typeof options.easeOptions === 'object')
         {
            easeOptions = options.easeOptions;
         }
      },

      destroy: () => removeListeners()
   };
}

class DraggableOptions
{
   #ease = false;

   #easeOptions = { duration: 0.1, ease: cubicOut };

   /**
    * Stores the subscribers.
    *
    * @type {(function(DraggableOptions): void)[]}
    */
   #subscriptions = [];

   constructor()
   {
      // Define the following getters directly on this instance and make them enumerable. This allows them to be
      // picked up w/ `Object.assign`.
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
    * Resets all options data to default values.
    */
   reset()
   {
      this.#ease = false;
      this.#easeOptions = { duration: 0.1, ease: cubicOut };
      this.#updateSubscribers();
   }

   /**
    * Resets easing options to default values.
    */
   resetEase()
   {
      this.#easeOptions = { duration: 0.1, ease: cubicOut };
      this.#updateSubscribers();
   }

   /**
    *
    * @param {function(DraggableOptions): void} handler - Callback function that is invoked on update / changes.
    *                                                 Receives the DraggableOptions object / instance.
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
 * Define a function to get a DraggableOptions instance.
 *
 * @returns {DraggableOptions} A new options instance.
 */
draggable.options = () => new DraggableOptions();

export { draggable };

/**
 * Used for direct call to `position.set`.
 *
 * @type {{top: number, left: number}}
 */
const s_POSITION_DATA = { left: 0, top: 0 };
