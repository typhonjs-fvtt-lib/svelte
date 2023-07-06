import type {
   Subscriber,
   Unsubscriber } from 'svelte/store';

/**
 * Provides a store / object to make updating / setting draggableGsap options much easier.
 */
export interface IDraggableGsapOptions
{
   ease: boolean;

   easeOptions: { duration: number, ease: string };

   inertia: boolean;

   inertiaOptions: {
      end?: Number | [] | Function,
      duration: { min: number, max: number },
      resistance: number,
      velocityScale: number
   };

   /**
    * @returns {number} Get ease duration
    */
   get easeDuration(): number;

   /**
    * @returns {string | Function} Get easing function value.
    */
   get easeValue(): string | Function;

   /**
    * @returns {number} Get inertia duration max time (seconds)
    */
   get inertiaDurationMax(): number;

   /**
    * @returns {number} Get inertia duration min time (seconds)
    */
   get inertiaDurationMin(): number;

   /**
    * @returns {number |Array | Function} Get inertia end.
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   get inertiaEnd(): number | Function | any[];

   /**
    * @returns {number} Get inertia resistance (1000 is default).
    */
   get inertiaResistance(): number;

   /**
    * @returns {number} Get inertia velocity scale.
    */
   get inertiaVelocityScale(): number;

   /**
    * @param {number}   duration - Set ease duration.
    */
   set easeDuration(duration: number);

   /**
    * @param {string | Function} value - Get easing function value.
    */
   set easeValue(value: string | Function);

   /**
    * @param {{min: number, max: number}} duration - Set inertia duration min & max.
    */
   set inertiaDuration(duration: { min: number, max: number });

   /**
    * @param {number}   max - Set inertia duration max.
    */
   set inertiaDurationMax(max: number);

   /**
    * @param {number}   min - Set inertia duration min.
    */
   set inertiaDurationMin(min: number);

   /**
    * @param {number |Array | Function} end - Set inertia end.
    *
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   set inertiaEnd(end: number | Function | any[]);

   /**
    * @param {number}   resistance - Set inertia resistance. Default: 1000
    */
   set inertiaResistance(resistance: number);

   /**
    * @param {number}   velocityScale - Set inertia velocity scale.
    */
   set inertiaVelocityScale(velocityScale: number);

   /**
    * Resets all options data to default values.
    */
   reset(): void;

   /**
    * Resets easing options to default values.
    */
   resetEase(): void;

   /**
    * Resets inertia options to default values.
    */
   resetInertia(): void;

   /**
    * Store subscribe method.
    *
    * @param {Subscriber<IDraggableGsapOptions>} handler - Callback function that is invoked on update / changes.
    *        Receives the DraggableOptions object / instance.
    *
    * @returns {Unsubscriber} Unsubscribe function.
    */
   subscribe(handler: Subscriber<IDraggableGsapOptions>): Unsubscriber;
}
