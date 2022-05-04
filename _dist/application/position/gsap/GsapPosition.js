import { gsap }         from '@typhonjs-fvtt/svelte/gsap';

import { Position }     from '../Position.js';
import { TimelineImpl } from './TimelineImpl.js';

/**
 * Stores the entry types that potentially use the generated initial position data.
 *
 * @type {Set<string>}
 */
const s_TYPES_POSITION = new Set(['from', 'fromTo', 'set', 'to']);

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
export class GsapPosition
{
   /**
    * @param {Position} trlPosition -
    *
    * @param {object}   vars -
    *
    * @returns {object} GSAP tween
    */
   static from(trlPosition, vars)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.from error: 'trlPosition' is not an instance of Position.`);
      }

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.from error: 'vars' is not an object.`);
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true });

      const existingOnUpdate = vars.onUpdate;

      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            trlPosition.set(positionData);
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () => trlPosition.set(positionData);
      }

      return gsap.from(positionData, vars);
   }

   /**
    * @param {Position} trlPosition -
    *
    * @param {object}   fromVars -
    *
    * @param {object}   toVars -
    *
    * @returns {object} GSAP tween
    */
   static fromTo(trlPosition, fromVars, toVars)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.fromTo error: 'trlPosition' is not an instance of Position.`);
      }

      if (typeof fromVars !== 'object')
      {
         throw new TypeError(`GsapPosition.fromTo error: 'fromVars' is not an object.`);
      }

      if (typeof toVars !== 'object')
      {
         throw new TypeError(`GsapPosition.fromTo error: 'fromVars' is not an object.`);
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true });

      const existingOnUpdate = toVars.onUpdate;

      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         toVars.onUpdate = () =>
         {
            trlPosition.set(positionData);
            existingOnUpdate();
         };
      }
      else
      {
         toVars.onUpdate = () => trlPosition.set(positionData);
      }

      return gsap.fromTo(positionData, fromVars, toVars);
   }

   /**
    * @param {Position} trlPosition -
    *
    * @param {object}   timelineOptions -
    *
    * @param {object[]} gsapData -
    *
    * @returns {object} GSAP timeline
    */
   static timeline(trlPosition, timelineOptions = {}, gsapData)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.timeline error: 'trlPosition' is not an instance of Position.`);
      }

      if (!Array.isArray(gsapData))
      {
         throw new TypeError(`GsapPosition.timeline error: 'gsapData' is not an array.`);
      }

      let hasPositionUpdates = false;

      // Validate gsapData.
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         if (typeof entry !== 'object')
         {
            throw new TypeError(`GsapPosition.timeline error: 'gsapData[${cntr}]' is not an object.`);
         }

         // Determine if any of the entries has a position related type and targets position by explicit value or by
         // default.
         if (s_TYPES_POSITION.has(entry.type) && (entry.target === void 0 || entry.target === 'position'))
         {
            hasPositionUpdates = true;
         }
      }

      let positionData;

      if (hasPositionUpdates)
      {
         positionData = trlPosition.get({ immediateElementUpdate: true });

         const existingOnUpdate = timelineOptions.onUpdate;

         // Preserve invoking existing onUpdate function.
         if (typeof existingOnUpdate === 'function')
         {
            timelineOptions.onUpdate = () =>
            {
               trlPosition.set(positionData);
               existingOnUpdate();
            };
         }
         else
         {
            timelineOptions.onUpdate = () => trlPosition.set(positionData);
         }
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
               TimelineImpl.from(timeline, trlPosition, positionData, entry, cntr);
               break;

            case 'fromTo':
               TimelineImpl.fromTo(timeline, trlPosition, positionData, entry, cntr);
               break;

            case 'set':
               TimelineImpl.set(timeline, trlPosition, positionData, entry, cntr);
               break;

            case 'to':
               TimelineImpl.to(timeline, trlPosition, positionData, entry, cntr);
               break;

            default:
               throw new Error(`GsapPosition.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }

      return timeline;
   }

   /**
    * @param {Position} trlPosition -
    *
    * @param {object}   vars -
    *
    * @returns {object} GSAP tween
    */
   static to(trlPosition, vars)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.to error: 'trlPosition' is not an instance of Position.`);
      }

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.to error: 'vars' is not an object.`);
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true });

      const existingOnUpdate = vars.onUpdate;

      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            trlPosition.set(positionData);
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () => trlPosition.set(positionData);
      }

      return gsap.to(positionData, vars);
   }
}
