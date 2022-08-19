/**
 * Attempts to create a Foundry UUID from standard drop data. This may not work for all systems.
 *
 * @param {object}   data - Drop transfer data.
 *
 * @param {ParseDataTransferOptions}   opts - Optional parameters.
 *
 * @returns {string|undefined} Foundry UUID for drop data.
 */
export function getUUIDFromDataTransfer(data, { actor = true, compendium = true, world = true, types = void 0 } = {})
{
   if (typeof data !== 'object') { return void 0; }
   if (Array.isArray(types) && !types.includes(data.type)) { return void 0; }

   let uuid = void 0;

   if (typeof data.uuid === 'string') // v10 and above provides a full UUID.
   {
      const isCompendium = data.uuid.startsWith('Compendium');

      if (isCompendium && compendium)
      {
         uuid = data.uuid;
      }
      else if (world)
      {
         uuid = data.uuid;
      }
   }
   else // v9 and below parsing.
   {
      if (actor && world && data.actorId && data.type)
      {
         uuid = `Actor.${data.actorId}.${data.type}.${data.data._id}`;
      }
      else if (typeof data.id === 'string') // v9 and below uses `id`
      {
         if (compendium && typeof data.pack === 'string')
         {
            uuid = `Compendium.${data.pack}.${data.id}`;
         }
         else if (world)
         {
            uuid = `${data.type}.${data.id}`;
         }
      }
   }

   return uuid;
}

/**
 * @typedef {object} ParseDataTransferOptions
 *
 * @property {boolean}  [actor=true] - Accept actor owned documents.
 *
 * @property {boolean}  [compendium=true] - Accept compendium documents.
 *
 * @property {boolean}  [world=true] - Accept world documents.
 *
 * @property {string[]|undefined}   [types] - Require the `data.type` to match entry in `types`.
 */
