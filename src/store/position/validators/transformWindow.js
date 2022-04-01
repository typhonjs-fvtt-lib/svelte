/**
 * @param {PositionData}   position - The complete position with top, left, width, height keys.
 *
 * @param {Application}    parent - Parent application.
 *
 * @returns {PositionData} Adjusted position data.
 */
export function transformWindow({ position, el, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width,
 height, transforms })
{
   if (!s_INIT_ALREADY) { s_INIT(); }

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


   // TODO REMOVE: FOR TESTING
   position.top += marginTop;
   position.left += marginLeft;
   const rect = transforms.getBoundingBox(position, s_RECT);
   position.top -= marginTop;
   position.left -= marginLeft;

   s_OVERLAY.style.top = `${rect.top}px`;
   s_OVERLAY.style.left = `${rect.left}px`;
   s_OVERLAY.style.width = `${rect.width}px`;
   s_OVERLAY.style.height = `${rect.height}px`;

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
