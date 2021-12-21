import {
   ApplicationShell,
   EmptyApplicationShell }       from '@typhonjs-fvtt/svelte/component/core';

import { SvelteFormApplication } from './SvelteFormApplication.js';

export class HandlebarsFormApplication extends SvelteFormApplication
{
   /**
    * Temporarily holds the inner HTML.
    *
    * @type {JQuery}
    */
   #innerHTML;

   /**
    * @inheritDoc
    */
   constructor(object, options)
   {
      super(object, options);

      this.options.svelte = foundry.utils.mergeObject(typeof this.options.svelte === 'object' ?
       this.options.svelte : {}, {
         class: this.popOut ? ApplicationShell : EmptyApplicationShell,
         intro: true,
         target: document.body
      });
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

      this.#innerHTML = void 0;
   }

   /**
    * Duplicates the FormApplication `_renderInner` method as SvelteFormApplication does not defer to super
    * implementations.
    *
    * @inheritDoc
    * @ignore
    */
   async _renderInner(data)
   {
      this.#innerHTML = await super._renderInner(data);

      this.form = this.#innerHTML.filter((i, el) => el instanceof HTMLFormElement)[0];
      if (!this.form) { this.form = this.#innerHTML.find('form')[0]; }

      return this.#innerHTML;
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

         // Use the reactive setter from `SvelteFormApplication` to set the title store.
         /** @ignore */
         this.reactive.title = this.reactive.title; // eslint-disable-line no-self-assign
      }
      else
      {
         console.warn(`HandlebarsFormApplication warning: No application shell mounted with 'elementContent' accessor`);
      }
   }
}
