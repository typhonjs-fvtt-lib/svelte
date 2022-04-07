import { TransformData } from '../TransformData.js';

const s_TRANSFORM_DATA = new TransformData();

/**
 * Provides a validator that respects transforms in positional data constraining the position to within the browser
 * window.
 *
 * @param {ValidationData}   validationData - The associated validation data for position updates.
 *
 * @returns {PositionData} Potentially adjusted position data.
 */
export function transformWindow(validationData)
{
   const { position, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width, height, transforms } =
    validationData;

   // Ensure min / max width constraints when position width is 'auto'.
   if (position.width !== 'auto')
   {
      const maxW = maxWidth || globalThis.innerWidth;
      position.width = Math.clamped(width, minWidth, maxW);
   }

   // Ensure min / max height constraints when position height is not 'auto'.
   if (position.height !== 'auto')
   {
      const maxH = maxHeight || globalThis.innerHeight;
      position.height = Math.clamped(height, minHeight, maxH);
   }

   // Get transform data. First set constraints including any margin top / left as offsets and width / height. Used
   // when position width / height is 'auto'.
   const data = transforms.getData(position, s_TRANSFORM_DATA.setConstraints(width, height, marginTop, marginLeft));

   // Check the bounding rectangle against browser height / width. Adjust position based on how far the overlap of the
   // bounding rect is outside the browser window. The order below matters as the constraints are top / left oriented,
   // so perform those checks last. Also adjust the bounding rectangle as position changes are made.

   if (data.boundingRect.bottom + marginTop > globalThis.innerHeight)
   {
      const adjust = globalThis.innerHeight - data.boundingRect.bottom - marginTop;
      position.top += adjust;
      data.boundingRect.y += adjust;
   }

   if (data.boundingRect.right + marginLeft > globalThis.innerWidth)
   {
      const adjust = globalThis.innerWidth - data.boundingRect.right - marginLeft;
      position.left += adjust;
      data.boundingRect.x += adjust;
   }

   if (data.boundingRect.top - marginTop < 0)
   {
      const adjust = Math.abs(data.boundingRect.top - marginTop);
      position.top += adjust;
      data.boundingRect.y += adjust;
   }

   if (data.boundingRect.left - marginLeft < 0)
   {
      position.left += Math.abs(data.boundingRect.left - marginLeft);
   }

   return position;
}
