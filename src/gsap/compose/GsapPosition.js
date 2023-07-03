import { gsap }         from '../gsap.js';

import { TJSPosition }  from '#runtime/svelte/store/position';

import {
   isIterable,
   isObject }           from '#runtime/util/object';

import { TimelineImpl } from './TimelineImpl.js';
/**
 * Stores the entry types that potentially use the generated initial position data.
 *
 * @type {Set<string>}
 */
const s_TYPES_POSITION = new Set(['from', 'fromTo', 'set', 'to']);

/**
 * Stores the TJSPosition properties in order to create the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_KEYS = new Set([
 // Main keys
 'left', 'top', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'width', 'height',
  'rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ', 'zIndex',

 // Aliases
 'rotation'
]);

/**
 * Stores the seen TJSPosition properties when building the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_PROPS = new Set();

/**
 * Defines the options for {@link TJSPosition.get}.
 *
 * @type {{keys: Set<string>, numeric: boolean}}
 */
const s_POSITION_GET_OPTIONS = {
   keys: s_POSITION_PROPS,
   numeric: true
};

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
export class GsapPosition
{
   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @returns {object} GSAP tween
    */
   static from(tjsPosition, options, vars)
   {
      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the TJSPosition keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.from(positionData, vars);
   }

   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @returns {object} GSAP tween
    */
   static fromTo(tjsPosition, options, fromVars, toVars)
   {
      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the TJSPosition keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in fromVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in toVars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = s_GET_POSITIONINFO(tjsPosition, toVars, filter).positionData;

      return gsap.fromTo(positionData, fromVars, toVars);
   }

   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(tjsPosition, options, key, vars)
   {
      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the TJSPosition keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      // Add specific key specified to initial `positionData`.
      if (s_POSITION_KEYS.has(key)) { s_POSITION_PROPS.add(key); }

      const positionData = s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.quickTo(positionData, key, vars);
   }

   /**
    * @param {TJSPosition | Iterable<TJSPosition>}   tjsPosition - TJSPosition instance.
    *
    * @param {object | import('../').GsapData}  arg1 - Either an object defining timelineOptions or GsapData.
    *
    * @param {import('../').GsapData | import('../').GsapPositionOptions}  [arg2] - When arg1 is defined as an object;
    *        arg2 defines GsapData.
    *
    * @param {import('../').GsapPositionOptions}   [arg3] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(tjsPosition, arg1, arg2, arg3)
   {
      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = isObject(arg1) ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = isIterable(arg1) || typeof arg1 === 'function' ? arg1 : arg2;

      /** @type {import('../').GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (!isObject(timelineOptions))
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!isIterable(gsapData) && typeof gsapData !== 'function')
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an iterable list or function.`);
      }

      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      const positionInfo = s_GET_POSITIONINFO(tjsPosition, timelineOptions, filter, gsapData);

      const optionPosition = options?.position;

      const timeline = gsap.timeline(timelineOptions);

      // If the passed in gsapData is a function then we know we are working w/ individual positions, so create
      // sub timelines for each position instance.
      if (typeof gsapData === 'function')
      {
         if (typeof optionPosition === 'function')
         {
            const positionCallbackData = {
               index: void 0,
               position: void 0,
               positionData: void 0,
               data: void 0,
               element: void 0,
               gsapData: void 0
            };

            for (let index = 0; index < positionInfo.gsapData.length; index++)
            {
               const subTimeline = gsap.timeline();

               positionCallbackData.index = index;
               positionCallbackData.position = positionInfo.position[index];
               positionCallbackData.positionData = positionInfo.positionData[index];
               positionCallbackData.data = positionInfo.data[index];
               positionCallbackData.element = positionInfo.elements[index];
               positionCallbackData.gsapData = positionInfo.gsapData[index];

               const positionTimeline = optionPosition(positionCallbackData);

               TimelinePositionImpl.handleGsapData(positionInfo.gsapData[index], subTimeline,
                positionInfo.positionData[index], positionInfo.elements[index]);

               timeline.add(subTimeline, positionTimeline);
            }
         }
         else
         {
            for (let index = 0; index < positionInfo.gsapData.length; index++)
            {
               const subTimeline = gsap.timeline();

               TimelinePositionImpl.handleGsapData(positionInfo.gsapData[index], subTimeline,
                positionInfo.positionData[index], positionInfo.elements[index]);

               timeline.add(subTimeline, optionPosition);
            }
         }
      }
      else
      {
         const gsapDataSingle = positionInfo.gsapData[0];

         // If `position` option is defined then handle each TJSPosition instance as a sub-timeline.
         if (typeof optionPosition !== void 0)
         {
            let index = 0;

            const positionCallbackData = {
               index,
               position: void 0,
               positionData: void 0,
               data: void 0,
               element: void 0,
               gsapData: void 0     // Note: When using JSON.stringify `gsapData` will cause a circular structure.
            };

            const isFunction = typeof optionPosition === 'function';

            for (;index < positionInfo.position.length; index++)
            {
               if (isFunction)
               {
                  positionCallbackData.index = index;
                  positionCallbackData.position = positionInfo.position[index];
                  positionCallbackData.positionData = positionInfo.positionData[index];
                  positionCallbackData.data = positionInfo.data[index];
                  positionCallbackData.element = positionInfo.elements[index];
                  positionCallbackData.gsapData = gsapDataSingle;

                  const positionTimeline = optionPosition(positionCallbackData);

                  const subTimeline = gsap.timeline();

                  TimelinePositionImpl.handleGsapData(gsapDataSingle, subTimeline, positionInfo.positionData[index],
                   positionInfo.elements[index]);

                  timeline.add(subTimeline, positionTimeline);
               }
               else
               {
                  const subTimeline = gsap.timeline();

                  TimelinePositionImpl.handleGsapData(gsapDataSingle, subTimeline, positionInfo.positionData[index],
                   positionInfo.elements[index]);

                  timeline.add(subTimeline, optionPosition);
               }
            }
         }
         else
         {
            TimelinePositionImpl.handleGsapData(gsapDataSingle, timeline, positionInfo.positionData,
             positionInfo.elements);
         }
      }

      return timeline;
   }

   /**
    * @param {TJSPosition | TJSPosition[]} tjsPosition - TJSPosition instance.
    *
    * @param {import('../').GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @returns {object} GSAP tween
    */
   static to(tjsPosition, options, vars)
   {
      if (options !== void 0 && !isObject(options))
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the TJSPosition keys that are in vars.
      s_POSITION_PROPS.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { s_POSITION_PROPS.add(prop); }
      }

