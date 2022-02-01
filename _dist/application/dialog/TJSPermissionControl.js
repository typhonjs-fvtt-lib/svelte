import { TJSPermissionControl
    as TJSPermissionControlImpl }   from '@typhonjs-fvtt/svelte/component/core';

import { hasSetter }                from '@typhonjs-fvtt/svelte/util';

import { TJSDialog }                from './TJSDialog.js';

/**
 * Provides a reactive dialog for permission control that by default is modal and not draggable. An additional set of
 * accessors for the document assigned are available via the `this.reactive.document`. You may swap out the document at
 * any time by setting it to a different document.
 */
export class TJSPermissionControl extends TJSDialog
{
   constructor(document, data = {})
   {
      super({
         modal: true,
         draggable: false,
         ...data,
         content: {
            class: TJSPermissionControlImpl,
            props: { document }
         },
         title: `${game.i18n.localize('PERMISSION.Title')}: ${document.name}`
      });

      // Add accessors to reactive data for 'document'.
      Object.defineProperty(this.reactive, 'document', {
         get: () => this.svelte?.dialogComponent,
         set: (document) =>
         {
            const dialogComponent = this.svelte.dialogComponent;
            if (hasSetter(dialogComponent, 'document')) { dialogComponent.document = document; }
         }
      });
   }
}
