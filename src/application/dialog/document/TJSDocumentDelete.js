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
         close: () => options?.resolve?.(null),
         default: 'yes',
         buttons: {
            yes: {
               icon: '<i class="fas fa-check"></i>',
               label: localize('Yes'),
               callback: async (html, dialogComponent) =>
               {
                  // Remove the delete Document function callback as we are intentionally deleting below.
                  dialogComponent.doc.setOptions({ delete: void 0 });

                  const returnDoc = await dialogComponent.document.delete(context);

                  this.options.resolve?.(returnDoc);
                  await this.close();
               }
            },
            no: {
               icon: '<i class="fas fa-times"></i>',
               label: localize('No'),
               callback: async () =>
               {
                  this.options.resolve?.(false);
                  await this.close();
               }
            }
         }
      }, { width: 320, ...options });

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
