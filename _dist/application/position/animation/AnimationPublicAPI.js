import { AnimationManager } from './AnimationManager.js';

/**
 * Provides a public API for AnimationManager.
 */
export class AnimationPublicAPI
{
   /**
    * Cancels any animation for given Position data.
    *
    * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} data -
    */
   static cancel(data) { AnimationManager.cancel(data); }

   /**
    * Cancels all Position animation.
    */
   static cancelAll() { AnimationManager.cancelAll(); }

   /**
    * Animates one or more Position instances as a group.
    *
    * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} data -
    *
    * @param {object|Function}   positionData -
    *
    * @param {object|Function}   options -
    *
    * @returns {TJSBasicAnimation} Basic animation control.
    */
   static to(data, positionData, options) { return AnimationManager.to(data, positionData, options); }
}
