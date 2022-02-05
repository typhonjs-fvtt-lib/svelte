import { TJSPermissionControl
    as TJSPermissionControlImpl }   from '@typhonjs-fvtt/svelte/component/core';

import { localize }                 from '@typhonjs-fvtt/svelte/helper';
import { hasSetter }                from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }                from '../TJSDialog.js';

/**
 * Provides a reactive dialog for permission control that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSPermissionControl extends TJSDialog
{
   /**
    * @param {foundry.abstract.Document}  document -
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
            class: TJSPermissionControlImpl,
            props: { document }
         },
         title: `${localize('PERMISSION.Title')}: ${document.name}`,
         close: () => this.options?.resolve?.(null)
      }, { width: 320, ...options });

      /**
       * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
       *                             TJSPermissionControl.
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
