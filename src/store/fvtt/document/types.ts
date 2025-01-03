import type {
   DynMapReducer,
   DynReducer }   from '#runtime/svelte/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
   /**
    * Create a reactive embedded collection store. When no options are provided the name of the embedded collection
    * matches the document name.
    *
    * @param doc - A Foundry document.
    *
    * @param [options] - Dynamic reducer create options.
    *
    * @typeParam D `Foundry Document`.
    *
    * @typeParam O `EmbeddedCreate` - create options.
    */
   create<D extends fvtt.DocumentConstructor, O extends EmbeddedCreateOptions<InstanceType<D>>>(doc: D, options?: O):
    O extends typeof DynMapReducer<string, InstanceType<D>>
      ? InstanceType<O>
      : O extends { ctor: typeof DynMapReducer<string, InstanceType<D>> }
         ? InstanceType<O['ctor']>
         : DynMapReducer<string, InstanceType<D>>;

   /**
    * Destroys one or more embedded collection reducers. When no `reducerName` is provided all reactive embedded
    * collections are destroyed for the given document type.
    *
    * @param doc - A Foundry document.
    *
    * @param [reducerName] - Optional name of a specific reducer to destroy.
    *
    * @typeParam D `Foundry Document`.
    */
   destroy<D extends fvtt.DocumentConstructor>(doc?: D, reducerName?: string): boolean;

   /**
    * Returns a specific existing embedded collection store. When no `reducerName` is provided the document name
    * is used instead.
    *
    * @param doc - A Foundry document.
    *
    * @param [reducerName] - Optional name of a specific reducer to get.
    *
    * @typeParam D `Foundry Document`.
    */
   get<D extends fvtt.DocumentConstructor>(doc: D, reducerName?: string): DynMapReducer<string, InstanceType<D>> |
    undefined;
}

/**
 * Creates a compound type for embedded collection map reducer 'create' option combinations.
 *
 * Includes additional type inference constraints for {@link DynReducer.Data.MapCreate} requiring either `ctor` or
 * `sort` / `filters` to be defined.
 *
 * @typeParam T `any` - Type of data.
 */
type EmbeddedCreateOptions<T> =
   | string
   | typeof DynMapReducer<string, T>
   | (DynReducer.Data.MapCreate<string, T> & { ctor: typeof DynMapReducer<string, T> })
   | (DynReducer.Data.MapCreate<string, T> & (
      | { filters: Iterable<DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>> }
      | { sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T> }
   ));

interface TJSDocumentOptions<D extends fvtt.Document> {
   /**
    * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
    */
   delete?: ((doc?: D) => void) | null;

   /**
    * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
    */
   preDelete?: ((doc?: D) => void) | null;
}

/**
 * Provides data regarding the latest document change.
 */
interface TJSDocumentUpdateOptions {
   /**
    * The update action. Useful for filtering.
    */
   action: string;

   /**
    * Foundry data associated with document changes.
    */
   data: { [key: string]: unknown }[] | string[];
}

interface TJSDocumentCollectionOptions<C extends fvtt.DocumentCollection> {
   /**
    * Optional post-delete function to invoke when document is deleted _after_ subscribers have been notified.
    *
    * @param collection
    */
   delete?: (collection: C) => void | null;

   /**
    * Optional pre-delete function to invoke when document is deleted _before_ subscribers are notified.
    *
    * @param collection
    */
   preDelete?: (collection: C) => void | null;
}

/**
 * Provides data regarding the latest collection change.
 */
interface TJSDocumentCollectionUpdateOptions<C extends fvtt.DocumentCollection> {
   /**
    * The update action. Useful for filtering.
    */
   action?: string;

   /**
    * Foundry data associated with document changes.
    */
   data: { [key: string]: unknown }[] | string[];
}

export {
   EmbeddedAPI,
   EmbeddedCreateOptions,
   TJSDocumentOptions,
   TJSDocumentUpdateOptions,
   TJSDocumentCollectionOptions,
   TJSDocumentCollectionUpdateOptions
};
