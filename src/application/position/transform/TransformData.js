import { mat4, vec3 }   from '@typhonjs-fvtt/svelte/math';

/**
 * Provides the output data for {@link Transforms.getData}.
 */
export class TransformData
{
   constructor()
   {
      Object.seal(this);
   }

   /**
    * Stores the calculated bounding rectangle.
    *
    * @type {DOMRect}
    */
   #boundingRect = new DOMRect();

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
}
