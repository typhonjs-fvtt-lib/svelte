<script>
   import { getContext }   from 'svelte';

   import { localize }     from '@typhonjs-fvtt/svelte/helper';
   import { TJSDocument }  from '@typhonjs-fvtt/svelte/store';

   /** @type {foundry.abstract.Document} */
   export let document = void 0;

   /** @type {object} DocumentModificationContext */
   export let context = {};

   const { foundryApp } = getContext('external');

   if (!(document instanceof foundry.abstract.Document))
   {
      throw new TypeError(`TJSDocumentDelete error: 'document' is not an instance of Document.`);
   }

   const doc = new TJSDocument(document, { delete: foundryApp.close.bind(foundryApp) });

   let name = document?.id ? document.name : '';
   let type = localize(document.constructor.metadata.label);

   $: if (typeof context !== 'object')
   {
      throw new TypeError(`TJSDocumentDelete error: 'context' is not an object.`);
   }

   $: if ($doc !== document)
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocumentDelete error: 'document' is not an instance of Document.`);
      }

      doc.set(document);

      name = document?.id ? document.name : '';
      type = localize(document.constructor.metadata.label);

      foundryApp.data.set('title', `${localize('DOCUMENT.Delete', { type })}: ${document.name}`);
   }

   /**
    * Handles the button click for 'Yes'.
    *
    * @returns {Promise<void>}
    */
   export async function deleteDocument()
   {
      // Remove the delete Document function callback as we are intentionally deleting below.
      doc.setOptions({ delete: void 0 });

      const returnDoc = await document.delete(context);

      foundryApp.options.resolve?.(returnDoc);
   }
</script>

<svelte:options accessors={true}/>

<h4>{localize('AreYouSure')}</h4>
<p>{localize('SIDEBAR.DeleteWarning', { type })}</p>
