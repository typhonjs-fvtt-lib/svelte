import { TJSDialog }          from '@typhonjs-fvtt/svelte/application';
import { TJSFolderRemove
    as TJSFolderRemoveImpl }  from '@typhonjs-fvtt/svelte/component/dialog';
import { localize }           from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }          from '@typhonjs-fvtt/svelte/util';

/**
 * Provides a reactive dialog for removing a folder that by default is modal and not draggable. An additional set of
 * accessors for the folder assigned are available via the `this.reactive.document`. You may swap out the folder at any
 * time by setting it to a different folder document.
 */
export class TJSFolderRemove extends TJSDialog
{
   /**
    * @param {globalThis.Folder} document - Folder to remove.
    *
    * @param {SvelteApplicationOptions} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    */
   constructor(document, options = {}, dialogData = {})
   {
      super({
         modal: typeof dialogData?.modal === 'boolean' ? dialogData.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         content: {
            class: TJSFolderRemoveImpl,
            props: { document }
         },
         title: `${localize('FOLDER.Remove')}: ${document.name}`,
         buttons: {
            remove: {
               icon: 'fas fa-trash',
               label: 'FOLDER.Remove',
               onPress: 'removeFolder'
            },
            cancel: {
               icon: 'fas fa-times',
               label: 'Cancel',
               onPress: () => false
            }
         },
         default: 'cancel'
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
   }

   /**
    * Removes a folder, but does not delete / remove subfolders / documents.
    *
    * @param {globalThis.Folder} document - Folder to remove.
    *
    * @param {SvelteApplicationOptions} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<globalThis.Folder|boolean|null>} The removed Folder or a falsy value; either 'false' for
    *          cancelling or 'null' if the user closed the dialog via `<Esc>` or the close header button.
    */
   static async show(document, options = {}, dialogData = {})
   {
      if (!(document instanceof globalThis.Folder))
      {
         console.warn(`TJSFolderRemove - show - warning: 'document' is not a Folder.`);
         return null;
      }

      return new TJSFolderRemove(document, options, dialogData).wait();
   }
}
