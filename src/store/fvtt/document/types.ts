import type {
   DynOptionsMapCreate,
   DynMapReducer } from '#runtime/data/struct/store/reducer';

/**
 * Provides the public embedded reactive collection API.
 */
interface EmbeddedAPI {
   /**
    * Creates an embedded collection store.
    */
   create<T extends NamedDocumentConstructor>(doc: T, options: DynOptionsMapCreate<string, InstanceType<T>>):
    DynMapReducer<string, InstanceType<T>>;

   /**
    * - Destroys one or more embedded collection stores.
    */
   destroy<T extends NamedDocumentConstructor>(doc?: T, storeName?: string): boolean;

   /**
    * - Returns a specific existing embedded collection store.
    */
   get<T extends NamedDocumentConstructor>(doc: T, storeName: string): DynMapReducer<string, InstanceType<T>>;
}

/**
 * Provides a basic duck type for Foundry documents. Expects a constructor / class w/ static property `name`.
 */
interface NamedDocumentConstructor {
   new (...args: any[]): any;
   readonly documentName: string;
}

export { EmbeddedAPI, NamedDocumentConstructor };
