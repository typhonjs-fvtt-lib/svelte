import * as constants   from './constants.js';

export class PositionData
{
   constructor({ height = null, left = null, maxHeight = null, maxWidth = null, minHeight = null, minWidth = null,
    rotateX = null, rotateY = null, rotateZ = null, scale = null, top = null,
     transformOrigin = constants.transformOriginDefault, width = null, zIndex = null } = {})
   {
      this.height = height;
      this.left = left;
      this.maxHeight = maxHeight;
      this.maxWidth = maxWidth;
      this.minHeight = minHeight;
      this.minWidth = minWidth;
      this.rotateX = rotateX;
      this.rotateY = rotateY;
      this.rotateZ = rotateZ;
      this.scale = scale;
      this.top = top;
      this.transformOrigin = transformOrigin;
      this.width = width;
      this.zIndex = zIndex;

      Object.seal(this);
   }
}
