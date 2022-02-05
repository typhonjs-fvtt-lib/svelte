<script>
   import { getContext }   from 'svelte';

   import {
      localize,
      radioBoxes }         from '@typhonjs-fvtt/svelte/helper';

   import { TJSDocument }  from '@typhonjs-fvtt/svelte/store';

   export let document = void 0;

   const { foundryApp } = getContext('external');

   if (!(document instanceof Folder))
   {
      throw new TypeError(`TJSFolderDialog error: 'document' is not an instance of Folder.`);
   }

   const doc = new TJSDocument(document, { delete: foundryApp.close.bind(foundryApp) });
   const newName = localize('DOCUMENT.New', { type: localize(Folder.metadata.label) });
   const sortingModes = { a: 'FOLDER.SortAlphabetical', m: 'FOLDER.SortManual' };

   let name = document?.id ? document.name : '';
   let safeColor = document?.data?.color ?? '#000000';
   let submitText = localize(document?.id ? 'FOLDER.Update' : 'FOLDER.Create');

   $: if ($doc !== document)
   {
      if (!(document instanceof Folder))
      {
         throw new TypeError(`TJSFolderDialog error: 'document' is not an instance of Folder.`);
      }

      doc.set(document);

      name = document?.id ? document.name : '';
      safeColor = document?.data?.color ?? '#000000';
      submitText = localize(document?.id ? 'FOLDER.Update' : 'FOLDER.Create');

      foundryApp.reactive.title = document?.id ? `${localize('FOLDER.Update')}: ${document.name}` :
       localize('FOLDER.Create');
   }

   /**
    * Saves any form data / changes to document.
    *
    * @returns {Promise<void>}
    */
   async function saveData(event)
   {
      const formData = new FormDataExtended(event.target).toObject();

      if (!formData.parent) { formData.parent = null; }

      let modifiedDoc = document;

      if (document.id)
      {
         await document.update(formData);
      }
      else
      {
         document.data.update(formData);
         modifiedDoc = await Folder.create(document.data);
      }

      foundryApp.options.resolve?.(modifiedDoc);
      foundryApp.close();
   }
</script>

<svelte:options accessors={true}/>

<form on:submit|preventDefault={saveData} id=folder-create autocomplete=off>
   <input type=hidden name=type value={document.data.type}/>
   <input type=hidden name=parent value={document.data.parent}/>

   <div class=form-group>
      <label>{localize('FOLDER.Name')}</label>
      <div class=form-fields>
         <input type=text name=name placeholder={newName} value={name} required/>
      </div>
   </div>

   <div class=form-group>
      <label>{localize('FOLDER.Color')}</label>
      <div class=form-fields>
         <input type=text name=color bind:value={safeColor} readonly />
         <input type=color bind:value={safeColor} data-edit=color />
      </div>
   </div>

   <div class=form-group>
      <label>{localize('FOLDER.SortMode')}</label>
      <div class=form-fields>
         {@html radioBoxes('sorting', sortingModes, { checked: document.data.sorting, localize: true })}
      </div>
   </div>
   <button type=submit>
      <i class="fas fa-check"></i> {submitText}
   </button>
</form>
