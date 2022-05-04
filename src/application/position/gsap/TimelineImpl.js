import { getTarget } from './utils.js';

export class TimelineImpl
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
      const target = getTarget(trlPosition, positionData, entry, cntr);
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
      const target = getTarget(trlPosition, positionData, entry, cntr);
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
      const target = getTarget(trlPosition, positionData, entry, cntr);
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
      const target = getTarget(trlPosition, positionData, entry, cntr);
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
