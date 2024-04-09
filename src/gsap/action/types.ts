import type { Readable }         from 'svelte/store';
import type { EasingFunction }   from 'svelte/transition';

/**
 * Defines Gsap tween options.
 */
type GsapTweenOptions = {
   /**
    * Duration in seconds; default: 1
    */
   duration?: number,

   /**
    * Easing function; default: 'power3.out'
    */
   ease?: string | EasingFunction
}

/**
 * Defines options for the inertia plugin / tween options.
 *
 * @see https://greensock.com/docs/v3/Plugins/InertiaPlugin
 */
type GsapInertiaOptions = {
   end?: Number | [] | Function,
   duration?: { min: number, max: number },
   resistance?: number,
   velocityScale?: number
}

/**
 * Provides an interface of the {@link draggableGsap} action options support / Readable store to make updating / setting
 * draggableGsap options much easier. When subscribing to the options instance returned by {@link draggableGsap.options}
 * the Subscriber handler receives the entire instance.
 */
interface IDraggableGsapOptions extends Readable<IDraggableGsapOptions>
{
   /**
    * Tweening enabled state.
    */
   tween: boolean;

   /**
    * GSAP tween options for easing function and duration.
    */
   tweenOptions: GsapTweenOptions;

   /**
    * Inertia enabled state.
    */
   inertia: boolean;

   /**
    * Inertia options.
    */
   inertiaOptions: GsapInertiaOptions;

   /**
    * @returns {number} Get ease duration
    */
   get tweenDuration(): number;

   /**
    * @returns {string | EasingFunction} Get easing function value.
    */
   get tweenEase(): string | Function;

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
   set tweenDuration(duration: number);

   /**
    * @param {string | Function} value - Get easing function value.
    */
   set tweenEase(value: string | Function);

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
    * Resets all options data to initial values.
    */
   reset(): void;

   /**
    * Resets tween enabled state to initial value.
    */
   resetTween(): void;

   /**
    * Resets tween options to initial values.
    */
   resetTweenOptions(): void;

   /**
    * Resets inertia enabled state to initial value.
    */
   resetInertia(): void;

   /**
    * Resets inertia options to initial values.
    */
   resetInertiaOptions(): void;
}

export {
   GsapInertiaOptions,
   GsapTweenOptions,
   IDraggableGsapOptions
}
