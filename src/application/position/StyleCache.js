import { writable }           from 'svelte/store';

import { styleParsePixels }   from '@typhonjs-fvtt/svelte/util';

export class StyleCache
{
   constructor()
   {
      this.el = void 0;
      this.computed = void 0;
      this.marginLeft = void 0;
      this.marginTop = void 0;
      this.maxHeight = void 0;
      this.maxWidth = void 0;
      this.minHeight = void 0;
      this.minWidth = void 0;

      this.hasWillChange = false;

      /**
       * @type {ResizeObserverData}
       */
      this.resizeObserved = {
         contentHeight: void 0,
         contentWidth: void 0,
         offsetHeight: void 0,
         offsetWidth: void 0
      };

      /**
       * Provides a writable store to track offset & content width / height from an associated `resizeObserver` action.
       *
       * @type {Writable<ResizeObserverData>}
       */
      this.storeResizeObserved = writable(this.resizeObserved);

      /**
       * Provides a writable store for the `element` readable store to update when element being tracked changes.
       *
       * @type {Writable<HTMLElement|undefined>}
       */
      this.storeElement = writable(this.el);
   }

   get offsetHeight()
   {
      if (this.el instanceof HTMLElement)
      {
         return this.resizeObserved.offsetHeight !== void 0 ? this.resizeObserved.offsetHeight : this.el.offsetHeight;
      }

      throw new Error(`StyleCache - get offsetHeight error: no element assigned.`);
   }

   get offsetWidth()
   {
      if (this.el instanceof HTMLElement)
      {
         return this.resizeObserved.offsetWidth !== void 0 ? this.resizeObserved.offsetWidth : this.el.offsetWidth;
      }

      throw new Error(`StyleCache - get offsetWidth error: no element assigned.`);
   }

   /**
    * @param {HTMLElement} el -
    *
    * @returns {boolean} Does element match cached element.
    */
   hasData(el) { return this.el === el; }

   reset()
   {
      // Remove will-change inline style from previous element if it is still connected.
      if (this.el instanceof HTMLElement && this.el.isConnected && !this.hasWillChange)
      {
         this.el.style.willChange = null;
      }

      this.el = void 0;
      this.computed = void 0;
      this.marginLeft = void 0;
      this.marginTop = void 0;
      this.maxHeight = void 0;
      this.maxWidth = void 0;
      this.minHeight = void 0;
      this.minWidth = void 0;

      this.hasWillChange = false;

      // Reset the tracked element this Position instance is modifying.
      this.storeElement.set(void 0);
   }

   update(el)
   {
      this.el = el;

      this.computed = globalThis.getComputedStyle(el);

      this.marginLeft = styleParsePixels(el.style.marginLeft) ?? styleParsePixels(this.computed.marginLeft);
      this.marginTop = styleParsePixels(el.style.marginTop) ?? styleParsePixels(this.computed.marginTop);
      this.maxHeight = styleParsePixels(el.style.maxHeight) ?? styleParsePixels(this.computed.maxHeight);
      this.maxWidth = styleParsePixels(el.style.maxWidth) ?? styleParsePixels(this.computed.maxWidth);

      // Note that the computed styles for below will always be 0px / 0 when no style is active.
      this.minHeight = styleParsePixels(el.style.minHeight) ?? styleParsePixels(this.computed.minHeight);
      this.minWidth = styleParsePixels(el.style.minWidth) ?? styleParsePixels(this.computed.minWidth);

      // Tracks if there already is a will-change property on the inline or computed styles.
      const willChange = el.style.willChange !== '' ? el.style.willChange : void 0 ?? this.computed.willChange;

      this.hasWillChange = willChange !== '' && willChange !== 'auto';

      // Update the tracked element this Position instance is modifying.
      this.storeElement.set(el);
   }
}
