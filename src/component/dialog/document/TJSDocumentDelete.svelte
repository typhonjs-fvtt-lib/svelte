<script>
   import { getContext }   from '#svelte';

   import { isObject }     from '#runtime/util/object';

   import { localize }     from '#svelte-fvtt/helper';
   import { TJSDocument }  from '#svelte-fvtt/store/fvtt/document';

   /** @type {foundry.abstract.Document} */
   export let document = void 0;

   /** @type {object} DocumentModificationContext */
   export let context = {};

   const { application } = getContext('#external');

   if (!(document instanceof globalThis.foundry.abstract.Document))
   {
      throw new TypeError(`TJSDocumentDelete error: 'document' is not an instance of Document.`);
   }

   const doc = new TJSDocument(document, { delete: application.close.bind(application) });

   let name = document?.id ? document.name : '';
   let type = localize(document.constructor.metadata.label);

   $: if (!isObject(context))
   {
      throw new TypeError(`TJSDocumentDelete error: 'context' is not an object.`);
   }

   $: if ($doc !== document)
   {
      if (!(document instanceof globalThis.foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocumentDelete error: 'document' is not an instance of Document.`);
      }

      doc.set(document);

      name = document?.id ? document.name : '';
      type = localize(document.constructor.metadata.label);

      application.data.set('title', `${localize('DOCUMENT.Delete', { type })}: ${document.name}`);
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

      return document.delete(context);
   }
</script>

<svelte:options accessors={true}/>

<h4>{localize('AreYouSure')}</h4>
<p>{localize('SIDEBAR.DeleteWarning', { type })}</p>
