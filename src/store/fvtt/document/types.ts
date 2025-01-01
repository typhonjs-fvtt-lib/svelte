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
    * @typeParam D `Foundry Document`
    *
    * @typeParam O `EmbeddedCreate` - create options.
    */
   create<D extends NamedDocumentConstructor, O extends EmbeddedCreate<InstanceType<D>>>(doc: D,
    options?: O): O extends typeof DynMapReducer<string, InstanceType<D>>
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
    */
   destroy<T extends NamedDocumentConstructor>(doc?: T, reducerName?: string): boolean;

   /**
    * Returns a specific existing embedded collection store. When no `reducerName` is provided the document name
    * is used instead.
    */
   get<T extends NamedDocumentConstructor>(doc: T, reducerName?: string): DynMapReducer<string, InstanceType<T>>;
}

/**
 * Creates a compound type for embedded collection map reducer 'create' option combinations.
 *
 * Includes additional type inference constraints for {@link DynReducer.Data.MapCreate} requiring either `ctor` or
 * `sort` / `filters` to be defined.
 *
 * @typeParam T `any` - Type of data.
 */
type EmbeddedCreate<T> =
   | string
   | typeof DynMapReducer<string, T>
   | (DynReducer.Data.MapCreate<string, T> & { ctor: typeof DynMapReducer<string, T> })
   | (DynReducer.Data.MapCreate<string, T> & (
      | { filters: Iterable<DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>> }
      | { sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T> }
   ));

/**
 * Provides a basic duck type for Foundry documents. Expects a constructor / class w/ static property `name`.
 */
interface NamedDocumentConstructor {
   new (...args: any[]): any;
   readonly documentName: string;
}

export { EmbeddedAPI, EmbeddedCreate, NamedDocumentConstructor };
