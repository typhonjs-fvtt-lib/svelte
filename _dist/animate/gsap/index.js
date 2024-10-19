import { easingFunc } from '@typhonjs-svelte/runtime-base/svelte/easing';
import { TJSVelocityTrack } from '@typhonjs-svelte/runtime-base/math/physics';
import { A11yHelper } from '@typhonjs-svelte/runtime-base/util/a11y';
import { isObject, isIterable, isPlainObject, klona } from '@typhonjs-svelte/runtime-base/util/object';
import { TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';

/**
 * The main GSAP object.
 *
 * @see https://greensock.com/docs/v3/GSAP
 */
let gsap = void 0;

/**
 * Note usage of `globalThis.location.origin` as this is the origin of the importing location which is necessary for
 * connecting to the Foundry server when the package is located on a CDN.
 *
 * @type {string}
 */
const modulePath = `${globalThis.location.origin}${foundry.utils.getRoute(`/scripts/greensock/esm/index.js`)}`;

/**
 * Provides a list of Gsap easing functions that are preconfigured and registered with `gsap`. `gsapEasingList`
 * is an index of all the function names that are available in the {@link gsapEasingFunc} object. Additionally, all
 * Svelte easing functions are loaded and prepended with `svelte-<function name>`.
 *
 * @type {ReadonlyArray<import('./types').GsapEasingFunctionName>}
 */
const gsapEasingList = [
   'back.in(1)',
   'back.inOut(1)',
   'back.out(1)',
   'back.in(10)',
   'back.inOut(10)',
   'back.out(10)',
   'bounce.in',
   'bounce.inOut',
   'bounce.out',
   'circ.in',
   'circ.inOut',
   'circ.out',
   'elastic.in(1, 0.5)',
   'elastic.inOut(1, 0.5)',
   'elastic.out(1, 0.5)',
   'elastic.in(10, 5)',
   'elastic.inOut(10, 5)',
   'elastic.out(10, 5)',
   'expo.in',
   'expo.inOut',
   'expo.out',
   'linear', // same as 'none'
   'power1.in',
   'power1.inOut',
   'power1.out',
   'power2.in',
   'power2.inOut',
   'power2.out',
   'power3.in',
   'power3.inOut',
   'power3.out',
   'power4.in',
   'power4.inOut',
   'power4.out',
   'sine.in',
   'sine.inOut',
   'sine.out',
   'steps(10)',
   'steps(100)'
];

/**
 * Provides an object of Gsap and Svelte easing functions that are preconfigured and registered with `gsap`.
 * {@link gsapEasingList} is an index of all the function names that are available in the `gsapEasingFunc` object. You may
 * use these functions with Gsap or Svelte.
 *
 * @type {Readonly<{ [key in import('./types').GsapEasingFunctionName]: import('#runtime/svelte/easing').EasingFunction }>}
 */
const gsapEasingFunc = {};

try
{
   const module = await import(/* @vite-ignore */modulePath);
   gsap = module.gsap;

   for (const entry of gsapEasingList)
   {
      gsapEasingFunc[entry] = entry === 'linear' ? (t) => t : gsap.parseEase(entry);
   }

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(easingFunc))
   {
      const name = `svelte-${prop}`;
      gsapEasingList.push(name);
      gsapEasingFunc[name] = easingFunc[prop];
      gsap.registerEase(name, easingFunc[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

gsapEasingList.sort();

Object.freeze(gsapEasingFunc);
Object.freeze(gsapEasingList);

/**
 * Performs a lookup for standard Gsap easing functions by name. All Svelte easing functions are also available by
 * prepending `svelte-<EASE_NAME>`. For convenience if passing in a function it is returned verbatim.
 *
 * @param {import('./types').GsapEasingReference} easingRef - The name of a standard GSAP easing function or an
 *        existing supplied easing function.
 *
 * @param {object}   [options] - Optional parameters.
 *
 * @param {import('./types').GsapEasingFunctionName | false} [options.default='linear'] - The default easing function
 *        name to apply. When specified as `false` no default fallback easing function is selected.
 *
 * @returns {import('#runtime/svelte/easing').EasingFunction} The requested easing function.
 */
function getGsapEasingFunc(easingRef, options)
{
   if (typeof easingRef === 'function') { return easingRef; }

   const easingFn = gsapEasingFunc[easingRef];

   return easingFn ? easingFn : gsapEasingFunc[options?.default ?? 'linear'];
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
 * Stores shared internal data for {@link GsapPosition}.
 */
class GsapPositionData
{
   /**
    * Stores the seen TJSPosition properties when building the minimum update data object when animating.
    *
    * @type {Set<keyof import('#runtime/svelte/store/position').Data.TJSPositionData>}
    */
   static tjsPositionProps = new Set();
}

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapPosition
{
   /**
    * Stores the entry types that potentially use the generated initial position data.
    *
    * @type {ReadonlySet<string>}
    */
   static #supportedEntryTypes = Object.freeze(new Set(['from', 'fromTo', 'set', 'to']));

   /**
    * Defines the options for {@link TJSPosition.get}.
    *
    * @type {(Readonly<{
    *    keys: Set<keyof import('#runtime/svelte/store/position').Data.TJSPositionData>,
    *    numeric: boolean
    * }>)}
    */
   static #tjsPositionGetOptions = Object.freeze({
      keys: GsapPositionData.tjsPositionProps,
      numeric: true
   });

   /**
    * Defines the options used for {@link TJSPosition.set}.
    *
    * @type {Readonly<{immediateElementUpdate: boolean}>}
    */
   static #tjsPositionSetOptions = Object.freeze({ immediateElementUpdate: true });

   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      GsapPositionData.tjsPositionProps.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      for (const prop in vars)
      {
         if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      const positionData = GsapPosition.#getPositionInfo(tjsPosition, vars, filter).positionData;

      return gsap.from(positionData, vars);
   }

   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      GsapPositionData.tjsPositionProps.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      for (const prop in fromVars)
      {
         if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      for (const prop in toVars)
      {
         if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      const positionData = GsapPosition.#getPositionInfo(tjsPosition, toVars, filter).positionData;

      return gsap.fromTo(positionData, fromVars, toVars);
   }

   /**
    * @param {TJSPosition} tjsPosition - TJSPosition instance.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      GsapPositionData.tjsPositionProps.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      // Add specific key specified to initial `positionData`.
      if (TJSPosition.Animate.isAnimationKey(key)) { GsapPositionData.tjsPositionProps.add(key); }

      const positionData = GsapPosition.#getPositionInfo(tjsPosition, vars, filter).positionData;

      return gsap.quickTo(positionData, key, vars);
   }

   /**
    * @param {TJSPosition | Iterable<TJSPosition>}   tjsPosition - TJSPosition instance.
    *
    * @param {object | import('./types').Compose.GsapData}  arg1 - Either an object defining timelineOptions or
    *        GsapData.
    *
    * @param {import('./types').Compose.GsapData | import('./types').Compose.GsapPositionOptions}  [arg2] - When arg1
    *        is defined as an object; arg2 defines GsapData.
    *
    * @param {import('./types').Compose.GsapPositionOptions}   [arg3] - Options for filtering and initial data
    *        population.
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

      /** @type {import('./types').Compose.GsapPositionOptions} */
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

      GsapPositionData.tjsPositionProps.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      const positionInfo = GsapPosition.#getPositionInfo(tjsPosition, timelineOptions, filter, gsapData);

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
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      GsapPositionData.tjsPositionProps.clear();

      // Add any initial props if defined.
      if (isIterable(initialProps))
      {
         for (const prop of initialProps) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      for (const prop in vars)
      {
         if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
      }

      const positionData = GsapPosition.#getPositionInfo(tjsPosition, vars, filter).positionData;

      return gsap.to(positionData, vars);
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * @param {TJSPosition|Iterable<TJSPosition>}   tjsPositions -
    *
    * @param {object}                        vars -
    *
    * @param {Function}                      filter -
    *
    * @param {object[]|Function}             [gsapData] -
    *
    * @returns {import('./types-local').TJSPositionInfo} A TJSPositionInfo instance.
    */
   static #getPositionInfo(tjsPositions, vars, filter, gsapData)
   {
      /** @type {import('./types-local').TJSPositionInfo} */
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

            if (!isIterable(finalGsapData))
            {
               throw new TypeError(
                `GsapCompose error: gsapData callback function iteration(${
                  index - 1}) failed to return an iterable list.`);
            }

            this.#validateGsapDataEntry(finalGsapData);

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
         this.#validateGsapDataEntry(gsapData);

         positionInfo.gsapData.push(gsapData);
      }

      // Ignore any existing `onUpdate` function if marked as coming from GsapPosition. This is set below.
      const existingOnUpdate = typeof vars.onUpdate?.fromGsapPosition === 'boolean' && vars.onUpdate.fromGsapPosition ?
       void 0 : vars.onUpdate;

      if (isIterable(tjsPositions))
      {
         for (const entry of tjsPositions)
         {
            const isPosition = entry instanceof TJSPosition;

            const position = isPosition ? entry : entry.position;
            const data = isPosition ? void 0 : entry;
            const positionData = position.get({}, this.#tjsPositionGetOptions);

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
         const positionData = position.get({}, this.#tjsPositionGetOptions);

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
                  positionInfo.position[cntr].set(filter(positionInfo.positionData[cntr]),
                   GsapPosition.#tjsPositionSetOptions);
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
                  positionInfo.position[cntr].set(filter(positionInfo.positionData[cntr]),
                   GsapPosition.#tjsPositionSetOptions);
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
                  positionInfo.position[cntr].set(positionInfo.positionData[cntr], GsapPosition.#tjsPositionSetOptions);
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
                  positionInfo.position[cntr].set(positionInfo.positionData[cntr], GsapPosition.#tjsPositionSetOptions);
               }
            };
         }
      }

      // Mark the update function as coming from GsapPosition.
      vars.onUpdate.fromGsapPosition = true;

      return positionInfo;
   }

   /**
    * Validates `gsapData` entries.
    *
    * @param {Iterable<object>} gsapData - GsapData array.
    */
   static #validateGsapDataEntry(gsapData)
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
         if (this.#supportedEntryTypes.has(entry.type) && (entry.target === void 0 || entry.target === 'position'))
         {
            TimelinePositionImpl.validatePositionProp(entry, index);
         }

         index++;
      }
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
    *    import('#runtime/svelte/store/position').Data.TJSPositionDataRelative |
    *    import('#runtime/svelte/store/position').Data.TJSPositionDataRelative[]
    * )}  positionData - TJSPositionInfo data.
    *
    * @param {HTMLElement | HTMLElement[]}  elements - One or more HTMLElements.
    *
    * @param {object}         entry - Gsap data entry.
    *
    * @param {number}         cntr - Current GSAP data entry index.
    *
    * @returns {(
    *    import('#runtime/svelte/store/position').Data.TJSPositionDataRelative |
    *    import('#runtime/svelte/store/position').Data.TJSPositionDataRelative[] |
    *    HTMLElement | HTMLElement[]
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
    * in Gsap entry data to GsapPositionData.tjsPositionProps, so that just the properties being animated are added to
    * animated `positionData`.
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
               if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
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
               if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
            }

            for (const prop in toVars)
            {
               if (TJSPosition.Animate.isAnimationKey(prop)) { GsapPositionData.tjsPositionProps.add(prop); }
            }

            break;
         }
      }
   }
}

/**
 * Provides a data driven ways to connect a {@link TJSPosition} instance with a GSAP timeline and tweens.
 *
 * {@link GsapPosition.timeline} supports the following types: 'add', 'addLabel', 'addPause', 'call', 'from',
 * 'fromTo', 'set', 'to'.
 */
class GsapCompose
{
   /**
    * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   vars - GSAP vars object for `from`.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population for TJSPosition tweens.
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
      const positionTween = this.#dispatchPosition('from', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.from(target, vars);
   }

   /**
    * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   fromVars - GSAP fromVars object for `fromTo`
    *
    * @param {object}   toVars - GSAP toVars object for `fromTo`.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      const positionTween = this.#dispatchPosition('fromTo', target, options, fromVars, toVars);

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
    * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {string}   key - Property of position to manipulate.
    *
    * @param {object}   vars - GSAP vars object for `quickTo`.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      const positionQuickTo = this.#dispatchPosition('quickTo', target, options, key, vars);

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
    * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object | import('./types').Compose.GsapData}   [arg1] - Either an object defining timeline options or
    *        GsapData.
    *
    * @param {object | import('./types').Compose.GsapData | import('./types').Compose.GsapPositionOptions} [arg2] -
    *        When arg1 is defined as an object / Function; arg2 defines GsapData or Gsap options.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [arg3] - Options for filtering and initial data population.
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

      // If target is an empty array then return an empty timeline.
      if (Array.isArray(target) && target.length === 0)
      {
         return gsap.timeline();
      }

      // If target is TJSPosition related attempt to dispatch to GsapPosition.
      const positionTimeline = this.#dispatchPosition('timeline', target, arg1, arg2, arg3);
      if (positionTimeline !== void 0) { return positionTimeline; }

      // Load the variable arguments from arg1 / arg2.
      // If arg1 is an object then take it as the timelineOptions.
      const timelineOptions = isObject(arg1) ? arg1 : {};

      // If arg1 is an array then take it as `gsapData` otherwise select arg2.
      const gsapData = isIterable(arg1) ? arg1 : arg2;

      /** @type {import('./types').Compose.GsapPositionOptions} */
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

         this.#validateOptions(entry, index);

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
    * @param {import('./types').Compose.GsapTarget} target - A standard GSAP target or TJSPosition.
    *
    * @param {object}   vars - GSAP vars object for `to`.
    *
    * @param {import('./types').Compose.GsapPositionOptions} [options] - Options for filtering and initial data
    *        population.
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
      const positionTween = this.#dispatchPosition('to', target, options, vars);

      return positionTween !== void 0 ? positionTween : gsap.to(target, vars);
   }

   // Internal implementation ----------------------------------------------------------------------------------------

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
   static #dispatchPosition(operation, target, options, arg1, arg2)
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
               throw new TypeError(`GsapCompose.${
                operation} error: 'target' is an iterable list but all entries are not a Position instance.`);
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
    * Validates data for TJSPosition related properties: 'from', 'fromTo', 'set', 'to'.
    *
    * @param {object}   entry - Gsap entry data.
    *
    * @param {number}   cntr - Current index.
    */
   static #validateOptions(entry, cntr)
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
}

/**
 * Provides an action to enable pointer dragging of an HTMLElement using GSAP `to` or `quickTo` to invoke `position.set`
 * on a given {@link TJSPosition} instance provided. You may provide a
 * `easeOptions` object sent to the tween to modify the duration / easing. When the attached boolean store state
 * changes the draggable action is enabled or disabled.
 *
 * Note: Requires GSAP `3.10+` for `quickTo` support.
 *
 * @param {HTMLElement}       node - The node associated with the action.
 *
 * @param {import('./types').Action.DraggableGsapOptions} options - Draggable Gsap options.
 *
 * @returns {import('svelte/action').ActionReturn<Partial<import('./types').Action.DraggableGsapOptions>>} Action
 *          lifecycle functions.
 */
function draggableGsap(node, { position, enabled = true, button = 0, storeDragging = void 0, tween = false,
 inertia = false, tweenOptions = { duration: 1, ease: 'power3.out' },
  inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 },
   hasTargetClassList, ignoreTargetClassList })
{
   if (hasTargetClassList !== void 0 && !isIterable(hasTargetClassList))
   {
      throw new TypeError(`'hasTargetClassList' is not iterable.`);
   }

   if (ignoreTargetClassList !== void 0 && !isIterable(ignoreTargetClassList))
   {
      throw new TypeError(`'ignoreTargetClassList' is not iterable.`);
   }

   const hasQuickTo = GsapCompose.hasMethod('quickTo');

   /**
    * Stores the initial X / Y on drag down.
    *
    * @type {object}
    */
   const initialDragPoint = { x: 0, y: 0 };

   /**
    * Used for direct call to `position.set`.
    *
    * @type {{top: number, left: number}}
    */
   const positionData = { left: 0, top: 0 };

   /**
    * Tracks velocity for inertia tween.
    */
   const velocityTrack = new TJSVelocityTrack();

   /**
    * Find actual position instance checking for a Positionable instance.
    *
    * @type {import('#runtime/svelte/store/position').TJSPosition}
    */
   let actualPosition = position?.position ?? position;

   /**
    * Duplicate the app / Positionable starting position to track differences.
    *
    * @type {object}
    */
   let initialPosition = null;

   /**
    * Stores the current dragging state and gates the move pointer as the dragging store is not
    * set until the first pointer move.
    *
    * @type {boolean}
    */
   let dragging = false;

   /**
    * Stores the inertia GSAP tween.
    *
    * @type {object}
    */
   let inertiaTween;

   /**
    * Event handlers associated with this action for addition / removal.
    *
    * @type {{ [p: string]: [string, EventListener, boolean] }}
    */
   const handlers = {
      dragDown: ['pointerdown', /** @type {EventListener} */ onDragPointerDown, false],
      dragMove: ['pointermove', /** @type {EventListener} */ onDragPointerChange, false],
      dragUp: ['pointerup', /** @type {EventListener} */ onDragPointerUp, false]
   };

   /**
    * Stores the `quickTo` functions.
    *
    * @type {Function}
    */
   let quickLeft, quickTop;

   /**
    * Stores the ease tween.
    *
    * @type {object}
    */
   let tweenTo;

   if (hasQuickTo)
   {
      quickLeft = GsapCompose.quickTo(actualPosition, 'left', { ...tweenOptions });
      quickTop = GsapCompose.quickTo(actualPosition, 'top', { ...tweenOptions });
   }

   /**
    * Activates listeners.
    */
   function activateListeners()
   {
      // Drag handlers
      node.addEventListener(...handlers.dragDown);
      node.classList.add('draggable');
   }

   /**
    * Removes listeners.
    */
   function removeListeners()
   {
      if (typeof storeDragging?.set === 'function') { storeDragging.set(false); }

      // Drag handlers
      node.removeEventListener(...handlers.dragDown);
      node.removeEventListener(...handlers.dragMove);
      node.removeEventListener(...handlers.dragUp);
      node.classList.remove('draggable');
   }

   if (enabled)
   {
      activateListeners();
   }

   /**
    * Handle the initial pointer down that activates dragging behavior for the positionable.
    *
    * @param {PointerEvent} event - The pointer down event.
    */
   function onDragPointerDown(event)
   {
      if (event.button !== button || !event.isPrimary) { return; }

      // Do not process if the position system is not enabled.
      if (!actualPosition.enabled) { return; }

      // Potentially ignore this event if `ignoreTargetClassList` is defined and the `event.target` has a matching
      // class.
      if (ignoreTargetClassList !== void 0 && A11yHelper.isFocusTarget(event.target))
      {
         for (const targetClass of ignoreTargetClassList)
         {
            if (event.target.classList.contains(targetClass)) { return; }
         }
      }

      // Potentially ignore this event if `hasTargetClassList` is defined and the `event.target` does not have any
      // matching class from the list.
      if (hasTargetClassList !== void 0 && A11yHelper.isFocusTarget(event.target))
      {
         let foundTarget = false;

         for (const targetClass of hasTargetClassList)
         {
            if (event.target.classList.contains(targetClass))
            {
               foundTarget = true;
               break;
            }
         }

         if (!foundTarget) { return; }
      }

      event.preventDefault();

      dragging = false;

      // Record initial position.
      initialPosition = actualPosition.get();
      initialDragPoint.x = event.clientX;
      initialDragPoint.y = event.clientY;

      // Reset velocity tracking when inertia is enabled.
      if (inertia)
      {
         // Reset any existing inertia tween.
         if (inertiaTween)
         {
            inertiaTween.kill();
            inertiaTween = void 0;
         }

         velocityTrack.reset(event.clientX, event.clientY);
      }

      // Add move and pointer up handlers.
      node.addEventListener(...handlers.dragMove);
      node.addEventListener(...handlers.dragUp);

      node.setPointerCapture(event.pointerId);
   }

   /**
    * Move the positionable.
    *
    * @param {PointerEvent} event - The pointer move event.
    */
   function onDragPointerChange(event)
   {
      // See chorded button presses for pointer events:
      // https://www.w3.org/TR/pointerevents3/#chorded-button-interactions
      // TODO: Support different button configurations for PointerEvents.
      if ((event.buttons & 1) === 0)
      {
         onDragPointerUp(event);
         return;
      }

      if (event.button !== -1 || !event.isPrimary) { return; }

      event.preventDefault();

      // Only set store dragging on first move event.
      if (!dragging && typeof storeDragging?.set === 'function')
      {
         dragging = true;
         storeDragging.set(true);
      }

      /** @type {number} */
      const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
      /** @type {number} */
      const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);

      if (inertia) { velocityTrack.update(event.clientX, event.clientY); }

      if (tween)
      {
         // Update position; `quickTo` can't be used when inertia is enabled.
         if (hasQuickTo && !inertia)
         {
            quickLeft(newLeft);
            quickTop(newTop);
         }
         else
         {
            if (tweenTo) { tweenTo.kill(); }

            tweenTo = GsapCompose.to(actualPosition, { left: newLeft, top: newTop, ...tweenOptions });
         }
      }
      else
      {
         positionData.left = newLeft;
         positionData.top = newTop;

         actualPosition.set(positionData);
      }
   }

   /**
    * Finish dragging and set the final position and removing listeners.
    *
    * @param {PointerEvent} event - The pointer up event.
    */
   function onDragPointerUp(event)
   {
      event.preventDefault();

      dragging = false;
      if (typeof storeDragging?.set === 'function') { storeDragging.set(false); }

      node.removeEventListener(...handlers.dragMove);
      node.removeEventListener(...handlers.dragUp);

      if (inertia)
      {
         // Kill any existing ease / tween before inertia tween.
         quickLeft?.tween?.kill?.();
         quickTop?.tween?.kill?.();

         if (tweenTo)
         {
            tweenTo.kill();
            tweenTo = void 0;
         }

         const opts = inertiaOptions;

         const velScale = opts.velocityScale ?? 1;
         const tweenDuration = opts.duration ?? { min: 0, max: 3 };
         const tweenEnd = opts.end ?? void 0;
         const tweenResistance = opts.resistance ?? 1000;

         const velocity = velocityTrack.update(event.clientX, event.clientY);

         inertiaTween = GsapCompose.to(actualPosition, {
            inertia: {
               left: Object.assign({ velocity: velocity.x * velScale }, tweenEnd ? { end: tweenEnd } : {}),
               top: Object.assign({ velocity: velocity.y * velScale }, tweenEnd ? { end: tweenEnd } : {}),
               duration: tweenDuration,
               resistance: tweenResistance,
               linkedProps: 'top,left'
            }
         }, { initialProps: ['top', 'left'] });
      }
   }

   return {
      /**
       * The default of enabled being true won't automatically add listeners twice.
       *
       * @param {Partial<import('./types').Action.DraggableGsapOptions>} options - Action options.
       */
      update: (options) =>
      {
         if (options.position !== void 0)
         {
            // Find actual position instance checking for a Positionable instance.
            const newPosition = /** @type {import('#runtime/svelte/store/position').TJSPosition} */
             options.position?.position ?? options.position;

            if (newPosition !== actualPosition)
            {
               actualPosition = newPosition;

               // Kill any existing ease / tween.
               if (hasQuickTo)
               {
                  quickLeft?.tween?.kill?.();
                  quickTop?.tween?.kill?.();

                  quickLeft = GsapCompose.quickTo(actualPosition, 'left', { ...tweenOptions });
                  quickTop = GsapCompose.quickTo(actualPosition, 'top', { ...tweenOptions });
               }
            }
         }

         if (typeof options.enabled === 'boolean')
         {
            enabled = options.enabled;
            if (enabled) { activateListeners(); }
            else { removeListeners(); }
         }

         if (typeof options.button === 'number')
         {
            button = options.button;
         }

         if (typeof options.tween === 'boolean') { tween = options.tween; }
         if (typeof options.inertia === 'boolean') { inertia = options.inertia; }

         if (isObject(options.tweenOptions))
         {
            tweenOptions = options.tweenOptions;

            if (hasQuickTo)
            {
               quickLeft = GsapCompose.quickTo(actualPosition, 'left', { ...tweenOptions });
               quickTop = GsapCompose.quickTo(actualPosition, 'top', { ...tweenOptions });
            }
         }

         if (isObject(options.inertiaOptions))
         {
            inertiaOptions = options.inertiaOptions;
         }

         if (options.hasTargetClassList !== void 0)
         {
            if (!isIterable(options.hasTargetClassList))
            {
               throw new TypeError(`'hasTargetClassList' is not iterable.`);
            }
            else
            {
               hasTargetClassList = options.hasTargetClassList;
            }
         }

         if (options.ignoreTargetClassList !== void 0)
         {
            if (!isIterable(options.ignoreTargetClassList))
            {
               throw new TypeError(`'ignoreTargetClassList' is not iterable.`);
            }
            else
            {
               ignoreTargetClassList = options.ignoreTargetClassList;
            }
         }
      },

      destroy: () => removeListeners()
   };
}

/**
 * Provides an instance of the {@link draggableGsap} action options support / Readable store to make updating / setting
 * draggableGsap options much easier. When subscribing to the options instance returned by {@link draggableGsap.options}
 * the Subscriber handler receives the entire instance.
 *
 * @implements {import('./types').Action.DraggableGsapOptionsStore}
 */
class DraggableGsapOptionsStore
{
   /** @type {boolean} */
   #initialTween;

   /**
    * @type {import('./types').Action.GsapTweenOptions}
    */
   #initialTweenOptions;

   /** @type {boolean} */
   #initialInertia;

   /**
    * @type {import('./types').GsapTweenInertiaOptions}
    */
   #initialInertiaOptions;

   /** @type {boolean} */
   #tween;

   #tweenOptions = { duration: 1, ease: 'power3.out' };

   /** @type {boolean} */
   #inertia;

   #inertiaOptions = { end: void 0, duration: { min: 0, max: 3 }, resistance: 1000, velocityScale: 1 };

   /**
    * Stores the subscribers.
    *
    * @type {import('svelte/store').Subscriber<import('./types').Action.DraggableGsapOptionsStore>[]}
    */
   #subscriptions = [];

   constructor({ tween = false, tweenOptions, inertia = false, inertiaOptions } = {})
   {
      // Define the following getters directly on this instance and make them enumerable. This allows them to be
      // picked up w/ `Object.assign`.

      Object.defineProperty(this, 'tween', {
         get: () => { return this.#tween; },
         set: (newTween) =>
         {
            if (typeof newTween !== 'boolean') { throw new TypeError(`'tween' is not a boolean.`); }

            this.#tween = newTween;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'tweenOptions', {
         get: () => { return this.#tweenOptions; },
         set: (newTweenOptions) =>
         {
            if (!isObject(newTweenOptions))
            {
               throw new TypeError(`'tweenOptions' is not an object.`);
            }

            if (newTweenOptions.duration !== void 0)
            {
               if (!Number.isFinite(newTweenOptions.duration))
               {
                  throw new TypeError(`'tweenOptions.duration' is not a finite number.`);
               }

               if (newTweenOptions.duration < 0) { throw new Error(`'tweenOptions.duration' is less than 0.`); }

               this.#tweenOptions.duration = newTweenOptions.duration;
            }

            if (newTweenOptions.ease !== void 0)
            {
               if (typeof newTweenOptions.ease !== 'function' && typeof newTweenOptions.ease !== 'string')
               {
                  throw new TypeError(`'tweenOptions.ease' is not a function or string.`);
               }

               this.#tweenOptions.ease = newTweenOptions.ease;
            }

            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'inertia', {
         get: () => { return this.#inertia; },
         set: (newInertia) =>
         {
            if (typeof newInertia !== 'boolean') { throw new TypeError(`'inertia' is not a boolean.`); }

            this.#inertia = newInertia;
            this.#updateSubscribers();
         },
         enumerable: true
      });

      Object.defineProperty(this, 'inertiaOptions', {
         get: () => { return this.#inertiaOptions; },
         set: (newInertiaOptions) =>
         {
            if (!isObject(newInertiaOptions))
            {
               throw new TypeError(`'inertiaOptions' is not an object.`);
            }

            if (newInertiaOptions.end !== void 0)
            {
               if (typeof newInertiaOptions.end !== 'function' && newInertiaOptions.end !== void 0)
               {
                  throw new TypeError(`'inertiaOptions.end' is not a function or undefined.`);
               }

               this.#inertiaOptions.end = newInertiaOptions.end;
            }

            if (newInertiaOptions.duration !== void 0)
            {
               if (!isObject(newInertiaOptions.duration))
               {
                  throw new TypeError(`'inertiaOptions.duration' is not an object.`);
               }

               if (newInertiaOptions.duration.max !== void 0)
               {
                  if (!Number.isFinite(newInertiaOptions.duration.max))
                  {
                     throw new TypeError(`'inertiaOptions.duration.max' is not a finite number.`);
                  }

                  if (newInertiaOptions.duration.max < 0)
                  {
                     throw new Error(`'newInertiaOptions.duration.max' is less than 0.`);
                  }

                  this.#inertiaOptions.duration.max = newInertiaOptions.duration.max;
               }

               if (newInertiaOptions.duration.min !== void 0)
               {
                  if (!Number.isFinite(newInertiaOptions.duration.min))
                  {
                     throw new TypeError(`'inertiaOptions.duration.min' is not a finite number.`);
                  }

                  if (newInertiaOptions.duration.min < 0)
                  {
                     throw new Error(`'newInertiaOptions.duration.min' is less than 0.`);
                  }

                  this.#inertiaOptions.duration.min = newInertiaOptions.duration.min;
               }

               if (this.#inertiaOptions.duration.min > this.#inertiaOptions.duration.max)
               {
                  this.#inertiaOptions.duration.max = this.#inertiaOptions.duration.min;
               }

               if (this.#inertiaOptions.duration.max < this.#inertiaOptions.duration.min)
               {
                  this.#inertiaOptions.duration.min = this.#inertiaOptions.duration.max;
               }
            }

            if (newInertiaOptions.resistance !== void 0)
            {
               if (!Number.isFinite(newInertiaOptions.resistance))
               {
                  throw new TypeError(`'inertiaOptions.resistance' is not a finite number.`);
               }

               if (newInertiaOptions.resistance < 0) { throw new Error(`'inertiaOptions.resistance' is less than 0.`); }

               this.#inertiaOptions.resistance = newInertiaOptions.resistance;
            }

            if (newInertiaOptions.velocityScale !== void 0)
            {
               if (!Number.isFinite(newInertiaOptions.velocityScale))
               {
                  throw new TypeError(`'inertiaOptions.velocityScale' is not a finite number.`);
               }

               if (newInertiaOptions.velocityScale < 0)
               {
                  throw new Error(`'inertiaOptions.velocityScale' is less than 0.`);
               }

               this.#inertiaOptions.velocityScale = newInertiaOptions.velocityScale;
            }

            this.#updateSubscribers();
         },
         enumerable: true
      });

      // Set default options.
      if (tween !== void 0) { this.tween = tween; }
      if (tweenOptions !== void 0) { this.tweenOptions = tweenOptions; }
      if (inertia !== void 0) { this.inertia = inertia; }
      if (inertiaOptions !== void 0) { this.inertiaOptions = inertiaOptions; }

      this.#initialTween = this.#tween;
      this.#initialTweenOptions = klona(this.#tweenOptions);
      this.#initialInertia = this.#inertia;
      this.#initialInertiaOptions = klona(this.#inertiaOptions);
   }

   /**
    * @returns {number} Get ease duration
    */
   get tweenDuration() { return this.#tweenOptions.duration; }

   /**
    * @returns {string|Function} Get easing function value.
    */
   get tweenEase() { return this.#tweenOptions.ease; }

   /**
    * @returns {number|Array|Function} Get inertia end.
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   get inertiaEnd() { return this.#inertiaOptions.end; }

   /**
    * @returns {number} Get inertia duration max time (seconds)
    */
   get inertiaDurationMax() { return this.#inertiaOptions.duration.max; }

   /**
    * @returns {number} Get inertia duration min time (seconds)
    */
   get inertiaDurationMin() { return this.#inertiaOptions.duration.min; }

   /**
    * @returns {number} Get inertia resistance (1000 is default).
    */
   get inertiaResistance() { return this.#inertiaOptions.resistance; }

   /**
    * @returns {number} Get inertia velocity scale.
    */
   get inertiaVelocityScale() { return this.#inertiaOptions.velocityScale; }

   /**
    * @param {number}   duration - Set tween duration.
    */
   set tweenDuration(duration)
   {
      if (!Number.isFinite(duration))
      {
         throw new TypeError(`'duration' is not a finite number.`);
      }

      if (duration < 0) { throw new Error(`'duration' is less than 0.`); }

      this.#tweenOptions.duration = duration;
      this.#updateSubscribers();
   }

   /**
    * @param {string|import('#runtime/svelte/easing').EasingFunction} value - Set tween easing function value.
    */
   set tweenEase(value)
   {
      if (typeof value !== 'function' && typeof value !== 'string')
      {
         throw new TypeError(`'value' is not a function or string.`);
      }

      this.#tweenOptions.ease = value;
      this.#updateSubscribers();
   }

   /**
    * @param {number|Array|Function} end - Set inertia end.
    *
    * @see `end` {@link https://greensock.com/docs/v3/Plugins/InertiaPlugin}
    */
   set inertiaEnd(end)
   {
      if (typeof end !== 'function' && end !== void 0) { throw new TypeError(`'end' is not a function or undefined.`); }

      this.#inertiaOptions.end = end;
      this.#updateSubscribers();
   }

   /**
    * @param {{min: number, max: number}} duration - Set inertia duration min & max.
    */
   set inertiaDuration(duration)
   {
      if (!isObject(duration) && !Number.isFinite(duration.min) && !Number.isFinite(duration.max))
      {
         throw new TypeError(`'duration' is not an object with 'min' & 'max' properties as finite numbers.`);
      }

      if (duration.max < 0) { throw new Error(`'duration.max' is less than 0.`); }
      if (duration.min < 0) { throw new Error(`'duration.min' is less than 0.`); }

      // Automatically correct for when min / max are out of sync.
      if (duration.min > duration.max) { duration.max = duration.min; }
      if (duration.max < duration.min) { duration.min = duration.max; }

      this.#inertiaOptions.duration.max = duration.max;
      this.#inertiaOptions.duration.min = duration.min;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   max - Set inertia duration max.
    */
   set inertiaDurationMax(max)
   {
      if (!Number.isFinite(max)) { throw new TypeError(`'max' is not a finite number.`); }
      if (max < 0) { throw new Error(`'max' is less than 0.`); }

      if (max < this.#inertiaOptions.duration.min) { this.#inertiaOptions.duration.min = max; }

      this.#inertiaOptions.duration.max = max;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   min - Set inertia duration min.
    */
   set inertiaDurationMin(min)
   {
      if (!Number.isFinite(min)) { throw new TypeError(`'min' is not a finite number.`); }
      if (min < 0) { throw new Error(`'min' is less than 0.`); }

      if (min > this.#inertiaOptions.duration.max) { this.#inertiaOptions.duration.max = min; }

      this.#inertiaOptions.duration.min = min;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   resistance - Set inertia resistance. Default: 1000
    */
   set inertiaResistance(resistance)
   {
      if (!Number.isFinite(resistance)) { throw new TypeError(`'resistance' is not a finite number.`); }
      if (resistance < 0) { throw new Error(`'resistance' is less than 0.`); }

      this.#inertiaOptions.resistance = resistance;
      this.#updateSubscribers();
   }

   /**
    * @param {number}   velocityScale - Set inertia velocity scale.
    */
   set inertiaVelocityScale(velocityScale)
   {
      if (!Number.isFinite(velocityScale)) { throw new TypeError(`'velocityScale' is not a finite number.`); }
      if (velocityScale < 0) { throw new Error(`'velocityScale' is less than 0.`); }

      this.#inertiaOptions.velocityScale = velocityScale;
      this.#updateSubscribers();
   }

   /**
    * Resets all options data to initial values.
    */
   reset()
   {
      this.#tween = this.#initialTween;
      this.#inertia = this.#initialInertia;
      this.#tweenOptions = klona(this.#initialTweenOptions);
      this.#inertiaOptions = klona(this.#initialInertiaOptions);
      this.#updateSubscribers();
   }

   /**
    * Resets tween enabled state to initial value.
    */
   resetTween()
   {
      this.#tween = this.#initialTween;
      this.#updateSubscribers();
   }

   /**
    * Resets tween options to initial values.
    */
   resetTweenOptions()
   {
      this.#tweenOptions = klona(this.#initialTweenOptions);
      this.#updateSubscribers();
   }

   /**
    * Resets inertia enabled state to initial value.
    */
   resetInertia()
   {
      this.#inertia = this.#initialInertia;
      this.#updateSubscribers();
   }

   /**
    * Resets inertia options to initial values.
    */
   resetInertiaOptions()
   {
      this.#inertiaOptions = klona(this.#initialInertiaOptions);
      this.#updateSubscribers();
   }

   /**
    * Store subscribe method.
    *
    * @param {import('svelte/store').Subscriber<import('./types').Action.DraggableGsapOptionsStore>} handler - Callback
    *        function that is invoked on update / changes. Receives the DraggableGsapOptionsStore object / instance.
    *
    * @returns {import('svelte/store').Unsubscriber} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * Update all subscribers.
    */
   #updateSubscribers()
   {
      const subscriptions = this.#subscriptions;

      // Early out if there are no subscribers.
      if (subscriptions.length > 0)
      {
         for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](this); }
      }
   }
}

/**
 * Define a function to get an DraggableGsapOptionsStore instance.
 *
 * @param {({
 *    tween?: boolean,
 *    tweenOptions?: import('./types').Action.GsapTweenOptions,
 *    inertia?: boolean,
 *    inertiaOptions?: import('./types').Action.GsapInertiaOptions
 * })} options - Initial options for DraggableGsapOptionsStore.
 *
 * @returns {import('./types').Action.DraggableGsapOptionsStore} A new options instance.
 */
draggableGsap.options = (options) => new DraggableGsapOptionsStore(options);

/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 * @ignore
 */
async function gsapLoadPlugin(name)
{
   /**
    * Note usage of `globalThis.location.origin` as this is the origin of the importing location which is necessary for
    * connecting to the Foundry server when the package is located on a CDN.
    *
    * @type {string}
    */
   const modulePath = `${globalThis.location.origin}${foundry.utils.getRoute(`/scripts/greensock/esm/${name}.js`)}`;

   try
   {
      const module = await import(/* @vite-ignore */modulePath);
      return module.default;
   }
   catch (err)
   {
      console.error(`TyphonJS Runtime Library error; Could not load ${name} plugin from: '${modulePath}'`);
      console.error(err);
   }
}

export { GsapCompose, draggableGsap, getGsapEasingFunc, gsap, gsapEasingFunc, gsapEasingList, gsapLoadPlugin };
//# sourceMappingURL=index.js.map
