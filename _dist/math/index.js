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
function lerp(start, end, amount)
{
   return (1 - amount) * start + amount * end;
}

/**
 * Provides a way to calculate velocity via effectively creating a "complementary filter".
 *
 * `velQuick` and `velSmooth` separately accumulate over time. `velInstant` and `velUsed` do not accumulate and are
 * discarded each update. `velQuick` is responsive, but noisy. `velSmooth` is laggy but eventually more accurate. By
 * tracking them separately the used result can be responsive in the short term and accurate in the long term.
 */
class TJSVelocityTrack
{
   /** @type {number} */
   #lastSampleTime;

   /**
    * Tracks the last sample point.
    *
    * @type {{x: number, y: number, z: number}}
    */
   #lastSamplePoint = { x: 0, y: 0, z: 0 };

   /**
    * Defines the settle time in milliseconds that resets any tracked velocity state.
    *
    * @type {number}
    */
   #resetDeltaTime;

   /**
    * Stores the scaling conversion for used velocity calculation. By default, this is 1000 which converts the velocity
    * calculation to velocity per second. Set to `1` for instance for velocity per millisecond.
    *
    * @type {number}
    */
   #scaleTime;

   /**
    * Stores the instant velocity between current and last sample point.
    *
    * @type {{x: number, y: number, z: number}}
    */
   #velInstant = { x: 0, y: 0, z: 0 };

   /**
    * Stores the `quick` running calculated velocity.
    *
    * @type {{x: number, y: number, z: number}}
    */
   #velQuick = { x: 0, y: 0, z: 0 };

   /**
    * Stores the `smooth` running calculated velocity.
    *
    * @type {{x: number, y: number, z: number}}
    */
   #velSmooth = { x: 0, y: 0, z: 0 };

