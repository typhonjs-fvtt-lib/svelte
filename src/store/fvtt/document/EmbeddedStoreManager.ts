import { DynMapReducer }      from '#runtime/svelte/store/reducer';

import { isDocument }         from '#runtime/types/fvtt-shim/guard';

import {
   hasPrototype,
   isObject }                 from '#runtime/util/object';

import type { DynReducer }    from '#runtime/svelte/store/reducer';

import type { TJSDocument }   from './TJSDocument';

/**
 * Provides management of reactive embedded collections.
 *
 * @privateRemarks
 * TODO: Consider subscribing to TJSDocument rather than exposing {@link EmbeddedStoreManager.handleDocChange} and
 * {@link EmbeddedStoreManager.handleUpdate}
 */
export class EmbeddedStoreManager implements TJSDocument.API.Embedded {
   /**
    * RegExp for detecting CRUD updates for the associated document.
    */
   static #updateActionRegex: RegExp = /(?<action>create|delete|update)(?<sep>\.?)(?<name>\w+)/;

   /**
    */
   #name: Map<string, EmbeddedCollectionData<unknown>> = new Map();

   /**
    * Source document.
    */
   readonly #document: (fvtt.Document | undefined)[];

   /**
    * Reverse lookup for older Foundry versions.
    */
   #collectionToDocName: Map<string, string> = new Map();

   /**
    * Valid embedded collection actions.
    */
   #embeddedNames: Set<string> = new Set();

   /**
    * @param document - The associated document holder.
    */
   constructor(document: (fvtt.Document | undefined)[]) {
      this.#document = document;

      this.handleDocChange();

      Object.seal(this);
   }

   /**
    * Create a reactive embedded collection store. When no options are provided the name of the embedded collection
    * matches the document name.
    *
    * @param FoundryDoc - A Foundry document.
    *
    * @param [options] - Dynamic reducer create options.
    *
    * @typeParam D `Foundry Document`.
    *
    * @typeParam O `CreateOptions` - Embedded API create options.
    */
   create<D extends fvtt.DocumentConstructor, O extends TJSDocument.API.Embedded.CreateOptions<InstanceType<D>>>(
    FoundryDoc: D, options?: O):
      O extends typeof DynMapReducer<string, InstanceType<D>>
         ? InstanceType<O>
         : O extends { ctor: typeof DynMapReducer<string, InstanceType<D>> }
            ? InstanceType<O['ctor']>
            : DynMapReducer<string, InstanceType<D>>
   {
      const docName: string = FoundryDoc?.documentName;

      if (typeof docName !== 'string')
      {
         throw new TypeError(
          `EmbeddedStoreManager.create error: 'FoundryDoc' does not have a valid 'documentName' property.`);
      }

      const doc: fvtt.Document | undefined = this.#document[0];

      let collection: Map<string, InstanceType<D>> | null = null;

      if (doc)
      {
         try
         {
            collection = doc.getEmbeddedCollection(docName) as unknown as Map<string, InstanceType<D>>;
         }
         catch (err)
         {
            console.warn(`EmbeddedStoreManager.create error: No valid embedded collection for: ${docName}`);
         }
      }

      let embeddedData: EmbeddedCollectionData<any> | undefined = this.#name.get(docName);

      if (!embeddedData)
      {
         embeddedData = {
            collection,
            stores: new Map<string, DynMapReducer<string, InstanceType<D>>>()
         };

         this.#name.set(docName, embeddedData);
      }

      /**
       * Reducer name
       */
      let name: string | undefined;

      /**
       * Rest of common reducer options.
       */
      let rest: DynReducer.Options.Common<D> = {};

      /**
       * Reducer constructor function.
       */
      let ctor: typeof DynMapReducer<string, InstanceType<D>>;

      if (typeof options === 'string')
      {
         name = options;
         ctor = DynMapReducer;
      }
      else if (typeof options === 'function' && hasPrototype(options, DynMapReducer))
      {
         ctor = options as typeof DynMapReducer;
      }
      else if (isObject(options))
      {
         ({ name, ctor = DynMapReducer, ...rest as DynReducer.Options.Common<InstanceType<D>> } = options);
      }
      else
      {
         name = docName;
         ctor = DynMapReducer;
      }

      if (!hasPrototype(ctor, DynMapReducer))
      {
         throw new TypeError(`EmbeddedStoreManager.create error: 'ctor' is not a 'DynMapReducer'.`);
      }

      name = name ?? ctor?.name;

      if (typeof name !== 'string')
      {
         throw new TypeError(`EmbeddedStoreManager.create error: 'name' is not a string.`);
      }

      // A bit funky here. I have not figured out the right guards to satisfy the complex return type.
      type CreateReturnType = O extends typeof DynMapReducer<string, InstanceType<D>>
      ? InstanceType<O>
      : O extends { ctor: typeof DynMapReducer<string, InstanceType<D>> }
          ? InstanceType<O['ctor']>
          : DynMapReducer<string, InstanceType<D>>;

      if (embeddedData.stores.has(name))
      {
         return embeddedData.stores.get(name) as CreateReturnType;
      }
      else
      {
         const reducerOptions = collection ? { data: collection, ...rest } : { ...rest };
         const instance = new ctor(reducerOptions as DynReducer.Options.MapReducer<string, InstanceType<D>>);
         embeddedData.stores.set(name, instance);

         // Invoke protected initialize method.
         if (typeof (instance as any)?.initialize === 'function') { (instance as any).initialize(rest); }

         return instance as CreateReturnType;
      }
   }

