<script>
   import { getContext }      from 'svelte';

   import { localize }        from '@typhonjs-fvtt/svelte/helper';
   import { TJSDocument }     from '@typhonjs-fvtt/svelte/store';

   export let document = void 0;

   const { foundryApp } = getContext('external');

   if (!(document instanceof Folder))
   {
      throw new TypeError(`TJSFolderRolltable error: 'document' is not an instance of Folder.`);
   }

   const doc = new TJSDocument(document, { delete: foundryApp.close.bind(foundryApp) });

   $: if ($doc !== document)
   {
      if (!(document instanceof Folder))
      {
         throw new TypeError(`TJSFolderRolltable error: 'document' is not an instance of Folder.`);
      }

      doc.set(document);

      foundryApp.data.set('title', `${localize('FOLDER.CreateTable')}: ${document.name}`);
   }

   /**
    * Creates roll table from folder documents.
    *
    * @returns {Promise<RollTable>}
    */
   export async function createTable()
   {
      const rollTable = await RollTable.fromFolder(document);

      foundryApp.options.resolve?.(rollTable);
      foundryApp.close();
   }
</script>

<svelte:options accessors={true}/>

{localize('FOLDER.CreateTableConfirm')}
