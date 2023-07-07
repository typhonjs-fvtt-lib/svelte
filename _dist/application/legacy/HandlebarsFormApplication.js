import {
   ApplicationShell,
   EmptyApplicationShell }       from '@typhonjs-fvtt/svelte/component/core';

import {
   deepMerge,
   isObject }                    from '@typhonjs-svelte/runtime-base/util/object';

import { SvelteFormApplication } from './SvelteFormApplication.js';

/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use HandlebarsFormApplication in a similar manner as the core Foundry `FormApplication`
 * class. This should only be an interim or stepwise solution as you convert your package over to fully using TRL &
 * Svelte.
 */
export class HandlebarsFormApplication extends SvelteFormApplication
{
   /**
    * Temporarily holds the inner JQuery HTML.
    */
   #innerHTML;

   /**
    * @inheritDoc
    */
   constructor(object, options)
   {
      super(object, options);

      this.options.svelte = deepMerge(isObject(this.options.svelte) ?
       this.options.svelte : {}, {
         class: this.popOut ? ApplicationShell : EmptyApplicationShell,
         intro: true,
         target: document.body
      });
   }

   /**
    * Append JQuery HTML to application shell content area.
    *
    * @protected
    * @ignore
    * @internal
    */
   _injectHTML(html) // eslint-disable-line no-unused-vars
   {
      // Mounts any Svelte components.
      super._injectHTML(this.#innerHTML);

      // Appends inner HTML content to application shell content element.
      if (this.svelte?.applicationShell?.elementContent)
      {
         this.svelte.applicationShell.elementContent.appendChild(...this.#innerHTML);
      }

      this.#innerHTML = void 0;
   }

   /**
    * Duplicates the FormApplication `_renderInner` method as SvelteFormApplication does not defer to super
    * implementations.
    *
    * @protected
    * @ignore
    * @internal
    */
   async _renderInner(data)
   {
      this.#innerHTML = await super._renderInner(data);

      // JQuery usage via `filter`.
      this.form = this.#innerHTML.filter((i, el) => el instanceof HTMLFormElement)[0];
      if (!this.form) { this.form = this.#innerHTML.find('form')[0]; }

      return this.#innerHTML;
   }

   /**
    * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
    * application frame / title for pop-out applications.
    *
    * @protected
    * @ignore
    * @internal
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