   /**
    * Destroys one or more embedded collection reducers. When no `reducerName` is provided all reactive embedded
    * collections are destroyed for the given document type.
    *
    * @param FoundryDoc - A Foundry document class constructor.
    *
    * @param [reducerName] - Optional name of a specific reducer to destroy.
    *
    * @typeParam D `Foundry Document`.
    */
   destroy<D extends fvtt.DocumentConstructor>(FoundryDoc?: D, reducerName?: string): boolean
   {
      let count: number = 0;

      // Destroy all embedded stores
      if (FoundryDoc === void 0)
      {
         for (const embeddedData of this.#name.values())
         {
            embeddedData.collection = null;
            for (const store of embeddedData.stores.values())
            {
               store.destroy();
               count++;
            }
         }

         this.#name.clear();
      }
      else
      {
         const docName: string = FoundryDoc?.documentName;

         if (typeof docName !== 'string')
         {
            throw new TypeError(
             `EmbeddedStoreManager.delete error: 'FoundryDoc' does not have a valid 'documentName' property.`);
         }

         if (reducerName === void 0)
         {
            const embeddedData: EmbeddedCollectionData<unknown> | undefined = this.#name.get(docName);
            if (embeddedData)
            {
               embeddedData.collection = null;
               for (const store of embeddedData.stores.values())
               {
                  store.destroy();
                  count++;
               }
            }

            this.#name.delete(docName);
         }
         else if (reducerName === 'string')
         {
            const embeddedData: EmbeddedCollectionData<unknown> | undefined = this.#name.get(docName);
            if (embeddedData)
            {
               const store: DynMapReducer<string, any> | undefined = embeddedData.stores.get(reducerName);
               if (store)
               {
                  store.destroy();
                  count++;
               }
            }
         }
      }

      return count > 0;
   }

   /**
    * Returns a specific existing embedded collection store. When no `reducerName` is provided the document name
    * is used instead.
    *
    * @param FoundryDoc - A Foundry document class constructor.
    *
    * @param [reducerName] - Optional name of a specific reducer to get.
    *
    * @typeParam D `Foundry Document`.
    *
    * @returns The associated reactive embedded collection / reducer.
    */
   get<D extends fvtt.DocumentConstructor>(FoundryDoc: D, reducerName?: string):
    DynMapReducer<string, InstanceType<D>> | undefined
   {
      const docName = FoundryDoc?.documentName;

      if (typeof docName !== 'string')
      {
         throw new TypeError(
          `EmbeddedStoreManager.get error: 'FoundryDoc' does not have a valid 'documentName' property.`);
      }

      const embeddedData: EmbeddedCollectionData<any> | undefined = this.#name.get(docName);

      if (embeddedData)
      {
         return embeddedData.stores.get(reducerName ?? docName);
      }
   }

   /**
    * Updates all existing embedded collection stores with the associated embedded collection
    */
   handleDocChange(): void
   {
      const doc: fvtt.Document | undefined = this.#document[0];

      if (isDocument(doc))
      {
         const existingEmbeddedNames = new Set(this.#name.keys());

         /**
          * All embedded names from associated document.
          */
         const embeddedNames: [string, string][] = Object.entries(
          (doc.constructor as fvtt.DocumentConstructor)?.metadata?.embedded ?? []);

         this.#collectionToDocName.clear();

         // Remove all previously stored embedded name CRUD keys.
         this.#embeddedNames.clear();

         for (const [docName, collectionName] of embeddedNames)
         {
            // Remove processed embedded doc name from existingEmbeddedNames set.
            existingEmbeddedNames.delete(docName);

            // Update CRUD keys for v10.
            this.#embeddedNames.add(`create${docName}`);
            this.#embeddedNames.add(`delete${docName}`);
            this.#embeddedNames.add(`update${docName}`);

            // Update CRUD keys for v11.
            this.#embeddedNames.add(`create.${collectionName}`);
            this.#embeddedNames.add(`delete.${collectionName}`);
            this.#embeddedNames.add(`update.${collectionName}`);

            // Update CRUD keys for v12.
            this.#embeddedNames.add(`create${collectionName}`);
            this.#embeddedNames.add(`delete${collectionName}`);
            this.#embeddedNames.add(`update${collectionName}`);

            // v10 collection to doc name lookup.
            this.#collectionToDocName.set(docName, docName);
            this.#collectionToDocName.set(collectionName, docName);

            let collection: fvtt.EmbeddedCollection | null = null;

            try
            {
               // Update any existing stores with the actual collection.
               collection = doc.getEmbeddedCollection(docName);
            }
            catch (err)
            {
               console.warn(`EmbeddedStoreManager.handleDocUpdate error: No valid embedded collection for: ${docName}`);
            }

            // Update EmbeddedData for new collection.
            const embeddedData = this.#name.get(docName);
            if (embeddedData)
            {
                  // A bit funky here, but Foundry collections modify the Map type.
                  embeddedData.collection = collection as unknown as Map<string, unknown>;

               // Update all existing stores.
               for (const store of embeddedData.stores.values())
               {
                  store.setData(embeddedData.collection, true);
               }
            }
         }

         // Update all existing embedded collections with null data that aren't processed above.
         for (const embeddedName of existingEmbeddedNames)
         {
            const embeddedData = this.#name.get(embeddedName);
            if (embeddedData)
            {
               embeddedData.collection = null;

               for (const store of embeddedData.stores.values()) { store.setData(null, true); }
            }
         }
      }
      else // Reset all embedded reducer stores to null data.
      {
         this.#collectionToDocName.clear();
         this.#embeddedNames.clear();

         for (const embeddedData of this.#name.values())
         {
            embeddedData.collection = null;

            for (const store of embeddedData.stores.values()) { store.setData(null, true); }
         }
      }
   }

   /**
    * Handles updates to embedded stores parsing the document update action for valid embedded store types.
    *
    * On create, delete, update parse the type being modified then force index updates for the embedded type.
    *
    * @param action - Update action from document.
    */
   handleUpdate(action: string): void
   {
      if (!this.#embeddedNames.has(action)) { return; }

      const match: RegExpExecArray | null = EmbeddedStoreManager.#updateActionRegex.exec(action);

      if (match && match.groups)
      {
         const docOrCollectionName: string = match.groups.name;
         const embeddedName: string | undefined = this.#collectionToDocName.get(docOrCollectionName);

         const embeddedData: EmbeddedCollectionData<unknown> | undefined = this.#name.get(embeddedName!);

         if (embeddedData)
         {
            for (const store of embeddedData.stores.values()) { store.index.update(true); }
         }
      }
   }
}

/**
 * Internal data stored for each collection and associated dynamic reducers.
 */
type EmbeddedCollectionData<D> = {
  collection: Map<string, D> | null;

  stores: Map<string, DynMapReducer<string, D>>
};

