import { gsap }         from '../gsap.js';
// import { gsap }         from './gsapNPM.js';

import { Position }     from '@typhonjs-fvtt/svelte/application';

import { GsapPosition } from './GsapPosition.js';
import { TimelineImpl } from './TimelineImpl.js';

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
export class GsapCompose
{
   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population for Position tweens.
    *
    * @returns {object} GSAP tween
    */
   static from(target, vars, options)
   {
      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('from', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.from(target, vars);
   }

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
   static fromTo(target, fromVars, toVars, options)
   {
      if (typeof fromVars !== 'object')
      {
         throw new TypeError(`GsapCompose.fromTo error: 'fromVars' is not an object.`);
      }

      if (typeof toVars !== 'object')
      {
         throw new TypeError(`GsapCompose.fromTo error: 'toVars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('fromTo', target, options, fromVars, toVars);

      return positionTween !== void 0 ? positionTween : gsap.fromTo(target, fromVars, toVars);
   }

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
   static quickTo(target, key, vars, options)
   {
      if (typeof key !== 'string')
      {
         throw new TypeError(`GsapCompose.quickTo error: 'key' is not a string.`);
      }

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.quickTo error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionQuickTo = s_DISPATCH_POSITION('quickTo', target, options, key, vars);

      return positionQuickTo !== void 0 ? positionQuickTo : gsap.quickTo(target, key, vars);
   }

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
   static timeline(target, arg1, arg2, arg3)
   {
      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTimeline = s_DISPATCH_POSITION('timeline', target, arg1, arg2, arg3);
      if (positionTimeline !== void 0) { return positionTimeline; }

      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = typeof arg1 === 'object' ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = Array.isArray(arg1) ? arg1 : arg2;

      /** @type {GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!Array.isArray(gsapData))
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an array.`);
      }

      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      // Validate gsapData.
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         if (typeof entry !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: 'gsapData[${cntr}]' is not an object.`);
         }

         s_VALIDATE_OPTIONS(entry, cntr);
      }

      const timeline = gsap.timeline(timelineOptions);

      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         const type = entry.type;

         switch (type)
         {
            case 'add':
               TimelineImpl.add(timeline, entry, cntr);
               break;

            case 'addLabel':
               TimelineImpl.addLabel(timeline, entry, cntr);
               break;

            case 'addPause':
               TimelineImpl.addPause(timeline, entry, cntr);
               break;

            case 'call':
               TimelineImpl.call(timeline, entry, cntr);
               break;

            case 'from':
               timeline.from(target, entry.vars, entry.position);
               break;

            case 'fromTo':
               timeline.fromTo(target, entry.fromVars, entry.toVars, entry.position);
               break;

            case 'set':
               timeline.set(target, entry.vars, entry.position);
               break;

            case 'to':
               timeline.to(target, entry.vars, entry.position);
               break;

            default:
               throw new Error(`GsapCompose.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }

      return timeline;
   }

   /**
    * @param {GSAPTarget} target - A standard GSAP target or Position.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP tween
    */
   static to(target, vars, options)
   {
      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapCompose.to error: 'vars' is not an object.`);
      }

      // If target is Position related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('to', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.to(target, vars);
   }
}

function s_DISPATCH_POSITION(operation, target, options, arg1, arg2)
{
   if (target instanceof Position)
   {
      return GsapPosition[operation](target, options, arg1, arg2);
   }
   else if (typeof target === 'object' && target.position instanceof Position)
   {
      return GsapPosition[operation](target.position, options, arg1, arg2);
   }
   else if (Array.isArray(target))
   {
      let hasPosition = false;
      let allPosition = true;

      for (const entry of target)
      {
         const isPosition = entry instanceof Position || entry?.position instanceof Position;

         hasPosition |= isPosition;
         if (!isPosition) { allPosition = false; }
      }

      if (hasPosition)
      {
         if (!allPosition)
         {
            throw new TypeError(
             `GsapCompose.${operation} error: 'target' is an array but all entries are not a Position instance.`);
         }
         else
         {
            return GsapPosition[operation](target, options, arg1, arg2);
         }
      }
   }

   return void 0;
}

/**
 * Validates data for Position related properties: 'from', 'fromTo', 'set', 'to'. Also adds all properties found
 * in Gsap entry data to s_POSITION_PROPS, so that just the properties being animated are added to animated
 * `positionData`.
 *
 * @param {object}   entry - Gsap entry data.
 *
 * @param {number}   cntr - Current index.
 */
function s_VALIDATE_OPTIONS(entry, cntr)
{
   const position = entry.position;

   if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
   {
      throw new TypeError(
       `GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
   }

   switch (entry.type)
   {
      case 'from':
      case 'to':
      case 'set':
      {
         const vars = entry.vars;

         if (typeof vars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'vars' object.`);
         }

         break;
      }

      case 'fromTo':
      {
         const fromVars = entry.fromVars;
         const toVars = entry.toVars;

         if (typeof fromVars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
         }

         if (typeof toVars !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
         }

         break;
      }
   }
}

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
 * @typedef {string|object|Position|Position[]|Array<HTMLElement|object>} GSAPTarget
 */
