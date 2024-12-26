import type {
   DynOptionsMapCreate,
   DynMapReducer } from '#runtime/svelte/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
   /**
    * Create a reactive embedded collection store. When no options are provided the name of the embedded collection
    * matches the document name.
    */
   create<T extends NamedDocumentConstructor>(doc: T, options?: DynOptionsMapCreate<string, InstanceType<T>>):
    DynMapReducer<string, InstanceType<T>>;

   /**
    * Destroys one or more embedded collection stores. When no `storeName` is provided all reactive embedded collections
    * are destroyed for the given document type.
    */
   destroy<T extends NamedDocumentConstructor>(doc?: T, storeName?: string): boolean;

   /**
    * Returns a specific existing embedded collection store. When no `storeName` is provided the document name
    * is used instead.
    */
   get<T extends NamedDocumentConstructor>(doc: T, storeName?: string): DynMapReducer<string, InstanceType<T>>;
}

/**
 * Provides a basic duck type for Foundry documents. Expects a constructor / class w/ static property `name`.
 */
interface NamedDocumentConstructor {
   new (...args: any[]): any;
   readonly documentName: string;
}

export { EmbeddedAPI, NamedDocumentConstructor };
