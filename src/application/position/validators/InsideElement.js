import { TransformData } from '../TransformData.js';

const s_TRANSFORM_DATA = new TransformData();

export class InsideElement
{
   /**
    * When true constrains the min / max width or height to element.
    *
    * @type {boolean}
    */
   #constrain;

   /**
    * @type {HTMLElement}
    */
   #element;

   /**
    * When true the validator is active.
    *
    * @type {boolean}
    */
   #enabled;

   constructor({ constrain = true, element, enabled = true } = {})
   {
      this.element = element;
      this.constrain = constrain;
      this.enabled = enabled;
   }

   get constrain() { return this.#constrain; }

   get element() { return this.#element; }

   get enabled() { return this.#enabled; }

   set constrain(constrain)
   {
      if (typeof constrain !== 'boolean')
      {
         throw new TypeError(`'constrain' is not a boolean.`);
      }

      this.#constrain = constrain;
   }

   set element(element)
   {
      if (element !== void 0 && !(element instanceof HTMLElement))
      {
         throw new TypeError(`'element' is not a HTMLElement or undefined.`);
      }

      this.#element = element;
   }

   set enabled(enabled)
   {
      if (typeof enabled !== 'boolean')
      {
         throw new TypeError(`'enabled' is not a boolean.`);
      }

      this.#enabled = enabled;
   }

   /**
    * Provides a validator that respects transforms in positional data constraining the position to within the target
    * elements bounds.
    *
    * @param {ValidationData}   validationData - The associated validation data for position updates.
    *
    * @returns {PositionData} Potentially adjusted position data.
    */
   validator(validationData)
   {
      // Early out if local enabled state is false.
      if (!this.#enabled) { return validationData.position; }

      const { position, minWidth, marginTop, marginLeft, maxWidth, minHeight, maxHeight, width, height, transforms } =
       validationData;

      const element = this.#element;

      if (!element) { return position; }

      const elWidth = element.offsetWidth;
      const elHeight = element.offsetHeight;

      // Ensure min / max width constraints when position width is 'auto'.
      if (position.width !== 'auto')
      {
         const maxW = maxWidth ?? this.#constrain ? elWidth : Number.MAX_SAFE_INTEGER;
         position.width = Math.clamped(width, minWidth, maxW);
      }

      // Ensure min / max height constraints when position height is not 'auto'.
      if (position.height !== 'auto')
      {
         const maxH = maxHeight ?? this.#constrain ? elHeight : Number.MAX_SAFE_INTEGER;
         position.height = Math.clamped(height, minHeight, maxH);
      }

      // Get transform data. First set constraints including any margin top / left as offsets and width / height. Used
      // when position width / height is 'auto'.
      const data = transforms.getData(position, s_TRANSFORM_DATA, validationData);

      // Check the bounding rectangle against browser height / width. Adjust position based on how far the overlap of the
      // bounding rect is outside the browser window. The order below matters as the constraints are top / left oriented,
      // so perform those checks last. Also adjust the bounding rectangle as position changes are made.

      if (data.boundingRect.bottom + marginTop > elHeight)
      {
         const adjust = elHeight - data.boundingRect.bottom - marginTop;
         position.top += adjust;
         data.boundingRect.y += adjust;
      }

      if (data.boundingRect.right + marginLeft > elWidth)
      {
         const adjust = elWidth - data.boundingRect.right - marginLeft;
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
}
