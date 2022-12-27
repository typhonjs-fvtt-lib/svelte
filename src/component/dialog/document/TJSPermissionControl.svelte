<script>
   import { getContext }   from 'svelte';

   import {
      localize,
      selectOptions }      from '@typhonjs-fvtt/svelte/helper';

   import { TJSDocument }  from '@typhonjs-fvtt/svelte/store';

   export let document = void 0;

   const { application } = getContext('external');

   if (!(document instanceof foundry.abstract.Document))
   {
      throw new TypeError(`TJSPermissionControl error: 'document' is not an instance of Document.`);
   }

   const doc = new TJSDocument(document, { delete: application.close.bind(application) });

   let form, instructions;
   let currentDefault, defaultLevels, playerLevels, users;
   let isFolder = document instanceof Folder;

   $: if ($doc !== document)
   {
      if (!(document instanceof foundry.abstract.Document))
      {
         throw new TypeError(`TJSPermissionControl error: 'document' is not an instance of Document.`);
      }

      doc.set(document);

      const title = localize('OWNERSHIP.Title');

      application.data.set('title', `${title}: ${document.name}`);
   }

   $: {
      ({ currentDefault, defaultLevels, playerLevels, users } = getData());
      isFolder = $doc instanceof Folder;
      instructions = localize(isFolder ? 'OWNERSHIP.HintFolder' : 'OWNERSHIP.HintDocument');
   }

   /**
    * Builds the data for the permission dialog from the document.
    */
   function getData()
   {
      // User permission levels
      const playerLevels = {};
      if (isFolder)
      {
         playerLevels['-2'] = localize('OWNERSHIP.DEFAULT');
         playerLevels['-1'] = localize('OWNERSHIP.NOCHANGE');
      }
      else
      {
         playerLevels['-1'] = localize('OWNERSHIP.DEFAULT');
      }

      for (const [n, l] of Object.entries(CONST.DOCUMENT_PERMISSION_LEVELS))
      {
         playerLevels[l] = localize(`OWNERSHIP.${n}`);
      }

      // Default permission levels
      const defaultLevels = foundry.utils.deepClone(playerLevels);

      if (isFolder) { delete defaultLevels['-2']; }
      else { delete defaultLevels['-1']; }

      // Player users
      const users = game.users.map((u) =>
      {
         return {
            user: u,
            level: $doc.data.permission?.[u.id] ?? '-1'
         };
      });

      // Construct and return the data object
      return {
         currentDefault: $doc.data.permission?.default ?? '-1',
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
      if (!($doc instanceof foundry.abstract.Document)) { return; }

      const formData = new FormDataExtended(event.target).toObject();

      // Collect user permissions
      const perms = {};
      for (const [user, level] of Object.entries(formData))
      {
         if (level === -1)
         {
            delete perms[user];
            continue;
         }
         perms[user] = level;
      }

      // Update all documents in a Folder
      if ($doc instanceof Folder)
      {
         const cls = getDocumentClass($doc.type);
         const updates = $doc.content.map((e) =>
         {
            const p = foundry.utils.deepClone(e.data.permission);
            for (const [k, v] of Object.entries(perms))
            {
               if (v === -2) { delete p[k]; }
               else { p[k] = v; }
            }
            return { _id: e.id, permission: p };
         });

         await cls.updateDocuments(updates, { diff: false, recursive: false, noHook: true });

         application.options.resolve?.($doc);
         application.close();
      }

      // Update a single Document
      await $doc.update({ permission: perms }, { diff: false, recursive: false, noHook: true });

      application.options.resolve?.($doc);
      application.close();
   }
</script>

<svelte:options accessors={true}/>

<form bind:this={form} on:submit|preventDefault={saveData} id=permission-control>
   <p class=notes>{instructions}</p>

   <div class=form-group>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>{localize('OWNERSHIP.AllPlayers')}</label>
      <select name=default data-dtype=Number>
         {@html selectOptions(defaultLevels, { selected: currentDefault })}
      </select>
   </div>
   <hr/>

   {#each users as data (data.user.id)}
      <div class=form-group class:hidden={data.user.isGM}>
         <!-- svelte-ignore a11y-label-has-associated-control -->
         <label>{data.user.name}</label>
            <select name={data.user.id} data-dtype=Number>
               {@html selectOptions(playerLevels, { selected: data.level })}
            </select>
        </div>
    {/each}
</form>
