<script>
   import { getContext }    from 'svelte';

   import { localize }      from '@typhonjs-fvtt/svelte/helper';
   import { TJSDocument }   from '@typhonjs-fvtt/svelte/store/fvtt/document';

   export let document = void 0;

   const { application } = getContext('#external');

   if (!(document instanceof Folder))
   {
      throw new TypeError(`TJSFolderDelete error: 'document' is not an instance of Folder.`);
   }

   const doc = new TJSDocument(document, { delete: application.close.bind(application) });

   $: if ($doc !== document)
   {
      if (!(document instanceof Folder))
      {
         throw new TypeError(`TJSFolderDelete error: 'document' is not an instance of Folder.`);
      }

      doc.set(document);

      application.data.set('title', `${localize('FOLDER.Delete')}: ${document.name}`);
   }

   /**
    * Removes a folder with deleting documents.
    *
    * @returns {Promise<Folder>}
    */
   export async function deleteFolder()
   {
      // Remove the delete Document function callback as we are intentionally deleting below.
      doc.setOptions({ delete: void 0 });

      return document.delete({ deleteSubfolders: true, deleteContents: true });
   }
</script>

<svelte:options accessors={true}/>

<h4>{localize('AreYouSure')}</h4>
<p>{localize('FOLDER.DeleteWarning')}</p>