      for (const prop in vars)
      {
         if (s_POSITION_KEYS.has(prop)) { s_POSITION_PROPS.add(prop); }
      }

      const positionData = s_GET_POSITIONINFO(tjsPosition, vars, filter).positionData;

      return gsap.to(positionData, vars);
   }
}

/**
 * Internal helper class for timeline implementation. Performs error checking before applying any timeline actions.
 */
class TimelinePositionImpl
{
   /**
    * Gets the target from GSAP data entry.
    *
    * @param {(
    *    import('#runtime/svelte/store/position').TJSPositionDataExtended |
    *    import('#runtime/svelte/store/position').TJSPositionDataExtended[]
    * )}  positionData - PositionInfo data.
    *
    * @param {HTMLElement|HTMLElement[]}  elements - One or more HTMLElements.
    *
    * @param {object}         entry - Gsap data entry.
    *
    * @param {number}         cntr - Current GSAP data entry index.
    *
    * @returns {(
    *    import('#runtime/svelte/store/position').TJSPositionDataExtended |
    *    import('#runtime/svelte/store/position').TJSPositionDataExtended[] |
    *    HTMLElement|HTMLElement[]
    * )} The target object or HTMLElement.
    */
   static getTarget(positionData, elements, entry, cntr)
   {
      const target = entry.target ?? 'position';

      switch (target)
      {
         case 'position':
            return positionData;
         case 'element':
            return elements;
         default:
            throw new Error(`GsapCompose.timeline error: 'gsapData[${cntr}]' unknown 'target' - '${target}'.`);
      }
   }

   static handleGsapData(gsapData, timeline, positionData, elements)
   {
      let index = 0;

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
               timeline.from(this.getTarget(positionData, elements, entry, index), entry.vars, entry.position);
               break;

            case 'fromTo':
               timeline.fromTo(this.getTarget(positionData, elements, entry, index), entry.fromVars, entry.toVars,
                entry.position);
               break;

            case 'set':
               timeline.set(this.getTarget(positionData, elements, entry, index), entry.vars, entry.position);
               break;

            case 'to':
               timeline.to(this.getTarget(positionData, elements, entry, index), entry.vars, entry.position);
               break;

            default:
               throw new Error(`GsapCompose.timeline error: gsapData[${index}] unknown 'type' - '${type}'`);
         }

         index++;
      }
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
   static validatePositionProp(entry, cntr)
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

            // Only retrieve the TJSPosition keys that are in vars.
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

            if (!isObject(fromVars))
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
            }

            if (!isObject(toVars))
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
            }

            // Only retrieve the TJSPosition keys that are in fromVars / toVars.
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
 * @param {TJSPosition|Iterable<TJSPosition>}   tjsPositions -
 *
 * @param {object}                        vars -
 *
 * @param {Function}                      filter -
 *
 * @param {object[]|Function}             [gsapData] -
 *
 * @returns {import('../').PositionInfo} A PositionInfo instance.
 */
