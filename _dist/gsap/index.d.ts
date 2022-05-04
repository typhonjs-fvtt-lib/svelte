/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
declare class GsapPosition {
    /**
     * @param {Position} trlPosition -
     *
     * @param {object}   vars -
     *
     * @returns {object} GSAP tween
     */
    static from(trlPosition: any, vars: object): object;
    /**
     * @param {Position} trlPosition -
     *
     * @param {object}   fromVars -
     *
     * @param {object}   toVars -
     *
     * @returns {object} GSAP tween
     */
    static fromTo(trlPosition: any, fromVars: object, toVars: object): object;
    /**
     * @param {Position} trlPosition -
     *
     * @param {object|object[]}   arg1 - Either an object defining timelineOptions or an array of gsapData entries.
     *
     * @param {object[]}          [arg2] - When arg1 is defined as an object; arg2 defines an array of gsapData entries.
     *
     * @returns {object} GSAP timeline
     */
    static timeline(trlPosition: any, arg1: object | object[], arg2?: object[]): object;
    /**
     * @param {Position} trlPosition -
     *
     * @param {object}   vars -
     *
     * @returns {object} GSAP tween
     */
    static to(trlPosition: any, vars: object): object;
}
/**
 * @param {HTMLElement} node -
 *
 * @param {object}      options -
 *
 * @param {string}      options.type -
 *
 * @returns {*} GSAP method.
 */
declare function animate(node: HTMLElement, { type, ...args }: {
    type: string;
}): any;
declare let gsap: any;

export { GsapPosition, animate, gsap };
