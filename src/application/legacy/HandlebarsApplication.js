import { SvelteApplication }  from '@typhonjs-fvtt/svelte/application';

import {
   ApplicationShell,
   EmptyApplicationShell }    from '@typhonjs-fvtt/svelte/component/application';

import {
   deepMerge,
   isObject }                 from '#runtime/util/object';

/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use HandlebarsApplication in a similar manner as the core Foundry `Application` class.
 * This should only be an interim or stepwise solution as you convert your package over to fully using TRL & Svelte.
 */
export class HandlebarsApplication extends SvelteApplication
{
   /**
    * Temporarily holds the inner JQuery HTML.
    */
   #innerHTML;

   /**
    * @inheritDoc
    */
   constructor(options)
   {
      super(options);

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
    * Temporarily store the inner JQuery HTML.
    *
    * @protected
    * @ignore
    * @internal
    */
   async _renderInner(data)
   {
      this.#innerHTML = await super._renderInner(data);
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
