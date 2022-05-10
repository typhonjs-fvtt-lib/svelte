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
declare let gsap: any;
/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 */
declare function gsapLoadPlugin(name: string): Promise<any>;

export { GSAPTarget, GsapCompose, GsapData, GsapPositionOptions, PositionInfo, gsap, gsapLoadPlugin };
