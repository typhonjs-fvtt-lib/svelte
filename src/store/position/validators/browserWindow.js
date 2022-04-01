/**
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
export function browserWindow({ position, el, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width,
 height })
{
   if (position.width !== 'auto')
   {
      const minW = minWidth || MIN_WINDOW_WIDTH;
      const maxW = maxWidth || el.style.maxWidth || globalThis.innerWidth;
      position.width = width = Math.clamped(position.width, minW, maxW);

      if ((width + position.left) > globalThis.innerWidth) { position.left = globalThis.innerWidth - width; }
   }

   if (position.height !== 'auto')
   {
      const minH = minHeight || MIN_WINDOW_HEIGHT;
      const maxH = maxHeight || el.style.maxHeight || globalThis.innerHeight;
      position.height = height = Math.clamped(position.height, minH, maxH);

      if ((height + position.top) > globalThis.innerHeight) { position.top = globalThis.innerHeight - height; }
   }

   const maxL = Math.max(globalThis.innerWidth - width - marginLeft, 0);
   position.left = Math.round(Math.clamped(position.left, 0, maxL));

   const maxT = Math.max(globalThis.innerHeight - height - marginTop, 0);
   position.top = Math.round(Math.clamped(position.top, 0, maxT));

   return position;
}
