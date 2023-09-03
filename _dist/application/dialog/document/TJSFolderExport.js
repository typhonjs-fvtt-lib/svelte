import { TJSDialog }          from '@typhonjs-fvtt/svelte/application';
import { TJSFolderExport
    as TJSFolderExportImpl }  from '@typhonjs-fvtt/svelte/component/dialog';
import { localize }           from '@typhonjs-fvtt/svelte/helper';

/**
 * Provides a reactive dialog for exporting folders to a compendium that by default is modal and not draggable.
 */
export class TJSFolderExport extends TJSDialog
{
   /**
    * Shows a modal / non-draggable dialog to export a folder to an eligible compendium pack.
    *
    * @param {globalThis.Folder} document - Folder to export.
    *
    * @param {object} [opts] - Additional options.
    *
    * @param {string} [opts.pack] - The name of the compendium pack to provide an initial selection value in the dialog.
    *
    * @param {boolean} [opts.merge=true] - Update existing entries in the Compendium pack, matching by name
    *
    * @param {boolean} [opts.keepId=true] - Keep document IDs.
    *
    * @param {import('@typhonjs-fvtt/svelte/application').SvelteApplicationOptions} [opts.options] - Rest of options to pass to
    *        TJSDialog / Application.
    *
    * @param {import('@typhonjs-fvtt/svelte/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<globalThis.CompendiumCollection|boolean|null>} The compendium collection the folder is exported
    *          to or a falsy value; either 'false' for cancelling or 'null' if the user closed the dialog via `<Esc>`
    *          or the close header button.
    */
   constructor(document, { pack, merge, keepId, ...options } = {}, dialogData = {})
   {
      super({}, options);

      // Get eligible pack destinations
      const packs = globalThis.game.packs.filter((p) => (p.documentName === document.type) && !p.locked);
      if (!packs.length)
      {
         this.managedPromise.resolve(null);
         return globalThis.ui.notifications.warn(localize("FOLDER.ExportWarningNone", { type: document.type }));
      }

      this.data.replace({
         modal: typeof dialogData?.modal === 'boolean' ? dialogData.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         focusKeep: true,
         minimizable: false,
         ...dialogData,
         content: {
            class: TJSFolderExportImpl,
            props: {
               document,
               packName: pack,
               merge,
               keepId
            }
         },
         title: `${localize('FOLDER.ExportTitle')}: ${document.name}`,
         buttons: {
            export: {
               autoClose: false,
               icon: 'fas fa-atlas',
               label: 'FOLDER.ExportTitle',
               onPress: 'exportData'
            },
            cancel: {
               icon: 'fas fa-times',
               label: 'Cancel',
               onPress: () => false
            }
         },
         default: 'cancel'
      });
   }

   /**
    * Shows a modal / non-draggable dialog to export a folder to an eligible compendium pack.
    *
    * @param {globalThis.Folder} document - Folder to export.
    *
    * @param {object} [opts] - Additional options.
    *
    * @param {string} [opts.pack] - The name of the compendium pack to provide an initial selection value in the dialog.
    *
    * @param {boolean} [opts.merge=true] - Update existing entries in the Compendium pack, matching by name
    *
    * @param {boolean} [opts.keepId=true] - Keep document IDs.
    *
    * @param {import('@typhonjs-fvtt/svelte/application').SvelteApplicationOptions} [opts.options] - Rest of options to pass to
    *        TJSDialog / Application.
    *
    * @param {import('@typhonjs-fvtt/svelte/application').TJSDialogOptions} [dialogData] - Optional data to modify dialog.
    *
    * @returns {Promise<globalThis.CompendiumCollection|boolean|null>} The compendium collection the folder is exported
    *          to or a falsy value; either 'false' for cancelling or 'null' if the user closed the dialog via `<Esc>`
    *          or the close header button.
    */
   static async show(document, { pack, merge, keepId, ...options } = {}, dialogData = {})
   {
      if (!(document instanceof Folder))
      {
         console.warn(`TJSFolderExport - show - warning: 'document' is not a Folder.`);
         return null;
      }

      // Get eligible pack destinations if there are none then post a warning.
      const packs = globalThis.game.packs.filter((p) => (p.documentName === document.type) && !p.locked);
      if (!packs.length)
      {
         globalThis.ui.notifications.warn(localize('FOLDER.ExportWarningNone', { type: document.type }));
         return null;
      }

      return new TJSFolderExport(document, { pack, merge, keepId, ...options }, dialogData).wait();
   }
}
