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

export { clamp, degToRad, radToDeg };
//# sourceMappingURL=index.js.map
