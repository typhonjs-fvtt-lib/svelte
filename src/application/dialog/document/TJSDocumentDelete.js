import { TJSDocumentDelete
    as TJSDocumentDeleteImpl }   from '@typhonjs-fvtt/svelte/component/core';
import { localize }              from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }             from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }             from '../TJSDialog.js';

/**
 * Provides a reactive dialog for deleting documents that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSDocumentDelete extends TJSDialog
{
   /**
    * @param {foundry.abstract.Document}  document -
    *
    * @param {object} [opts] - Additional context options or dialog positioning options.
    *
    * @param {object} [opts.context] - DocumentModificationContext.
    *
    * @param {...*} [opts.options] - Rest of options to pass to TJSDialog / Application.
    *
    * @param {object}   dialogData -
    */
   constructor(document, { context = {}, ...options } = {}, dialogData = {})
   {
      super({
         modal: typeof options?.modal === 'boolean' ? options.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         ...dialogData,
         content: {
            class: TJSDocumentDeleteImpl,
            props: { document, context }
         },
         title: `${localize('DOCUMENT.Delete', { type: localize(document.constructor.metadata.label) })}: ${
          document.name}`,
         default: 'yes',
         buttons: {
            yes: {
               icon: 'fas fa-check',
               label: localize('Yes'),
               onclick: 'handleClickYes'
            },
            no: {
               icon: 'fas fa-times',
               label: localize('No'),
               onclick: () => this.options.resolve?.(false)
            }
         },
         close: () => this.options?.resolve?.(null)
      }, options);

      /**
       * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
       *                             Document.
       *
       * @memberof SvelteReactive#
       */
      Object.defineProperty(this.reactive, 'document', {
         get: () => this.svelte?.dialogComponent?.document,
         set: (document) =>
         {
            const dialogComponent = this.svelte.dialogComponent;
            if (hasSetter(dialogComponent, 'document')) { dialogComponent.document = document; }
         }
      });

      /**
       * @member {object} context - Adds accessors to SvelteReactive to get / set the DocumentModificationContext
       *                            associated with Document.
       *
       * @memberof SvelteReactive#
       */
      Object.defineProperty(this.reactive, 'context', {
         get: () => this.svelte?.dialogComponent?.context,
         set: (context) => // eslint-disable-line no-shadow
         {
            const dialogComponent = this.svelte.dialogComponent;
            if (hasSetter(dialogComponent, 'context')) { dialogComponent.context = context; }
         }
      });
   }
}
