import { isWritableStore } from '@typhonjs-fvtt/svelte/store';
import { styleParsePixels } from '@typhonjs-fvtt/svelte/util';

const s_MAP = new Map();

export class ResizeObserverManager
{
   static add(el, target)
   {
      const updateType = s_GET_UPDATE_TYPE(target);

      if (updateType === 0)
      {
         throw new Error(`'target' does not match supported ResizeObserverManager update mechanisms.`);
      }

      const computed = globalThis.getComputedStyle(el);

      const data = {
         updateType,
         target,
         styles: {
            borderBottom: styleParsePixels(el.style.borderBottom) ?? styleParsePixels(computed.borderBottom) ?? 0,
            borderLeft: styleParsePixels(el.style.borderLeft) ?? styleParsePixels(computed.borderLeft) ?? 0,
            borderRight: styleParsePixels(el.style.borderRight) ?? styleParsePixels(computed.borderRight) ?? 0,
            borderTop: styleParsePixels(el.style.borderTop) ?? styleParsePixels(computed.borderTop) ?? 0,
            paddingBottom: styleParsePixels(el.style.paddingBottom) ?? styleParsePixels(computed.paddingBottom) ?? 0,
            paddingLeft: styleParsePixels(el.style.paddingLeft) ?? styleParsePixels(computed.paddingLeft) ?? 0,
            paddingRight: styleParsePixels(el.style.paddingRight) ?? styleParsePixels(computed.paddingRight) ?? 0,
            paddingTop: styleParsePixels(el.style.paddingTop) ?? styleParsePixels(computed.paddingTop) ?? 0
         }
      };

      const styles = data.styles;

      styles.additionalWidth = styles.borderLeft + styles.borderRight + styles.paddingLeft + styles.paddingRight;
      styles.additionalHeight = styles.borderTop + styles.borderBottom + styles.paddingTop + styles.paddingBottom;

      if (s_MAP.has(el))
      {
         const targets = s_MAP.get(el);
         targets.push(data);
      }
      else
      {
         s_MAP.set(el, [data]);
      }

      s_RESIZE_OBSERVER.observe(el);

      return true;
   }

   /**
    * Removes all targets from monitoring when just an element is provided otherwise removes a specific target
    * from the monitoring map. If no more targets remain then the element is removed from monitoring.
    *
    * @param {HTMLElement}       el -
    *
    * @param {object|Function}   [target] -
    */
   static remove(el, target = void 0)
   {
      if (target === void 0)
      {
         s_MAP.delete(el);
         s_RESIZE_OBSERVER.unobserve(el);
      }
      else
      {
         const targets = s_MAP.get(el);
         if (Array.isArray(targets))
         {
            const index = targets.findIndex((entry) => entry.target === target);
            if (index >= 0) { targets.splice(index, 1); }

            // Remove element entry.
            if (targets.length === 0)
            {
               s_MAP.delete(el);
               s_RESIZE_OBSERVER.unobserve(el);
            }
         }
      }

      // console.log(`! ResizeObserverManager - remove - s_MAP.size: `, s_MAP.size);
   }
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
   resizeObserved: 3,
   setContentBounds: 4,
   setDimension: 5,
   storeObject: 6,
   storesObject: 7
};

const s_RESIZE_OBSERVER = new ResizeObserver((entries) =>
{
   for (const entry of entries)
   {
      const targets = s_MAP.get(entry?.target);

      if (Array.isArray(targets))
      {
         const contentWidth = entry.contentRect.width;
         const contentHeight = entry.contentRect.height;

         for (const data of targets)
         {
            const styles = data.styles;
            const offsetWidth = contentWidth + styles.additionalWidth;
            const offsetHeight = contentHeight + styles.additionalHeight;

            switch (data.updateType)
            {
               case s_UPDATE_TYPES.attribute:
                  data.target.contentWidth = contentWidth;
                  data.target.contentHeight = contentHeight;
                  data.target.offsetWidth = offsetWidth;
                  data.target.offsetHeight = offsetHeight;
                  break;

               case s_UPDATE_TYPES.function:
                  data.target?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
                  break;

               case s_UPDATE_TYPES.resizeObserved:
                  data.target.resizeObserved?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
                  break;

               case s_UPDATE_TYPES.setContentBounds:
                  data.target.setContentBounds?.(contentWidth, contentHeight);
                  break;

               case s_UPDATE_TYPES.setDimension:
                  data.target.setDimension?.(offsetWidth, offsetHeight);
                  break;

               case s_UPDATE_TYPES.storeObject:
                  data.target.resizeObserved.update((object) =>
                  {
                     object.contentHeight = contentHeight;
                     object.contentWidth = contentWidth;
                     object.offsetHeight = offsetHeight;
                     object.offsetWidth = offsetWidth;

                     return object;
                  });
                  break;

               case s_UPDATE_TYPES.storesObject:
                  data.target.stores.resizeObserved.update((object) =>
                  {
                     object.contentHeight = contentHeight;
                     object.contentWidth = contentWidth;
                     object.offsetHeight = offsetHeight;
                     object.offsetWidth = offsetWidth;

                     return object;
                  });
                  break;
            }
         }
      }
   }
});

/**
 * Determines the shape of the target instance regarding valid update mechanisms to set width & height changes.
 *
 * @param {*}  target - The target instance.
 *
 * @returns {number} Update type value.
 */
function s_GET_UPDATE_TYPE(target)
{
   if (target?.resizeObserved instanceof Function) { return s_UPDATE_TYPES.resizeObserved; }
   if (target?.setDimension instanceof Function) { return s_UPDATE_TYPES.setDimension; }
   if (target?.setContentBounds instanceof Function) { return s_UPDATE_TYPES.setContentBounds; }

   const targetType = typeof target;

   // Does the target have resizeObserved writable store?
   if ((targetType === 'object' || targetType === 'function'))
   {
      if (isWritableStore(target.resizeObserved))
      {
         return s_UPDATE_TYPES.storeObject;
      }

      // Now check for a child stores object which is a common TRL pattern for exposing stores.
      const stores = target?.stores;
      if (typeof stores === 'object' || typeof stores === 'function')
      {
         if (isWritableStore(stores.resizeObserved))
         {
            return s_UPDATE_TYPES.storesObject;
         }
      }
   }

   if (targetType === 'object') { return s_UPDATE_TYPES.attribute; }

   if (targetType === 'function') { return s_UPDATE_TYPES.function; }

   return s_UPDATE_TYPES.none;
}
