type GsapData = Iterable<object> | Function;
type GsapPositionOptions = {
    /**
     * - An optional filter function to adjust position data in `onUpdate` callbacks. This is
     *    useful if you need to transform any data from GSAP / plugins into data Position can
     *    utilize.
     */
    filter?: Function;
    /**
     * - Provides an iterable of property keys to assign to initial position
     *    data. This is useful when you are using GSAP plugins that manipulate
     *    data automatically; Ex. MotionPathPlugin
     */
    initialProps?: Iterable<string>;
};
type GSAPTarget = string | object | any | Iterable<any> | Array<HTMLElement | object>;
type PositionInfo = {
    /**
     * -
     */
    position: any[];
    /**
     * -
     */
    positionData: any[];
    /**
     * - Contains the full data object when a list of object w/ position is used.
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
/**
 * @typedef {object} PositionInfo
 *
 * @property {Position[]}              position -
 *
 * @property {PositionDataExtended[]}  positionData -
 *
 * @property {object[]}                data - Contains the full data object when a list of object w/ position is used.
 *
 * @property {HTMLElement[]}           elements -
 *
 * @property {Array<object[]>}         gsapData -
 */
/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
declare class GsapCompose {
    /**
     * @param {GSAPTarget} target - A standard GSAP target or Position.
     *
     * @param {object}   vars - GSAP vars object for `from`.
     *
     * @param {GsapPositionOptions} [options] - Options for filtering and initial data population for Position tweens.
     *
     * @returns {object} GSAP tween
     */
    static from(target: GSAPTarget, vars: object, options?: GsapPositionOptions): object;
    /**
     * @param {GSAPTarget} target - A standard GSAP target or Position.
     *
     * @param {object}   fromVars - GSAP fromVars object for `fromTo`
     *
     * @param {object}   toVars - GSAP toVars object for `fromTo`.
     *
     * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
     *
     * @returns {object} GSAP tween
     */
    static fromTo(target: GSAPTarget, fromVars: object, toVars: object, options?: GsapPositionOptions): object;
    /**
     * @param {GSAPTarget} target - A standard GSAP target or Position.
     *
     * @param {string}   key - Property of position to manipulate.
     *
     * @param {object}   vars - GSAP vars object for `quickTo`.
     *
     * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
     *
     * @returns {Function}  GSAP quickTo function.
     */
    static quickTo(target: GSAPTarget, key: string, vars: object, options?: GsapPositionOptions): Function;
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
     * @param {GSAPTarget} target - A standard GSAP target or Position.
     *
     * @param {object|GsapData}   arg1 - Either an object defining timelineOptions or GsapData.
     *
     * @param {GsapData|GsapPositionOptions} [arg2] - When arg1 is defined as an object; arg2 defines GsapData.
     *
     * @param {GsapPositionOptions} [arg3] - Options for filtering and initial data population.
     *
     * @returns {object} GSAP timeline
     */
    static timeline(target: GSAPTarget, arg1: object | GsapData, arg2?: GsapData | GsapPositionOptions, arg3?: GsapPositionOptions): object;
    /**
     * @param {GSAPTarget} target - A standard GSAP target or Position.
     *
     * @param {object}   vars - GSAP vars object for `to`.
     *
     * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
     *
     * @returns {object} GSAP tween
     */
    static to(target: GSAPTarget, vars: object, options?: GsapPositionOptions): object;
}
/**
 * @typedef {Iterable<object>|Function} GsapData
 */
/**
 * @typedef {object} GsapPositionOptions
 *
 * @property {Function} [filter] - An optional filter function to adjust position data in `onUpdate` callbacks. This is
 *                                 useful if you need to transform any data from GSAP / plugins into data Position can
 *                                 utilize.
 *
 * @property {Iterable<string>} [initialProps] - Provides an iterable of property keys to assign to initial position
 *                                               data. This is useful when you are using GSAP plugins that manipulate
 *                                               data automatically; Ex. MotionPathPlugin
 */
/**
 * @typedef {string|object|Position|Iterable<Position>|Array<HTMLElement|object>} GSAPTarget
 */
/**
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `quickTo` to invoke `position.set` on a
 * given {@link Position} instance provided. You may provide a `vars` object sent to `quickTo` to modify the duration /
 * easing. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+`.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Position}          params.position - A position instance.
 *
 * @param {object}            params.vars - Gsap `quickTo` vars object.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function draggableEase(node: HTMLElement, { position, vars, active, storeDragging }: {
    position: any;
    vars: object;
    active?: boolean;
    storeDragging?: any;
}): {
    update: Function;
    destroy: Function;
};
/**
 * Provides an action to enable pointer dragging of an HTMLElement and invoke `position.set` on a given {@link Position}
 * instance provided. When the attached boolean store state changes the draggable action is enabled or disabled.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {object}            params - Required parameters.
 *
 * @param {Position}          params.position - A position instance.
 *
 * @param {boolean}           [params.active=true] - A boolean value; attached to a readable store.
 *
 * @param {Writable<boolean>} [params.storeDragging] - A writable store that tracks "dragging" state.
 *
 * @param {number|number[]|Function}   [params.tweenEnd] - Defines the tween end position.
 *
 * @param {number|{min: number, max: number}} [params.tweenDuration] Duration of inertia tween; constant or provide
 *                                                                   min / max object.
 *
 * @param {number}            [params.tweenResistance=1] - Resistance per second for the inertia tween.
 *
 * @param {number}            [params.velScale=1] - Scales velocity calculation.
 *
 * @returns {{update: Function, destroy: Function}} The action lifecycle methods.
 */
declare function draggableInertia(node: HTMLElement, { position, active, storeDragging, tweenEnd, tweenDuration, tweenResistance, velScale }: {
    position: any;
    active?: boolean;
    storeDragging?: any;
    tweenEnd?: number | number[] | Function;
    tweenDuration?: number | {
        min: number;
        max: number;
    };
    tweenResistance?: number;
    velScale?: number;
}): {
    update: Function;
    destroy: Function;
};
declare let gsap: any;
/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 */
declare function gsapLoadPlugin(name: string): Promise<any>;

export { GSAPTarget, GsapCompose, GsapData, GsapPositionOptions, PositionInfo, draggableEase, draggableInertia, gsap, gsapLoadPlugin };
