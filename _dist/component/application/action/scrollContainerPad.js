import { isObject }           from '@typhonjs-svelte/runtime-base/util/object';
import { findParentElement }  from '@typhonjs-svelte/runtime-base/util/dom/layout';

/**
 * Auto padding for any configured `TJSScrollContainer` in application shells syncing padding and gutter stable
 * status with the embedded scroll container. This automatically keeps a stable gutter without the requirement to make
 * custom modifications between different app window border styles.
 *
 * @param {HTMLElement} node - The node associated with the action.
 *
 * @param {({
 *    gutterStable?: boolean
 *    visualEdgeInsets?: import('svelte/store').Writable<{ top: number, left: number, right: number, bottom: number}>
 * })} options - Data from `TJSScrollContainer`.
 *
 * @returns {import('svelte/action').ActionReturn<object>} The action lifecycle methods.
 */
export function scrollContainerPad(node, options = {})
{
   let gutterStable = false;
   let visualEdgeInsets;

   let windowContentEl = findParentElement(node, { stackingContext: true });

   windowContentEl.addEventListener('tjs-visual-edge-recalculate-external', calculate);

   function calculate()
   {
      gutterStable = typeof options?.gutterStable === 'boolean' ? options.gutterStable : false;
      visualEdgeInsets = isObject(options?.visualEdgeInsets) ? options.visualEdgeInsets : {};

      const rightInset = Number.isFinite(visualEdgeInsets?.right) ? `${visualEdgeInsets?.right}px` : '0';

      const windowContentPaddingLeft = windowContentEl?.isConnected ? getComputedStyle(windowContentEl).paddingLeft :
       '1rem';

      if (gutterStable)
      {
         // Match the gutter padding of the parent app shell content area.
         node.style.paddingRight = `calc(max(calc(var(--_tjs-default-scrollbar-width) + 0.25rem), calc(${
          windowContentPaddingLeft} - ${rightInset})) - var(--_tjs-default-scrollbar-width))`;
      }
      else
      {
         node.style.paddingRight = `calc(${windowContentPaddingLeft} - ${rightInset})`;
      }
   }

   return {
      /**
       * @param {({
       *    gutterStable?: boolean
       *    visualEdgeInsets?: import('svelte/store').Writable<{ top: number, left: number, right: number, bottom: number}>
       * })} newOptions - New action options.
       */
      update: (newOptions) =>
      {
         if (isObject(newOptions))
         {
            options = { ...newOptions };
            calculate();
         }
      },

      destroy: () =>
      {
         windowContentEl?.removeEventListener?.('tjs-visual-edge-recalculate-external', calculate);
         windowContentEl = void 0;

         node.style.paddingRight = '';
      }
   };
}
