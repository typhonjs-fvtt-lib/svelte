type PositionInfo = {
    /**
     * -
     */
    positionData: any[];
    /**
     * -
     */
    elements: HTMLElement[];
};
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
type GSAPTarget = string | object | any | any[] | Array<HTMLElement | object>;
declare let CustomBounce: any;
declare let CustomEase: any;
declare let CustomWiggle: any;
declare let Draggable: any;
declare let DrawSVGPlugin: any;
declare let EasePack: any;
declare let GSDevTools: any;
/**
 * @typedef {object} PositionInfo
 *
 * @property {PositionDataExtended[]} positionData -
 *
 * @property {HTMLElement[]} elements -
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
     * @param {object|object[]}   arg1 - Either an object defining timelineOptions or an array of gsapData entries.
     *
     * @param {object[]|Function} [arg2] - When arg1 is defined as an object; arg2 defines an array of gsapData entries.
     *
     * @param {GsapPositionOptions} [arg3] - Options for filtering and initial data population.
     *
     * @returns {object} GSAP timeline
     */
    static timeline(target: GSAPTarget, arg1: object | object[], arg2?: object[] | Function, arg3?: GsapPositionOptions): object;
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
declare let InertiaPlugin: any;
declare let MorphSVGPlugin: any;
declare let MotionPathHelper: any;
declare let MotionPathPlugin: any;
declare let Physics2DPlugin: any;
declare let PhysicsPropsPlugin: any;
declare let PixiPlugin: any;
declare let ScrambleTextPlugin: any;
declare let ScrollToPlugin: any;
declare let ScrollTrigger: any;
declare let SplitText: any;
declare let TextPlugin: any;
declare let gsap: any;

export { CustomBounce, CustomEase, CustomWiggle, Draggable, DrawSVGPlugin, EasePack, GSAPTarget, GSDevTools, GsapCompose, GsapPositionOptions, InertiaPlugin, MorphSVGPlugin, MotionPathHelper, MotionPathPlugin, Physics2DPlugin, PhysicsPropsPlugin, PixiPlugin, PositionInfo, ScrambleTextPlugin, ScrollToPlugin, ScrollTrigger, SplitText, TextPlugin, gsap };
