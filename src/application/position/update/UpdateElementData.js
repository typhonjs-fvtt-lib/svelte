import { writable }        from 'svelte/store';

import { TransformData }   from '../transform/TransformData.js';
import { PositionData }    from '../PositionData.js';

export class UpdateElementData
{
   constructor()
   {
      this.calculateTransform = void 0;
      this.data = void 0;

      /**
       * Provides a copy of local data sent to subscribers.
       *
       * @type {PositionData}
       */
      this.dataSubscribers = new PositionData();

      /**
       * Stores the current dimension data used for the readable `dimension` store.
       *
       * @type {{width: number | 'auto', height: number | 'auto'}}
       */
      this.dimensionData = { width: 0, height: 0 };

      this.changeSet = void 0;
      this.options = void 0;
      this.styleCache = void 0;
      this.transforms = void 0;

      /**
       * Stores the current transform data used for the readable `transform` store. It is only active when there are
       * subscribers to the store or calculateTransform options is true.
       *
       * @type {TransformData}
       */
      this.transformData = new TransformData();

      this.subscriptions = void 0;

      this.storeDimension = writable(this.dimensionData);

      // When there are subscribers set option to calculate transform updates; set to false when no subscribers.
      this.storeTransform = writable(this.transformData, () =>
      {
         this.options.transformSubscribed = true;
         return () => this.options.transformSubscribed = false;
      });

      // Seal data backing readable stores.
      Object.seal(this.dimensionData);
   }
}
