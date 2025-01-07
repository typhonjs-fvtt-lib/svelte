import type { TJSPosition } from '#runtime/svelte/store/position';

/**
 * Defines the types for {@link GsapCompose}.
 */
namespace Compose {
   export type GsapData = Iterable<object> | Function;

   export type GsapPositionOptions = {
      /**
       * An optional filter function to adjust position data in `onUpdate` callbacks. This is useful if you need to
       * transform any data from GSAP / plugins into data TJSPosition can utilize.
       */
      filter?: Function;

      /**
       * Provides an iterable list of property keys to assign to initial position data. This is useful when you are
       * using GSAP plugins that manipulate data automatically; Ex. MotionPathPlugin
       */
      initialProps?: Iterable<string>;
   };

   /**
    * Allowable targets for {@link GsapCompose}.
    */
   export type GsapTarget = string |
    object |
    TJSPosition |
    Iterable<TJSPosition> |
    TJSPosition.Positionable |
    Iterable<TJSPosition.Positionable> |
    Array<HTMLElement | object>;
}

export { Compose };
