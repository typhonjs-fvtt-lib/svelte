import * as easingFuncs from 'svelte/easing';
import { Position } from '@typhonjs-fvtt/svelte/application';
import { isIterable } from '@typhonjs-fvtt/svelte/util';

let gsap = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/index.js');

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
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 */
async function gsapLoadPlugin(name)
{
   const modulePath = foundry.utils.getRoute(`/scripts/greensock/esm/${name}.js`);

   try
   {
      const module = await import(modulePath);
      return module.default;
   }
   catch (err)
   {
      console.error(`TyphonJS Runtime Library error; Could not load ${name} plugin from: '${modulePath}'`);
      console.error(err);
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
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'child' property.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.add(child, position);
   }

   static addLabel(timeline, entry, cntr)
   {
      const label = entry.label;
      const position = entry.position;

      if (typeof label !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'label' is not a string.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
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
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      if (callback !== void 0 && typeof callback !== 'function')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'params' is not an array.`);
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
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'callback' is not a function.`);
      }

      if (params !== void 0 && !Array.isArray(params))
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'params' is not an array.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.call(callback, params, position);
   }
}

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
const s_POSITION_KEYS = new Set([
 // Main keys
 'left', 'top', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 'width', 'height',
  'rotateX', 'rotateY', 'rotateZ', 'scale', 'translateX', 'translateY', 'translateZ', 'zIndex',

 // Aliases
 'rotation'
]);

/**
 * Stores the seen Position properties when building the minimum update data object when animating.
 *
 * @type {Set<string>}
 */
const s_POSITION_PROPS = new Set();

/**
 * Defines the options for {@link Position.get}.
 *
 * @type {{keys: Set<string>, numeric: boolean}}
 */
const s_POSITION_GET_OPTIONS = {
   keys: s_POSITION_PROPS,
   numeric: true
};

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapPosition
{
   /**
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @returns {object} GSAP tween
    */
   static from(tjsPosition, options, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
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
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @returns {object} GSAP tween
    */
   static fromTo(tjsPosition, options, fromVars, toVars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
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
    * @param {Position} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @returns {Function}  GSAP quickTo function.
    */
   static quickTo(tjsPosition, options, key, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
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
    * @param {Position|Iterable<Position>}   tjsPosition - Position instance.
    *
    * @param {object|GsapData}               arg1 - Either an object defining timelineOptions or GsapData.
    *
    * @param {GsapData|GsapPositionOptions}  [arg2] - When arg1 is defined as an object; arg2 defines GsapData.
    *
    * @param {GsapPositionOptions}           [arg3] - Options for filtering and initial data population.
    *
    * @returns {object} GSAP timeline
    */
   static timeline(tjsPosition, arg1, arg2, arg3)
   {
      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = typeof arg1 === 'object' ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = isIterable(arg1) || typeof arg1 === 'function' ? arg1 : arg2;

      /** @type {GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!isIterable(gsapData) && typeof gsapData !== 'function')
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an iterable list or function.`);
      }

      if (options !== void 0 && typeof options !== 'object')
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

         // If `position` option is defined then handle each Position instance as a sub-timeline.
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
    * @param {Position|Position[]} tjsPosition - Position instance.
    *
    * @param {GsapPositionOptions} [options] - Options for filtering and initial data population.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @returns {object} GSAP tween
    */
   static to(tjsPosition, options, vars)
   {
      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      const filter = options?.filter;
      const initialProps = options?.initialProps;

      // Only retrieve the Position keys that are in vars.
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
    * @param {PositionDataExtended|PositionDataExtended[]}  positionData - PositionInfo data.
    *
    * @param {HTMLElement|HTMLElement[]}  elements - One or more HTMLElements.
    *
    * @param {object}         entry - Gsap data entry.
    *
    * @param {number}         cntr - Current GSAP data entry index.
    *
    * @returns {PositionDataExtended|PositionDataExtended[]|HTMLElement|HTMLElement[]} The target object or HTMLElement.
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
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
            }

            if (typeof toVars !== 'object')
            {
               throw new TypeError(`GsapCompose.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
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
 * @param {Position|Iterable<Position>}   tjsPositions -
 *
 * @param {object}                        vars -
 *
 * @param {Function}                      filter -
 *
 * @param {object[]|Function}             [gsapData] -
 *
 * @returns {PositionInfo} A PositionInfo instance.
 */
function s_GET_POSITIONINFO(tjsPositions, vars, filter, gsapData)
{
   /** @type {PositionInfo} */
   const positionInfo = {
      position: [],
      positionData: [],
      data: [],
      elements: [],
      gsapData: [],
   };

   // If gsapData is a function invoke it w/ the current Position instance and position data to retrieve a unique
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
         const isPosition = entry instanceof Position;

         gsapDataOptions.index = index++;
         gsapDataOptions.position = isPosition ? entry : entry.position;
         gsapDataOptions.data = isPosition ? void 0 : entry;

         const finalGsapData = gsapData(gsapDataOptions);

         if (typeof finalGsapData !== 'object')
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
         const isPosition = entry instanceof Position;

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
      const isPosition = tjsPositions instanceof Position;

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
      if (typeof entry !== 'object')
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

/**
 * @typedef {object} PositionInfo
 *
 * @property {Position[]}              position -
 *
 * @property {PositionDataExtended[]}  positionData -
 *
 * @property {object[]}                data - Contains the full data object when a list of object w/ position is used.
 *
 * @property {HTMLElement[]}           elements -
 *
 * @property {Array<object[]>}         gsapData -
 */

/**
 * Provides a data driven ways to connect a {@link Position} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapCompose
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
    * @param {object|GsapData}   arg1 - Either an object defining timelineOptions or GsapData.
    *
    * @param {GsapData|GsapPositionOptions} [arg2] - When arg1 is defined as an object; arg2 defines GsapData.
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
      const gsapData = isIterable(arg1) ? arg1 : arg2;

      /** @type {GsapPositionOptions} */
      const options = gsapData === arg1 ? arg2 : arg3;

      if (typeof timelineOptions !== 'object')
      {
         throw new TypeError(`GsapCompose.timeline error: 'timelineOptions' is not an object.`);
      }

      if (!isIterable(gsapData))
      {
         throw new TypeError(`GsapCompose.timeline error: 'gsapData' is not an iterable list.`);
      }

      if (options !== void 0 && typeof options !== 'object')
      {
         throw new TypeError(`GsapCompose.from error: 'options' is not an object.`);
      }

      // Validate gsapData.
      let index = 0;

      for (const entry of gsapData)
      {
         if (typeof entry !== 'object')
         {
            throw new TypeError(`GsapCompose.timeline error: 'gsapData[${index}]' is not an object.`);
         }

         s_VALIDATE_OPTIONS(entry, index);

         index++;
      }

      const timeline = gsap.timeline(timelineOptions);

      index = 0;

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
   else if (isIterable(target))
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
 * @typedef {Iterable<object>|Function} GsapData
 */

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
 * @typedef {string|object|Position|Iterable<Position>|Array<HTMLElement|object>} GSAPTarget
 */

export { GsapCompose, gsap, gsapLoadPlugin };
//# sourceMappingURL=index.js.map
