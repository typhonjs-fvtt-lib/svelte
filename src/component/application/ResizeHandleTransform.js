import { Mat4, Vec3 } from '#runtime/math/gl-matrix';

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
   static #pWorldDown = new Vec3();

   /**
    * Stores point drag in world space.
    */
   static #pWorldDrag = new Vec3();

   /**
    * Compute the deltaWidth, deltaHeight in local space given the app transform matrix and initial pointer down and
    * drag world coordinates.
    *
    * @param {Mat4} transformMat - App transform matrix.
    *
    * @param {number} pWorldDownX - Pointer down X position in world coords.
    *
    * @param {number} pWorldDownY - Pointer down Y position in world coords.
    *
    * @param {number} pDragWorldX - Current pointer drag X position in world coords.
    *
    * @param {number} pDragWorldY - Current pointer drag Y position in world coords.
    *
    * @returns {Vec3} Output vector for width & height changes (x = deltaWidth, y = deltaHeight).
    */
   static computeDelta(transformMat, pWorldDownX, pWorldDownY, pDragWorldX, pDragWorldY)
   {
      // Invert the transform to go from WORLD -> LOCAL.
      Mat4.invert(this.#invMat, transformMat);

      // Store world down and drag coordinates in temp vectors.
      this.#pWorldDown[0] = pWorldDownX;
      this.#pWorldDown[1] = pWorldDownY;

      this.#pWorldDrag[0] = pDragWorldX;
      this.#pWorldDrag[1] = pDragWorldY;

      // Transform both points to local space.
      Vec3.transformMat4(this.#pLocalDown, this.#pWorldDown, this.#invMat);
      Vec3.transformMat4(this.#pLocalDrag, this.#pWorldDrag, this.#invMat);

      // Compute local delta.
      this.#pDeltaLocal[0] = this.#pLocalDrag[0] - this.#pLocalDown[0];
      this.#pDeltaLocal[1] = this.#pLocalDrag[1] - this.#pLocalDown[1];

      return this.#pDeltaLocal;
   }
}
