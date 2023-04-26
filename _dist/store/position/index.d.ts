import * as _svelte_store from 'svelte/store';
import * as _svelte_lib_animate from '@typhonjs-fvtt/svelte/animate';

/**
 * Defines stored positional data.
 */
declare class TJSPositionData {
    constructor({ height, left, maxHeight, maxWidth, minHeight, minWidth, rotateX, rotateY, rotateZ, scale, translateX, translateY, translateZ, top, transformOrigin, width, zIndex }?: {
        height?: any;
        left?: any;
        maxHeight?: any;
        maxWidth?: any;
        minHeight?: any;
        minWidth?: any;
        rotateX?: any;
        rotateY?: any;
        rotateZ?: any;
        scale?: any;
        translateX?: any;
        translateY?: any;
        translateZ?: any;
        top?: any;
        transformOrigin?: any;
        width?: any;
        zIndex?: any;
    });
    /**
     * @type {number|'auto'|'inherit'|null}
     */
    height: number | 'auto' | 'inherit' | null;
    /**
     * @type {number|null}
     */
    left: number | null;
    /**
     * @type {number|null}
     */
    maxHeight: number | null;
    /**
     * @type {number|null}
     */
    maxWidth: number | null;
    /**
     * @type {number|null}
     */
    minHeight: number | null;
    /**
     * @type {number|null}
     */
    minWidth: number | null;
    /**
     * @type {number|null}
     */
    rotateX: number | null;
    /**
     * @type {number|null}
     */
    rotateY: number | null;
    /**
     * @type {number|null}
     */
    rotateZ: number | null;
    /**
     * @type {number|null}
     */
    scale: number | null;
    /**
     * @type {number|null}
     */
    top: number | null;
    /**
     * @type {string|null}
     */
    transformOrigin: string | null;
    /**
     * @type {number|null}
     */
    translateX: number | null;
    /**
     * @type {number|null}
     */
    translateY: number | null;
    /**
     * @type {number|null}
     */
    translateZ: number | null;
    /**
     * @type {number|'auto'|'inherit'|null}
     */
    width: number | 'auto' | 'inherit' | null;
    /**
     * @type {number|null}
     */
    zIndex: number | null;
    /**
     * Copies given data to this instance.
     *
     * @param {TJSPositionData}   data - Copy from this instance.
     *
     * @returns {TJSPositionData} This instance.
     */
    copy(data: TJSPositionData): TJSPositionData;
}

/**
 * Provides the output data for {@link TJSTransforms.getData}.
 */
declare class TJSTransformData {
    /**
     * @returns {DOMRect} The bounding rectangle.
     */
    get boundingRect(): DOMRect;
    /**
     * @returns {import('../').Vector3[]} The transformed corner points as vec3 in screen space.
     */
    get corners(): Float32Array[];
    /**
     * @returns {string} Returns the CSS style string for the transform matrix.
     */
    get css(): string;
    /**
     * @returns {import('../').Matrix4} The transform matrix.
     */
    get mat4(): Float32Array;
    /**
     * @returns {import('../').Matrix4[]} The pre / post translation matrices for origin translation.
     */
    get originTranslations(): Float32Array[];
    #private;
}

declare class TJSTransforms {
    _data: {};
    /**
     * @returns {boolean} Whether there are active transforms in local data.
     */
    get isActive(): boolean;
    /**
     * Sets the local rotateX data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateX(arg: number);
    /**
     * @returns {number|undefined} Any local rotateX data.
     */
    get rotateX(): number;
    /**
     * Sets the local rotateY data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateY(arg: number);
    /**
     * @returns {number|undefined} Any local rotateY data.
     */
    get rotateY(): number;
    /**
     * Sets the local rotateZ data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateZ(arg: number);
    /**
     * @returns {number|undefined} Any local rotateZ data.
     */
    get rotateZ(): number;
    /**
     * Sets the local scale data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set scale(arg: number);
    /**
     * @returns {number|undefined} Any local rotateZ scale.
     */
    get scale(): number;
    /**
     * Sets the local translateX data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateX(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateX(): number;
    /**
     * Sets the local translateY data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateY(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateY(): number;
    /**
     * Sets the local translateZ data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateZ(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateZ(): number;
    /**
     * Returns the matrix3d CSS transform for the given position / transform data.
     *
     * @param {object} [data] - Optional position data otherwise use local stored transform data.
     *
     * @returns {string} The CSS matrix3d string.
     */
    getCSS(data?: object): string;
    /**
     * Returns the matrix3d CSS transform for the given position / transform data.
     *
     * @param {object} [data] - Optional position data otherwise use local stored transform data.
     *
     * @returns {string} The CSS matrix3d string.
     */
    getCSSOrtho(data?: object): string;
    /**
     * Collects all data including a bounding rect, transform matrix, and points array of the given {@link TJSPositionData}
     * instance with the applied local transform data.
     *
     * @param {import('../').TJSPositionData} position - The position data to process.
     *
     * @param {TJSTransformData} [output] - Optional TJSTransformData output instance.
     *
     * @param {object} [validationData] - Optional validation data for adjustment parameters.
     *
     * @returns {TJSTransformData} The output TJSTransformData instance.
     */
    getData(position: TJSPositionData, output?: TJSTransformData, validationData?: object): TJSTransformData;
    /**
     * Creates a transform matrix based on local data applied in order it was added.
     *
     * If no data object is provided then the source is the local transform data. If another data object is supplied
     * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
     * construction of a transform matrix in advance of setting local data and is useful in collision detection.
     *
     * @param {object}   [data] - TJSPositionData instance or local transform data.
     *
     * @param {import('../').Matrix4}  [output] - The output mat4 instance.
     *
     * @returns {import('../').Matrix4} Transform matrix.
     */
    getMat4(data?: object, output?: Matrix4): Matrix4;
    /**
     * Provides an orthographic enhancement to convert left / top positional data to a translate operation.
     *
     * This transform matrix takes into account that the remaining operations are , but adds any left / top attributes from passed in data to
     * translate X / Y.
     *
     * If no data object is provided then the source is the local transform data. If another data object is supplied
     * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
     * construction of a transform matrix in advance of setting local data and is useful in collision detection.
     *
     * @param {object}   [data] - TJSPositionData instance or local transform data.
     *
     * @param {import('../').Matrix4}  [output] - The output mat4 instance.
     *
     * @returns {import('../').Matrix4} Transform matrix.
     */
    getMat4Ortho(data?: object, output?: Matrix4): Matrix4;
    /**
     * Tests an object if it contains transform keys and the values are finite numbers.
     *
     * @param {object} data - An object to test for transform data.
     *
     * @returns {boolean} Whether the given TJSPositionData has transforms.
     */
    hasTransform(data: object): boolean;
    /**
     * Resets internal data from the given object containing valid transform keys.
     *
     * @param {object}   data - An object with transform data.
     */
    reset(data: object): void;
    #private;
}

