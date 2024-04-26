import * as svelte_transition from 'svelte/transition';
import { EasingFunction } from 'svelte/transition';
import * as svelte_action from 'svelte/action';
import { Writable, Readable } from 'svelte/store';
import { TJSPosition, TJSPositionTypes } from '@typhonjs-svelte/runtime-base/svelte/store/position';

/**
 * Defines all the standard 1-dimensional Gsap easing function names.
 */
type GsapEasingFunctionName =
  | 'back.in(1)'
  | 'back.inOut(1)'
  | 'back.out(1)'
  | 'back.in(10)'
  | 'back.inOut(10)'
  | 'back.out(10)'
  | 'bounce.in'
  | 'bounce.inOut'
  | 'bounce.out'
  | 'circ.in'
  | 'circ.inOut'
  | 'circ.out'
  | 'elastic.in(1, 0.5)'
  | 'elastic.inOut(1, 0.5)'
  | 'elastic.out(1, 0.5)'
  | 'elastic.in(10, 5)'
  | 'elastic.inOut(10, 5)'
  | 'elastic.out(10, 5)'
  | 'expo.in'
  | 'expo.inOut'
  | 'expo.out'
  | 'linear'
  | 'power1.in'
  | 'power1.inOut'
  | 'power1.out'
  | 'power2.in'
  | 'power2.inOut'
  | 'power2.out'
  | 'power3.in'
  | 'power3.inOut'
  | 'power3.out'
  | 'power4.in'
  | 'power4.inOut'
  | 'power4.out'
  | 'sine.in'
  | 'sine.inOut'
  | 'sine.out'
  | 'steps(10)'
  | 'steps(100)'
  | 'svelte-backIn'
  | 'svelte-backInOut'
  | 'svelte-backOut'
  | 'svelte-bounceIn'
  | 'svelte-bounceInOut'
  | 'svelte-bounceOut'
  | 'svelte-circIn'
  | 'svelte-circInOut'
  | 'svelte-circOut'
  | 'svelte-cubicIn'
  | 'svelte-cubicInOut'
  | 'svelte-cubicOut'
  | 'svelte-elasticIn'
  | 'svelte-elasticInOut'
  | 'svelte-elasticOut'
  | 'svelte-expoIn'
  | 'svelte-expoInOut'
  | 'svelte-expoOut'
  | 'svelte-linear'
  | 'svelte-quadIn'
  | 'svelte-quadInOut'
  | 'svelte-quadOut'
  | 'svelte-quartIn'
  | 'svelte-quartInOut'
  | 'svelte-quartOut'
  | 'svelte-quintIn'
  | 'svelte-quintInOut'
  | 'svelte-quintOut'
  | 'svelte-sineIn'
  | 'svelte-sineInOut'
  | 'svelte-sineOut';

/**
 * Performs a lookup for standard Gsap easing functions by name. All Svelte easing functions are also available by
 * prepending `svelte-<EASE_NAME>`. For convenience if passing in a function it is returned verbatim.
 *
 * @param {import('./types').GsapEasingFunctionName | import('svelte/transition').EasingFunction} nameOrFunc - The name
 *        of a standard Svelte easing function or an existing supplied easing function.
 *
 * @param {object}   [options] - Optional parameters.
 *
 * @param {import('./types').GsapEasingFunctionName | false} [options.default='linear'] - The default easing function
 *        name to apply. When specified as `false` no default fallback easing function is selected.
 *
 * @returns {import('svelte/transition').EasingFunction} The requested easing function.
 */
declare function getGsapEasingFunc(
  nameOrFunc: GsapEasingFunctionName | svelte_transition.EasingFunction,
  options?: {
    default?: GsapEasingFunctionName | false;
  },
): svelte_transition.EasingFunction;
/**
 * The main GSAP object.
 *
 * @see https://greensock.com/docs/v3/GSAP
 */
declare let gsap: any;
/**
 * Provides an object of Gsap and Svelte easing functions that are preconfigured and registered with `gsap`.
 * {@link gsapEasingList} is an index of all the function names that are available in the `gsapEasingFunc` object. You may
 * use these functions with Gsap or Svelte.
 *
 * @type {Readonly<Record<import('types').GsapEasingFunctionName, import('svelte/transition').EasingFunction>>}
 */
declare const gsapEasingFunc: Readonly<Record<any, svelte_transition.EasingFunction>>;
/**
 * Provides a list of Gsap easing functions that are preconfigured and registered with `gsap`. `gsapEasingList`
 * is an index of all the function names that are available in the {@link gsapEasingFunc} object. Additionally, all
 * Svelte easing functions are loaded and prepended with `svelte-<function name>`.
 *
 * @type {ReadonlyArray<import('./types').GsapEasingFunctionName>}
 */
declare const gsapEasingList: ReadonlyArray<GsapEasingFunctionName>;

/**
 * Defines the types for the {@link draggableGsap} action.
 */