function s_GET_POSITIONINFO(tjsPositions, vars, filter, gsapData)
{
   /** @type {import('../').PositionInfo} */
   const positionInfo = {
      position: [],
      positionData: [],
      data: [],
      elements: [],
      gsapData: [],
   };

   // If gsapData is a function invoke it w/ the current TJSPosition instance and position data to retrieve a unique
   // gsapData object. If null / undefined is returned this entry is ignored.
   if (typeof gsapData === 'function')
   {
      let index = 0;

      const gsapDataOptions = {
         index,
         position: void 0,
         data: void 0
      };

      const populateData = (entry) =>
      {
         const isPosition = entry instanceof TJSPosition;

         gsapDataOptions.index = index++;
         gsapDataOptions.position = isPosition ? entry : entry.position;
         gsapDataOptions.data = isPosition ? void 0 : entry;

         const finalGsapData = gsapData(gsapDataOptions);

         if (!isObject(finalGsapData))
         {
            throw new TypeError(
             `GsapCompose error: gsapData callback function iteration(${index - 1}) failed to return an object.`);
         }

         s_VALIDATE_GSAPDATA_ENTRY(finalGsapData);

         positionInfo.gsapData.push(finalGsapData);
      };

      if (isIterable(tjsPositions))
      {
         for (const entry of tjsPositions) { populateData(entry); }
      }
      else
      {
         populateData(tjsPositions);
      }
   }
   else if (isIterable(gsapData))
   {
      s_VALIDATE_GSAPDATA_ENTRY(gsapData);

      positionInfo.gsapData.push(gsapData);
   }

   const existingOnUpdate = vars.onUpdate;

   if (isIterable(tjsPositions))
   {
      for (const entry of tjsPositions)
      {
         const isPosition = entry instanceof TJSPosition;

         const position = isPosition ? entry : entry.position;
         const data = isPosition ? void 0 : entry;
         const positionData = position.get({ immediateElementUpdate: true }, s_POSITION_GET_OPTIONS);

         positionInfo.position.push(position);
         positionInfo.positionData.push(positionData);
         positionInfo.data.push(data);
         positionInfo.elements.push(position.element);
      }
   }
   else
   {
      const isPosition = tjsPositions instanceof TJSPosition;

      const position = isPosition ? tjsPositions : tjsPositions.position;
      const data = isPosition ? void 0 : tjsPositions;
      const positionData = position.get({ immediateElementUpdate: true }, s_POSITION_GET_OPTIONS);

      positionInfo.position.push(position);
      positionInfo.positionData.push(positionData);
      positionInfo.data.push(data);
      positionInfo.elements.push(position.element);
   }

   if (typeof filter === 'function')
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < positionInfo.position.length; cntr++)
            {
               positionInfo.position[cntr].set(filter(positionInfo.positionData[cntr]));
            }
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < positionInfo.position.length; cntr++)
            {
               positionInfo.position[cntr].set(filter(positionInfo.positionData[cntr]));
            }
         };
      }
   }
   else
   {
      // Preserve invoking existing onUpdate function.
      if (typeof existingOnUpdate === 'function')
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < positionInfo.position.length; cntr++)
            {
               positionInfo.position[cntr].set(positionInfo.positionData[cntr]);
            }
            existingOnUpdate();
         };
      }
      else
      {
         vars.onUpdate = () =>
         {
            for (let cntr = 0; cntr < positionInfo.position.length; cntr++)
            {
               positionInfo.position[cntr].set(positionInfo.positionData[cntr]);
            }
         };
      }
   }

   return positionInfo;
}

/**
 * Validates `gsapData` entries.
 *
 * @param {Iterable<object>} gsapData - GsapData array.
 */
function s_VALIDATE_GSAPDATA_ENTRY(gsapData)
{
   let index = 0;

   for (const entry of gsapData)
   {
      if (!isObject(entry))
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData[${index}]' is not an object.`);
      }

      // Determine if any of the entries has a position related type and targets position by explicit value or by
      // default. Build up only the position properties that are being modified by all entries. This allows maximum
      // composability when animating multiple non-overlapping properties in a timeline.
      if (s_TYPES_POSITION.has(entry.type) && (entry.target === void 0 || entry.target === 'position'))
      {
         TimelinePositionImpl.validatePositionProp(entry, index);
      }

      index++;
   }
}
