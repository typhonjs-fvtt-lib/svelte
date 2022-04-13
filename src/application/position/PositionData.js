import * as constants   from './constants.js';

/**
 * Defines stored positional data.
 */
export class PositionData
{
   constructor({ height = null, left = null, maxHeight = null, maxWidth = null, minHeight = null, minWidth = null,
    rotateX = null, rotateY = null, rotateZ = null, scale = null, translateX = null, translateY = null,
     translateZ = null, top = null, transformOrigin = constants.transformOriginDefault, width = null,
      zIndex = null } = {})
   {
      /**
       * @type {number|'auto'|null}
       */
      this.height = height;

      /**
       * @type {number|null}
       */
      this.left = left;

      /**
       * @type {number|null}
       */
      this.maxHeight = maxHeight;

      /**
       * @type {number|null}
       */
      this.maxWidth = maxWidth;

      /**
       * @type {number|null}
       */
      this.minHeight = minHeight;

      /**
       * @type {number|null}
       */
      this.minWidth = minWidth;

      /**
       * @type {number|null}
       */
      this.rotateX = rotateX;

      /**
       * @type {number|null}
       */
      this.rotateY = rotateY;

      /**
       * @type {number|null}
       */
      this.rotateZ = rotateZ;

      /**
       * @type {number|null}
       */
      this.scale = scale;

      /**
       * @type {number|null}
       */
      this.top = top;

      /**
       * @type {string}
       */
      this.transformOrigin = transformOrigin;

      /**
       * @type {number|null}
       */
      this.translateX = translateX;

      /**
       * @type {number|null}
       */
      this.translateY = translateY;

      /**
       * @type {number|null}
       */
      this.translateZ = translateZ;

      /**
       * @type {number|'auto'|null}
       */
      this.width = width;

      /**
       * @type {number|null}
       */
      this.zIndex = zIndex;

      Object.seal(this);
   }

   /**
    * Copies data stored in this instance to the given instance.
    *
    * @param {PositionData}   data - Copy to this instance.
    *
    * @returns {PositionData} Passed in PositionData instance.
    */
   copy(data)
   {
      data.height = this.height;
      data.left = this.left;
      data.maxHeight = this.maxHeight;
      data.maxWidth = this.maxWidth;
      data.minHeight = this.minHeight;
      data.minWidth = this.minWidth;
      data.rotateX = this.rotateX;
      data.rotateY = this.rotateY;
      data.rotateZ = this.rotateZ;
      data.scale = this.scale;
      data.top = this.top;
      data.transformOrigin = this.transformOrigin;
      data.translateX = this.translateX;
      data.translateY = this.translateY;
      data.translateZ = this.translateZ;
      data.width = this.width;
      data.zIndex = this.zIndex;

      return data;
   }
}
