import { linear }    from "svelte/easing";
import { lerp }      from '@typhonjs-fvtt/svelte/math';
import { isObject }  from '@typhonjs-fvtt/svelte/util';

export class ApplicationState
{
   /** @type {ApplicationShellExt} */
   #application;

   /** @type {Map<string, ApplicationData>} */
   #dataSaved = new Map();

   /**
    * @param {ApplicationShellExt}   application - The application.
    */
   constructor(application)
   {
      this.#application = application;
   }

   /**
    * Returns current application state along with any extra data passed into method.
    *
    * @param {object} [extra] - Extra data to add to application state.
    *
    * @returns {ApplicationData} Passed in object with current application state.
    */
   get(extra = {})
   {
      return Object.assign(extra, {
         position: this.#application?.position?.get(),
         beforeMinimized: this.#application?.position?.state.get({ name: '#beforeMinimized' }),
         options: Object.assign({}, this.#application?.options),
         ui: { minimized: this.#application?.reactive?.minimized }
      });
   }

   /**
    * Returns any stored save state by name.
    *
    * @param {string}   name - Saved data set name.
    *
    * @returns {ApplicationData} The saved data set.
    */
   getSave({ name })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - getSave error: 'name' is not a string.`);
      }

      return this.#dataSaved.get(name);
   }

   /**
    * Removes and returns any application state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {ApplicationData} Saved application data.
    */
   remove({ name })
   {
      if (typeof name !== 'string') { throw new TypeError(`ApplicationState - remove: 'name' is not a string.`); }

      const data = this.#dataSaved.get(name);
      this.#dataSaved.delete(name);

      return data;
   }

   /**
    * Restores a saved application state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
    * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
    * returned if awaiting the end of the animation.
    *
    * @param {object}            params - Parameters
    *
    * @param {string}            params.name - Saved data set name.
    *
    * @param {boolean}           [params.remove=false] - Remove data set.
    *
    * @param {boolean}           [params.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [params.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [params.duration=0.1] - Duration in seconds.
    *
    * @param {Function}          [params.ease=linear] - Easing function.
    *
    * @param {Function}          [params.interpolate=lerp] - Interpolation function.
    *
    * @returns {ApplicationData|Promise<ApplicationData>} Saved application data.
    */
   restore({ name, remove = false, async = false, animateTo = false, duration = 0.1, ease = linear,
    interpolate = lerp })
   {
      if (typeof name !== 'string')
      {
         throw new TypeError(`ApplicationState - restore error: 'name' is not a string.`);
      }

      const dataSaved = this.#dataSaved.get(name);

      if (dataSaved)
      {
         if (remove) { this.#dataSaved.delete(name); }

         if (async)
         {
            return this.set(dataSaved, { async, animateTo, duration, ease, interpolate }).then(() => dataSaved);
         }
         else
         {
            this.set(dataSaved, { async, animateTo, duration, ease, interpolate });
         }
      }

      return dataSaved;
   }

   /**
    * Saves current application state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - name to index this saved data.
    *
    * @param {...*}     [options.extra] - Extra data to add to saved data.
    *
    * @returns {ApplicationData} Current application data
    */
   save({ name, ...extra })
   {
      if (typeof name !== 'string') { throw new TypeError(`ApplicationState - save error: 'name' is not a string.`); }

      const data = this.get(extra);

      this.#dataSaved.set(name, data);

      return data;
   }

   /**
    * Restores a saved application state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
    * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
    * returned if awaiting the end of the animation.
    *
    * @param {ApplicationData}   data - Saved data set name.
    *
    * @param {object}            [opts] - Optional parameters
    *
    * @param {boolean}           [opts.async=false] - If animating return a Promise that resolves with any saved data.
    *
    * @param {boolean}           [opts.animateTo=false] - Animate to restore data.
    *
    * @param {number}            [opts.duration=0.1] - Duration in seconds.
    *
    * @param {Function}          [opts.ease=linear] - Easing function.
    *
    * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
    *
    * @returns {ApplicationShellExt|Promise<ApplicationShellExt>} When synchronous the application or Promise when
    *                                                             animating resolving with application.
    */
   set(data, { async = false, animateTo = false, duration = 0.1, ease = linear, interpolate = lerp } = {})
   {
      if (!isObject(data))
      {
         throw new TypeError(`ApplicationState - restore error: 'data' is not an object.`);
      }

      const application = this.#application;

      if (data)
      {
         if (isObject(data?.position))
         {
            // Update data directly with no store or inline style updates.
            if (animateTo)  // Animate to saved data.
            {
               // Provide special handling to potentially change transform origin as this parameter is not animated.
               if (data.position.transformOrigin !== application.position.transformOrigin)
               {
                  application.position.transformOrigin = data.position.transformOrigin;
               }

               if (isObject(data?.ui))
               {
                  const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

                  if (application?.reactive?.minimized && !minimized)
                  {
                     application.maximize({ animate: false, duration: 0 });
                  }
               }

               const promise = application.position.animate.to(data.position,
                { duration, ease, interpolate }).finished.then((cancelled) =>
               {
                  // Merge in saved options to application.
                  if (!cancelled && isObject(data?.options))
                  {
                     application?.reactive.mergeOptions(data.options);
                  }

                  if (!cancelled && isObject(data?.ui))
                  {
                     const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

                     // Application is currently minimized and stored state is not, so reset minimized state without
                     // animation.
                     if (!application?.reactive?.minimized && minimized)
                     {
                        application.minimize({ animate: false, duration: 0 });
                     }
                  }

                  if (!cancelled && isObject(data?.beforeMinimized))
                  {
                     application.position.state.set({ name: '#beforeMinimized', ...data.beforeMinimized });
                  }

                  return application;
               });

               // Return a Promise with the application that resolves after animation ends.
               if (async) { return promise; }
            }
            else
            {
               // Merge in saved options to application.
               if (isObject(data?.options))
               {
                  application?.reactive.mergeOptions(data.options);
               }

               if (isObject(data?.ui))
               {
                  const minimized = typeof data.ui?.minimized === 'boolean' ? data.ui.minimized : false;

                  // Application is currently minimized and stored state is not, so reset minimized state without
                  // animation.
                  if (application?.reactive?.minimized && !minimized)
                  {
                     application.maximize({ animate: false, duration: 0 });
                  }
                  else if (!application?.reactive?.minimized && minimized)
                  {
                     application.minimize({ animate: false, duration });
                  }
               }

               if (isObject(data?.beforeMinimized))
               {
                  application.position.state.set({ name: '#beforeMinimized', ...data.beforeMinimized });
               }

               // Default options is to set data for an immediate update.
               application.position.set(data.position);
            }
         }
      }

      return application;
   }
}

/**
 * @typedef {object} ApplicationData
 *
 * @property {PositionDataExtended}   position - Application position.
 *
 * @property {object}         beforeMinimized - Any application saved position state for #beforeMinimized
 *
 * @property {object}         options - Application options.
 *
 * @property {object}         ui - Application UI state.
 */
