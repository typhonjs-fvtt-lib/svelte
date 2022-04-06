import { BoundingData } from '../BoundingData.js';

const s_BOUNDING_DATA = new BoundingData();

/**
 *
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
export function transformWindow({ position, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width,
 height, transforms })
{
   if (!s_INIT_ALREADY) { s_INIT(); }

   if (position.width !== 'auto')
   {
      const maxW = maxWidth || globalThis.innerWidth;
      position.width = width = Math.clamped(position.width, minWidth, maxW);

      // if ((width + position.left) > globalThis.innerWidth) { position.left = globalThis.innerWidth - width; }
   }

   if (position.height !== 'auto')
   {
      const maxH = maxHeight || globalThis.innerHeight;
      position.height = height = Math.clamped(position.height, minHeight, maxH);

      // if ((height + position.top) > globalThis.innerHeight) { position.top = globalThis.innerHeight - height; }
   }

   // const maxL = Math.max(globalThis.innerWidth - width - marginLeft, 0);
   // position.left = Math.round(Math.clamped(position.left, 0, maxL));
   //
   // const maxT = Math.max(globalThis.innerHeight - height - marginTop, 0);
   // position.top = Math.round(Math.clamped(position.top, 0, maxT));

   // TODO REMOVE: FOR TESTING
   position.top += marginTop;
   position.left += marginLeft;
   const data = transforms.getBoundingData(position, s_BOUNDING_DATA);
   position.top -= marginTop;
   position.left -= marginLeft;

   s_OVERLAY.style.top = `${data.boundingRect.top}px`;
   s_OVERLAY.style.left = `${data.boundingRect.left}px`;
   s_OVERLAY.style.width = `${data.boundingRect.width}px`;
   s_OVERLAY.style.height = `${data.boundingRect.height}px`;

   if (data.boundingRect.left < 0)
   {
      position.left += Math.abs(data.boundingRect.left);
   }

// console.log(`! data.boundingRect.right: ${data.boundingRect.right}`)

   if (data.boundingRect.right > globalThis.innerWidth)
   {
      position.left += globalThis.innerWidth - data.boundingRect.right;
   }

   // if (rect.left < 0 || rect.right > globalThis.innerWidth || rect.top < 0 || rect.bottom > globalThis.innerHeight)
   // {
   //    return null;
   // }

   return position;
}

let s_INIT_ALREADY = false;
let s_OVERLAY;
const s_RECT = new DOMRect();

function s_INIT()
{
   s_INIT_ALREADY = true;

   // TODO REMOVE: FOR TESTING
   s_OVERLAY = document.createElement('div');
   s_OVERLAY.style.zIndex = '99999';
   s_OVERLAY.style.background = 'rgba(0, 0, 255, 0.3)';
   s_OVERLAY.style.width = '200px';
   s_OVERLAY.style.height = '200px';
   s_OVERLAY.style.top = '100px';
   s_OVERLAY.style.left = '100px';
   s_OVERLAY.style.position = 'absolute';
   s_OVERLAY.style.pointerEvents = 'none';

   document.body.append(s_OVERLAY);
}
