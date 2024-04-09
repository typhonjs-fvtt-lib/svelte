import * as _runtime_svelte_store_position from '@typhonjs-svelte/runtime-base/svelte/store/position';
import * as svelte_transition from 'svelte/transition';
import { EasingFunction } from 'svelte/transition';
import * as svelte_action from 'svelte/action';
import * as svelte_store from 'svelte/store';
import { Readable } from 'svelte/store';

/**
 * The main GSAP object.
 *
 * @see https://greensock.com/docs/v3/GSAP
 */
declare let gsap: any;
/**
 * Provides an object of Gsap and Svelte easing functions that are preconfigured and registered with `gsap`.
 * {@link easingList} is an index of all the function names that are available in the `easingFunc` object. You may
 * use these functions with Gsap or Svelte.
 *
 * @type {{ [key: string]: import('svelte/transition').EasingFunction }}
 */
declare const easingFunc: {
  [key: string]: svelte_transition.EasingFunction;
};
/**
 * Provides a list of Gsap easing functions that are preconfigured and registered with `gsap`. `easingList`
 * is an index of all the function names that are available in the {@link easingFunc} object. Additionally, all Svelte
 * easing functions are loaded and prepended with `svelte-<function name>`.
 *
 * The easing list include:
 * - back.in(1)
 * - back.inOut(1)
 * - back.out(1)
 * - back.in(10)
 * - back.inOut(10)
 * - back.out(10)
 * - bounce.in
 * - bounce.inOut
 * - bounce.out
 * - circ.in
 * - circ.inOut
 * - circ.out
 * - elastic.in(1, 0.5)
 * - elastic.inOut(1, 0.5)
 * - elastic.out(1, 0.5)
 * - elastic.in(10, 5)
 * - elastic.inOut(10, 5)
 * - elastic.out(10, 5)
 * - expo.in
 * - expo.inOut
 * - expo.out
 * - linear // same as 'none'
 * - power1.in
 * - power1.inOut
 * - power1.out
 * - power2.in
 * - power2.inOut
 * - power2.out
 * - power3.in
 * - power3.inOut
 * - power3.out
 * - power4.in
 * - power4.inOut
 * - power4.out
 * - sine.in
 * - sine.inOut
 * - sine.out
 * - steps(10)
 * - steps(100)'
 * - svelte-backIn
 * - svelte-backInOut
 * - svelte-backOut
 * - svelte-bounceIn
 * - svelte-bounceInOut
 * - svelte-bounceOut
 * - svelte-circIn
 * - svelte-circInOut
 * - svelte-circOut
 * - svelte-cubicIn
 * - svelte-cubicInOut
 * - svelte-cubicOut
 * - svelte-elasticIn
 * - svelte-elasticInOut
 * - svelte-elasticOut
 * - svelte-expoIn
 * - svelte-expoInOut
 * - svelte-expoOut
 * - svelte-linear
 * - svelte-quadIn
 * - svelte-quadInOut
 * - svelte-quadOut
 * - svelte-quartIn
 * - svelte-quartInOut
 * - svelte-quartOut
 * - svelte-quintIn
 * - svelte-quintInOut
 * - svelte-quintOut
 * - svelte-sineIn
 * - svelte-sineInOut
 * - svelte-sineOut
 *
 * @type {string[]}
 */
declare const easingList: string[];

/**
 * Defines Gsap tween options.
 */
type GsapTweenOptions = {
  /**
   * Duration in seconds; default: 1
   */
  duration?: number;
  /**
   * Easing function; default: 'power3.out'
   */
  ease?: string | EasingFunction;
};
/**
 * Defines options for the inertia plugin / tween options.
 *
 * @see https://greensock.com/docs/v3/Plugins/InertiaPlugin
 */
type GsapInertiaOptions = {
  end?: Number | [] | Function;
  duration?: {
    min: number;
    max: number;
  };
  resistance?: number;
  velocityScale?: number;
};
/**
 * Provides an interface of the {@link draggableGsap} action options support / Readable store to make updating / setting
 * draggableGsap options much easier. When subscribing to the options instance returned by {@link draggableGsap.options}
 * the Subscriber handler receives the entire instance.
 */
