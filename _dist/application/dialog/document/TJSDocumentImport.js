import { TJSDialog }             from '@typhonjs-fvtt/svelte/application';
import { TJSDocumentImport
    as TJSDocumentImportImpl }   from '@typhonjs-fvtt/svelte/component/dialog';
import { localize }              from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }             from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a reactive dialog for importing documents that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSDocumentImport extends TJSDialog
{
   /**
    * Render an import dialog for updating the data related to this Document through an exported JSON file
    *
    * @param {foundry.abstract.Document} document - The document to import JSON to...
    *
    * @param {SvelteApplicationOptions} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(document, options, dialogData = {})
   {
      super({
         modal: typeof dialogData?.modal === 'boolean' ? dialogData.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         title: `${localize('DOCUMENT.ImportData')}: ${document.name}`,
         content: {
            class: TJSDocumentImportImpl,
            props: { document }
         },
         buttons: {
            import: {
               autoClose: false, // Don't automatically close on button onclick.
               icon: 'fas fa-file-import',
               label: 'Import',
               onPress: 'requestSubmit'
            },
            cancel: {
               icon: 'fas fa-times',
               label: 'Cancel',
               onPress: () => false
            }
         },
         default: 'cancel'
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

   /**
    * Render an import dialog for updating the data related to this Document through an exported JSON file
    *
    * @param {foundry.abstract.Document} document - The document to import JSON to...
    *
    * @param {SvelteApplicationOptions} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<foundry.abstract.Document|boolean|null>} The document after import completes or a falsy value;
    *          either 'false' for cancelling or 'null' if the user closed the dialog via `<Esc>` or the close header
    *          button.
    */
   static async show(document, options = {}, dialogData = {})
   {
      if (!(document instanceof globalThis.foundry.abstract.Document))
      {
         console.warn(`TJSDocumentImport - show - warning: 'document' is not a Document.`);
         return null;
      }

      if (document instanceof Folder)
      {
         console.warn(`TJSDocumentImport - show - warning: 'document' is a Folder; unsupported operation'.`);
         return null;
      }

      return new TJSDocumentImport(document, options, dialogData).wait();
   }
}
