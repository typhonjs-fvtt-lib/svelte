import { TJSDialog }                from '@typhonjs-fvtt/svelte/application';
import { TJSDocumentOwnership
    as TJSDocumentOwnershipImpl }   from '@typhonjs-fvtt/svelte/component/dialog';
import { localize }                 from '@typhonjs-fvtt/svelte/helper';

import { hasSetter }                from '#runtime/util/object';

/**
 * Provides a reactive dialog for permission control that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSDocumentOwnership extends TJSDialog
{
   /**
    * @param {foundry.abstract.Document} document - Document instance to modify.
    *
    * @param {import('#svelte-fvtt/application').SvelteApplicationOptions} [options] - Rest of options to pass to
    *        TJSDialog / Application.
    *
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(document, options = {}, dialogData = {})
   {
      super({
         modal: typeof dialogData?.modal === 'boolean' ? dialogData.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         focusFirst: true,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         content: {
            class: TJSDocumentOwnershipImpl,
            props: { document }
         },
         title: `${localize('OWNERSHIP.Title')}: ${document.name}`,
         buttons: {
            save: {
               autoClose: false,
               icon: 'far fa-save',
               label: 'Save Changes',
               onPress: 'requestSubmit'
            }
         },
         default: 'save'
      }, options);

      /**
       * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
       *                             TJSDocumentOwnership.
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
   }

   /**
    * Change permissions of a document by rendering a dialog to alter the default and all user / player permissions.
    *
    * @param {foundry.abstract.Document} document - Document instance to modify.
    *
    * @param {import('#svelte-fvtt/application').SvelteApplicationOptions} [options] - Rest of options to pass to
    *        TJSDialog / Application.
    *
    * @param {import('#svelte-fvtt/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<foundry.abstract.Document|null>} The modified document or 'null' if the user closed the dialog
    *          via `<Esc>` or the close header button.
    */
   static async show(document, options = {}, dialogData = {})
   {
      if (!(document instanceof globalThis.foundry.abstract.Document))
      {
         console.warn(`TJSDocumentOwnership - show - warning: 'document' is not a Document.`);
         return null;
      }

      return new TJSDocumentOwnership(document, options, dialogData).wait();
   }
}
