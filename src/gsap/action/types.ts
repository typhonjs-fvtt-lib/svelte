import type {
   Readable,
   Writable }                    from 'svelte/store';

import type { EasingFunction }   from 'svelte/transition';

import type {
   TJSPosition,
   TJSPositionTypes }            from '#runtime/svelte/store/position';

/**
 * Defines the types for the {@link draggableGsap} action.
 */
namespace Action {
   /**
    * Defines the options for the {@link draggableGsap} action.
    */
   export type DraggableGsapOptions = {
      /**
       * A position or positionable instance.
       */
      position: TJSPosition | TJSPositionTypes.Positionable;

      /**
       * A boolean value; controlling the `enabled` state.
       */
      active?: boolean;

      /**
       * MouseEvent button that activates dragging; default: 0
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
       */
      button?: number;

      /**
       *  When defined any event targets that have a class in this list are allowed.
       */
      hasTargetClassList?: Iterable<string>;

      /**
       * When defined any event targets that have a class in this list are ignored.
       */
      ignoreTargetClassList?: Iterable<string>;

      /**
       * When true inertia plugin options are enabled.
       */
      inertia: boolean;

      /**
       * Inertia plugin options.
       */
      inertiaOptions: GsapInertiaOptions;

      /**
       *  A writable store that tracks "dragging" state.
       */
      storeDragging?: Writable<boolean>;

      /**
       * When true tweening is enabled; default: false
       */
      tween?: boolean;

      /**
       * Quick tween options.
       */
      tweenOptions?: GsapTweenOptions;
   }

   /**
    * Provides an interface of the {@link draggableGsap} action options support / Readable store to make updating /
    * setting `draggableGsap` options much easier. When subscribing to the options instance returned by
    * {@link draggableGsap.options} the Subscriber handler receives the entire instance.
    */
   export interface DraggableGsapOptionsStore extends Readable<DraggableGsapOptionsStore>
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

   /**
    * Defines Gsap tween options.
    */
   export type GsapTweenOptions = {
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
    * Defines options for the inertia plugin.
    *
    * @see https://gsap.com/docs/v3/Plugins/InertiaPlugin/#config-object
    */
   export type GsapInertiaOptions = {
      /**
       * Specifies hard ending points that are snapped to in pixels.
       */
      end?: number | number[] | ((naturalLandingValue: number) => number),

      /**
       * Min and max time in seconds for inertia duration. Default: `min`: 0; `max`: 3
       */
      duration?: { min: number, max: number },

      /**
       * The amount of resistance per second (think of it like how much friction is applied); Default: 1000
       */
      resistance?: number,

      /**
       * Scales velocity tracking values generated from dragging; Default: 1
       */
      velocityScale?: number
   }
}

export { Action };
