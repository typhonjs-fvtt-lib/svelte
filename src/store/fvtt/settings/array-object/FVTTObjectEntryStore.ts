import { ObjectEntryStore }            from '#runtime/svelte/store/reducer/array-object';

import type { GameSettingArrayObject } from './GameSettingArrayObject';

/**
 * Provides an extension to {@link #runtime/svelte/store/reducer/array-object!ObjectEntryStore} adding the
 * {@link FVTTObjectEntryStore.canEdit} accessor which when paired with {@link GameSettingArrayObject} forwards on
 * whether the current Foundry user can edit / save to the Foundry DB.
 *
 * This is the base {@link ObjectEntryStore} available from a direct import or through
 * {@link GameSettingArrayObject.EntryStore} accessor.
 */
export abstract class FVTTObjectEntryStore<T extends GameSettingArrayObject.Data.BaseArrayObject =
 GameSettingArrayObject.Data.BaseArrayObject> extends ObjectEntryStore<T>
{
   readonly #canEdit: boolean;

   /**
    * @param data - Initial entry data.
    *
    * @param [gameSettingArrayObject] - Associated backing array object store. Automatically passed on entry creation
    *        by {@link #runtime/svelte/store/reducer/array-object!ArrayObjectStore}.
    */
   protected constructor(data: T, gameSettingArrayObject?: GameSettingArrayObject<any>)
   {
      super(data);

      this.#canEdit = gameSettingArrayObject?.canEdit ?? true;
   }

   /**
    * Can the current user edit / save this instance to the Foundry DB.
    */
   get canEdit(): boolean
   {
      return this.#canEdit;
   }
}
