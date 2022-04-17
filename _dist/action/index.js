import 'svelte/store';
import 'svelte/internal';
import { hasSetter } from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * and `set` functions.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ `subscribe` & `set` functions.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */

function isWritableStore(store) {
  if (store === null || store === void 0) {
    return false;
  }

  switch (typeof store) {
    case 'function':
    case 'object':
      return typeof store.subscribe === 'function' && typeof store.set === 'function';
  }

  return false;
}

/**
 * Provides an action to apply style properties provided as an object.
 *
 * @param {HTMLElement} node - Target element
 *
 * @param {object}      properties - Key / value object of properties to set.
 *
 * @returns {Function} Update function.
 */
function applyStyles(node, properties)
{
   /** Sets properties on node. */
   function setProperties()
   {
      if (typeof properties !== 'object') { return; }

      for (const prop of Object.keys(properties))
      {
         node.style.setProperty(`${prop}`, properties[prop]);
      }
   }

   setProperties();

   return {
      update(newProperties)
      {
         properties = newProperties;
         setProperties();
      }
   };
}

/**
 * Provides an action to monitor the given HTMLElement node with `ResizeObserver` posting width / height changes
 * to the target in various ways depending on the shape of the target. The target can be one of the following and the
 * precedence order is listed from top to bottom:
 *
 *
 * - has a `setDimension` function as attribute; width / height are passed as parameters.
 * - has `setWidth` & `setHeight` functions as attribute; width & height are passed as parameters.
 * - has
 * - target is an object; width and height attributes are directly set on target.
 * - target is a function; the function is invoked with width & height parameters.
 *
 * Note: Svelte currently uses an archaic IFrame based workaround to monitor offset / client width & height changes.
 * A more up to date way to do this is with ResizeObserver. To track when Svelte receives ResizeObserver support
 * monitor this issue: {@link https://github.com/sveltejs/svelte/issues/4233}
 *
 * Can-I-Use: {@link https://caniuse.com/resizeobserver}
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object | Function} target - An object to update with observed width & height changes.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 * @see {@link https://github.com/sveltejs/svelte/issues/4233}
 */
function resizeObserver(node, target)
{
   let updateType = setUpdateType(target);

   const observer = new ResizeObserver((entries) =>
   {
      for (const entry of entries)
      {
         // An early out verifying that the entry matches the node.
         if (node !== entry?.target) { return; }

         switch (updateType)
         {
            case s_UPDATE_TYPES.attribute:
               target.width = entry.contentRect.width;
               target.height = entry.contentRect.height;
               break;

            case s_UPDATE_TYPES.function:
               target(entry.contentRect.width, entry.contentRect.height);
               break;

            case s_UPDATE_TYPES.setDimension:
               target.setDimension?.(entry.contentRect.width, entry.contentRect.height);
               break;

            case s_UPDATE_TYPES.setWidthAndHeight:
               target.setWidth?.(entry.contentRect.width);
               target.setHeight?.(entry.contentRect.height);
               break;

            case s_UPDATE_TYPES.storeObject:
               target.width.set(entry.contentRect.width);
               target.height.set(entry.contentRect.height);
               break;
         }
      }
   });

   observer.observe(node);

   return {
      update: (newTarget) =>
      {
         updateType = setUpdateType(newTarget);
         target = newTarget;
      },

      destroy: () =>
      {
         observer.unobserve(node);
         observer.disconnect();
      }
   };
}

/**
 * Defines the various shape / update type of the given target.
 *
 * @type {Record<string, number>}
 */
const s_UPDATE_TYPES = {
   none: 0,
   attribute: 1,
   function: 2,
   setDimension: 3,
   setWidthAndHeight: 4,
   storeObject: 5
};

/**
 * Determines the shape of the target instance regarding valid update mechanisms to set width & height changes.
 *
 * @param {*}  target - The target instance.
 *
 * @returns {number} Update type value.
 */
function setUpdateType(target)
{
   if (target?.setDimension instanceof Function) { return s_UPDATE_TYPES.setDimension; }

   if (target?.setWidth instanceof Function && target?.setHeight instanceof Function)
   {
      return s_UPDATE_TYPES.setWidthAndHeight;
   }

   const targetType = typeof target;

   // Does the target have width & height writable store attributes?
   if ((targetType === 'object' || targetType === 'function') && isWritableStore(target.width) &&
    isWritableStore(target.height))
   {
      return s_UPDATE_TYPES.storeObject;
   }

   if (targetType === 'object') { return s_UPDATE_TYPES.attribute; }

   if (targetType === 'function') { return s_UPDATE_TYPES.function; }

   return s_UPDATE_TYPES.none;
}

/**
 * Provides an action to apply a Position instance to a HTMLElement and invoke `position.parent`
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {Position}          position - A position instance.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function applyPosition(node, position)
{
   if (hasSetter(position, 'parent')) { position.parent = node; }

   return {
      update: (newPosition) =>
      {
         if (hasSetter(position)) { position.parent = void 0; }

         position = newPosition;

         if (hasSetter(position, 'parent')) { position.parent = node; }
      },

      destroy: () => { if (hasSetter(position, 'parent')) { position.parent = void 0; } }
   };
}

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
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggable(node, { position, active = true, storeDragging = void 0 })
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

export { applyPosition, applyStyles, draggable, resizeObserver };
//# sourceMappingURL=index.js.map
