import type {
   TJSPosition,
   TJSPositionTypes,
   TJSPositionDataExtended } from '#runtime/svelte/store/position';

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
    TJSPositionTypes.Positionable |
    Iterable<TJSPositionTypes.Positionable> |
    Array<HTMLElement | object>;

   // Typedefs from GsapPosition -------------------------------------------------------------------------------------

   /**
    * Stores and tracks any associated `TJSPosition` instance utilized by {@link GsapCompose}.
    */
   export type TJSPositionInfo = {
      position: TJSPosition[];

      positionData: TJSPositionDataExtended[];

      /**
       * Contains the full data object when a list of object w/ position is used.
       */
      data: object[];

      elements: HTMLElement[];

      gsapData: Array<object[]>;
   };
}

export { Compose };
