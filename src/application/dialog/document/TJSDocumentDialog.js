import { localize }              from '@typhonjs-fvtt/svelte/helper';

import { TJSDocumentCreate }     from './TJSDocumentCreate.js';
import { TJSDocumentDelete }     from './TJSDocumentDelete.js';
import { TJSDocumentImport }     from './TJSDocumentImport.js';
import { TJSFolderDialog }       from './TJSFolderDialog.js';
import { TJSPermissionControl }  from './TJSPermissionControl.js';

/**
 * Provides several methods to create documents, folders, and modify them through use of TJSDialog and a modal and
 * non-draggable by default user experience.
 */
export class TJSDocumentDialog
{
   /**
    * Change permissions of a document by rendering a dialog to alter the default and all user / player permissions.
    *
    * @param {foundry.abstract.Document} document - Document instance to modify.
    *
    * @param {object} [options] - Rest of options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Document|null>} The modified document or 'null' if the user closed the dialog via `<Esc>` or the
    *                                   close header button.
    */
   static async configurePermissions(document, options = {}, dialogData = {})
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         console.warn(`TJSDocumentDialog configurePermissions warning: 'document' is not a Document.`);
         return null;
      }

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSPermissionControl(document, options, dialogData).render(true, { focus: true });
      });
   }

   /**
    * Create a new Document of the type specified by `documentCls` by rendering a dialog window to provide basic
    * creation details.
    *
    * @param {object} documentCls - Document class to create.
    *
    * @param {object} [data] - Document data.
    *
    * @param {object} [context={}] - Additional context options or dialog positioning options.
    *
    * @param {object} [context.parent] - A parent Document within which these Documents should be embedded.
    *
    * @param {object} [context.pack] - A Compendium pack identifier within which the Documents should be modified.
    *
    * @param {...*} [context.options] - Rest of options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Document|null>} The newly created document or a falsy value; either 'false' for cancelling
    *                                   or 'null' if the user closed the dialog via `<Esc>` or the close header button.
    */
   static async createDocument(documentCls, data = {}, { parent = null, pack = null, ...options } = {}, dialogData = {})
   {
      if (!Object.prototype.isPrototypeOf.call(foundry.abstract.Document, documentCls))
      {
         console.warn(`TJSDocumentDialog createDocument warning: 'documentCls' is not a Document.`);
         return null;
      }

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSDocumentCreate(documentCls, data, { parent, pack, ...options }, dialogData).render(
          true, { focus: true });
      });
   }

   /**
    * Create a new Folder by rendering a dialog window to provide basic creation details.
    *
    * @param {object} folderData - Initial data with which to populate the creation form.
    *
    * @param {object} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Folder|null>} The newly created Folder or null if the dialog is closed.
    */
   static async createFolder(folderData, options = {}, dialogData = {})
   {
      if (!(folderData?.type in CONFIG))
      {
         console.warn(`TJSDocumentDialog createFolder warning: 'type' attribute of folderData is not a Document.`);
         return null;
      }

      const label = localize(Folder.metadata.label);

      const data = foundry.utils.mergeObject({
         name: localize('DOCUMENT.New', { type: label }),
         sorting: 'a',
      }, folderData);

      const folder = new Folder(data);

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         const dialog = new TJSFolderDialog(folder, options, dialogData).render(true, { focus: true });

         setTimeout(() =>
         {
            dialog.reactive.document = game.folders.get('LsZIX3zmBaaLEuKW');
         }, 3000);

         setTimeout(() =>
         {
            dialog.reactive.document = folder;
         }, 6000);
      });
   }

   /**
    * Shows a modal / non-draggable dialog to delete a document.
    *
    * @param {foundry.abstract.Document} document - Document to delete.
    *
    * @param {object} [opts] - Additional context options or dialog positioning options.
    *
    * @param {object} [opts.context] - DocumentModificationContext.
    *
    * @param {...*} [opts.options] - Rest of options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Document|boolean|null>} The document if deleted or a falsy value; either 'false' for cancelling
    *                                   or 'null' if the user closed the dialog via `<Esc>` or the close header button.
    */
   static async deleteDocument(document, { context = {}, ...options } = {}, dialogData = {})
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         console.warn(`TJSDocumentDialog deleteDocument warning: 'document' is not a Document.`);
         return null;
      }

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSDocumentDelete(document, { context, ...options }, dialogData).render(true, { focus: true });
      });
   }

   /**
    * Render an import dialog for updating the data related to this Document through an exported JSON file
    *
    * @param {foundry.abstract.Document} document - The document to import JSON to...
    *
    * @param {object} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Document|boolean|null>} The document after import completes or a falsy value; either 'false' for
    *                         cancelling or 'null' if the user closed the dialog via `<Esc>` or the close header button.
    */
   static async importFromJSON(document, options = {}, dialogData = {})
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         console.warn(`TJSDocumentDialog importFromJSON warning: 'document' is not a Document.`);
         return null;
      }

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSDocumentImport(document, options, dialogData).render(true, { focus: true });
      });
   }

   /**
    * Updates an existing Folder by rendering a dialog window with basic details.
    *
    * @param {Folder} folder - The folder to edit.
    *
    * @param {object} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Folder|null>} The modified Folder or null if the dialog is closed.
    */
   static async updateFolder(folder, options = {}, dialogData = {})
   {
      if (!(folder instanceof Folder))
      {
         console.warn(`TJSDocumentDialog editFolder warning: 'folder' is not a Folder.`);
         return null;
      }

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSFolderDialog(folder, options, dialogData).render(true, { focus: true });
      });
   }
}