declare namespace Action {
  /**
   * Defines the options for the {@link draggableGsap} action.
   */
  type DraggableGsapOptions = {
    /**
     * A position or positionable instance.
     */
    position: TJSPosition | TJSPositionTypes.Positionable;
    /**
     * MouseEvent button that activates dragging; default: 0
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
     */
    button?: number;
    /**
     * A boolean value; controlling the `enabled` state.
     */
    enabled?: boolean;
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
  };
  /**
   * Provides an interface of the {@link draggableGsap} action options support / Readable store to make updating /
   * setting `draggableGsap` options much easier. When subscribing to the options instance returned by
   * {@link draggableGsap.options} the Subscriber handler receives the entire instance.
   */
  interface DraggableGsapOptionsStore extends Readable<DraggableGsapOptionsStore> {
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
   * Defines options for the inertia plugin.
   *
   * @see https://gsap.com/docs/v3/Plugins/InertiaPlugin/#config-object
   */
  type GsapInertiaOptions = {
    /**
     * Specifies hard ending points that are snapped to in pixels.
     */
    end?: number | number[] | ((naturalLandingValue: number) => number);
    /**
     * Min and max time in seconds for inertia duration. Default: `min`: 0; `max`: 3
     */
    duration?: {
      min: number;
      max: number;
    };
    /**
     * The amount of resistance per second (think of it like how much friction is applied); Default: 1000
     */
    resistance?: number;
    /**
     * Scales velocity tracking values generated from dragging; Default: 1
     */
    velocityScale?: number;
  };
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
 * @param {import('./types').Action.DraggableGsapOptions} options - Draggable Gsap options.
 *
 * @returns {import('svelte/action').Action<Partial<import('./types').Action.DraggableGsapOptions>>} Action
 *          lifecycle functions.
 */
declare function draggableGsap(
  node: HTMLElement,
  {
    position,
    enabled,
    button,
    storeDragging,
    tween,
    inertia,
    tweenOptions,
    inertiaOptions,
    hasTargetClassList,
    ignoreTargetClassList,
  }: Action.DraggableGsapOptions,
): svelte_action.Action<Partial<Action.DraggableGsapOptions>>;
declare namespace draggableGsap {
  /**
   * Define a function to get an DraggableGsapOptionsStore instance.
   *
   * @param {({
   *    tween?: boolean,
   *    tweenOptions?: import('./types').Action.GsapTweenOptions,
   *    inertia?: boolean,
   *    inertiaOptions?: import('./types').Action.GsapInertiaOptions
   * })} options - Initial options for DraggableGsapOptionsStore.
   *
   * @returns {import('./types').Action.DraggableGsapOptionsStore} A new options instance.
   */
  function options(options: {
    tween?: boolean;
    tweenOptions?: Action.GsapTweenOptions;
    inertia?: boolean;
    inertiaOptions?: Action.GsapInertiaOptions;
  }): Action.DraggableGsapOptionsStore;
}

/**
 * Defines the types for {@link GsapCompose}.
 */
declare namespace Compose {
  type GsapData = Iterable<object> | Function;
  type GsapPositionOptions = {
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
  type GsapTarget =
    | string
    | object
    | TJSPosition
    | Iterable<TJSPosition>
    | TJSPositionTypes.Positionable
    | Iterable<TJSPositionTypes.Positionable>
    | Array<HTMLElement | object>;
}

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
declare class GsapCompose {
  /**
   * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   vars - GSAP vars object for `from`.
   *
   * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
   *        population for TJSPosition tweens.
   *
   * @returns {object} GSAP tween
   */
  static from(target: Compose.GsapTarget, vars: object, options?: Compose.GsapPositionOptions): object;
  /**
   * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   fromVars - GSAP fromVars object for `fromTo`
   *
   * @param {object}   toVars - GSAP toVars object for `fromTo`.
   *
   * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
   *        population.
   *
   * @returns {object} GSAP tween
   */
  static fromTo(
    target: Compose.GsapTarget,
    fromVars: object,
    toVars: object,
    options?: Compose.GsapPositionOptions,
  ): object;
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
   * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {string}   key - Property of position to manipulate.
   *
   * @param {object}   vars - GSAP vars object for `quickTo`.
   *
   * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
   *        population.
   *
   * @returns {Function}  GSAP quickTo function.
   */
  static quickTo(
    target: Compose.GsapTarget,
    key: string,
    vars: object,
    options?: Compose.GsapPositionOptions,
  ): Function;
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
   * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object | import('./types').Compose.GsapData}   [arg1] - Either an object defining timeline options or
   *        GsapData.
   *
   * @param {object | import('./types').Compose.GsapData | import('./types').Compose.GsapPositionOptions} [arg2] -
   *        When arg1 is defined as an object / Function; arg2 defines GsapData or Gsap options.
   *
   * @param {import('./types').Compose.GsapPositionOptions} [arg3] - Options for filtering and initial data population.
   *
   * @returns {object} GSAP timeline
   */
  static timeline(
    target: Compose.GsapTarget,
    arg1?: object | Compose.GsapData,
    arg2?: object | Compose.GsapData | Compose.GsapPositionOptions,
    arg3?: Compose.GsapPositionOptions,
  ): object;
  /**
   * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
   *
   * @param {object}   vars - GSAP vars object for `to`.
   *
   * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
   *        population.
   *
   * @returns {object} GSAP tween
   */
  static to(target: Compose.GsapTarget, vars: object, options?: Compose.GsapPositionOptions): object;
}

/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 * @ignore
 */
declare function gsapLoadPlugin(name: string): Promise<any>;

export {
  Action,
  Compose,
  GsapCompose,
  type GsapEasingFunctionName,
  draggableGsap,
  getGsapEasingFunc,
  gsap,
  gsapEasingFunc,
  gsapEasingList,
  gsapLoadPlugin,
};
