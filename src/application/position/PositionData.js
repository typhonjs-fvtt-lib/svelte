import * as constants   from './constants.js';

/**
 * Defines stored positional data.
 */
export class PositionData
{
   constructor({ height = null, left = null, maxHeight = null, maxWidth = null, minHeight = null, minWidth = null,
    rotateX = null, rotateY = null, rotateZ = null, scale = null, top = null,
     transformOrigin = constants.transformOriginDefault, width = null, zIndex = null } = {})
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
       * @type {number|'auto'|null}
       */
      this.width = width;

      /**
       * @type {number|null}
       */
      this.zIndex = zIndex;

      Object.seal(this);
   }
}
