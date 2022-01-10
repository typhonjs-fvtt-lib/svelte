import 'svelte/internal';
import { get } from 'svelte/store';
import { tick } from 'svelte';
import { debounce as debounce$1 } from '@typhonjs-fvtt/svelte/util';

/**
 * Wraps a callback in a debounced timeout.
 *
 * Delay execution of the callback function until the function has not been called for delay milliseconds
 *
 * @param {Function} callback - A function to execute once the debounced threshold has been passed.
 *
 * @param {number}   delay - An amount of time in milliseconds to delay.
 *
 * @return {Function} A wrapped function which can be called to debounce execution
 */
function debounce(callback, delay)
{
   let timeoutId;

   return function(...args)
   {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { callback.apply(this, args); }, delay);
   }
}

/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('svelte/store').Readable | import('svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {function} first - Function to receive first update.
 *
 * @param {function} update - Function to receive future updates.
 *
 * @returns {function} Store unsubscribe function.
 */

function subscribeFirstRest(store, first, update) {
  let firedFirst = false;
  return store.subscribe(value => {
    if (!firedFirst) {
      firedFirst = true;
      first(value);
    } else {
      update(value);
    }
  });
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
 * Provides an action to blur the element when any pointer down event occurs outside the element. This can be useful
 * for input elements including select to blur / unfocus the element when any pointer down occurs outside the element.
 *
 * @param {HTMLElement}   element - The element to handle automatic blur on focus loss.
 */
function autoBlur(element)
{
   function blur() { document.body.removeEventListener('pointerdown', onPointerDown); }
   function focus() { document.body.addEventListener('pointerdown', onPointerDown); }

   /**
    * Blur the element if a pointer down event happens outside the element.
    * @param {PointerEvent} event
    */
   function onPointerDown(event)
   {
      if (event.target === element || element.contains(event.target)) { return; }

      element.blur();
   }

   element.addEventListener('blur', blur);
   element.addEventListener('focus', focus);

   return {
      destroy: () =>
      {
         document.body.removeEventListener('pointerdown', onPointerDown);
         element.removeEventListener('blur', blur);
         element.removeEventListener('focus', focus);
      }
   };
}

/**
 * Defines an `Element.animate` animation from provided keyframes and options.
 *
 * @param {object}         [opts] - Optional parameters.
 *
 * @param {number}         [opts.duration=600] - Duration in milliseconds.
 *
 * @param {Array|object}   opts.keyframes - An array of keyframe objects or a keyframe object whose properties are
 *                                          arrays of values to iterate over.
 *
 * @param {object}         [opts.options] - An object containing one or more timing properties. When defined it is used
 *                                          instead of duration.
 *
 * @param {string}         [opts.event='click'] - DOM event to bind element to respond with the ripple effect.
 *
 * @param {number}         [opts.debounce=undefined] - Add a debounce to incoming events in milliseconds.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
 *
 * @returns Function - Actual action.
 */
function animate({ duration = 600, keyframes = [], options, event = 'click', debounce: debounce$1 } = {})
{
   return (element) =>
   {
      function createAnimation() {
         element.animate(keyframes, typeof options === 'object' && options !== null ? options : duration);
      }

      const eventFn = Number.isInteger(debounce$1) && debounce$1 > 0 ? debounce(createAnimation, debounce$1) :
       createAnimation;

      element.addEventListener(event, eventFn);

      return {
         destroy: () => element.removeEventListener(event, eventFn)
      };
   }
}

/**
 * Combines multiple composable actions.
 *
 * Note: The update function passes the same variable to all update functions of each action.
 *
 * @param {...Function} actions - One or more composable action functions to combine.
 *
 * @returns {Function} Composed action.
 */
function composable(...actions)
{
   return (element, options) =>
   {
      let lifecycle = actions.map((action) => action(element, options));

      return {
         destroy: () =>
         {
            for (const action of lifecycle)
            {
               if (typeof action.destroy === 'function') { action.destroy(); }
            }

            lifecycle = void 0;
         },
         update: (parameters) =>
         {
            for (const action of lifecycle)
            {
               if (typeof action.update === 'function') { action.update(parameters); }
            }
         }
      }
   };
}

/**
 * Defines the classic Material Design ripple effect as an action. `ripple` is a wrapper around the returned action.
 * This allows it to be easily used as a prop.
 *
 * Note: A negative one translateZ transform is applied to the added spans allowing other content to be layered on top
 * with a positive translateZ.
 *
 * Styling: There is a single CSS variable `--tjs-action-ripple-background` that can be set to control the background.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {number}   [opts.duration=600] - Duration in milliseconds.
 *
 * @param {string}   [opts.background='rgba(255, 255, 255, 0.7)'] - A valid CSS background attribute.
 *
 * @param {string}   [opts.event='click'] - DOM event to bind element to respond with the ripple effect.
 *
 * @param {number}   [opts.debounce=undefined] - Add a debounce to incoming events in milliseconds.
 *
 * @returns Function - Actual action.
 */
function ripple({ duration = 600, background = 'rgba(255, 255, 255, 0.7)', event = 'click', debounce: debounce$1 } = {})
{
   return (element) =>
   {
      function createRipple(e) {
         const elementRect = element.getBoundingClientRect();

         const diameter = Math.max(elementRect.width, elementRect.height);
         const radius = diameter / 2;
         const left = `${e.clientX - (elementRect.left + radius)}px`;
         const top = `${e.clientY - (elementRect.top + radius)}px`;

         const span = document.createElement('span');

         span.style.position = 'absolute';
         span.style.width = `${diameter}px`;
         span.style.height = `${diameter}px`;
         span.style.left = left;
         span.style.top = top;

         span.style.background = `var(--tjs-action-ripple-background, ${background})`;
         span.style.borderRadius = '50%';
         span.style.pointerEvents = 'none';
         span.style.transform = 'translateZ(-1px)';

         element.prepend(span);

         const animation = span.animate([
            {  // from
               transform: 'scale(.7)',
               opacity: 0.5,
               filter: 'blur(2px)'
            },
            {  // to
               transform: 'scale(4)',
               opacity: 0,
               filter: 'blur(5px)'
            }
         ],
         duration);

         animation.onfinish = () => span.remove();
      }

      const eventFn = Number.isInteger(debounce$1) && debounce$1 > 0 ? debounce(createRipple, debounce$1) : createRipple;

      element.addEventListener(event, eventFn);

      return {
         destroy: () => element.removeEventListener(event, eventFn)
      };
   }
}

/**
 * Defines the classic Material Design ripple effect as an action that is attached to an elements focus and blur events.
 * `rippleFocus` is a wrapper around the returned action. This allows it to be easily used as a prop.
 *
 * Note: A negative one translateZ transform is applied to the added span allowing other content to be layered on top
 * with a positive translateZ.
 *
 * If providing the `selectors` option a target child element will be registered for the focus events otherwise the
 * first child is targeted with a final fallback of the element assigned to this action.
 *
 * Styling: There is a single CSS variable `--tjs-action-ripple-background-focus` that can be set to control the
 * background with a fallback to `--tjs-action-ripple-background`.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {number}   [opts.duration=600] - Duration in milliseconds.
 *
 * @param {string}   [opts.background='rgba(255, 255, 255, 0.7)'] - A valid CSS background attribute.
 *
 * @param {string}   [opts.selectors] - A valid CSS selectors string.
 *
 * @returns Function - Actual action.
 */
function rippleFocus({ duration = 300, background = 'rgba(255, 255, 255, 0.7)', selectors } = {})
{
   return (element) =>
   {
      const targetEl = typeof selectors === 'string' ? element.querySelector(selectors) :
       element.firstChild instanceof HTMLElement ? element.firstChild : element;

      let span = void 0;
      let clientX = -1;
      let clientY = -1;

      function blurRipple()
      {
         if (!(span instanceof HTMLElement)) { return; }

         const animation = span.animate(
         [
            {  // from
               transform: 'scale(3)',
               opacity: 0.3,
            },
            {  // to
               transform: 'scale(.7)',
               opacity: 0.0,
            }
         ],
         {
            duration,
            fill: 'forwards'
         });

         animation.onfinish = () =>
         {
            clientX = clientY = -1;
            span.remove();
         };
      }

      function focusRipple()
      {
         const elementRect = element.getBoundingClientRect();

         // The order of events don't always occur with a pointer event first. In this case use the center of the
         // element as the click point. Mostly this is seen when the focused target element has a followup event off
         // the app / screen. If the next pointer down occurs on the target element the focus callback occurs before
         // pointer down in Chrome and Firefox.
         const actualX = clientX >= 0 ? clientX : elementRect.left + (elementRect.width / 2);
         const actualY = clientX >= 0 ? clientY : elementRect.top + (elementRect.height / 2);

         const diameter = Math.max(elementRect.width, elementRect.height);
         const radius = diameter / 2;
         const left = `${actualX - (elementRect.left + radius)}px`;
         const top = `${actualY - (elementRect.top + radius)}px`;

         span = document.createElement('span');

         span.style.position = 'absolute';
         span.style.width = `${diameter}px`;
         span.style.height = `${diameter}px`;
         span.style.left = left;
         span.style.top = top;

         span.style.background =
          `var(--tjs-action-ripple-background-focus, var(--tjs-action-ripple-background, ${background}))`;

         span.style.borderRadius = '50%';
         span.style.pointerEvents = 'none';
         span.style.transform = 'translateZ(-1px)';

         element.prepend(span);

         span.animate([
            {  // from
               transform: 'scale(.7)',
               opacity: 0.5,
            },
            {  // to
               transform: 'scale(3)',
               opacity: 0.3,
            }
         ],
         {
            duration,
            fill: 'forwards'
         });
      }

      // Store the pointer down location for the origination of the ripple.
      function onPointerDown(e)
      {
         clientX = e.clientX;
         clientY = e.clientY;
      }

      targetEl.addEventListener('pointerdown', onPointerDown);
      targetEl.addEventListener('blur', blurRipple);
      targetEl.addEventListener('focus', focusRipple);

      return {
         destroy: () => {
            targetEl.removeEventListener('pointerdown', onPointerDown);
            targetEl.removeEventListener('blur', blurRipple);
            targetEl.removeEventListener('focus', focusRipple);
         }
      };
   }
}

/**
 * Provides a toggle action for `details` HTML elements. The boolean store provided controls animation.
 *
 * It is not necessary to bind the store to the `open` attribute of the associated details element.
 *
 * When the action is triggered to close the details element a data attribute `closing` is set to `true`. This allows
 * any associated closing transitions to start immediately.
 *
 * @param {HTMLDetailsElement} details - The details element.
 *
 * @param {import('svelte/store').Writable<boolean>} booleanStore - A boolean store.
 *
 * @returns {object} Destroy callback.
 */
function toggleDetails(details, booleanStore)
{
   /** @type {HTMLElement} */
   const summary = details.querySelector('summary');

   /** @type {Animation} */
   let animation;

   /** @type {boolean} */
   let open = details.open;

   // The booleanStore sets initial open state and handles animation on further changes.
   const unsubscribe = subscribeFirstRest(booleanStore, (value) => { open = value; details.open = open; }, (value) =>
   {
      open = value;
      handleAnimation();
   });

   /**
    * @param {number} a -
    *
    * @param {number} b -
    *
    * @param {boolean} value -
    */
   function animate(a, b, value)
   {
      details.style.overflow = 'hidden';

      // Must guard when `b - a === 0`; add a small epsilon and wrap with Math.max.
      const duration = Math.max(0, 30 * Math.log(Math.abs(b - a) + Number.EPSILON));

      animation = details.animate(
       {
          height: [`${a}px`, `${b}px`]
       },
       {
          duration,
          easing: 'ease-out'
       }
      );

      animation.onfinish = () =>
      {
         details.open = value;
         details.dataset.closing = 'false';
         details.style.overflow = '';
      };
   }

   /**
    * Handles animation coordination based on current state.
    */
   function handleAnimation()
   {
      if (open)
      {
         const a = details.offsetHeight;
         if (animation) { animation.cancel(); }
         details.open = true;
         const b = details.offsetHeight;

         animate(a, b, true);
      }
      else
      {
         const a = details.offsetHeight;
         const b = summary.offsetHeight;

         details.dataset.closing = 'true';

         animate(a, b, false);
      }
   }

   /**
    * @param {MouseEvent} e - A mouse event.
    */
   function handleClick(e)
   {
      e.preventDefault();

      // Simply set the store to the opposite of current open state and the callback above handles animation.
      booleanStore.set(!open);
   }

   summary.addEventListener('click', handleClick);

   return {
      destroy()
      {
         unsubscribe();
         summary.removeEventListener('click', handleClick);
      }
   };
}

/**
 * Provides an action to save `scrollTop` of an element with a vertical scrollbar. This action should be used on the
 * scrollable element and must include a writable store that holds the active store for the current `scrollTop` value.
 * You may switch the stores externally and this action will set the `scrollTop` based on the newly set store. This is
 * useful for instance providing a select box that controls the scrollable container.
 *
 * @param {HTMLElement} element - The target scrollable HTML element.
 *
 * @param {object}      store - The host store wrapping another store that is the `scrollTop` target.
 */
function storeScrolltop(element, store)
{
   let storeScrolltop;

   const unsubscribe = store.subscribe(async (newStore) => {
      storeScrolltop = newStore;

      // If the new store is valid then set the element `scrollTop`.
      if (typeof storeScrolltop === 'object' && typeof storeScrolltop.set === 'function')
      {
         // Wait for any pending updates.
         await tick();

         const value = get(storeScrolltop);

         if (typeof value === 'number') { element.scrollTop = value; }
      }
   });

   /**
    * Save target `scrollTop` to the current set store.
    *
    * @param {Event} event -
    */
   function onScroll(event)
   {
      if (typeof storeScrolltop === 'object' && typeof storeScrolltop.set === 'function')
      {
         storeScrolltop.set(event.target.scrollTop);
      }
   }

   const debounceFn = debounce$1((e) => onScroll(e), 500);

   element.addEventListener('scroll', debounceFn);

   return {
      destroy: () =>
      {
         element.removeEventListener('scroll', debounceFn);

         unsubscribe();
      }
   };
}

/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `setPosition` on given Positionable
 * object provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Positionable}      params.positionable - A positionable object.
 *
 * @param {Readable<boolean>} params.booleanStore - A Svelte store that contains a boolean.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
function draggable(node, { positionable, booleanStore })
{
   /**
    * Duplicate the app / Positionable starting position to track differences.
    *
    * @type {object}
    */
   let position = null;

   /**
    * Stores the initial X / Y on drag down.
    *
    * @type {object}
    */
   let initialPosition = {};

   /**
    * Throttle mousemove event handling to 60fps
    *
    * @type {number}
    */
   let moveTime = 0;

   /**
    * Stores the active state and is used to cut off any active dragging when the store value changes.
    *
    * @type {Readable<boolean>}
    */
   let active = booleanStore;

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
      active = true;

      // Drag handlers
      node.addEventListener(...handlers.dragDown);
      node.classList.add('draggable');
   }

   /**
    * Removes listeners.
    */
   function removeListeners()
   {
      active = false;

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
    * Handle the initial pointer down which activates dragging behavior for the positionable.
    *
    * @param {PointerEvent} event - The pointer down event.
    */
   function onDragPointerDown(event)
   {
      event.preventDefault();

      // Record initial position
      position = foundry.utils.duplicate(positionable.position);
      initialPosition = { x: event.clientX, y: event.clientY };

      // Add temporary handlers
      globalThis.addEventListener(...handlers.dragMove);
      globalThis.addEventListener(...handlers.dragUp);
   }

   /**
    * Move the positionable.
    *
    * @param {PointerEvent} event - The pointer move event.
    */
   function onDragPointerMove(event)
   {
      event.preventDefault();

      if (!active) { return; }

      // Limit dragging to 60 updates per second
      const now = Date.now();

      if ((now - moveTime) < (1000 / 60)) { return; }

      moveTime = now;

      // Update application position
      positionable.setPosition({
         left: position.left + (event.clientX - initialPosition.x),
         top: position.top + (event.clientY - initialPosition.y)
      });
   }

   /**
    * Conclude the dragging behavior when the mouse is release, setting the final position and removing listeners
    *
    * @param {PointerEvent} event - The pointer up event.
    */
   function onDragPointerUp(event)
   {
      event.preventDefault();
      globalThis.removeEventListener(...handlers.dragMove);
      globalThis.removeEventListener(...handlers.dragUp);
   }

   return {
      update: ({ booleanStore }) =>  // eslint-disable-line no-shadow
      {
         if (booleanStore) { activateListeners(); }
         else { removeListeners(); }
      },

      destroy: () => removeListeners()
   };
}

export { animate, applyStyles, autoBlur, composable, draggable, ripple, rippleFocus, storeScrolltop, toggleDetails };
//# sourceMappingURL=index.js.map
