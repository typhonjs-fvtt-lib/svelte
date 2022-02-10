<script>
   import { getContext }    from 'svelte';

   import { localize }      from '@typhonjs-fvtt/svelte/helper';
   import { TJSDocument }   from '@typhonjs-fvtt/svelte/store';

   export let document = void 0;

   const { foundryApp } = getContext('external');

   if (!(document instanceof Folder))
   {
      throw new TypeError(`TJSFolderDelete error: 'document' is not an instance of Folder.`);
   }

   const doc = new TJSDocument(document, { delete: foundryApp.close.bind(foundryApp) });

   $: if ($doc !== document)
   {
      if (!(document instanceof Folder))
      {
         throw new TypeError(`TJSFolderDelete error: 'document' is not an instance of Folder.`);
      }

      doc.set(document);

      foundryApp.data.set('title', `${localize('FOLDER.Delete')}: ${document.name}`);
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

      const folder = await document.delete({ deleteSubfolders: true, deleteContents: true });

      foundryApp.options.resolve?.(folder);
      foundryApp.close();
   }
</script>

<svelte:options accessors={true}/>

<h4>{localize('AreYouSure')}</h4>
<p>{localize('FOLDER.DeleteWarning')}</p>
