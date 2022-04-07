import { mat4, vec3 }   from '@typhonjs-fvtt/svelte/math';

/**
 * Provides the output data for {@link Transforms.getData}.
 */
export class TransformData
{
   /**
    * Stores the calculated bounding rectangle.
    *
    * @type {DOMRect}
    */
   #boundingRect = new DOMRect();

   /**
    * Stores additional constraint data used in {@link Transforms.getData} for offsets to top / left. Also provides
    * width / height data when the PositionData instance has width / height set to 'auto'.
    *
    * @type {Constraints}
    */
   #constraints = new Constraints();

   /**
    * Stores the individual transformed corner points of the window in screenspace clockwise from:
    * top left -> top right -> bottom right -> bottom left.
    *
    * @type {Float32Array[]}
    */
   #corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];

   /**
    * Stores the current gl-matrix mat4 data.
    *
    * @type {Float32Array}
    */
   #mat4 = mat4.create();

   /**
    * Stores the pre & post origin translations to apply to matrix transforms.
    *
    * @type {Float32Array[]}
    */
   #originTranslations = [mat4.create(), mat4.create()];

   /**
    * @returns {DOMRect} The bounding rectangle.
    */
   get boundingRect() { return this.#boundingRect; }

   /**
    * @returns {Constraints} Additional transform constraints.
    */
   get constraints() { return this.#constraints; }

   /**
    * @returns {Float32Array[]} The transformed corner points as vec3 in screen space.
    */
   get corners() { return this.#corners; }

   /**
    * @returns {string} Returns the CSS style string for the transform matrix.
    */
   get css() { return `matrix3d(${this.mat4.join(',')})`; }

   /**
    * @returns {Float32Array} The transform matrix.
    */
   get mat4() { return this.#mat4; }

   /**
    * @returns {Float32Array[]} The pre / post translation matrices for origin translation.
    */
   get originTranslations() { return this.#originTranslations; }

   /**
    * Convenience function to set all constraints.
    *
    * @param {number}   width - Width value to use when `position.width` is 'auto'.
    *
    * @param {number}   height - Height value to use when `position.height` is 'auto'.
    *
    * @param {number}   offsetTop - Offset / margin top value to offset transform calculation.
    *
    * @param {number}   offsetLeft - Offset / margin left value to offset transform calculation.
    *
    * @returns {TransformData} This TransformData instance.
    */
   setConstraints(width, height, offsetTop, offsetLeft)
   {
      this.#constraints.set(width, height, offsetTop, offsetLeft);
      return this;
   }
}

/**
 * Encapsulates the constraint data providing error checking.
 */
class Constraints
{
   /**
    * @type {number}
    */
   #height = 0;

   /**
    * @type {number}
    */
   #offsetLeft = 0;

   /**
    * @type {number}
    */
   #offsetTop = 0;

   /**
    * @type {number}
    */
   #width = 0;

   /**
    * @returns {number} Height value to use when `position.height` is 'auto'.
    */
   get height() { return this.#height; }

   /**
    * @returns {number} Offset / margin left value to offset transform calculation.
    */
   get offsetLeft() { return this.#offsetLeft; }

   /**
    * @returns {number} Offset / margin top value to offset transform calculation.
    */
   get offsetTop() { return this.#offsetTop; }

   /**
    * @returns {number} Width value to use when `position.width` is 'auto'.
    */
   get width() { return this.#width; }

   /**
    * @param {number}   height - Height value to use when `position.height` is 'auto'.
    */
   set height(height)
   {
      if (!Number.isFinite(height)) { throw new TypeError(`'height' must be a finite number.`); }
      this.#height = height;
   }

   /**
    * @param {number}   offsetLeft - Offset / margin left value to offset transform calculation.
    */
   set offsetLeft(offsetLeft)
   {
      if (!Number.isFinite(offsetLeft)) { throw new TypeError(`'offsetLeft' must be a finite number.`); }
      this.#offsetLeft = offsetLeft;
   }

   /**
    * @param {number} offsetTop - Offset / margin top value to offset transform calculation.
    */
   set offsetTop(offsetTop)
   {
      if (!Number.isFinite(offsetTop)) { throw new TypeError(`'offsetTop' must be a finite number.`); }
      this.#offsetTop = offsetTop;
   }

   /**
    * @param {number} width - Width value to use when `position.width` is 'auto'.
    */
   set width(width)
   {
      if (!Number.isFinite(width)) { throw new TypeError(`'width' must be a finite number.`); }
      this.#width = width;
   }

   /**
    * Convenience function to reset all constraints.
    */
   reset()
   {
      this.#height = this.#offsetLeft = this.#offsetTop = this.#width = 0;
   }

   /**
    * Convenience function to set all constraints.
    *
    * @param {number}   width - Width value to use when `position.width` is 'auto'.
    *
    * @param {number}   height - Height value to use when `position.height` is 'auto'.
    *
    * @param {number}   offsetTop - Offset / margin top value to offset transform calculation.
    *
    * @param {number}   offsetLeft - Offset / margin left value to offset transform calculation.
    *
    * @returns {Constraints} This constraints instance.
    */
   set(width, height, offsetTop, offsetLeft)
   {
      if (!Number.isFinite(height)) { throw new TypeError(`'height' must be a finite number.`); }
      if (!Number.isFinite(offsetLeft)) { throw new TypeError(`'offsetLeft' must be a finite number.`); }
      if (!Number.isFinite(offsetTop)) { throw new TypeError(`'offsetTop' must be a finite number.`); }
      if (!Number.isFinite(width)) { throw new TypeError(`'width' must be a finite number.`); }

      this.#height = height;
      this.#offsetLeft = offsetLeft;
      this.#offsetTop = offsetTop;
      this.#width = width;

      return this;
   }
}
