<script>
   /**
    * @privateRemarks
    * TODO: Add description
    *
    * @componentDocumentation
    */
   import { getContext }            from '#svelte';

   import { ResizeHandleTransform } from './ResizeHandleTransform.js';

   export let isResizable = false;

   const application = getContext('#external')?.application;

   // Allows retrieval of the element root at runtime.
   const storeElementRoot = getContext('#internal').stores.elementRoot;

   const storeResizable = application.reactive.storeAppOptions.resizable;

   const storeMinimized = application.reactive.storeUIState.minimized;
   const storeResizing = application.reactive.storeUIState.resizing;

   let elementResize;

   $: if (elementResize)
   {
      // Instead of creating a derived store it is easier to use isResizable and the minimized store below.
      elementResize.style.display = isResizable && !$storeMinimized ? 'block' : 'none';

      // Add / remove `resizable` class from element root.
      const elementRoot = $storeElementRoot;
      if (elementRoot) { elementRoot.classList[isResizable ? 'add' : 'remove']('resizable'); }
   }

   /**
    * Cancel any app animation in progress when dragging starts.
    */
   function onPointerdown()
   {
      application.position.animate.cancel();
   }

   /**
    * Provides an action to handle resizing the application shell based on the resizable app option.
    *
    * @param {HTMLElement}       node - The node associated with the action.
    *
    * @param {object}            [opts] - Optional parameters.
    *
    * @param {boolean}           [opts.active=true] - A boolean value; attached to a readable store.
    *
    * @param {Writable<boolean>} [opts.storeResizing] - A writable store that tracks "resizing" state.
    *
    * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
    */
   function resizable(node, { active = true, storeResizing = void 0 } = {})
   {
      /**
       * Duplicate the app / Positionable starting position to track differences.
       *
       * @type {object}
       */
      let position = null;

      /**
       * Stores the current resizing state and gates the move pointer as the resizing store is not
       * set until the first pointer move.
       *
       * @type {boolean}
       */
      let resizing = false;

      /**
       * Stores initial pointer down X in screen coordinates.
       */
      let pScreenDownX = 0;

      /**
       * Stores initial pointer down Y in screen coordinates.
       */
      let pScreenDownY = 0;

      /**
       * Remember event handlers associated with this action so they may be later unregistered.
       *
       * @type {Object}
       */
      const handlers = {
         resizeDown: ['pointerdown', (e) => onResizePointerDown(e), false],
         resizeMove: ['pointermove', (e) => onResizePointerMove(e), false],
         resizeUp: ['pointerup', (e) => onResizePointerUp(e), false]
      };

      /**
       * Activates listeners.
       */
      function activateListeners()
      {
         // Resize handlers
         node.addEventListener(...handlers.resizeDown);

         isResizable = true;

         node.style.display = 'block';
      }

      /**
       * Removes listeners.
       */
      function removeListeners()
      {
         if (typeof storeResizing?.set === 'function') { storeResizing.set(false); }

         // Resize handlers
         node.removeEventListener(...handlers.resizeDown);
         node.removeEventListener(...handlers.resizeMove);
         node.removeEventListener(...handlers.resizeUp);

         node.style.display = 'none';

         isResizable = false;
      }

      // On mount if resizable is true then activate listeners otherwise set element display to `none`.
      if (active)
      {
         activateListeners();
      }
      else
      {
         node.style.display = 'none';
      }

      /**
       * Handle the initial pointer down that activates resizing capture.
       */
      function onResizePointerDown(event)
      {
         event.preventDefault();

         resizing = false;

         // Record initial position
         position = application.position.get();

         if (position.height === 'auto') { position.height = $storeElementRoot.clientHeight; }
         if (position.width === 'auto') { position.width = $storeElementRoot.clientWidth; }

         pScreenDownX = event.clientX;
         pScreenDownY = event.clientY;

         // Add temporary handlers
         node.addEventListener(...handlers.resizeMove);
         node.addEventListener(...handlers.resizeUp);

         node.setPointerCapture(event.pointerId);
      }

      /**
       * Sets the width / height of the positionable application.
       */
      function onResizePointerMove(event)
      {
         event.preventDefault();

         if (!resizing && typeof storeResizing?.set === 'function')
         {
            resizing = true;
            storeResizing.set(true);
         }

         const pDeltaLocal = ResizeHandleTransform.computeDelta(application.position.transform.mat4, pScreenDownX,
          pScreenDownY, event.clientX, event.clientY);

         application.position.set({
            width: position.width + pDeltaLocal[0],
            height: position.height + pDeltaLocal[1]
         });
      }

      /**
       * Conclude the dragging behavior when the pointer is released setting the final position and
       * removing listeners.
       */
      function onResizePointerUp(event)
      {
         resizing = false;
         if (typeof storeResizing?.set === 'function') { storeResizing.set(false); }

         event.preventDefault();
         node.removeEventListener(...handlers.resizeMove);
         node.removeEventListener(...handlers.resizeUp);

         // TODO: Direct Foundry API access.
         application?._onResize?.(event);
      }

      return {
         update: ({ active }) =>  // eslint-disable-line no-shadow
         {
            if (active) { activateListeners(); }
            else { removeListeners(); }
         },

         destroy: () => removeListeners()
      };
   }

</script>

<div class="window-resizable-handle"
     on:pointerdown={onPointerdown}
     use:resizable={{ active: $storeResizable, storeResizing }}
     bind:this={elementResize}>
   <i class="fas fa-arrows-alt-h"></i>
</div>

<style>
   .window-resizable-handle {
      display: block;
      position: absolute;
      width: var(--tjs-app-resizable-handle-width, 20px);
      height: var(--tjs-app-resizable-handle-height, 20px);
      top: var(--tjs-app-resizable-handle-top, unset);
      bottom: var(--tjs-app-resizable-handle-bottom, -1px);
      right: var(--tjs-app-resizable-handle-right, 0);
      left: var(--tjs-app-resizable-handle-left, unset);
      background: var(--tjs-app-resizable-handle-background, #444);
      border: var(--tjs-app-resizable-handle-border, 1px solid #111);
      border-radius: var(--tjs-app-resizable-handle-border-radius, 4px 0 0 0);
      padding: var(--tjs-app-resizable-handle-padding, 2px);
      touch-action: none;
   }

   .fa-arrows-alt-h {
      color: var(--tjs-app-resizable-handle-icon-color, #f0f0e0);
      transform: var(--tjs-app-resizable-handle-icon-transform, rotate(45deg));
   }
</style>
