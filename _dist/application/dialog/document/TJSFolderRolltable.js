import { TJSFolderRolltable
    as TJSFolderRolltableImpl }  from '@typhonjs-fvtt/svelte/component/core';

import { localize }              from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }             from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }             from '../TJSDialog.js';

/**
 * Provides a reactive dialog for creating a RollTable from a folder that by default is modal and not draggable. An
 * additional set of accessors for the folder assigned are available via the `this.reactive.document`. You may swap out
 * the folder at any time by setting it to a different folder document.
 */
export class TJSFolderRolltable extends TJSDialog
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
            class: TJSFolderRolltableImpl,
            props: { document }
         },
         title: `${localize('FOLDER.CreateTable')}: ${document.name}`,
         buttons: {
            create: {
               icon: `${CONFIG.RollTable.sidebarIcon}`,
               label: 'FOLDER.CreateTable',
               onclick: 'createTable'
            },
            cancel: {
               icon: 'fas fa-times',
               label: 'Cancel',
               onclick: () =>
               {
                  this.options?.resolve?.(false);
                  this.close();
               }
            }
         },
         default: 'create',
         autoClose: false,
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
   }
}