   /**
    * Stores the mix between `quick` and `smooth` running velocity.
    *
    * @type {{x: number, y: number, z: number}}
    */
   #velUsed = { x: 0, y: 0, z: 0 };

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
   constructor({ resetDeltaTime = 50, scaleTime = 1000 } = {})
   {
      this.resetDeltaTime = resetDeltaTime;
      this.scaleTime = scaleTime;

      Object.seal(this.#velUsed);
   }

   /**
    * @returns {number} Gets `resetDeltaTime`.
    */
   get resetDeltaTime() { return this.#resetDeltaTime; }

   /**
    * @returns {number} Gets `scaleTime`.
    */
   get scaleTime() { return this.#scaleTime; }

   /**
    * Sets `resetDeltaTime`.
    *
    * @param {number}   resetDeltaTime - Delta time in milliseconds that resets velocity tracking.
    */
   set resetDeltaTime(resetDeltaTime)
   {
      if (!Number.isFinite(resetDeltaTime) || resetDeltaTime < 0)
      {
         throw new TypeError(`'resetDeltaTime' is not a positive finite number.`);
      }

      this.#resetDeltaTime = resetDeltaTime;
   }

   /**
    * Sets `scaleTime`.
    *
    * @param {number}   scaleTime - Scales velocity calculation to new time frame. 1000 is velocity per second.
    */
   set scaleTime(scaleTime)
   {
      if (!Number.isFinite(scaleTime) || scaleTime < 0)
      {
         throw new TypeError(`'scaleTime' is not a positive finite number.`);
      }

      this.#scaleTime = scaleTime;
   }

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
   reset(x = 0, y = 0, z = 0, sampleTime = performance.now())
   {
      if (!Number.isFinite(x)) { throw new TypeError(`'x' is not a finite number.`); }
      if (!Number.isFinite(y)) { throw new TypeError(`'y' is not a finite number.`); }
      if (!Number.isFinite(z)) { throw new TypeError(`'z' is not a finite number.`); }
      if (!Number.isFinite(sampleTime)) { throw new TypeError(`'sampleTime' is not a finite number.`); }

      // Reset velocity tracking variables.
      this.#lastSampleTime = sampleTime;

      this.#lastSamplePoint.x = x;
      this.#lastSamplePoint.y = y;
      this.#lastSamplePoint.z = z;

      this.#velInstant.x = this.#velQuick.x = this.#velSmooth.x = this.#velUsed.x = 0;
      this.#velInstant.y = this.#velQuick.y = this.#velSmooth.y = this.#velUsed.y = 0;
      this.#velInstant.z = this.#velQuick.z = this.#velSmooth.z = this.#velUsed.z = 0;
   }

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
   update(x = void 0, y = void 0, z = void 0, sampleTime = performance.now())
   {
      if (!Number.isFinite(sampleTime)) { throw new TypeError(`'sampleTime' is not a finite number.`); }

      const deltaTime = sampleTime - this.#lastSampleTime + Number.EPSILON;
      this.#lastSampleTime = sampleTime;

      // Reset velocity tracking if the delta time is greater than `resetDeltaTime`.
      if (deltaTime > this.#resetDeltaTime)
      {
         this.reset(x, y, z, sampleTime);
         return this.#velUsed;
      }

      if (Number.isFinite(x))
      {
         this.#velInstant.x = (x - this.#lastSamplePoint.x) / deltaTime;

         this.#lastSamplePoint.x = x;

         this.#velQuick.x = lerp(this.#velQuick.x, this.#velInstant.x, 0.1);
         this.#velSmooth.x = lerp(this.#velSmooth.x, this.#velInstant.x, 0.01);
         this.#velUsed.x = lerp(this.#velSmooth.x, this.#velQuick.x, 0.5) * this.#scaleTime;
      }

      if (Number.isFinite(y))
      {
         this.#velInstant.y = (y - this.#lastSamplePoint.y) / deltaTime;

         this.#lastSamplePoint.y = y;

         this.#velQuick.y = lerp(this.#velQuick.y, this.#velInstant.y, 0.1);
         this.#velSmooth.y = lerp(this.#velSmooth.y, this.#velInstant.y, 0.01);

         this.#velUsed.y = lerp(this.#velSmooth.y, this.#velQuick.y, 0.5) * this.#scaleTime;
      }

      if (Number.isFinite(z))
      {
         this.#velInstant.z = (z - this.#lastSamplePoint.z) / deltaTime;

         this.#lastSamplePoint.z = z;

         this.#velQuick.z = lerp(this.#velQuick.z, this.#velInstant.z, 0.1);
         this.#velSmooth.z = lerp(this.#velSmooth.z, this.#velInstant.z, 0.01);
         this.#velUsed.z = lerp(this.#velSmooth.z, this.#velQuick.z, 0.5) * this.#scaleTime;
      }

      return this.#velUsed;
   }

   /**
    * Gets the current velocity tracking data.
    *
    * @returns {{x: number, y: number, z: number}} Velocity tracking data.
    */
   get()
   {
      this.#velUsed.x = lerp(this.#velSmooth.x, this.#velQuick.x, 0.5) * this.#scaleTime;
      this.#velUsed.y = lerp(this.#velSmooth.y, this.#velQuick.y, 0.5) * this.#scaleTime;
      this.#velUsed.z = lerp(this.#velSmooth.z, this.#velQuick.z, 0.5) * this.#scaleTime;

      return this.#velUsed;
   }
}

/**
 * Clamps a value between min / max values.
 *
 * @param {number}   value - Value to clamp.
 *
 * @param {number}   min - Minimum value.
 *
 * @param {number}   max - Maximum value.
 *
 * @returns {number} Clamped value.
 */
function clamp(value = 0, min = 0, max = 0)
{
   return Math.min(Math.max(value, min), max);
}

/**
 * Converts the given number from degrees to radians.
 *
 * @param {number}   deg - Degree number to convert
 *
 * @returns {number} Degree as radians.
 */
function degToRad(deg)
{
   return deg * (Math.PI / 180.0);
}

/**
 * Converts the given number from radians to degrees.
 *
 * @param {number}   rad - Radian number to convert.
 *
 * @returns {number} Degree as radians.
 */
function radToDeg(rad)
{
   return rad * (180.0 / Math.PI);
}

export { TJSVelocityTrack, clamp, degToRad, lerp, radToDeg };
//# sourceMappingURL=index.js.map
