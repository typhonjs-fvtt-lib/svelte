<script>
   import { getContext }    from '#svelte';

   import { localize }      from '#svelte-fvtt/helper';
   import { TJSDocument }   from '#svelte-fvtt/store/fvtt/document';

   export let document = void 0;

   const { application } = getContext('#external');

   if (!(document instanceof Folder))
   {
      throw new TypeError(`TJSFolderRolltable error: 'document' is not an instance of Folder.`);
   }

   const doc = new TJSDocument(document, { delete: application.close.bind(application) });

   $: if ($doc !== document)
   {
      if (!(document instanceof Folder))
      {
         throw new TypeError(`TJSFolderRolltable error: 'document' is not an instance of Folder.`);
      }

      doc.set(document);

      application.data.set('title', `${localize('FOLDER.CreateTable')}: ${document.name}`);
   }

   /**
    * Creates roll table from folder documents.
    *
    * @returns {Promise<RollTable>}
    */
   export async function createTable()
   {
      return RollTable.fromFolder(document);
   }
</script>

<svelte:options accessors={true}/>

{localize('FOLDER.CreateTableConfirm')}
