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
         throw new TypeError(`PositionGSAP.timeline error: 'trlPosition' is not an instance of Position.`);
      }

      if (!Array.isArray(gsapData))
      {
         throw new TypeError(`PositionGSAP.timeline error: 'gsapData' is not an array.`);
      }

      let hasPositionUpdates = false;

      // Validate gsapData.
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         if (typeof entry !== 'object')
         {
            throw new TypeError(`PositionGSAP.timeline error: 'gsapData[${cntr}]' is not an object.`);
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
               throw new Error(`PositionGSAP.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }

      return timeline;
   }
}
