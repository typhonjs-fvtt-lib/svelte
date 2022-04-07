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
    * @type {Constraints}
    */
   #constraints = new Constraints();

   /**
    * Stores the individual transformed corner points of the window in screenspace clockwise from:
    * top left -> top right -> bottom right -> bottom left.
    *
    * @type {vec3[]}
    */
   #corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];

   /**
    * Stores the current gl-matrix mat4 data.
    *
    * @type {mat4}
    */
   #mat4 = mat4.create();

   /**
    * Stores the pre & post origin translations to apply to matrix transforms.
    *
    * @type {mat4[]}
    */
   #originTranslations = [mat4.create(), mat4.create()];

   get boundingRect() { return this.#boundingRect; }
   get constraints() { return this.#constraints; }
   get corners() { return this.#corners; }
   get mat4() { return this.#mat4; }
   get originTranslations() { return this.#originTranslations; }

   // Returns the CSS matrix3d string for the stored mat4 / matrix.
   get css() { return `matrix3d(${this.mat4.join(',')})`; }

   setConstraints(width, height, offsetTop, offsetLeft)
   {
      this.#constraints.set(width, height, offsetTop, offsetLeft);
      return this;
   }
}

class Constraints
{
   #height = 0;
   #offsetLeft = 0;
   #offsetTop = 0;
   #width = 0;

   get height() { return this.#height; }
   get offsetLeft() { return this.#offsetLeft; }
   get offsetTop() { return this.#offsetTop; }
   get width() { return this.#width; }

   set height(height)
   {
      if (!Number.isFinite(height)) { throw new TypeError(`'height' must be a finite number.`); }
      this.#height = height;
   }

   set offsetLeft(offsetLeft)
   {
      if (!Number.isFinite(offsetLeft)) { throw new TypeError(`'offsetLeft' must be a finite number.`); }
      this.#offsetLeft = offsetLeft;
   }

   set offsetTop(offsetTop)
   {
      if (!Number.isFinite(offsetTop)) { throw new TypeError(`'offsetTop' must be a finite number.`); }
      this.#offsetTop = offsetTop;
   }

   set width(width)
   {
      if (!Number.isFinite(width)) { throw new TypeError(`'width' must be a finite number.`); }
      this.#width = width;
   }

   reset()
   {
      height = offsetLeft = offsetTop = width = 0;
   }

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
