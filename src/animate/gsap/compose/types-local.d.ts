import type { TJSPosition } from '#runtime/svelte/store/position';

/**
 * Stores and tracks any associated `TJSPosition` instance utilized by {@link GsapCompose}.
 */
export type TJSPositionInfo = {
   position: TJSPosition[];

   positionData: Partial<TJSPosition.API.Data.TJSPositionData>[];

   /**
    * Contains the full data object when a list of object w/ position is used.
    */
   data: object[];

   elements: HTMLElement[];

   gsapData: Array<object[]>;
};