/**
 * Provides a TJSBasicAnimation implementation for TJSPosition animation.
 */
declare class AnimationControl {
    /**
     * Defines a static empty / void animation control.
     *
     * @type {AnimationControl}
     */
    static "__#173114@#voidControl": AnimationControl;
    /**
     * Provides a static void / undefined AnimationControl that is automatically resolved.
     *
     * @returns {AnimationControl} Void AnimationControl
     */
    static get voidControl(): AnimationControl;
    /**
     * @param {object|null} [animationData] - Animation data from {@link AnimationAPI}.
     *
     * @param {boolean}     [willFinish] - Promise that tracks animation finished state.
     */
    constructor(animationData?: object | null, willFinish?: boolean);
    /**
     * Get a promise that resolves when animation is finished.
     *
     * @returns {Promise<void>}
     */
    get finished(): Promise<void>;
    /**
     * Returns whether this animation is currently active / animating.
     *
     * Note: a delayed animation may not be started / active yet. Use {@link AnimationControl.isFinished} to determine
     * if an animation is actually finished.
     *
     * @returns {boolean} Animation active state.
     */
    get isActive(): boolean;
    /**
     * Returns whether this animation is completely finished.
     *
     * @returns {boolean} Animation finished state.
     */
    get isFinished(): boolean;
    /**
     * Cancels the animation.
     */
    cancel(): void;
    #private;
}

