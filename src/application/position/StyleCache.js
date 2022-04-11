import { styleParsePixels } from '@typhonjs-fvtt/svelte/util';

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
      this.minHeight = void 0
      this.minWidth = void 0;
   }

   /**
    * @param {HTMLElement} el -
    *
    * @returns {boolean} Does element match cached element.
    */
   hasData(el) { return this.el === el; }

   reset()
   {
      this.el = void 0;
      this.computed = void 0;
      this.marginLeft = void 0;
      this.marginTop = void 0;
      this.maxHeight = void 0;
      this.maxWidth = void 0;
      this.minHeight = void 0;
      this.minWidth = void 0;
   }

   update(el)
   {
      this.el = el;

      this.computed = globalThis.getComputedStyle(el);

      this.marginLeft = styleParsePixels(el.style.marginLeft) ||
       styleParsePixels(this.computed.marginLeft);

      this.marginTop = styleParsePixels(el.style.marginTop) ||
       styleParsePixels(this.computed.marginTop);

      this.maxHeight = styleParsePixels(el.style.maxHeight) ||
       styleParsePixels(this.computed.maxHeight);

      this.maxWidth = styleParsePixels(el.style.maxWidth) ||
       styleParsePixels(this.computed.maxWidth);

      this.minHeight = styleParsePixels(el.style.minHeight) ||
       styleParsePixels(this.computed.minHeight);

      this.minWidth = styleParsePixels(el.style.minWidth) ||
       styleParsePixels(this.computed.minWidth);
   }
}
