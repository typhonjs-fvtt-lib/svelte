export * from 'gl-matrix';

/**
 * Performs linear interpolation between a start & end value by given amount between 0 - 1 inclusive.
 *
 * @param {number}   start - Start value.
 *
 * @param {number}   end - End value.
 *
 * @param {number}   amount - Current amount between 0 - 1 inclusive.
 *
 * @returns {number} Linear interpolated value between start & end.
 */
declare function lerp(start: number, end: number, amount: number): number;

/**
 * Converts the given number from degrees to radians.
 *
 * @param {number}   deg - Degree number to convert
 *
 * @returns {number} Degree as radians.
 */
declare function degToRad(deg: number): number;

/**
 * Converts the given number from radians to degrees.
 *
 * @param {number}   rad - Radian number to convert.
 *
 * @returns {number} Degree as radians.
 */
declare function radToDeg(rad: number): number;

/**
 * Provides a way to calculate velocity via effectively creating a "complementary filter".
 *
 * `velQuick` and `velSmooth` separately accumulate over time. `velInstant` and `velUsed` do not accumulate and are
 * discarded each update. `velQuick` is responsive, but noisy. `velSmooth` is laggy but eventually more accurate. By
 * tracking them separately the used result can be responsive in the short term and accurate in the long term.
 *
 * TODO: This class will be moved to a final location in the @typhonjs-svelte/lib/math package.
 */
declare class TJSVelocityTrack {
    /**
     * Creates a velocity tracker instance.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {number}   [opts.resetDeltaTime=50] - Delta time in milliseconds that resets velocity tracking.
     *
     * @param {number}   [opts.scaleTime=1000] - Scales velocity calculation to new time frame. 1000 is velocity per
     *                                           second.
     */
    constructor({ resetDeltaTime, scaleTime }?: {
        resetDeltaTime?: number;
        scaleTime?: number;
    });
    /**
     * Sets `resetDeltaTime`.
     *
     * @param {number}   resetDeltaTime - Delta time in milliseconds that resets velocity tracking.
     */
    set resetDeltaTime(arg: number);
    /**
     * @returns {number} Gets `resetDeltaTime`.
     */
    get resetDeltaTime(): number;
    /**
     * Sets `scaleTime`.
     *
     * @param {number}   scaleTime - Scales velocity calculation to new time frame. 1000 is velocity per second.
     */
    set scaleTime(arg: number);
    /**
     * @returns {number} Gets `scaleTime`.
     */
    get scaleTime(): number;
    /**
     * Resets velocity tracking data.
     *
     * @param {number}   [x=0] - 'X' value to set to last sample point.
     *
     * @param {number}   [y=0] - 'Y' value to set to last sample point.
     *
     * @param {number}   [z=0] - 'Z' value to set to last sample point.
     *
     * @param {number}   [sampleTime=performance.now()] - A sample time in milliseconds resolution.
     */
    reset(x?: number, y?: number, z?: number, sampleTime?: number): void;
    /**
     * Runs ongoing velocity calculation of x / y / z given a sample time.
     *
     * @param {number|undefined}  x - New sample X
     *
     * @param {number|undefined}  y - New sample Y
     *
     * @param {number|undefined}  z - New sample Z
     *
     * @param {number}            [sampleTime=performance.now()] - An optional specific time w/ millisecond resolution.
     *
     * @returns {{x: number, y: number, z: number}} current velocity.
     */
    update(x?: number | undefined, y?: number | undefined, z?: number | undefined, sampleTime?: number): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Gets the current velocity tracking data.
     *
     * @returns {{x: number, y: number, z: number}} Velocity tracking data.
     */
    get(): {
        x: number;
        y: number;
        z: number;
    };
    #private;
}

export { TJSVelocityTrack, degToRad, lerp, radToDeg };
