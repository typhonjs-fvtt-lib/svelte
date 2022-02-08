import { TJSFolderDialog
    as TJSFolderDialogImpl }  from '@typhonjs-fvtt/svelte/component/core';
import { localize }           from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }          from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }          from '../TJSDialog.js';

/**
 * Provides a reactive dialog for modifying folders that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different folder document.
 */
export class TJSFolderDialog extends TJSDialog
{
   /**
    * @param {Folder}  document -
    *
    * @param {object}   options -
    *
    * @param {object}   dialogData -
    */
   constructor(document, options = {}, dialogData = {})
   {
      super({
         modal: typeof options?.modal === 'boolean' ? options.modal : true,
         draggable: typeof options?.draggable === 'boolean' ? options.draggable : false,
         ...dialogData,
         content: {
            class: TJSFolderDialogImpl,
            props: { document }
         },
         title: document.id ? `${localize('FOLDER.Update')}: ${document.name}` : localize('FOLDER.Create'),
         buttons: {
            submit: {
               icon: 'fas fa-check',
               label: localize(document?.id ? 'FOLDER.Update' : 'FOLDER.Create'),
               onclick: 'requestSubmit'
            }
         },
         default: 'submit',
         autoClose: false,
         close: () => this.options?.resolve?.(null)
      }, { id: `tjs-folder-edit-${document.id}`, ...options });

      /**
       * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
       *                             TJSFolderDialog.
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
}
