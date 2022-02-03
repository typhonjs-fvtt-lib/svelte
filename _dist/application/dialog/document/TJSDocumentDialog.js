import { TJSDialog }             from '../TJSDialog.js';
import { TJSDocumentCreate }     from './TJSDocumentCreate.js';
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
    * @param {object} document - Document instance to modify.
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
    * Create a new Folder by rendering a dialog window to provide basic creation details
    *
    * @param {object} folderData - Initial data with which to populate the creation form
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

      const label = game.i18n.localize(Folder.metadata.label);

      const data = foundry.utils.mergeObject({
         name: game.i18n.format('DOCUMENT.New', { type: label }),
         sorting: 'a',
      }, folderData);

      const folder = new Folder(data);

      return new Promise((resolve) =>
      {
         options.resolve = resolve;
         new TJSFolderDialog(folder, options, dialogData).render(true, { focus: true });
      });
   }

   /**
    * Shows a modal / non-draggable dialog to delete a document.
    *
    * @param {Document} document - Document to delete.
    *
    * @param {object} [options] - Options to pass to TJSDialog / Application.
    *
    * @param {object} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<Document|boolean|null>} The document if deleted or a falsy value; either 'false' for cancelling
    *                                   or 'null' if the user closed the dialog via `<Esc>` or the close header button.
    */
   static async deleteDocument(document, options = {}, dialogData = {})
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         console.warn(`TJSDocumentDialog deleteDocument warning: 'document' is not a Document.`);
         return null;
      }

      const type = game.i18n.localize(document.constructor.metadata.label);
      return TJSDialog.confirm({
         modal: typeof options?.modal === 'boolean' ? options.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         ...dialogData,
         title: `${game.i18n.format('DOCUMENT.Delete', { type })}: ${document.name}`,
         content: `<h4>${game.i18n.localize('AreYouSure')}</h4><p>${game.i18n.format('SIDEBAR.DeleteWarning',
          { type })}</p>`,
         yes: document.delete.bind(document),
         options
      });
   }

   /**
    * Render an import dialog for updating the data related to this Document through an exported JSON file
    *
    * @param {Document} document - The document to import JSON to...
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

      const content = await renderTemplate('templates/apps/import-data.html',
      {
          hint1: game.i18n.format('DOCUMENT.ImportDataHint1', { document: document.documentName }),
          hint2: game.i18n.format('DOCUMENT.ImportDataHint2', { name: document.name })
      });

      return new Promise((resolve) =>
      {
         new TJSDialog({
            modal: typeof options?.modal === 'boolean' ? options.modal : true,
            draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
            ...dialogData,
            title: `Import Data: ${document.name}`,
            content,
            buttons: {
               import: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: 'Import',
                  callback: async (html) =>
                  {
                     const form = html.querySelector('form');

                     if (!form.data.files.length) { return ui.notifications.error('You did not upload a data file!'); }

                     const json = await readTextFromFile(form.data.files[0]);
                     const importedDoc = await document.importFromJSON(json);

                     resolve(importedDoc);
                  }
               },
               no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: 'Cancel',
                  callback: () => resolve(false)
               }
            },
            default: 'import',
            close: () => resolve(null)
         }, {
            width: 400,
            ...options
         }).render(true, { focus: true });
      });
   }
}
