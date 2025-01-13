import { Mat4, Vec3 } from '#runtime/math/gl-matrix';

/**
 * Handles the projection of app resizing from screen to local space of the app transform for accurate resizing.
 */
export class ResizeHandleTransform
{
   /**
    * Stores inverted app transform matrix.
    */
   static #invMat = new Mat4();

   /**
    * Stores converted world delta width & height change.
    */
   static #pDeltaLocal = new Vec3();

   /**
    * Stores point down in local space.
    */
   static #pLocalDown = new Vec3();

   /**
    * Stores point drag in local space.
    */
   static #pLocalDrag = new Vec3();

   /**
    * Stores point down in world space.
    */
   static #pScreenDown = new Vec3();

   /**
    * Stores point drag in world space.
    */
   static #pScreenDrag = new Vec3();

   /**
    * Compute the delta width and height in local space given the app transform matrix and initial pointer down and
    * drag screen coordinates.
    *
    * @param {Mat4} transformMat - App transform matrix.
    *
    * @param {number} pScreenDownX - Pointer down X position in screen coords.
    *
    * @param {number} pScreenDownY - Pointer down Y position in screen coords.
    *
    * @param {number} pScreenDragX - Current pointer drag X position in screen coords.
    *
    * @param {number} pScreenDragY - Current pointer drag Y position in screen coords.
    *
    * @returns {Vec3} Output vector for width & height changes (x = deltaWidth, y = deltaHeight).
    */
   static computeDelta(transformMat, pScreenDownX, pScreenDownY, pScreenDragX, pScreenDragY)
   {
      // Invert the transform to go from SCREEN -> LOCAL.
      Mat4.invert(this.#invMat, transformMat);

      // Store screen down and drag coordinates in temp vectors.
      this.#pScreenDown[0] = pScreenDownX;
      this.#pScreenDown[1] = pScreenDownY;

      this.#pScreenDrag[0] = pScreenDragX;
      this.#pScreenDrag[1] = pScreenDragY;

      // Transform both points to local space.
      Vec3.transformMat4(this.#pLocalDown, this.#pScreenDown, this.#invMat);
      Vec3.transformMat4(this.#pLocalDrag, this.#pScreenDrag, this.#invMat);

      // Compute local delta.
      this.#pDeltaLocal[0] = this.#pLocalDrag[0] - this.#pLocalDown[0];
      this.#pDeltaLocal[1] = this.#pLocalDrag[1] - this.#pLocalDown[1];

      return this.#pDeltaLocal;
   }
}
