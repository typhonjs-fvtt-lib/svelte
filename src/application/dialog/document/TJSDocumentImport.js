import { TJSDocumentImport
    as TJSDocumentImportImpl }   from '@typhonjs-fvtt/svelte/component/core';
import { localize }              from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }             from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }             from '../TJSDialog.js';

/**
 * Provides a reactive dialog for importing documents that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSDocumentImport extends TJSDialog
{
   /**
    * @param {foundry.abstract.Document}  document -
    *
    * @param {object} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] -
    */
   constructor(document, options, dialogData = {})
   {
      super({
         modal: typeof options?.modal === 'boolean' ? options.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         ...dialogData,
         title: `${localize('DOCUMENT.ImportData')}: ${document.name}`,
         content: {
            class: TJSDocumentImportImpl,
            props: { document, context }
         },
         buttons: {
            import: {
               icon: '<i class="fas fa-file-import"></i>',
               label: 'Import',
               callback: async (html) =>
               {
                  const form = html.querySelector('form');

                  if (!form.data.files.length) { return ui.notifications.error('You did not upload a data file!'); }

                  const json = await readTextFromFile(form.data.files[0]);
                  const importedDoc = await this.reactive.document.importFromJSON(json);

                  this.options.resolve?.(importedDoc);
               }
            },
            no: {
               icon: '<i class="fas fa-times"></i>',
               label: 'Cancel',
               callback: () => this.options.resolve?.(false)
            }
         },
         default: 'import',
         close: () => this.options.resolve?.(null)
      }, { width: 400, ...options });

      /**
       * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
       *                             Document.
       *
       * @memberof SvelteApplication.reactive
       */
      Object.defineProperty(this.reactive, 'document', {
         get: () => this.svelte?.dialogComponent?.document,
         set: (document) =>
         {
            const dialogComponent = this.svelte.dialogComponent;
            if (hasSetter(dialogComponent, 'document')) { dialogComponent.document = document; }
         }
      });
   }
}
