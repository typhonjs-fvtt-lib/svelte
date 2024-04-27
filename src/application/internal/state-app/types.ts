import type {
   EasingFunction,
   EasingFunctionName } from '#runtime/svelte/easing';

import type { Data }    from '#runtime/svelte/store/position';

/**
 * @template T
 *
 * Provides the ability the save / restore application state for positional and UI state such as minimized status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
declare interface ApplicationState<T> {
   /**
    * Returns current application state along with any extra data passed into method.
    *
    * @param {object} [extra] - Extra data to add to application state.
    *
    * @returns {ApplicationStateData} Passed in object with current application state.
    */
   get(extra?: object): ApplicationStateData;

   /**
    * Returns any stored save state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Saved data set name.
    *
    * @returns {ApplicationStateData} The saved data set.
    */
   getSave({ name }: {
      name: string;
   }): ApplicationStateData;

   /**
    * Removes and returns any application state by name.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - Name to remove and retrieve.
    *
    * @returns {ApplicationStateData} Saved application data.
    */
   remove({ name }: {
      name: string;
   }): ApplicationStateData;

   /**
    * Restores a saved application state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
    * specification of the duration and easing along with configuring a Promise to be returned if awaiting the end of
    * the animation.
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
    * @param {EasingFunctionName | EasingFunction} [params.ease='linear'] - Easing function name or function.
    *
    * @returns {ApplicationStateData|Promise<ApplicationStateData>} Saved application data.
    */
   restore({ name, remove, async, animateTo, duration, ease }: {
      name: string;
      remove?: boolean;
      async?: boolean;
      animateTo?: boolean;
      duration?: number;
      ease?: EasingFunctionName | EasingFunction;
   }): ApplicationStateData | Promise<ApplicationStateData>;

   /**
    * Saves current application state with the opportunity to add extra data to the saved state.
    *
    * @param {object}   options - Options.
    *
    * @param {string}   options.name - name to index this saved data.
    *
    * @param {...*}     [options.extra] - Extra data to add to saved data.
    *
    * @returns {ApplicationStateData} Current application data
    */
   save({ name, ...extra }: {
      name: string;
      extra?: any[];
   }): ApplicationStateData;

   /**
    * Restores a saved application state returning the data. Several optional parameters are available
    * to control whether the restore action occurs silently (no store / inline styles updates), animates
    * to the stored data, or simply sets the stored data. Restoring via {@link AnimationAPI.to} allows
    * specification of the duration and easing along with configuring a Promise to be returned if awaiting the end of
    * the animation.
    *
    * Note: If serializing application state any minimized apps will use the before minimized state on initial render
    * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
    *
    * @param {ApplicationStateData}   data - Saved data set name.
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
    * @returns {T | Promise<T>} When synchronous the application or Promise when animating resolving with application.
    */
   set(data: ApplicationStateData, { async, animateTo, duration, ease }?: {
      async?: boolean;
      animateTo?: boolean;
      duration?: number;
      ease?: Function;
   }): (T | Promise<T>);
}

type ApplicationStateData = {
   /**
    * Application position.
    */
   position: Data.TJSPositionDataExtra;
   /**
    * Any application saved position state for #beforeMinimized
    */
   beforeMinimized: object;
   /**
    * Application options.
    */
   options: object;
   /**
    * Application UI state.
    */
   ui: object;
};

export { ApplicationState, ApplicationStateData }
