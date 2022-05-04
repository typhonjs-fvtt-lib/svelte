import * as easingFuncs from 'svelte/easing';
import { Position } from '@typhonjs-fvtt/svelte/application';

let gsap = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/all.js');

try
{
   const module = await import(modulePath);
   gsap = module.gsap;

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(easingFuncs))
   {
      const name = `svelte-${prop}`;
      gsap.registerEase(name, easingFuncs[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
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
function animate(node, { type, ...args })
{
   const method = gsap[type];
   return method(node, args);
}

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
class GsapPosition
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
    * @param {object|object[]}   arg1 - Either an object defining timelineOptions or an array of gsapData entries.
    *
    * @param {object[]}          [arg2] - When arg1 is defined as an object; arg2 defines an array of gsapData entries.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(trlPosition, arg1, arg2)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.timeline error: 'trlPosition' is not an instance of Position.`);
      }

      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = typeof arg1 === 'object' ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = Array.isArray(arg1) ? arg1 : arg2;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: 'timelineOptions' is not an object.`);
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

class TimelineImpl
{
   static add(timeline, entry, cntr)
   {
      const child = entry.child;
      const position = entry.position;

      if (child === void 0)
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'child' property.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.add(child, position);
   }

   static addLabel(timeline, entry, cntr)
   {
      const label = entry.label;
      const position = entry.position;

      if (typeof label !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'label' is not a string.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.addLabel(label, position);
   }

   static addPause(timeline, entry, cntr)
   {
      const position = entry.position;
      const callback = entry.callback;
      const params = entry.params;

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      if (callback !== void 0 && typeof callback !== 'function')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'params' is not an array.`);
      }

      timeline.addPause(position, callback, params);
   }

   static call(timeline, entry, cntr)
   {
      const callback = entry.callback;
      const params = entry.params;
      const position = entry.position;

      if (typeof callback !== 'function')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'params' is not an array.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.call(callback, params, position);
   }

   static from(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = s_GET_TARGET(trlPosition, positionData, entry, cntr);
      const vars = entry.vars;
      const position = entry.position;

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'vars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.from(target, vars, position);
   }

   static fromTo(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = s_GET_TARGET(trlPosition, positionData, entry, cntr);
      const fromVars = entry.fromVars;
      const toVars = entry.toVars;
      const position = entry.position;

      if (typeof fromVars !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
      }

      if (typeof toVars !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.from(target, fromVars, toVars, position);
   }

   static set(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = s_GET_TARGET(trlPosition, positionData, entry, cntr);
      const vars = entry.vars;
      const position = entry.position;

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'vars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.set(target, vars, position);
   }

   static to(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = s_GET_TARGET(trlPosition, positionData, entry, cntr);
      const vars = entry.vars;
      const position = entry.position;

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'vars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.to(target, vars, position);
   }
}

/**
 * Gets the target from GSAP data entry.
 *
 * @param {Position}             trlPosition -
 *
 * @param {PositionDataExtended} positionData -
 *
 * @param {object}               entry -
 *
 * @param {number}               cntr - Current GSAP data entry index.
 *
 * @returns {PositionDataExtended|HTMLElement} The target object or HTMLElement.
 */
function s_GET_TARGET(trlPosition, positionData, entry, cntr)
{
   const target = entry.target ?? 'position';

   switch (target)
   {
      case 'position':
         return positionData;
      case 'element':
         return trlPosition.element;
      default:
         throw new Error(`GsapPosition.timeline error: 'gsapData[${cntr}]' unknown 'target' - '${target}'.`);
   }
}

export { GsapPosition, animate, gsap };
//# sourceMappingURL=index.js.map