declare class AnimationAPI {
    /**
     * @param {import('../').TJSPosition}       position -
     *
     * @param {import('../').TJSPositionData}   data -
     */
    constructor(position: TJSPosition, data: TJSPositionData);
    /**
     * Returns whether there are scheduled animations whether active or delayed for this TJSPosition.
     *
     * @returns {boolean} Are there active animation instances.
     */
    get isScheduled(): boolean;
    /**
     * Cancels all animation instances for this TJSPosition instance.
     */
    cancel(): void;
    /**
     * Returns all currently scheduled AnimationControl instances for this TJSPosition instance.
     *
     * @returns {AnimationControl[]} All currently scheduled animation controls for this TJSPosition instance.
     */
    getScheduled(): AnimationControl[];
    /**
     * Provides a tween from given position data to the current position.
     *
     * @param {import('../').TJSPositionDataExtended} fromData - The starting position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    from(fromData: TJSPositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl;
    /**
     * Provides a tween from given position data to the current position.
     *
     * @param {import('../').TJSPositionDataExtended} fromData - The starting position.
     *
     * @param {import('../').TJSPositionDataExtended} toData - The ending position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    fromTo(fromData: TJSPositionDataExtended, toData: TJSPositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl;
    /**
     * Provides a tween to given position data from the current position.
     *
     * @param {import('../').TJSPositionDataExtended} toData - The destination position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    to(toData: TJSPositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl;
    /**
     * Returns a function that provides an optimized way to constantly update a to-tween.
     *
     * @param {Iterable<string>}  keys - The keys for quickTo.
     *
     * @param {object}            [opts] - Optional parameters.
     *
     * @param {number}            [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}          [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {import('../').quickToCallback} quick-to tween function.
     */
    quickTo(keys: Iterable<string>, { duration, ease, interpolate }?: {
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): quickToCallback;
    #private;
}

declare class PositionStateAPI {
    constructor(position: any, data: any, transforms: any);
    /**
     * Returns any stored save state by name.
     *
     * @param {object}   options - Options
     *
     * @param {string}   options.name - Saved data set name.
     *
     * @returns {import('./').TJSPositionDataExtended} The saved data set.
     */
    get({ name }: {
        name: string;
    }): TJSPositionDataExtended;
    /**
     * Returns any associated default data.
     *
     * @returns {import('./').TJSPositionDataExtended} Associated default data.
     */
    getDefault(): TJSPositionDataExtended;
    /**
     * Removes and returns any position state by name.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - Name to remove and retrieve.
     *
     * @returns {import('./').TJSPositionDataExtended} Saved position data.
     */
    remove({ name }: {
        name: string;
    }): TJSPositionDataExtended;
    /**
     * Resets data to default values and invokes set.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.keepZIndex=false] - When true keeps current z-index.
     *
     * @param {boolean}  [opts.invokeSet=true] - When true invokes set method.
     *
     * @returns {boolean} Operation successful.
     */
    reset({ keepZIndex, invokeSet }?: {
        keepZIndex?: boolean;
        invokeSet?: boolean;
    }): boolean;
    /**
     * Restores a saved positional state returning the data. Several optional parameters are available
     * to control whether the restore action occurs silently (no store / inline styles updates), animates
     * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
     * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
     * returned if awaiting the end of the animation.
     *
     * @param {object}            params - Parameters
     *
     * @param {string}            params.name - Saved data set name.
     *
     * @param {boolean}           [params.remove=false] - Remove data set.
     *
     * @param {Iterable<string>}  [params.properties] - Specific properties to set / animate.
     *
     * @param {boolean}           [params.silent] - Set position data directly; no store or style updates.
     *
     * @param {boolean}           [params.async=false] - If animating return a Promise that resolves with any saved data.
     *
     * @param {boolean}           [params.animateTo=false] - Animate to restore data.
     *
     * @param {number}            [params.duration=0.1] - Duration in seconds.
     *
     * @param {Function}          [params.ease=linear] - Easing function.
     *
     * @param {Function}          [params.interpolate=lerp] - Interpolation function.
     *
     * @returns {import('./').TJSPositionDataExtended | Promise<import('./').TJSPositionDataExtended>} Saved position
     *          data.
     */
    restore({ name, remove, properties, silent, async, animateTo, duration, ease, interpolate }: {
        name: string;
        remove?: boolean;
        properties?: Iterable<string>;
        silent?: boolean;
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): TJSPositionDataExtended | Promise<TJSPositionDataExtended>;
    /**
     * Saves current position state with the opportunity to add extra data to the saved state.
     *
     * @param {object}   opts - Options.
     *
     * @param {string}   opts.name - name to index this saved data.
     *
     * @param {...*}     [opts.extra] - Extra data to add to saved data.
     *
     * @returns {import('./').TJSPositionData} Current position data
     */
    save({ name, ...extra }: {
        name: string;
        extra?: any[];
    }): TJSPositionData;
    /**
     * Directly sets a position state.
     *
     * @param {object}   opts - Options.
     *
     * @param {string}   opts.name - name to index this saved data.
     *
     * @param {...*}     [opts.data] - TJSPosition data to set.
     */
    set({ name, ...data }: {
        name: string;
        data?: any[];
    }): void;
    #private;
}

/**
 * Provides the storage and sequencing of managed position validators. Each validator added may be a bespoke function or
 * a {@link ValidatorData} object containing an `id`, `validator`, and `weight` attributes; `validator` is the only
 * required attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the validator; recommended strings or numbers. This
 * allows validators to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows validators to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted validator always
 * runs before a higher weighted validator. If no weight is specified the default of '1' is assigned and it is appended
 * to the end of the validators list.
 *
 * This class forms the public API which is accessible from the `.validators` getter in the main TJSPosition instance.
 * ```
 * const position = new TJSPosition(<TJSPositionData>);
 * position.validators.add(...);
 * position.validators.clear();
 * position.validators.length;
 * position.validators.remove(...);
 * position.validators.removeBy(...);
 * position.validators.removeById(...);
 * ```
 */
declare class AdapterValidators {
    /**
     * @param {boolean}  enabled - Sets enabled state.
     */
    set enabled(arg: boolean);
    /**
     * @returns {boolean} Returns the enabled state.s
     */
    get enabled(): boolean;
    /**
     * @returns {number} Returns the length of the validators array.
     */
    get length(): number;
    /**
     * @param {...(import('../').ValidatorFn | import('../').ValidatorData)}   validators -
     */
    add(...validators: (ValidatorFn | ValidatorData)[]): void;
    clear(): void;
    /**
     * @param {...(import('../').ValidatorFn | import('../').ValidatorData)}   validators -
     */
    remove(...validators: (ValidatorFn | ValidatorData)[]): void;
    /**
     * Remove validators by the provided callback. The callback takes 3 parameters: `id`, `validator`, and `weight`.
     * Any truthy value returned will remove that validator.
     *
     * @param {function(*, import('../').ValidatorFn, number): boolean} callback - Callback function to evaluate each
     *        validator entry.
     */
    removeBy(callback: (arg0: any, arg1: ValidatorFn, arg2: number) => boolean): void;
    removeById(...ids: any[]): void;
    /**
     * Provides an iterator for validators.
     *
     * @yields {import('../').ValidatorData}
     */
    [Symbol.iterator](): Generator<{
        /**
         * - An ID associated with this validator. Can be used to remove the validator.
         */
        id?: any;
        /**
         * - TJSPosition validator function that takes a {@link TJSPositionData } instance
         * potentially modifying it or returning null if invalid.
         */
        validator: ValidatorFn;
        /**
         * - A number between 0 and 1 inclusive to position this validator against others.
         */
        weight?: number;
        /**
         * - Optional subscribe function following the Svelte store / subscribe pattern.
         */
        subscribe?: Function;
    }, void, unknown>;
    #private;
}

declare class BasicBounds {
    constructor({ constrain, element, enabled, lock, width, height }?: {
        constrain?: boolean;
        element: any;
        enabled?: boolean;
        lock?: boolean;
        width: any;
        height: any;
    });
    set element(arg: HTMLElement);
    get element(): HTMLElement;
    set constrain(arg: boolean);
    get constrain(): boolean;
    set enabled(arg: boolean);
    get enabled(): boolean;
    set width(arg: number);
    get width(): number;
    set height(arg: number);
    get height(): number;
    setDimension(width: any, height: any): void;
    /**
     * Provides a validator that respects transforms in positional data constraining the position to within the target
     * elements bounds.
     *
     * @param {import('../').ValidationData}   valData - The associated validation data for position updates.
     *
     * @returns {import('../').TJSPositionData} Potentially adjusted position data.
     */
    validator(valData: ValidationData): TJSPositionData;
    #private;
}

declare class TransformBounds {
    constructor({ constrain, element, enabled, lock, width, height }?: {
        constrain?: boolean;
        element: any;
        enabled?: boolean;
        lock?: boolean;
        width: any;
        height: any;
    });
    set element(arg: HTMLElement);
    get element(): HTMLElement;
    set constrain(arg: boolean);
    get constrain(): boolean;
    set enabled(arg: boolean);
    get enabled(): boolean;
    set width(arg: number);
    get width(): number;
    set height(arg: number);
    get height(): number;
    setDimension(width: any, height: any): void;
    /**
     * Provides a validator that respects transforms in positional data constraining the position to within the target
     * elements bounds.
     *
     * @param {import('../').ValidationData}   valData - The associated validation data for position updates.
     *
     * @returns {import('../').TJSPositionData} Potentially adjusted position data.
     */
    validator(valData: ValidationData): TJSPositionData;
    #private;
}

declare class Centered {
    /**
     * @param {object}      [options] - Initial options.
     *
     * @param {HTMLElement} [options.element] - Target element.
     *
     * @param {boolean}     [options.lock=false] - Lock parameters from being set.
     *
     * @param {number}      [options.width] - Manual width.
     *
     * @param {number}      [options.height] - Manual height.
     */
    constructor({ element, lock, width, height }?: {
        element?: HTMLElement;
        lock?: boolean;
        width?: number;
        height?: number;
    });
    /**
     * @param {HTMLElement|undefined|null} element - Set target element.
     */
    set element(arg: HTMLElement);
    /**
     * @returns {HTMLElement|undefined|null} Target element.
     */
    get element(): HTMLElement;
    /**
     * @param {number}   width - Set manual width.
     */
    set width(arg: number);
    /**
     * @returns {number} Get manual width.
     */
    get width(): number;
    /**
     * @param {number}   height - Set manual height.
     */
    set height(arg: number);
    /**
     * @returns {number} Get manual height.
     */
    get height(): number;
    /**
     * Set manual width & height.
     *
     * @param {number}   width - New manual width.
     *
     * @param {number}   height - New manual height.
     */
    setDimension(width: number, height: number): void;
    /**
     * Get the left constraint based on any manual target values or the browser inner width.
     *
     * @param {number}   width - Target width.
     *
     * @returns {number} Calculated left constraint.
     */
    getLeft(width: number): number;
    /**
     * Get the top constraint based on any manual target values or the browser inner height.
     *
     * @param {number}   height - Target height.
     *
     * @returns {number} Calculated top constraint.
     */
    getTop(height: number): number;
    #private;
}

/**
 * Provides a public API for grouping multiple {@link TJSPosition} animations together with the AnimationManager.
 *
 * Note: To remove cyclic dependencies as this class provides the TJSPosition static / group Animation API `instanceof`
 * checks are not done against TJSPosition. Instead, a check for the animate property being an instanceof
 * {@link AnimationAPI} is performed in {@link AnimationGroupAPI.#isPosition}.
 *
 * @see AnimationAPI
 */
declare class AnimationGroupAPI {
    /**
     * Checks of the given object is a TJSPosition instance by checking for AnimationAPI.
     *
     * @param {*}  object - Any data.
     *
     * @returns {boolean} Is TJSPosition.
     */
    static "__#173117@#isPosition"(object: any): boolean;
    /**
     * Cancels any animation for given TJSPosition data.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     */
    static cancel(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>): void;
    /**
     * Cancels all TJSPosition animation.
     */
    static cancelAll(): void;
    /**
     * Gets all animation controls for the given position data.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     *
     * @returns {{ position: import('../').TJSPosition, data: object | void, controls: import('./AnimationControl').AnimationControl[]}[]} Results array.
     */
    static getScheduled(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>): {
        position: TJSPosition;
        data: object | void;
        controls: AnimationControl[];
    }[];
    /**
     * Provides the `from` animation tween for one or more TJSPosition instances as a group.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     *
     * @param {object|Function}   fromData -
     *
     * @param {object|Function}   options -
     *
     * @returns {import('svelte-lib/animate').TJSBasicAnimation} Basic animation control.
     */
    static from(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>, fromData: object | Function, options: object | Function): _svelte_lib_animate.TJSBasicAnimation;
    /**
     * Provides the `fromTo` animation tween for one or more TJSPosition instances as a group.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     *
     * @param {object|Function}   fromData -
     *
     * @param {object|Function}   toData -
     *
     * @param {object|Function}   options -
     *
     * @returns {import('svelte-lib/animate').TJSBasicAnimation} Basic animation control.
     */
    static fromTo(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>, fromData: object | Function, toData: object | Function, options: object | Function): _svelte_lib_animate.TJSBasicAnimation;
    /**
     * Provides the `to` animation tween for one or more TJSPosition instances as a group.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     *
     * @param {object|Function}   toData -
     *
     * @param {object|Function}   options -
     *
     * @returns {import('svelte-lib/animate').TJSBasicAnimation} Basic animation control.
     */
    static to(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>, toData: object | Function, options: object | Function): _svelte_lib_animate.TJSBasicAnimation;
    /**
     * Provides the `to` animation tween for one or more TJSPosition instances as a group.
     *
     * @param {import('../').TJSPosition | {position: import('../').TJSPosition} | Iterable<import('../').TJSPosition> | Iterable<{position: import('../').TJSPosition}>} position -
     *
     * @param {Iterable<string>}  keys -
     *
     * @param {object|Function}   options -
     *
     * @returns {import('../').quickToCallback} Basic animation control.
     */
    static quickTo(position: TJSPosition | {
        position: TJSPosition;
    } | Iterable<TJSPosition> | Iterable<{
        position: TJSPosition;
    }>, keys: Iterable<string>, options: object | Function): quickToCallback;
}

/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
declare class TJSPosition {
    /**
     * @type {{browserCentered: Centered, Centered: Centered}}
     */
    static "__#173125@#positionInitial": {
        browserCentered: Centered;
        Centered: Centered;
    };
    /**
     * @type {{TransformBounds: TransformBounds, BasicBounds: BasicBounds, basicWindow: BasicBounds, transformWindow: TransformBounds}}
     */
    static "__#173125@#positionValidators": {
        TransformBounds: TransformBounds;
        BasicBounds: BasicBounds;
        basicWindow: BasicBounds;
        transformWindow: TransformBounds;
    };
    /**
     * @returns {AnimationGroupAPI} Public Animation API.
     */
    static get Animate(): AnimationGroupAPI;
    /**
     * @returns {{browserCentered: Centered, Centered: Centered}} TJSPosition initial API.
     */
    static get Initial(): {
        browserCentered: Centered;
        Centered: Centered;
    };
    /**
     * Returns TJSTransformData class / constructor.
     *
     * @returns {TJSTransformData} TJSTransformData class / constructor.
     */
    static get TransformData(): TJSTransformData;
    /**
     * Returns default validators.
     *
     * Note: `basicWindow` and `BasicBounds` will eventually be removed.
     *
     * @returns {{TransformBounds: TransformBounds, BasicBounds: BasicBounds, basicWindow: BasicBounds, transformWindow: TransformBounds}}
     * Available validators.
     */
    static get Validators(): {
        TransformBounds: TransformBounds;
        BasicBounds: BasicBounds;
        basicWindow: BasicBounds;
        transformWindow: TransformBounds;
    };
    /**
     * Returns a duplicate of a given position instance copying any options and validators.
     *
     * // TODO: Consider more safety over options processing.
     *
     * @param {TJSPosition}          position - A position instance.
     *
     * @param {import('./').TJSPositionOptions}   options - TJSPosition options.
     *
     * @returns {TJSPosition} A duplicate position instance.
     */
    static duplicate(position: TJSPosition, options: TJSPositionOptions): TJSPosition;
    /**
     * @param {import('./').TJSPositionParent | import('./').TJSPositionOptionsAll}   [parent] - A potential parent
     *        element or object w/ `elementTarget` getter. May also be the TJSPositionOptions object w/ 1 argument.
     *
     * @param {import('./').TJSPositionOptionsAll}   [options] - Default values.
     */
    constructor(parent?: TJSPositionParent | TJSPositionOptionsAll, options?: TJSPositionOptionsAll);
    /**
     * Returns the animation API.
     *
     * @returns {AnimationAPI} Animation API.
     */
    get animate(): AnimationAPI;
    /**
     * Returns the dimension data for the readable store.
     *
     * @returns {{width: number | 'auto', height: number | 'auto'}} Dimension data.
     */
    get dimension(): {
        width: number | 'auto';
        height: number | 'auto';
    };
    /**
     * Sets the enabled state.
     *
     * @param {boolean}  enabled - New enabled state.
     */
    set enabled(arg: boolean);
    /**
     * Returns the enabled state.
     *
     * @returns {boolean} Enabled state.
     */
    get enabled(): boolean;
    /**
     * Returns the current HTMLElement being positioned.
     *
     * @returns {HTMLElement|undefined} Current HTMLElement being positioned.
     */
    get element(): HTMLElement;
    /**
     * Returns a promise that is resolved on the next element update with the time of the update.
     *
     * @returns {Promise<number>} Promise resolved on element update.
     */
    get elementUpdated(): Promise<number>;
    /**
     * Sets the associated {@link TJSPositionParent} instance. Resets the style cache and default data.
     *
     * @param {import('./').TJSPositionParent | void} parent - A TJSPositionParent instance.
     */
    set parent(arg: any);
    /**
     * Returns the associated {@link TJSPositionParent} instance.
     *
     * @returns {import('./').TJSPositionParent} The TJSPositionParent instance.
     */
    get parent(): any;
    /**
     * Returns the state API.
     *
     * @returns {PositionStateAPI} TJSPosition state API.
     */
    get state(): PositionStateAPI;
    /**
     * Returns the derived writable stores for individual data variables.
     *
     * @returns {import('./').StorePosition} Derived / writable stores.
     */
    get stores(): StorePosition;
    /**
     * Returns the transform data for the readable store.
     *
     * @returns {TJSTransformData} Transform Data.
     */
    get transform(): TJSTransformData;
    /**
     * Returns the validators.
     *
     * @returns {AdapterValidators} validators.
     */
    get validators(): AdapterValidators;
    /**
     * @param {number|string|null} height -
     */
    set height(arg: number | "auto" | "inherit");
    /**
     * @returns {number|'auto'|'inherit'|null} height
     */
    get height(): number | "auto" | "inherit";
    /**
     * @param {number|string|null} left -
     */
    set left(arg: number);
    /**
     * @returns {number|null} left
     */
    get left(): number;
    /**
     * @param {number|string|null} maxHeight -
     */
    set maxHeight(arg: number);
    /**
     * @returns {number|null} maxHeight
     */
    get maxHeight(): number;
    /**
     * @param {number|string|null} maxWidth -
     */
    set maxWidth(arg: number);
    /**
     * @returns {number|null} maxWidth
     */
    get maxWidth(): number;
    /**
     * @param {number|string|null} minHeight -
     */
    set minHeight(arg: number);
    /**
     * @returns {number|null} minHeight
     */
    get minHeight(): number;
    /**
     * @param {number|string|null} minWidth -
     */
    set minWidth(arg: number);
    /**
     * @returns {number|null} minWidth
     */
    get minWidth(): number;
    /**
     * @param {number|string|null} rotateX -
     */
    set rotateX(arg: number);
    /**
     * @returns {number|null} rotateX
     */
    get rotateX(): number;
    /**
     * @param {number|string|null} rotateY -
     */
    set rotateY(arg: number);
    /**
     * @returns {number|null} rotateY
     */
    get rotateY(): number;
    /**
     * @param {number|string|null} rotateZ -
     */
    set rotateZ(arg: number);
    /**
     * @returns {number|null} rotateZ
     */
    get rotateZ(): number;
    /**
     * @param {number|string|null} rotateZ - alias for rotateZ
     */
    set rotation(arg: number);
    /**
     * @returns {number|null} alias for rotateZ
     */
    get rotation(): number;
    /**
     * @param {number|string|null} scale -
     */
    set scale(arg: number);
    /**
     * @returns {number|null} scale
     */
    get scale(): number;
    /**
     * @param {number|string|null} top -
     */
    set top(arg: number);
    /**
     * @returns {number|null} top
     */
    get top(): number;
    /**
     * @param {string} transformOrigin -
     */
    set transformOrigin(arg: string);
    /**
     * @returns {string} transformOrigin
     */
    get transformOrigin(): string;
    /**
     * @param {number|string|null} translateX -
     */
    set translateX(arg: number);
    /**
     * @returns {number|null} translateX
     */
    get translateX(): number;
    /**
     * @param {number|string|null} translateY -
     */
    set translateY(arg: number);
    /**
     * @returns {number|null} translateY
     */
    get translateY(): number;
    /**
     * @param {number|string|null} translateZ -
     */
    set translateZ(arg: number);
    /**
     * @returns {number|null} translateZ
     */
    get translateZ(): number;
    /**
     * @param {number|string|null} width -
     */
    set width(arg: number | "auto" | "inherit");
    /**
     * @returns {number|'auto'|'inherit'|null} width
     */
    get width(): number | "auto" | "inherit";
    /**
     * @param {number|string|null} zIndex -
     */
    set zIndex(arg: number);
    /**
     * @returns {number|null} z-index
     */
    get zIndex(): number;
    /**
     * Assigns current position to object passed into method.
     *
     * @param {object|TJSPositionData}  [position] - Target to assign current position data.
     *
     * @param {import('./').TJSPositionGetOptions}   [options] - Defines options for specific keys and substituting null
     *        for numeric default values.
     *
     * @returns {TJSPositionData} Passed in object with current position data.
     */
    get(position?: object | TJSPositionData, options?: TJSPositionGetOptions): TJSPositionData;
    /**
     * @returns {TJSPositionData} Current position data.
     */
    toJSON(): TJSPositionData;
    /**
     * All calculation and updates of position are implemented in {@link TJSPosition}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * Note: the logic for updating position is improved and changes a few aspects from the default
     * {@link Application.setPosition}. The gate on `popOut` is removed, so to ensure no positional application occurs
     * popOut applications can set `this.options.positionable` to false ensuring no positional inline styles are
     * applied.
     *
     * The initial set call on an application with a target element will always set width / height as this is
     * necessary for correct calculations.
     *
     * When a target element is present updated styles are applied after validation. To modify the behavior of set
     * implement one or more validator functions and add them from the application via
     * `this.position.validators.add(<Function>)`.
     *
     * Updates to any target element are decoupled from the underlying TJSPosition data. This method returns this instance
     * that you can then await on the target element inline style update by using {@link TJSPosition.elementUpdated}.
     *
     * @param {import('./').TJSPositionDataExtended} [position] - TJSPosition data to set.
     *
     * @returns {TJSPosition} This TJSPosition instance.
     */
    set(position?: TJSPositionDataExtended): TJSPosition;
    /**
     *
     * @param {function(TJSPositionData): void} handler - Callback function that is invoked on update / changes. Receives
     *                                                 a copy of the TJSPositionData.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: TJSPositionData) => void): (() => void);
    #private;
}

type quickToCallback = (...args: (number | object)[]) => any;
type TJSPositionInitialHelper = {
    /**
     * - Returns the left position given the width of the browser window.
     */
    getLeft: (width: number) => number;
    /**
     * - Returns the top position given the height of the browser window.
     */
    getTop: (height: number) => number;
};
type TJSPositionGetOptions = {
    /**
     * - When provided only these keys are copied.
     */
    keys: Iterable<string>;
    /**
     * - When provided these keys are excluded.
     */
    exclude: Iterable<string>;
    /**
     * - When true any `null` values are converted into defaults.
     */
    numeric: boolean;
};
/**
 * - Options set in constructor.
 */
type TJSPositionOptions = {
    /**
     * - When true always calculate transform data.
     */
    calculateTransform: boolean;
    /**
     * - Provides a helper for setting initial position data.
     */
    initialHelper: TJSPositionInitialHelper;
    /**
     * - Sets TJSPosition to orthographic mode using just transform / matrix3d for positioning.
     */
    ortho: boolean;
    /**
     * - Set to true when there are subscribers to the readable transform store.
     */
    transformSubscribed: boolean;
};
type TJSPositionOptionsAll = TJSPositionOptions & TJSPositionData;
type TJSPositionParent = HTMLElement | object;
type TJSPositionable = {
    /**
     * - An instance of TJSPosition that manages application positional
     * state.
     */
    position: TJSPosition;
};
type ResizeObserverData = {
    /**
     * -
     */
    contentHeight: number | undefined;
    /**
     * -
     */
    contentWidth: number | undefined;
    /**
     * -
     */
    offsetHeight: number | undefined;
    /**
     * -
     */
    offsetWidth: number | undefined;
};
/**
 * - Provides individual writable stores for {@link TJSPosition }.
 */
type StorePosition = {
    /**
     * - Readable store for dimension
     *  data.
     */
    dimension: _svelte_store.Readable<{
        width: number;
        height: number;
    }>;
    /**
     * - Readable store for current element.
     */
    element: _svelte_store.Readable<HTMLElement>;
    /**
     * - Derived store for `left` updates.
     */
    left: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `top` updates.
     */
    top: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `width` updates.
     */
    width: _svelte_store.Writable<number | 'auto' | null>;
    /**
     * - Derived store for `height` updates.
     */
    height: _svelte_store.Writable<number | 'auto' | null>;
    /**
     * - Derived store for `maxHeight` updates.
     */
    maxHeight: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `maxWidth` updates.
     */
    maxWidth: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `minHeight` updates.
     */
    minHeight: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `minWidth` updates.
     */
    minWidth: _svelte_store.Writable<number | null>;
    /**
     * - Readable store for `contentHeight`.
     */
    resizeContentHeight: _svelte_store.Readable<number | undefined>;
    /**
     * - Readable store for `contentWidth`.
     */
    resizeContentWidth: _svelte_store.Readable<number | undefined>;
    /**
     * - Protected store for resize observer updates.
     */
    resizeObserved: _svelte_store.Writable<ResizeObserverData>;
    /**
     * - Readable store for `offsetHeight`.
     */
    resizeOffsetHeight: _svelte_store.Readable<number | undefined>;
    /**
     * - Readable store for `offsetWidth`.
     */
    resizeOffsetWidth: _svelte_store.Readable<number | undefined>;
    /**
     * - Derived store for `rotate` updates.
     */
    rotate: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `rotateX` updates.
     */
    rotateX: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `rotateY` updates.
     */
    rotateY: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `rotateZ` updates.
     */
    rotateZ: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `scale` updates.
     */
    scale: _svelte_store.Writable<number | null>;
    /**
     * - Readable store for
     * transform data.
     */
    transform: _svelte_store.Readable<TJSTransformData>;
    /**
     * - Derived store for `transformOrigin`.
     */
    transformOrigin: _svelte_store.Writable<string>;
    /**
     * - Derived store for `translateX` updates.
     */
    translateX: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `translateY` updates.
     */
    translateY: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `translateZ` updates.
     */
    translateZ: _svelte_store.Writable<number | null>;
    /**
     * - Derived store for `zIndex` updates.
     */
    zIndex: _svelte_store.Writable<number | null>;
};
type TJSPositionDataExtended = {
    /**
     * -
     */
    height?: number | string | null;
    /**
     * -
     */
    left?: number | string | null;
    /**
     * -
     */
    maxHeight?: number | string | null;
    /**
     * -
     */
    maxWidth?: number | string | null;
    /**
     * -
     */
    minHeight?: number | string | null;
    /**
     * -
     */
    minWidth?: number | string | null;
    /**
     * -
     */
    rotateX?: number | string | null;
    /**
     * -
     */
    rotateY?: number | string | null;
    /**
     * -
     */
    rotateZ?: number | string | null;
    /**
     * -
     */
    scale?: number | string | null;
    /**
     * -
     */
    top?: number | string | null;
    /**
     * -
     */
    transformOrigin?: string | null;
    /**
     * -
     */
    translateX?: number | string | null;
    /**
     * -
     */
    translateY?: number | string | null;
    /**
     * -
     */
    translateZ?: number | string | null;
    /**
     * -
     */
    width?: number | string | null;
    /**
     * -
     *
     * Extended properties -----------------------------------------------------------------------------------------------
     */
    zIndex?: number | string | null;
    /**
     * - When true any associated element is updated immediately.
     */
    immediateElementUpdate?: boolean;
    /**
     * - Alias for `rotateZ`.
     */
    rotation?: number | null;
};
/**
 * - 3 Dimensional Vector.
 */
type Vector3 = Float32Array;
/**
 * - 4x4 Matrix; Format: column-major, when typed out it looks like row-major.
 */
type Matrix4 = Float32Array;
/**
 * - The supported transform origin strings.
 */
type TJSTransformOrigin = 'top left' | 'top center' | 'top right' | 'center left' | 'center' | 'center right' | 'bottom left' | 'bottom center' | 'bottom right';
type ValidationData = {
    /**
     * -
     */
    position: TJSPositionData;
    /**
     * -
     */
    parent: TJSPositionParent;
    /**
     * -
     */
    el: HTMLElement;
    /**
     * -
     */
    computed: CSSStyleDeclaration;
    /**
     * -
     */
    transforms: TJSTransforms;
    /**
     * -
     */
    height: number;
    /**
     * -
     */
    width: number;
    /**
     * -
     */
    marginLeft: number | undefined;
    /**
     * -
     */
    marginTop: number | undefined;
    /**
     * -
     */
    maxHeight: number | undefined;
    /**
     * -
     */
    maxWidth: number | undefined;
    /**
     * -
     */
    minHeight: number | undefined;
    /**
     * -
     */
    minWidth: number | undefined;
    /**
     * - The rest of any data submitted to {@link TJSPosition.set }
     */
    rest: object;
};
/**
 * - TJSPosition validator function that takes a {@link TJSPositionData } instance potentially
 *                             modifying it or returning null if invalid.
 */
type ValidatorFn = (valData: ValidationData) => TJSPositionData | null;
type ValidatorData = {
    /**
     * - An ID associated with this validator. Can be used to remove the validator.
     */
    id?: any;
    /**
     * - TJSPosition validator function that takes a {@link TJSPositionData } instance
     * potentially modifying it or returning null if invalid.
     */
    validator: ValidatorFn;
    /**
     * - A number between 0 and 1 inclusive to position this validator against others.
     */
    weight?: number;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
/**
 * Defines the
 *          position validator options.
 */
type TJSPositionValidatorOptions = ValidatorFn | ValidatorData | Iterable<ValidatorFn | ValidatorData>;

export { Matrix4, ResizeObserverData, StorePosition, TJSPosition, TJSPositionData, TJSPositionDataExtended, TJSPositionGetOptions, TJSPositionInitialHelper, TJSPositionOptions, TJSPositionOptionsAll, TJSPositionParent, TJSPositionValidatorOptions, TJSPositionable, TJSTransformData, TJSTransformOrigin, TJSTransforms, ValidationData, ValidatorData, ValidatorFn, Vector3, quickToCallback };
