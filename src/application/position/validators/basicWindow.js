/**
 * Provides basic browser window constraints when position data contains no transforms. This is a fast validator.
 *
 * @param {ValidationData}   validationData - The associated validation data for position updates.
 *
 * @returns {PositionData} Potentially adjusted position data.
 */
export function basicWindow(validationData)
{
   const { position, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight } = validationData;
   let { width, height } = validationData;

   if (position.width !== 'auto')
   {
      const maxW = maxWidth || globalThis.innerWidth;
      position.width = width = Math.clamped(position.width, minWidth, maxW);

      if ((width + position.left + marginLeft) > globalThis.innerWidth)
      {
         position.left = globalThis.innerWidth - width - marginLeft;
      }
   }

   if (position.height !== 'auto')
   {
      const maxH = maxHeight || globalThis.innerHeight;
      position.height = height = Math.clamped(position.height, minHeight, maxH);

      if ((height + position.top + marginTop) > globalThis.innerHeight)
      {
         position.top = globalThis.innerHeight - height - marginTop;
      }
   }

   const maxL = Math.max(globalThis.innerWidth - width - marginLeft, 0);
   position.left = Math.round(Math.clamped(position.left, 0, maxL));

   const maxT = Math.max(globalThis.innerHeight - height - marginTop, 0);
   position.top = Math.round(Math.clamped(position.top, 0, maxT));

   return position;
}
