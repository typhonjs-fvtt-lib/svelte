import { applyVisualEdgeInsets } from '#runtime/svelte/action/dom/style';
import { isObject }              from '#runtime/util/object';

/**
 * Sanitation / merging of various app shell props.
 */
export class AppShellOptions
{
   constructor()
   {
      throw new Error('AppShellOptions constructor: This is a static class and should not be constructed.');
   }

   /**
    * Sanitizes and potentially merges the `padToVisualEdge` data from `scrollContainer` into `padToVisualEdgeActual`.
    *
    * @param {import('#runtime/svelte/action/dom/style').VisualEdgeSides} [padToVisualEdge] - App shell prop.
    *
    * @param {boolean | import('#runtime/svelte/component/container').TJSScrollContainerData} [scrollContainer] - App
    *        shell prop.
    *
    * @returns {({
    *    padToVisualEdgeActual?: import('#runtime/svelte/action/dom/style').VisualEdgeSides,
    *    scrollContainerActual?: boolean | import('#runtime/svelte/component/container').TJSScrollContainerData
    * })} Configured padding and scroll container data.
    */
   static handlePadScrollOptions(padToVisualEdge, scrollContainer)
   {
      // If the app shell prop is valid then use it.
      let padToVisualEdgeActual = applyVisualEdgeInsets.validateSides(padToVisualEdge) ? padToVisualEdge : void 0;

      let scrollContainerActual = void 0;

      // Potentially copy any `padToVisualEdge` data from `scrollContainer` to `padToVisualEdgeActual` if not already
      // configured.
      if (isObject(scrollContainer))
      {
         // Shallow copy.
         scrollContainerActual = Object.assign({}, scrollContainer);

         if (applyVisualEdgeInsets.validateSides(scrollContainerActual.padToVisualEdge))
         {
            // Copy `padToVisualEdge` to `padToVisualEdgeActual` if undefined.
            if (padToVisualEdgeActual === void 0) { padToVisualEdgeActual = scrollContainerActual.padToVisualEdge; }

            // Remove `padToVisualEdge from `scrollContainerActual` data.
            delete scrollContainerActual.padToVisualEdge;
         }
      }
      else if (typeof scrollContainer === 'boolean' && scrollContainer)
      {
         // Convert to object.
         scrollContainerActual = {};
      }

      if (padToVisualEdgeActual === void 0)
      {
         padToVisualEdgeActual = isObject(scrollContainerActual) ? { right: true } : false;
      }

      return { padToVisualEdgeActual, scrollContainerActual };
   }
}
