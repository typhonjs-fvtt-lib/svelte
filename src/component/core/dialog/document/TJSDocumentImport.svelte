<script>
   import { getContext }   from 'svelte';

   import { localize }     from '@typhonjs-fvtt/svelte/helper';
   import { TJSDocument }  from '@typhonjs-fvtt/svelte/store';

   /** @type {foundry.abstract.Document} */
   export let document = void 0;

   const { foundryApp } = getContext('external');

   if (!(document instanceof foundry.abstract.Document))
   {
      throw new TypeError(`TJSDocumentImport error: 'document' is not an instance of Document.`);
   }

   const doc = new TJSDocument(document, { delete: foundryApp.close.bind(foundryApp) });

   let hint1 = localize('DOCUMENT.ImportDataHint1', { document: document.documentName });
   let hint2 = localize('DOCUMENT.ImportDataHint2', { name: document.name });

   $: if ($doc !== document)
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSDocumentImport error: 'document' is not an instance of Document.`);
      }

      doc.set(document);

      hint1 = localize('DOCUMENT.ImportDataHint1', { document: document.documentName });
      hint2 = localize('DOCUMENT.ImportDataHint2', { name: document.name });

      foundryApp.reactive.title = `${localize('DOCUMENT.ImportData')}: ${document.name}`;
   }
</script>

<svelte:options accessors={true}/>

<form on:submit|preventDefault autocomplete=off>
    <p class=notes>{hint1}</p>
    <p class=notes>{hint2}</p>
    <div class=form-group>
        <label for=data>{localize('DOCUMENT.ImportSource')}</label>
        <input type=file id="data"/>
    </div>
</form>
