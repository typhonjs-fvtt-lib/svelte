import { gsap }         from '../gsap.js';

import { TJSPosition }  from '#runtime/svelte/store/position';

import {
   isIterable,
   isObject,
   isPlainObject }      from '#runtime/util/object';

import { GsapPosition } from './GsapPosition.js';
import { TimelineImpl } from './TimelineImpl.js';

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
export class GsapCompose
{
   /**
    * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population for
    *        TJSPosition tweens.
    *
    * @returns {object} GSAP tween
    */
   static from(target, vars, options)
   {
      if (!isObject(vars))
      {
         throw new TypeError(`GsapCompose.from error: 'vars' is not an object.`);
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('from', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.from(target, vars);
   }

   /**
    * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP tween
    */
   static fromTo(target, fromVars, toVars, options)
   {
      if (!isObject(fromVars))
      {
         throw new TypeError(`GsapCompose.fromTo error: 'fromVars' is not an object.`);
      }

      if (!isObject(toVars))
      {
         throw new TypeError(`GsapCompose.fromTo error: 'toVars' is not an object.`);
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('fromTo', target, options, fromVars, toVars);

      return positionTween !== void 0 ? positionTween : gsap.fromTo(target, fromVars, toVars);
   }

   /**
    * Checks the `gsap` module instance for existence of a method and GsapCompose for the same method name. This
    * is helpful to determine which new features are available. Ex. `quickTo` is not available until GSAP `3.10+`.
    *
    * @param {string}   name - Name of method to check.
    *
    * @returns {boolean} Gsap and GsapCompose support the given method.
    */
   static hasMethod(name)
   {
      return typeof gsap[name] === 'function' && typeof this[name] === 'function';
   }

   /**
    * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(target, key, vars, options)
   {
      if (typeof key !== 'string')
      {
         throw new TypeError(`GsapCompose.quickTo error: 'key' is not a string.`);
      }

      if (!isObject(vars))
      {
         throw new TypeError(`GsapCompose.quickTo error: 'vars' is not an object.`);
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionQuickTo = s_DISPATCH_POSITION('quickTo', target, options, key, vars);

      return positionQuickTo !== void 0 ? positionQuickTo : gsap.quickTo(target, key, vars);
   }

   /**
    * Defers to `gsap` module to register an easing function.
    *
    * @param {string}   name - Easing name.
    *
    * @param {Function} ease - An easing function.
    */
   static registerEase(name, ease)
   {
      gsap.registerEase(name, ease);
   }

   /**
    * Defers to `gsap` module to register a plugin.
    *
    * @param {...Function} args - A list of plugins.
    */
   static registerPlugin(...args)
   {
      gsap.registerPlugin(...args);
   }

   /**
    * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object | import('../').GsapData}   [arg1] - Either an object defining timeline options or GsapData.
    *
    * @param {import('../').GsapData | import('../').GsapPositionOptions} [arg2] - When arg1 is defined as an object;
    *        arg2 defines GsapData.
    *
    * @param {import('../').GsapPositionOptions} [arg3] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(target, arg1, arg2, arg3)
   {
      // When an object and not iterable assume an object literal as timeline options.
      // This allows through `GsapCompose.timeline()` and `GsapCompose.timeline({ <TIMELINE_OPTIONS> })`.
      if (target === void 0 || (isPlainObject(target) && arg1 === void 0))
      {
         return gsap.timeline(target);
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionTimeline = s_DISPATCH_POSITION('timeline', target, arg1, arg2, arg3);
      if (positionTimeline !== void 0) { return positionTimeline; }

      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = isObject(arg1) ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = isIterable(arg1) ? arg1 : arg2;

      /** @type {import('../').GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (!isObject(timelineOptions))
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!isIterable(gsapData))
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an iterable list.`);
      }

      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      // Validate gsapData.
      let index = 0;

      for (const entry of gsapData)
      {
         if (!isObject(entry))
         {
            throw new TypeError(`GsapCompose.timeline error: 'gsapData[${index}]' is not an object.`);
         }

         s_VALIDATE_OPTIONS(entry, index);

         index++;
      }

      index = 0;

      const timeline = gsap.timeline(timelineOptions);

      for (const entry of gsapData)
      {
         const type = entry.type;

         switch (type)
         {
            case 'add':
               TimelineImpl.add(timeline, entry, index);
               break;

            case 'addLabel':
               TimelineImpl.addLabel(timeline, entry, index);
               break;

            case 'addPause':
               TimelineImpl.addPause(timeline, entry, index);
               break;

            case 'call':
               TimelineImpl.call(timeline, entry, index);
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
               throw new Error(`GsapCompose.timeline error: gsapData[${index}] unknown 'type' - '${type}'`);
         }

         index++;
      }

      return timeline;
   }

   /**
    * @param {import('../').GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP tween
    */
   static to(target, vars, options)
   {
      if (!isObject(vars))
      {
         throw new TypeError(`GsapCompose.to error: 'vars' is not an object.`);
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionTween = s_DISPATCH_POSITION('to', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.to(target, vars);
   }
}

/**
 * @param {string}            operation - GsapPosition function to invoke.
 *
 * @param {TJSPosition | object}   [target] -
 *
 * @param {object}            [options] -
 *
 * @param {*}                 [arg1] -
 *
 * @param {*}                 [arg2] -
 *
 * @returns {*} GsapPosition function result.
 */
function s_DISPATCH_POSITION(operation, target, options, arg1, arg2)
{
   if (target instanceof TJSPosition)
   {
      return GsapPosition[operation](target, options, arg1, arg2);
   }
   else if (isObject(target) && target.position instanceof TJSPosition)
   {
      return GsapPosition[operation](target.position, options, arg1, arg2);
   }
   else if (isIterable(target))
   {
      let hasPosition = false;
      let allPosition = true;

      for (const entry of target)
      {
         const isPosition = entry instanceof TJSPosition || entry?.position instanceof TJSPosition;

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
 * Validates data for TJSPosition related properties: 'from', 'fromTo', 'set', 'to'. Also adds all properties found
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

         if (!isObject(vars))
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'vars' object.`);
         }

         break;
      }

      case 'fromTo':
      {
         const fromVars = entry.fromVars;
         const toVars = entry.toVars;

         if (!isObject(fromVars))
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
         }

         if (!isObject(toVars))
         {
            throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
         }

         break;
      }
   }
}
