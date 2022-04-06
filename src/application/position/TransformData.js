import { mat4, vec3 }   from '@typhonjs-fvtt/svelte/math';

/**
 * Provides the output data for {@link Transforms.getData}.
 */
export class TransformData
{
   /** Instantiate TransformData */
   constructor()
   {
      /**
       * Stores the calculated bounding rectangle.
       *
       * @type {DOMRect}
       */
      this.boundingRect = new DOMRect();

      /**
       * Stores the current gl-matrix mat4 data.
       *
       * @type {mat4}
       */
      this.mat4 = mat4.create();

      /**
       * Stores the pre & post origin translations to apply to matrix transforms.
       *
       * @type {mat4[]}
       */
      this.originTranslations = [mat4.create(), mat4.create()];

      /**
       * Stores the individual points of the window clockwise from top left -> top right -> bottom right -> bottom left.
       *
       * @type {vec3[]}
       */
      this.points = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
   }

   // Returns the CSS matrix3d string for the stored mat4 / matrix.
   get css() { return `matrix3d(${this.mat4.join(',')})`; }
}