interface IDraggableGsapOptions extends Readable<IDraggableGsapOptions> {
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
  set inertiaDuration(duration: { min: number; max: number });
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
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `to` or `quickTo` to invoke `position.set`
 * on a given {@link TJSPosition} instance provided. You may provide a
 * `easeOptions` object sent to the tween to modify the duration / easing. When the attached boolean store state
 * changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+` for `quickTo` support.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {import('#runtime/svelte/store/position').TJSPosition}   params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {number}            [params.button=0] - MouseEvent button;
 *        {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}.
 *
 * @param {import('svelte/store').Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging"
 *        state.
 *
 * @param {boolean}           [params.tween=false] - When true tweening is enabled.
 *
 * @param {boolean}           [params.inertia=false] - When true inertia easing is enabled.
 *
 * @param {import('./types').GsapTweenOptions}  [params.tweenOptions] - Gsap `to / `quickTo` tween vars object.
 *
 * @param {import('./types').GsapInertiaOptions}   [params.inertiaOptions] - Inertia Options.
 *
 * @param {Iterable<string>}  [params.hasTargetClassList] - When defined any event targets that has any class in this
 *                                                          list are allowed.
 *
 * @param {Iterable<string>}  [params.ignoreTargetClassList] - When defined any event targets that have a class in this
 *                                                             list are ignored.
 *
 * @returns {import('svelte/action').ActionReturn<Record<string, any>>} Lifecycle functions.
 */
declare function draggableGsap(
  node: HTMLElement,
  {
    position,
    active,
    button,
    storeDragging,
    tween,
    inertia,
    tweenOptions,
    inertiaOptions,
    hasTargetClassList,
    ignoreTargetClassList,
  }: {
    position: _runtime_svelte_store_position.TJSPosition;
    active?: boolean;
    button?: number;
    storeDragging?: svelte_store.Writable<boolean>;
    tween?: boolean;
    inertia?: boolean;
    tweenOptions?: GsapTweenOptions;
    inertiaOptions?: GsapInertiaOptions;
    hasTargetClassList?: Iterable<string>;
    ignoreTargetClassList?: Iterable<string>;
  },
): svelte_action.ActionReturn<Record<string, any>>;
declare namespace draggableGsap {
  /**
   * Define a function to get an IDraggableGsapOptions instance.
   *
   * @param {({
   *    tween?: boolean,
   *    tweenOptions?: import('./types').GsapTweenOptions,
   *    inertia?: boolean,
   *    inertiaOptions?: import('./types').GsapInertiaOptions
   * })} options - Initial options for IDraggableGsapOptions.
   *
   * @returns {import('./types').IDraggableGsapOptions} A new options instance.
   */
  function options(options: {
    tween?: boolean;
    tweenOptions?: GsapTweenOptions;
    inertia?: boolean;
    inertiaOptions?: GsapInertiaOptions;
  }): IDraggableGsapOptions;
}

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
declare class GsapCompose {
  /**
   * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   vars - GSAP vars object for `from`.
   *
   * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population for
   *        TJSPosition tweens.
   *
   * @returns {object} GSAP tween
   */
  static from(target: GsapTarget, vars: object, options?: GsapPositionOptions): object;
  /**
   * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   fromVars - GSAP fromVars object for `fromTo`
   *
   * @param {object}   toVars - GSAP toVars object for `fromTo`.
   *
   * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
   *
   * @returns {object} GSAP tween
   */
  static fromTo(target: GsapTarget, fromVars: object, toVars: object, options?: GsapPositionOptions): object;
  /**
   * Checks the `gsap` module instance for existence of a method and GsapCompose for the same method name. This
   * is helpful to determine which new features are available. Ex. `quickTo` is not available until GSAP `3.10+`.
   *
   * @param {string}   name - Name of method to check.
   *
   * @returns {boolean} Gsap and GsapCompose support the given method.
   */
  static hasMethod(name: string): boolean;
  /**
   * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {string}   key - Property of position to manipulate.
   *
   * @param {object}   vars - GSAP vars object for `quickTo`.
   *
   * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
   *
   * @returns {Function}  GSAP quickTo function.
   */
  static quickTo(target: GsapTarget, key: string, vars: object, options?: GsapPositionOptions): Function;
  /**
   * Defers to `gsap` module to register an easing function.
   *
   * @param {string}   name - Easing name.
   *
   * @param {Function} ease - An easing function.
   */
  static registerEase(name: string, ease: Function): void;
  /**
   * Defers to `gsap` module to register a plugin.
   *
   * @param {...Function} args - A list of plugins.
   */
  static registerPlugin(...args: Function[]): void;
  /**
   * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object | import('../').GsapData}   [arg1] - Either an object defining timeline options or GsapData.
   *
   * @param {import('../').GsapData | import('../').GsapPositionOptions} [arg2] - When arg1 is defined as an object;
   *        arg2 defines GsapData.
   *
   * @param {import('../').GsapPositionOptions} [arg3] - Options for filtering and initial data population.
   *
   * @returns {object} GSAP timeline
   */
  static timeline(
    target: GsapTarget,
    arg1?: object | GsapData,
    arg2?: GsapData | GsapPositionOptions,
    arg3?: GsapPositionOptions,
  ): object;
  /**
   * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   vars - GSAP vars object for `to`.
   *
   * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
   *
   * @returns {object} GSAP tween
   */
  static to(target: GsapTarget, vars: object, options?: GsapPositionOptions): object;
}

/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 * @ignore
 */
declare function gsapLoadPlugin(name: string): Promise<any>;

type GsapData = Iterable<object> | Function;
type GsapPositionOptions = {
  /**
   * An optional filter function to adjust position data in `onUpdate` callbacks. This is
   * useful if you need to transform any data from GSAP / plugins into data TJSPosition can utilize.
   */
  filter?: Function;
  /**
   * Provides an iterable of property keys to assign to initial position
   * data. This is useful when you are using GSAP plugins that manipulate data automatically; Ex. MotionPathPlugin
   */
  initialProps?: Iterable<string>;
};
type GsapTarget =
  | string
  | object
  | _runtime_svelte_store_position.TJSPosition
  | Iterable<_runtime_svelte_store_position.TJSPosition>
  | Array<HTMLElement | object>;
/**
 * Stores and tracks any associated `TJSPosition` instance utilized by
 *          {@link GsapCompose }.
 */
type TJSPositionInfo = {
  /**
   * -
   */
  position: _runtime_svelte_store_position.TJSPosition[];
  /**
   * -
   */
  positionData: _runtime_svelte_store_position.TJSPositionDataExtended[];
  /**
   * Contains the full data object when a list of object w/ position is used.
   */
  data: object[];
  /**
   * -
   */
  elements: HTMLElement[];
  /**
   * -
   */
  gsapData: Array<object[]>;
};

export {
  GsapCompose,
  type GsapData,
  type GsapInertiaOptions,
  type GsapPositionOptions,
  type GsapTarget,
  type GsapTweenOptions,
  type IDraggableGsapOptions,
  type TJSPositionInfo,
  draggableGsap,
  easingFunc,
  easingList,
  gsap,
  gsapLoadPlugin,
};
