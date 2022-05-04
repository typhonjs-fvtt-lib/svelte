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
export function getTarget(trlPosition, positionData, entry, cntr)
{
   const target = entry.target ?? 'position';

   switch (target)
   {
      case 'position':
         return positionData;
      case 'element':
         return trlPosition.element;
      default:
         throw new Error(`PositionGSAP.timeline error: 'gsapData[${cntr}]' unknown 'target' - '${target}'.`);
   }
}
