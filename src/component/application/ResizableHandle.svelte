<script>
   /**
    * @privateRemarks
    * TODO: Add description
    *
    * @componentDocumentation
    */
   import { getContext }            from '#svelte';

   import { ResizeHandleTransform } from './ResizeHandleTransform.js';

   const { application } = getContext('#external');

   // Allows retrieval of the element root at runtime.
   const storeElementRoot = getContext('#internal').stores.elementRoot;

   const storeResizable = application.reactive.storeAppOptions.resizable;

   const storeDetached = application.reactive.storeUIState.detached;
   const storeMinimized = application.reactive.storeUIState.minimized;
   const storeResizing = application.reactive.storeUIState.resizing;

   const storeIntrinsicHeight = application.position.stores.intrinsicHeight;
   const storeIntrinsicWidth = application.position.stores.intrinsicWidth;

   let elementResize;

   /** @type {boolean} */
   let isResizable = false;

   /**
    * Which dimensions can resize.
    *
    * @type {'all' | 'height' | 'width'}
    */
   let dimension = 'all';

   /**
    * Which cursor to display for `--dynamic-cursor`.
    *
    * @type {string}
    */
   let cursor = 'var(--tjs-cursor-resize-nwse, nwse-resize)';

   $: {
      const isIntrinsicHeight = $storeIntrinsicHeight;
      const isIntrinsicWidth = $storeIntrinsicWidth;

      if (!isIntrinsicHeight && isIntrinsicWidth)
      {
         dimension = 'height';
         cursor = 'var(--tjs-cursor-resize-ns, ns-resize)';
      }
      else if (isIntrinsicHeight && !isIntrinsicWidth)
      {
         dimension = 'width';
         cursor = 'var(--tjs-cursor-resize-ew, ew-resize)';
      }
      else
      {
         dimension = 'all';
         cursor = 'var(--tjs-cursor-resize-nwse, nwse-resize)';
      }
   }

   $: {
      isResizable = $storeResizable && !$storeDetached && !$storeMinimized &&
       (!$storeIntrinsicWidth || !$storeIntrinsicHeight);
   }

   $: if (elementResize)
   {
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

         switch (dimension)
         {
            case 'all':
               application.position.set({
                  width: position.width + pDeltaLocal[0],
                  height: position.height + pDeltaLocal[1]
               });
               break;

            case 'height':
               application.position.set({ height: position.height + pDeltaLocal[1] });
               break;

            case 'width':
               application.position.set({ width: position.width + pDeltaLocal[0] });
               break;
         }
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

<div class="window-resize-handle"
     style:--dynamic-cursor={cursor}
     style:display={isResizable ? 'block' : 'none'}
     on:pointerdown={onPointerdown}
     use:resizable={{ active: isResizable, storeResizing }}
     bind:this={elementResize}>
</div>

<style>
   .window-resize-handle {
      /* Set inline based on intrinsic dimension constraints */
      --dynamic-cursor: var(--tjs-cursor-resize-nwse, nwse-resize);

      display: block;
      position: var(--tjs-app-resize-handle-position);
      width: var(--tjs-app-resize-handle-width);
      height: var(--tjs-app-resize-handle-height);

      background: var(--tjs-app-resize-handle-background);
      cursor: var(--tjs-app-resize-handle-cursor, var(--dynamic-cursor));
      filter: var(--tjs-app-resize-handle-filter, none);
      inset: var(--tjs-app-resize-handle-inset);
      padding: var(--tjs-app-resize-handle-padding, 0);
      touch-action: none;
   }
</style>
