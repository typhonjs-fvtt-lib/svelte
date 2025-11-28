import { isObject }           from '#runtime/util/object';
import { findParentElement }  from '#runtime/util/dom/layout';

/**
 * Experimental auto padding.
 *
 * @param {HTMLElement} node - The node associated with the action.
 *
 * @param {object} options - Data from `TJSScrollContainer`.
 *
 * @returns {import('svelte/action').ActionReturn<object>} The action lifecycle methods.
 */
export function scrollContainerPad(node, options = {})
{
   console.log(`!!! scrollContainerPad - main - node: `, node);

   let gutterStable = false;
   let visualEdgeInsets;

   function calculate()
   {
      gutterStable = typeof options?.gutterStable === 'boolean' ? options.gutterStable : false;
      visualEdgeInsets = isObject(options?.visualEdgeInsets) ? options.visualEdgeInsets : {};

      const rightInset = Number.isFinite(visualEdgeInsets?.right) ? `${visualEdgeInsets?.right}px` : '0';

      const windowContentEl = findParentElement(node, { stackingContext: true });

      const windowContentPaddingLeft = windowContentEl ? getComputedStyle(windowContentEl).paddingLeft : '1rem';

      console.log(`!!! scrollContainerPad - calculate - windowContentEl: `, windowContentEl);

      console.log(`!!! scrollContainerPad - calculate - gutterStable: `, gutterStable);
      console.log(`!!! scrollContainerPad - calculate - visualEdgeInsets: `, visualEdgeInsets);
      console.log(`!!! scrollContainerPad - calculate - rightInset: `, rightInset);
      console.log(`!!! scrollContainerPad - calculate - windowContentPaddingLeft: `, windowContentPaddingLeft);

      if (gutterStable)
      {
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
       * @param {object} newOptions -
       */
      update: (newOptions) =>
      {
         if (isObject(newOptions))
         {
            options = newOptions;
            calculate();
         }
      },

      destroy: () =>
      {
         node.style.paddingRight = '';
      }
   };
}
