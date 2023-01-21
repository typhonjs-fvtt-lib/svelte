/**
 * Provides management of a single Promise accessible via {@link ApplicationState.promises}. This allows a Promise to
 * be lightly managed during the lifetime of an application. Presently when a promise is created via
 * {@link PromiseManager.create} it is only automatically resolved when the application is closed. You are in control
 * of resolving and rejecting any results for this Promise otherwise.
 */
export class PromiseManager
{
   /** @type {{ isProcessing: boolean, logging: boolean, promise: Promise, reject: Function, resolve: Function }} */
   #current;

   /**
    * @returns {boolean} Whether there is an active managed Promise.
    */
   get active()
   {
      return this.#current !== void 0;
   }

   /**
    * Resolves any current Promise with undefined and creates a new current Promise.
    *
    * @template T
    *
    * @param {object} opts - Options.
    *
    * @param {boolean}  [opts.logging=false] - When true log statements are posted.
    *
    * @returns {Promise<T>} The new current managed Promise.
    */
   create({ logging = false } = {})
   {
      if (this.#current !== void 0)
      {
         this.#log(`[TRL] PromiseManager.create info: Creating a new Promise and resolving existing immediately.`);

         this.#current.resolve(void 0);
         this.#current = void 0;
      }

      if (typeof logging !== 'boolean')
      {
         throw new TypeError(`PromiseManager.create error: 'logging' is not a boolean.`);
      }

      /** @type {Promise<T>} */
      const promise = new Promise((resolve, reject) =>
      {
         this.#current = {
            logging,
            reject,
            resolve
         };
      });

      this.#current.promise = promise;

      return promise;
   }

   /**
    * Gets the current Promise if any.
    *
    * @returns {Promise<any>} Current Promise.
    */
   get()
   {
      return this.#current ? this.#current.promise : void 0;
   }

   /**
    * Logs a message if logging for the current Promise is enabled.
    *
    * @param {string}   message - Message to log.
    */
   #log(message)
   {
      if (this.#current !== void 0 && this.#current.logging) { console.log(message); }
   }

   /**
    * Rejects the current Promise if applicable.
    *
    * @param {*}  [result] - Result to reject.
    *
    * @returns {boolean} Was the promise rejected.
    */
   reject(result = void 0)
   {
      // Early out as Promise resolution is currently processing.
      if (this.#current !== void 0 && this.#current.isProcessing)
      {
         this.#log(`[TRL] PromiseManager.reject info: Currently processing promise.`);

         return true;
      }

      if (this.#current !== void 0)
      {
         this.#current.isProcessing = true;

         if (result instanceof Promise)
         {
            result.then((value) =>
            {
               this.#current.reject(value);
               this.#current = void 0;
            }).catch((err) =>
            {
               this.#current.reject(err);
               this.#current = void 0;
            });
         }
         else
         {
            this.#current.reject(result);
            this.#current = void 0;
         }

         return true;
      }
      else
      {
         this.#log(`[TRL] PromiseManager.reject warning: No current managed Promise to reject.`);

         return false;
      }
   }

   /**
    * Resolves the current Promise if applicable.
    *
    * @param {*}  [result] - Result to resolve.
    *
    * @returns {boolean} Was the promise resolved.
    */
   resolve(result = void 0)
   {
      // Early out as Promise resolution is currently processing.
      if (this.#current !== void 0 && this.#current.isProcessing)
      {
         this.#log(`[TRL] PromiseManager.resolve info: Currently processing promise.`);

         return true;
      }

      if (this.#current !== void 0)
      {
         if (result instanceof Promise)
         {
            this.#current.isProcessing = true;

            result.then((value) =>
            {
               this.#current.resolve(value);
               this.#current = void 0;
            }).catch((err) =>
            {
               this.#current.reject(err);
               this.#current = void 0;
            });
         }
         else
         {
            this.#current.resolve(result);
            this.#current = void 0;
         }

         return true;
      }
      else
      {
         this.#log(`[TRL] PromiseManager.resolve warning: No current managed Promise to resolve.`);

         return false;
      }
   }
}
