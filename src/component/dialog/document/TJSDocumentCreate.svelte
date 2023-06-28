<script>
   import { getContext }    from '#svelte';

   import {
      localize,
      selectOptions }       from '#svelte-fvtt/helper';

   export let documentCls = void 0;
   export let data = {};
   export let parent = null;
   export let pack = null;
   export let renderSheet = true;

   const { application } = getContext('#external');

   const managedPromise = getContext('#managedPromise');

   let form;
   let name, folderSelect, folders, hasTypes, type, types;

   if (!Object.prototype.isPrototypeOf.call(foundry.abstract.Document, documentCls))
   {
      throw new TypeError(`TJSCreateDocument error: 'documentCls' is not a Document.`);
   }

   // Collect data
   const documentName = documentCls.metadata.name;
   const label = localize(documentCls.metadata.label);
   const allTypes = game.documentTypes[documentName].filter((t) => t !== globalThis.CONST?.BASE_DOCUMENT_TYPE);

   folderSelect = data.folder || '';
   folders = parent ? [] : globalThis.game.folders.filter((f) => (f.type === documentName) && f.displayed);

   hasTypes = allTypes.length > 1;

   name = data.name || localize('DOCUMENT.New', { type: label });
   type = data.type || allTypes[0];

   types = allTypes.reduce((obj, t) =>
   {
      const typeLabel = globalThis.CONFIG[documentName]?.typeLabels?.[t] ?? t;
      obj[t] = globalThis.game.i18n.has(typeLabel) ? localize(typeLabel) : t;
      return obj;
   }, {});

   export function requestSubmit()
   {
      form.requestSubmit();
   }

   /**
    * Creates a new document from the form data.
    *
    * @returns {Promise<void>}
    */
   async function saveData(event)
   {
      const fd = new FormDataExtended(event.target);

      globalThis.foundry.utils.mergeObject(data, fd.object, { inplace: true });

      if (!data.folder) { delete data['folder']; }
      if (types.length === 1) { data.type = types[0]; }

      const document = await documentCls.create(data, { parent, pack, renderSheet });

      managedPromise.resolve(document);
      application.close();
   }
</script>

<svelte:options accessors={true}/>

<form bind:this={form} on:submit|preventDefault={saveData} autocomplete="off">
   <div class="form-group">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>{localize('Name')}</label>
      <div class="form-fields">
         <input type="text" name="name" placeholder={name} required/>
      </div>
   </div>

   {#if hasTypes}
      <div class="form-group">
         <!-- svelte-ignore a11y-label-has-associated-control -->
         <label>{localize('Type')}</label>
         <div class="form-fields">
            <select name="type">
               {@html selectOptions(types, {selected: type})}
            </select>
         </div>
      </div>
   {/if}

   {#if folders.length >= 1}
      <div class="form-group">
         <!-- svelte-ignore a11y-label-has-associated-control -->
         <label>{localize('DOCUMENT.Folder')}</label>
         <div class="form-fields">
            <select name="folder" bind:value={folderSelect}>
               <option value=""></option>
               {#each folders as folder}
                  <option value={folder.id}>{folder.name}</option>
               {/each}
            </select>
         </div>
      </div>
   {/if}
</form>
