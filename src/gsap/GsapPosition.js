import { gsap }      from './gsap.js';

import { Position }  from '@typhonjs-fvtt/svelte/application';

/**
 * Stores the entry types that potentially use the generated initial position data.
 *
 * @type {Set<string>}
 */
const s_TYPES_POSITION = new Set(['from', 'fromTo', 'set', 'to']);

/**
 * Stores the Position properties in order to create the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_KEYS = new Set(['left', 'top', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'width', 'height',
 'rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ', 'zIndex']);

/**
 * Stores the seen Position properties when building the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_PROPS = new Set();

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
export class GsapPosition
{
   /**
    * @param {Position} trlPosition - Position instance.
    *
    * @param {object}   vars - GSAP vars object for `from`.
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

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();
      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true }, s_POSITION_PROPS);

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
    * @param {Position} trlPosition - Position instance.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
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

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();
      for (const prop in fromVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in toVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true }, s_POSITION_PROPS);

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
    * @param {Position} trlPosition - Position instance.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(trlPosition, key, vars)
   {
      if (!(trlPosition instanceof Position))
      {
         throw new TypeError(`GsapPosition.quickTo error: 'trlPosition' is not an instance of Position.`);
      }

      if (typeof vars !== 'object')
      {
         throw new TypeError(`GsapPosition.quickTo error: 'vars' is not an object.`);
      }

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();
      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true }, s_POSITION_PROPS);

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

      return gsap.quickTo(positionData, key, vars);
   }

   /**
    * @param {Position}          trlPosition - Position instance.
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

      let positionData;
      s_POSITION_PROPS.clear();

      // Validate gsapData.
      for (let cntr = 0; cntr < gsapData.length; cntr++)
      {
         const entry = gsapData[cntr];

         if (typeof entry !== 'object')
         {
            throw new TypeError(`GsapPosition.timeline error: 'gsapData[${cntr}]' is not an object.`);
         }

         // Determine if any of the entries has a position related type and targets position by explicit value or by
         // default. Build up only the position properties that are being modified by all entries. This allows maximum
         // composability when animating multiple non-overlapping properties in a timeline.
         if (s_TYPES_POSITION.has(entry.type) && (entry.target === void 0 || entry.target === 'position'))
         {
            // Initialize positionData.
            if (!hasPositionUpdates) { positionData = { immediateElementUpdate: true }; }

            hasPositionUpdates = true;

            TimelineImpl.validatePositionProp(entry, cntr);
         }
      }

      if (hasPositionUpdates)
      {
         // positionData = trlPosition.get({ immediateElementUpdate: true });
         trlPosition.get(positionData, s_POSITION_PROPS);

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
               timeline.from(s_GET_TARGET(trlPosition, positionData, entry, cntr), entry.vars, entry.position);
               break;

            case 'fromTo':
               timeline.fromTo(s_GET_TARGET(trlPosition, positionData, entry, cntr), entry.fromVars, entry.toVars,
                entry.position);
               break;

            case 'set':
               timeline.set(s_GET_TARGET(trlPosition, positionData, entry, cntr), entry.vars, entry.position);
               break;

            case 'to':
               timeline.to(s_GET_TARGET(trlPosition, positionData, entry, cntr), entry.vars, entry.position);
               break;

            default:
               throw new Error(`GsapPosition.timeline error: gsapData[${cntr}] unknown 'type' - '${type}'`);
         }
      }

      return timeline;
   }

   /**
    * @param {Position} trlPosition - Position instance.
    *
    * @param {object}   vars - GSAP vars object for `to`.
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

      // Only retrieve the Position keys that are in vars.
      s_POSITION_PROPS.clear();
      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = trlPosition.get({ immediateElementUpdate: true }, s_POSITION_PROPS);

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

/**
 * Internal helper class for timeline implementation. Performs error checking before applying any timeline actions.
 */
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

   /**
    * Validates data for Position related properties: 'from', 'fromTo', 'set', 'to'. Also adds all properties found
    * in Gsap entry data to s_POSITION_PROPS, so that just the properties being animated are added to animated
    * `positionData`.
    *
    * @param {object}   entry - Gsap entry data.
    *
    * @param {number}   cntr - Current index.
    */
   static validatePositionProp(entry, cntr)
   {
      const position = entry.position;

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(
          `GsapPosition.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
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
               throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'vars' object.`);
            }

            // Only retrieve the Position keys that are in vars.
            for (const prop in vars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            break;
         }

         case 'fromTo':
         {
            const fromVars = entry.fromVars;
            const toVars = entry.toVars;

            if (typeof fromVars !== 'object')
            {
               throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
            }

            if (typeof toVars !== 'object')
            {
               throw new TypeError(`GsapPosition.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
            }

            // Only retrieve the Position keys that are in fromVars / toVars.
            for (const prop in fromVars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            for (const prop in toVars)
            {
               if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
            }

            break;
         }
      }
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
