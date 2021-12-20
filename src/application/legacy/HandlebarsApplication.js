import { SvelteApplication }  from '@typhonjs-fvtt/svelte/application';

import {
   ApplicationShell,
   EmptyApplicationShell }    from '@typhonjs-fvtt/svelte/component/core';

export class HandlebarsApplication extends SvelteApplication
{
   /**
    * Temporarily holds the original popOut value when rendering.
    *
    * @type {boolean}
    */
   #orignalPopOut;

   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);

      if (this.popOut)
      {
         this.options.svelte = foundry.utils.mergeObject(typeof this.options.svelte === 'object' ?
          this.options.svelte : {}, {
            class: this.popOut ? ApplicationShell : EmptyApplicationShell,
            intro: true,
            target: document.body
         });
      }
   }

   /**
    * Temporarily set popOut to false to only render inner HTML. This inner HTML will be appended to the content area
    * of ApplicationShell if the original popOut value is true.
    *
    * @inheritDoc
    * @ignore
    */
   async _render(force, options)
   {
      this.#orignalPopOut = this.options.popOut;
      this.options.popOut = false;
      await super._render(force, options);
      this.options.popOut = this.#orignalPopOut;
   }

   /**
    * Append HTML to application shell content area.
    *
    * @param {JQuery}   html - new content.
    *
    * @private
    * @ignore
    */
   _injectHTML(html)
   {
      // Mounts any Svelte components.
      super._injectHTML(html);

      // Appends inner HTML content to application shell content element.
      if (this.svelte?.applicationShell?.elementContent)
      {
         this.svelte.applicationShell.elementContent.appendChild(...html);
      }
   }

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @inheritDoc
    * @ignore
    */
   _replaceHTML(element, html)  // eslint-disable-line no-unused-vars
   {
      if (!element.length) { return; }

      super._replaceHTML(element, html);

      if (this.svelte?.applicationShell?.elementContent)
      {
         const elementContent = this.svelte.applicationShell.elementContent;

         // Remove existing children.
         while (elementContent.firstChild && !elementContent.lastChild.remove()) {} // eslint-disable-line no-empty

         elementContent.appendChild(...html);

         // Use the reactive setter from `SvelteApplication` to set the title store.
         /** @ignore */
         this.reactive.title = this.reactive.title; // eslint-disable-line no-self-assign
      }
      else
      {
         console.warn(`HandlebarsApplication warning: No application shell mounted with 'elementContent' accessor`);
      }
   }
}
