<script>
   import { getContext }   from 'svelte';

   import {
      localize,
      selectOptions }      from '@typhonjs-fvtt/svelte/helper';

   import { TJSDocument }  from '@typhonjs-fvtt/svelte/store';

   export let document = void 0;

   const { application } = getContext('#external');

   const managedPromise = getContext('#managedPromise');

   if (!(document instanceof globalThis.foundry.abstract.Document))
   {
      throw new TypeError(`TJSOwnershipControl error: 'document' is not an instance of Document.`);
   }

   const doc = new TJSDocument(document, { delete: application.close.bind(application) });

   let form, instructions;
   let currentDefault, defaultLevels, playerLevels, users;
   let isFolder = document instanceof Folder;
   let isEmbedded = document.isEmbedded;
   let ownership = document.ownership;

   if (!ownership && !isFolder)
   {
      throw new Error(`The ${document.documentName} document does not contain ownership data`);
   }

   $: if ($doc !== document)
   {
      if (!(document instanceof globalThis.foundry.abstract.Document))
      {
         throw new TypeError(`TJSOwnershipControl error: 'document' is not an instance of Document.`);
      }

      doc.set(document);

      const title = localize('OWNERSHIP.Title');

      application.data.set('title', `${title}: ${document.name}`);
   }

   $: {
      ({ currentDefault, defaultLevels, playerLevels, users } = getData());
      isFolder = $doc instanceof Folder;
      isEmbedded = $doc.isEmbedded;
      instructions = localize(isFolder ? 'OWNERSHIP.HintFolder' : 'OWNERSHIP.HintDocument');

      if (!ownership && !isFolder)
      {
         throw new Error(`The ${document.documentName} document does not contain ownership data`);
      }
   }

   /**
    * Builds the data for the permission dialog from the document.
    */
   function getData()
   {
      // User permission levels
      const playerLevels = Object.entries(globalThis.CONST.DOCUMENT_META_OWNERSHIP_LEVELS).map(([name, level]) =>
      {
         return { level, label: localize(`OWNERSHIP.${name}`) };
      });

      if (!isFolder) { playerLevels.pop(); }

      for (const [name, level] of Object.entries(globalThis.CONST.DOCUMENT_OWNERSHIP_LEVELS))
      {
         if ((level < 0) && !isEmbedded) { continue; }

         playerLevels.push({ level, label: localize(`OWNERSHIP.${name}`) });
      }

      // Default permission levels
      const defaultLevels = globalThis.foundry.utils.deepClone(playerLevels);
      defaultLevels.shift();

      // Player users
      const users = globalThis.game.users.map(user => {
         return {
            user,
            level: isFolder ? globalThis.CONST.DOCUMENT_META_OWNERSHIP_LEVELS.NOCHANGE : ownership[user.id],
            isAuthor: $doc.author === user
         };
      });

      // Construct and return the data object
      return {
         currentDefault: $doc?.ownership?.default ?? playerLevels[0],
         defaultLevels,
         playerLevels,
         users
      };
   }

   export function requestSubmit()
   {
      form.requestSubmit();
   }

   /**
    * Saves any form data / changes to document.
    *
    * @returns {Promise<void>}
    */
   async function saveData(event)
   {
      if (!($doc instanceof globalThis.foundry.abstract.Document)) { return; }

      const formData = new FormDataExtended(event.target).object;

      // Collect new ownership levels from the form data
      const metaLevels = globalThis.CONST.DOCUMENT_META_OWNERSHIP_LEVELS;
      const omit = isFolder ? metaLevels.NOCHANGE : metaLevels.DEFAULT;
      const ownershipLevels = {};
      for (const [user, level] of Object.entries(formData))
      {
         if (level === omit)
         {
            delete ownershipLevels[user];
            continue;
         }
         ownershipLevels[user] = level;
      }

      // Update all documents in a Folder
      if ($doc instanceof Folder)
      {
         const cls = globalThis.getDocumentClass($doc.type);
         const updates = $doc.contents.map((d) =>
         {
            const ownership = globalThis.foundry.utils.deepClone(d.ownership);

            for (const [k, v] of Object.entries(ownershipLevels))
            {
               if (v === metaLevels.DEFAULT) { delete ownership[k]; }
               else { ownership[k] = v; }
            }

            return { _id: d.id, ownership };
         });

         await cls.updateDocuments(updates, { diff: false, recursive: false, noHook: true });

         managedPromise.resolve($doc);
         application.close();
         return;
      }

      // Update a single Document
      await $doc.update({ ownership: ownershipLevels }, { diff: false, recursive: false, noHook: true });

      managedPromise.resolve($doc);
      application.close();
   }
</script>

<svelte:options accessors={true}/>

<form bind:this={form} on:submit|preventDefault={saveData}>
   <p class=notes>{instructions}</p>

   <div class=form-group>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>{localize('OWNERSHIP.AllPlayers')}</label>
      <select name=default data-dtype=Number>
         {@html selectOptions(defaultLevels, { selected: currentDefault, nameAttr: 'level', labelAttr: 'label' })}
      </select>
   </div>
   <hr/>

   {#each users as data (data.user.id)}
      <div class=form-group class:hidden={data.user.isGM}>
         <!-- svelte-ignore a11y-label-has-associated-control -->
         <label>{data.user.name}</label>
            <select name={data.user.id} data-dtype=Number>
               {@html selectOptions(playerLevels, { selected: data.level, nameAttr: 'level', labelAttr: 'label' })}
            </select>
        </div>
    {/each}
</form>
