import { TJSDocumentCreate
    as TJSDocumentCreateImpl }   from '@typhonjs-fvtt/svelte/component/core';
import { localize }              from '@typhonjs-fvtt/svelte/helper';

import { TJSDialog }             from '../TJSDialog.js';

/**
 * Provides a dialog for creating documents that by default is modal and not draggable.
 */
export class TJSDocumentCreate extends TJSDialog
{
   constructor(documentCls, data = {}, { parent = null, pack = null, renderSheet = true, ...options } = {},
    dialogData = {})
   {
      super({
         modal: true,
         draggable: false,
         ...dialogData,
         content: {
            class: TJSDocumentCreateImpl,
            props: {
               documentCls,
               data,
               parent,
               pack,
               renderSheet
            }
         },
         title: localize('DOCUMENT.Create', { type: localize(documentCls?.metadata?.label) }),
         close: () => options?.resolve?.(null)
      }, options);
   }
}
