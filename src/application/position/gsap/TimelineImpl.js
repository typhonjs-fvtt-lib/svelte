import { getTarget } from './utils.js';

export class TimelineImpl
{
   static from(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = getTarget(trlPosition, positionData, entry, cntr);
      const vars = entry.vars;
      const position = entry.position;

      if (typeof vars !== 'object')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] missing 'vars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
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
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] missing 'fromVars' object.`);
      }

      if (typeof toVars !== 'object')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] missing 'toVars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.from(target, fromVars, toVars, position);
   }

   static to(timeline, trlPosition, positionData, entry, cntr)
   {
      const target = getTarget(trlPosition, positionData, entry, cntr);
      const vars = entry.vars;
      const position = entry.position;

      if (typeof vars !== 'object')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] missing 'vars' object.`);
      }

      if (position !== void 0 && !Number.isFinite(position) && typeof position !== 'string')
      {
         throw new TypeError(`PositionGSAP.timeline error: gsapData[${cntr}] 'position' is not a number or string.`);
      }

      timeline.to(target, vars, position);
   }
}
