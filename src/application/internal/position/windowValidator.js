import { styleParsePixels }   from '../styleParsePixels.js';

/**
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
export function windowValidator(position, parent)
{
   const el = parent.elementTarget;

   const styles = globalThis.getComputedStyle(el);

   let height, width;

   if (position.width !== 'auto')
   {
      const minW = styleParsePixels(styles.minWidth) || MIN_WINDOW_WIDTH;
      const maxW = styleParsePixels(styles.maxWidth) || el.style.maxWidth || globalThis.innerWidth;

      position.width = width = Math.clamped(position.width, minW, maxW);

      if ((width + position.left) > globalThis.innerWidth) { position.left = globalThis.innerWidth - width; }
   }
   else
   {
      width = el.offsetWidth;
   }

   if (position.height !== 'auto')
   {
      const minH = styleParsePixels(styles.minHeight) || MIN_WINDOW_HEIGHT;
      const maxH = styleParsePixels(styles.maxHeight) || el.style.maxHeight || globalThis.innerHeight;
      position.height = height = Math.clamped(position.height, minH, maxH);

      if ((height + position.top) > globalThis.innerHeight + 1) { position.top = globalThis.innerHeight - height; }
   }
   else
   {
      height = el.offsetHeight;
   }

   const maxL = Math.max(globalThis.innerWidth - width, 0);
   position.left = Math.round(Math.clamped(position.left, 0, maxL));

   const maxT = Math.max(globalThis.innerHeight - height, 0);
   position.top = Math.round(Math.clamped(position.top, 0, maxT));

   return position;
}
