/**
 * Provides the ability the save / restore application state for positional and UI state such as minimized status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
declare class ApplicationState {
    /**
     * @param {ApplicationShellExt}   application - The application.
     */
    constructor(application: ApplicationShellExt);
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
     * @returns {ApplicationStateData|Promise<ApplicationStateData>} Saved application data.
     */
    restore({ name, remove, async, animateTo, duration, ease, interpolate }: {
        name: string;
        remove?: boolean;
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
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
     * specification of the duration, easing, and interpolate functions along with configuring a Promise to be
     * returned if awaiting the end of the animation.
     *
     * Note: If serializing application state any minimized apps will use the before minimized state on initial render
     * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
     *
     * TODO: THIS METHOD NEEDS TO BE REFACTORED WHEN TRL IS MADE INTO A STANDALONE FRAMEWORK.
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
     * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {ApplicationShellExt|Promise<ApplicationShellExt>} When synchronous the application or Promise when
     *                                                             animating resolving with application.
     */
    set(data: ApplicationStateData, { async, animateTo, duration, ease, interpolate }?: {
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): ApplicationShellExt | Promise<ApplicationShellExt>;
    #private;
}
type ApplicationStateData = {
    /**
     * - Application position.
     */
    position: PositionDataExtended;
    /**
     * - Any application saved position state for #beforeMinimized
     */
    beforeMinimized: object;
    /**
     * - Application options.
     */
    options: object;
    /**
     * - Application UI state.
     */
    ui: object;
};

/**
 * Provides a helper class for {@link SvelteApplication} by combining all methods that work on the {@link SvelteData[]}
 * of mounted components. This class is instantiated and can be retrieved by the getter `svelte` via SvelteApplication.
 */
declare class GetSvelteData {
    /**
     * Keep a direct reference to the SvelteData array in an associated {@link SvelteApplication}.
     *
     * @param {MountedAppShell[]|null[]}  applicationShellHolder - A reference to the MountedAppShell array.
     *
     * @param {SvelteData[]}  svelteData - A reference to the SvelteData array of mounted components.
     */
    constructor(applicationShellHolder: MountedAppShell[] | null[], svelteData: SvelteData[]);
    /**
     * Returns any mounted {@link MountedAppShell}.
     *
     * @returns {MountedAppShell|null} Any mounted application shell.
     */
    get applicationShell(): any;
    /**
     * Returns the indexed Svelte component.
     *
     * @param {number}   index -
     *
     * @returns {object} The loaded Svelte component.
     */
    component(index: number): object;
    /**
     * Returns the Svelte component entries iterator.
     *
     * @returns {Generator<Array<number|import('svelte').SvelteComponent>>} Svelte component entries iterator.
     * @yields
     */
    componentEntries(): Generator<Array<number | any>>;
    /**
     * Returns the Svelte component values iterator.
     *
     * @returns {Generator<import('svelte').SvelteComponent>} Svelte component values iterator.
     * @yields
     */
    componentValues(): Generator<any>;
    /**
     * Returns the indexed SvelteData entry.
     *
     * @param {number}   index -
     *
     * @returns {SvelteData} The loaded Svelte config + component.
     */
    data(index: number): SvelteData;
    /**
     * Returns the {@link SvelteData} instance for a given component.
     *
     * @param {object} component - Svelte component.
     *
     * @returns {SvelteData} -  The loaded Svelte config + component.
     */
    dataByComponent(component: object): SvelteData;
    /**
     * Returns the SvelteData entries iterator.
     *
     * @returns {IterableIterator<[number, SvelteData]>} SvelteData entries iterator.
     */
    dataEntries(): IterableIterator<[number, SvelteData]>;
    /**
     * Returns the SvelteData values iterator.
     *
     * @returns {IterableIterator<SvelteData>} SvelteData values iterator.
     */
    dataValues(): IterableIterator<SvelteData>;
    /**
     * Returns the length of the mounted Svelte component list.
     *
     * @returns {number} Length of mounted Svelte component list.
     */
    get length(): number;
    #private;
}

/**
 * Contains the reactive functionality / Svelte stores associated with SvelteApplication and retrievable by
 * {@link SvelteApplication.reactive}.
 *
 * There are several reactive getters for UI state such and for two-way bindings / stores see
 * {@link SvelteReactive.storeUIState}:
 * - {@link SvelteReactive.dragging}
 * - {@link SvelteReactive.minimized}
 * - {@link SvelteReactive.resizing}
 *
 * There are also reactive getters / setters for {@link SvelteApplicationOptions} and Foundry
 * {@link ApplicationOptions}. You can use the following as one way bindings and update the associated stores. For
 * two-way bindings / stores see {@link SvelteReactive.storeAppOptions}.
 *
 * - {@link SvelteReactive.draggable}
 * - {@link SvelteReactive.focusAuto}
 * - {@link SvelteReactive.focusKeep}
 * - {@link SvelteReactive.focusTrap}
 * - {@link SvelteReactive.headerButtonNoClose}
 * - {@link SvelteReactive.headerButtonNoLabel}
 * - {@link SvelteReactive.headerIcon}
 * - {@link SvelteReactive.headerNoTitleMinimized}
 * - {@link SvelteReactive.minimizable}
 * - {@link SvelteReactive.popOut}
 * - {@link SvelteReactive.positionable}
 * - {@link SvelteReactive.resizable}
 * - {@link SvelteReactive.title}
 *
 * An instance of TJSSessionStorage is accessible via {@link SvelteReactive.sessionStorage}. Optionally you can pass
 * in an existing instance that can be shared across multiple SvelteApplications by setting
 * {@link SvelteApplicationOptions.sessionStorage}.
 *
 * -------------------------------------------------------------------------------------------------------------------
 *
 * This API is not sealed, and it is recommended that you extend it with accessors to get / set data that is reactive
 * in your application. An example of setting an exported prop `document` from the main mounted application shell.
 *
 * @example
 * import { hasSetter } from '@typhonjs-fvtt/runtime/svelte/util';
 *
 * // Note: make a normal comment.
 * //  * @member {object} document - Adds accessors to SvelteReactive to get / set the document associated with
 * //  *                             Document with the mounted application shell Svelte component.
 * //  *
 * //  * @memberof SvelteReactive#
 * //  *
 * Object.defineProperty(this.reactive, 'document', {
 *    get: () => this.svelte?.applicationShell?.document,
 *    set: (document) =>
 *    {
 *       const component = this.svelte?.applicationShell;
 *       if (hasSetter(component, 'document')) { component.document = document; }
 *    }
 * });
 */
declare class SvelteReactive {
    /**
     * @param {SvelteApplication} application - The host Foundry application.
     */
    constructor(application: SvelteApplication);
    /**
     * Initializes reactive support. Package private for internal use.
     *
     * @returns {SvelteStores|void} Internal methods to interact with Svelte stores.
     * @package
     */
    initialize(): SvelteStores | void;
    /**
     * @returns {TJSSessionStorage} Returns TJSSessionStorage instance.
     */
    get sessionStorage(): TJSSessionStorage;
    /**
     * Returns the store for app options.
     *
     * @returns {StoreAppOptions} App options store.
     */
    get storeAppOptions(): StoreAppOptions;
    /**
     * Returns the store for UI options.
     *
     * @returns {StoreUIOptions} UI options store.
     */
    get storeUIState(): StoreUIOptions;
    /**
     * Returns the current dragging UI state.
     *
     * @returns {boolean} Dragging UI state.
     */
    get dragging(): boolean;
    /**
     * Returns the current minimized UI state.
     *
     * @returns {boolean} Minimized UI state.
     */
    get minimized(): boolean;
    /**
     * Returns the current resizing UI state.
     *
     * @returns {boolean} Resizing UI state.
     */
    get resizing(): boolean;
    /**
     * Sets `this.options.draggable` which is reactive for application shells.
     *
     * @param {boolean}  draggable - Sets the draggable option.
     */
    set draggable(arg: boolean);
    /**
     * Returns the draggable app option.
     *
     * @returns {boolean} Draggable app option.
     */
    get draggable(): boolean;
    /**
     * Sets `this.options.focusAuto` which is reactive for application shells.
     *
     * @param {boolean}  focusAuto - Sets the focusAuto option.
     */
    set focusAuto(arg: boolean);
    /**
     * Returns the focusAuto app option.
     *
     * @returns {boolean} When true auto-management of app focus is enabled.
     */
    get focusAuto(): boolean;
    /**
     * Sets `this.options.focusKeep` which is reactive for application shells.
     *
     * @param {boolean}  focusKeep - Sets the focusKeep option.
     */
    set focusKeep(arg: boolean);
    /**
     * Returns the focusKeep app option.
     *
     * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    get focusKeep(): boolean;
    /**
     * Sets `this.options.focusTrap` which is reactive for application shells.
     *
     * @param {boolean}  focusTrap - Sets the focusTrap option.
     */
    set focusTrap(arg: boolean);
    /**
     * Returns the focusTrap app option.
     *
     * @returns {boolean} When true focus trapping / wrapping is enabled keeping focus inside app.
     */
    get focusTrap(): boolean;
    /**
     * Sets `this.options.headerButtonNoClose` which is reactive for application shells.
     *
     * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
     */
    set headerButtonNoClose(arg: boolean);
    /**
     * Returns the headerButtonNoClose app option.
     *
     * @returns {boolean} Remove the close the button in header app option.
     */
    get headerButtonNoClose(): boolean;
    /**
     * Sets `this.options.headerButtonNoLabel` which is reactive for application shells.
     *
     * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
     */
    set headerButtonNoLabel(arg: boolean);
    /**
     * Returns the headerButtonNoLabel app option.
     *
     * @returns {boolean} Remove the labels from buttons in header app option.
     */
    get headerButtonNoLabel(): boolean;
    /**
     * Sets `this.options.headerIcon` which is reactive for application shells.
     *
     * @param {string|void}  headerIcon - Sets the headerButtonNoLabel option.
     */
    set headerIcon(arg: string | void);
    /**
     * Returns the headerIcon app option.
     *
     * @returns {string|void} URL for header app icon.
     */
    get headerIcon(): string | void;
    /**
     * Sets `this.options.headerNoTitleMinimized` which is reactive for application shells.
     *
     * @param {boolean}  headerNoTitleMinimized - Sets the headerNoTitleMinimized option.
     */
    set headerNoTitleMinimized(arg: boolean);
    /**
     * Returns the headerNoTitleMinimized app option.
     *
     * @returns {boolean} When true removes the header title when minimized.
     */
    get headerNoTitleMinimized(): boolean;
    /**
     * Sets `this.options.minimizable` which is reactive for application shells that are also pop out.
     *
     * @param {boolean}  minimizable - Sets the minimizable option.
     */
    set minimizable(arg: boolean);
    /**
     * Returns the minimizable app option.
     *
     * @returns {boolean} Minimizable app option.
     */
    get minimizable(): boolean;
    /**
     * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
     * from `ui.windows`.
     *
     * @param {boolean}  popOut - Sets the popOut option.
     */
    set popOut(arg: boolean);
    /**
     * Returns the Foundry popOut state; {@link Application.popOut}
     *
     * @returns {boolean} Positionable app option.
     */
    get popOut(): boolean;
    /**
     * Sets `this.options.positionable` enabling / disabling {@link SvelteApplication.position.set}.
     *
     * @param {boolean}  positionable - Sets the positionable option.
     */
    set positionable(arg: boolean);
    /**
     * Returns the positionable app option; {@link SvelteApplicationOptions.positionable}
     *
     * @returns {boolean} Positionable app option.
     */
    get positionable(): boolean;
    /**
     * Sets `this.options.resizable` which is reactive for application shells.
     *
     * @param {boolean}  resizable - Sets the resizable option.
     */
    set resizable(arg: boolean);
    /**
     * Returns the resizable option.
     *
     * @returns {boolean} Resizable app option.
     */
    get resizable(): boolean;
    /**
     * Sets `this.options.title` which is reactive for application shells.
     *
     * Note: Will set empty string if title is undefined or null.
     *
     * @param {string|undefined|null}   title - Application title; will be localized, so a translation key is fine.
     */
    set title(arg: string);
    /**
     * Returns the title accessor from the parent Application class; {@link Application.title}
     * TODO: Application v2; note that super.title localizes `this.options.title`; IMHO it shouldn't.
     *
     * @returns {string} Title.
     */
    get title(): string;
    /**
     * Provides a way to safely get this applications options given an accessor string which describes the
     * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
     * to walk.
     *
     * // TODO DOCUMENT the accessor in more detail.
     *
     * @param {string}   accessor - The path / key to set. You can set multiple levels.
     *
     * @param {*}        [defaultValue] - A default value returned if the accessor is not found.
     *
     * @returns {*} Value at the accessor.
     */
    getOptions(accessor: string, defaultValue?: any): any;
    /**
     * Provides a way to merge `options` into this applications options and update the appOptions store.
     *
     * @param {object}   options - The options object to merge with `this.options`.
     */
    mergeOptions(options: object): void;
    /**
     * Provides a way to safely set this applications options given an accessor string which describes the
     * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
     * to walk.
     *
     * Additionally if an application shell Svelte component is mounted and exports the `appOptions` property then
     * the application options is set to `appOptions` potentially updating the application shell / Svelte component.
     *
     * // TODO DOCUMENT the accessor in more detail.
     *
     * @param {string}   accessor - The path / key to set. You can set multiple levels.
     *
     * @param {*}        value - Value to set.
     */
    setOptions(accessor: string, value: any): void;
    /**
     * Updates the UI Options store with the current header buttons. You may dynamically add / remove header buttons
     * if using an application shell Svelte component. In either overriding `_getHeaderButtons` or responding to the
     * Hooks fired return a new button array and the uiOptions store is updated and the application shell will render
     * the new buttons.
     *
     * Optionally you can set in the SvelteApplication app options {@link SvelteApplicationOptions.headerButtonNoClose}
     * to remove the close button and {@link SvelteApplicationOptions.headerButtonNoLabel} to true and labels will be
     * removed from the header buttons.
     *
     * @param {object} opts - Optional parameters (for internal use)
     *
     * @param {boolean} opts.headerButtonNoClose - The value for `headerButtonNoClose`.
     *
     * @param {boolean} opts.headerButtonNoLabel - The value for `headerButtonNoLabel`.
     */
    updateHeaderButtons({ headerButtonNoClose, headerButtonNoLabel }?: {
        headerButtonNoClose: boolean;
        headerButtonNoLabel: boolean;
    }): void;
    #private;
}

/**
 * Provides a basic {@link TJSBasicAnimation} implementation for Position animation.
 */
declare class AnimationControl$1 {
    /**
     * Defines a static empty / void animation control.
     *
     * @type {AnimationControl}
     */
    static "__#1@#voidControl": AnimationControl$1;
    /**
     * Provides a static void / undefined AnimationControl that is automatically resolved.
     *
     * @returns {AnimationControl} Void AnimationControl
     */
    static get voidControl(): AnimationControl$1;
    /**
     * @param {object|null} [animationData] - Animation data from {@link AnimationAPI}.
     *
     * @param {boolean}     [willFinish] - Promise that tracks animation finished state.
     */
    constructor(animationData?: object | null, willFinish?: boolean);
    /**
     * Get a promise that resolves when animation is finished.
     *
     * @returns {Promise<void>}
     */
    get finished(): Promise<void>;
    /**
     * Returns whether this animation is currently active / animating.
     *
     * Note: a delayed animation may not be started / active yet. Use {@link AnimationControl.isFinished} to determine
     * if an animation is actually finished.
     *
     * @returns {boolean} Animation active state.
     */
    get isActive(): boolean;
    /**
     * Returns whether this animation is completely finished.
     *
     * @returns {boolean} Animation finished state.
     */
    get isFinished(): boolean;
    /**
     * Cancels the animation.
     */
    cancel(): void;
    #private;
}

declare class AnimationAPI {
    constructor(position: any, data: any);
    /**
     * Returns whether there are scheduled animations whether active or delayed for this Position.
     *
     * @returns {boolean} Are there active animation instances.
     */
    get isScheduled(): boolean;
    /**
     * Cancels all animation instances for this Position instance.
     */
    cancel(): void;
    /**
     * Returns all currently scheduled AnimationControl instances for this Position instance.
     *
     * @returns {AnimationControl[]} All currently scheduled animation controls for this Position instance.
     */
    getScheduled(): AnimationControl$1[];
    /**
     * Provides a tween from given position data to the current position.
     *
     * @param {PositionDataExtended} fromData - The starting position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    from(fromData: PositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl$1;
    /**
     * Provides a tween from given position data to the current position.
     *
     * @param {PositionDataExtended} fromData - The starting position.
     *
     * @param {PositionDataExtended} toData - The ending position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    fromTo(fromData: PositionDataExtended, toData: PositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl$1;
    /**
     * Provides a tween to given position data from the current position.
     *
     * @param {PositionDataExtended} toData - The destination position.
     *
     * @param {object}         [opts] - Optional parameters.
     *
     * @param {number}         [opts.delay=0] - Delay in seconds before animation starts.
     *
     * @param {number}         [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}       [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}       [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {AnimationControl}  A control object that can cancel animation and provides a `finished` Promise.
     */
    to(toData: PositionDataExtended, { delay, duration, ease, interpolate }?: {
        delay?: number;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): AnimationControl$1;
    /**
     * Returns a function that provides an optimized way to constantly update a to-tween.
     *
     * @param {Iterable<string>}  keys - The keys for quickTo.
     *
     * @param {object}            [opts] - Optional parameters.
     *
     * @param {number}            [opts.duration=1] - Duration in seconds.
     *
     * @param {Function}          [opts.ease=cubicOut] - Easing function.
     *
     * @param {Function}          [opts.interpolate=lerp] - Interpolation function.
     *
     * @returns {quickToCallback} quick-to tween function.
     */
    quickTo(keys: Iterable<string>, { duration, ease, interpolate }?: {
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): quickToCallback$1;
    #private;
}
type quickToCallback$1 = (...args: (number | object)[]) => any;

declare class PositionStateAPI {
    constructor(position: any, data: any, transforms: any);
    /**
     * Returns any stored save state by name.
     *
     * @param {string}   name - Saved data set name.
     *
     * @returns {PositionDataExtended} The saved data set.
     */
    get({ name }: string): PositionDataExtended;
    /**
     * Returns any associated default data.
     *
     * @returns {PositionDataExtended} Associated default data.
     */
    getDefault(): PositionDataExtended;
    /**
     * Removes and returns any position state by name.
     *
     * @param {object}   options - Options.
     *
     * @param {string}   options.name - Name to remove and retrieve.
     *
     * @returns {PositionDataExtended} Saved position data.
     */
    remove({ name }: {
        name: string;
    }): PositionDataExtended;
    /**
     * Resets data to default values and invokes set.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.keepZIndex=false] - When true keeps current z-index.
     *
     * @param {boolean}  [opts.invokeSet=true] - When true invokes set method.
     *
     * @returns {boolean} Operation successful.
     */
    reset({ keepZIndex, invokeSet }?: {
        keepZIndex?: boolean;
        invokeSet?: boolean;
    }): boolean;
    /**
     * Restores a saved positional state returning the data. Several optional parameters are available
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
     * @param {Iterable<string>}  [params.properties] - Specific properties to set / animate.
     *
     * @param {boolean}           [params.silent] - Set position data directly; no store or style updates.
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
     * @returns {PositionDataExtended|Promise<PositionDataExtended>} Saved position data.
     */
    restore({ name, remove, properties, silent, async, animateTo, duration, ease, interpolate }: {
        name: string;
        remove?: boolean;
        properties?: Iterable<string>;
        silent?: boolean;
        async?: boolean;
        animateTo?: boolean;
        duration?: number;
        ease?: Function;
        interpolate?: Function;
    }): PositionDataExtended | Promise<PositionDataExtended>;
    /**
     * Saves current position state with the opportunity to add extra data to the saved state.
     *
     * @param {object}   opts - Options.
     *
     * @param {string}   opts.name - name to index this saved data.
     *
     * @param {...*}     [opts.extra] - Extra data to add to saved data.
     *
     * @returns {PositionData} Current position data
     */
    save({ name, ...extra }: {
        name: string;
        extra?: any[];
    }): PositionData;
    /**
     * Directly sets a position state.
     *
     * @param {object}   opts - Options.
     *
     * @param {string}   opts.name - name to index this saved data.
     *
     * @param {...*}     [opts.data] - Position data to set.
     */
    set({ name, ...data }: {
        name: string;
        data?: any[];
    }): void;
    #private;
}

/**
 * Provides the output data for {@link Transforms.getData}.
 */
declare class TransformData$1 {
    /**
     * @returns {DOMRect} The bounding rectangle.
     */
    get boundingRect(): DOMRect;
    /**
     * @returns {Vector3[]} The transformed corner points as vec3 in screen space.
     */
    get corners(): Float32Array[];
    /**
     * @returns {string} Returns the CSS style string for the transform matrix.
     */
    get css(): string;
    /**
     * @returns {Matrix4} The transform matrix.
     */
    get mat4(): Float32Array;
    /**
     * @returns {Matrix4[]} The pre / post translation matrices for origin translation.
     */
    get originTranslations(): Float32Array[];
    #private;
}

/**
 * Provides the storage and sequencing of managed position validators. Each validator added may be a bespoke function or
 * a {@link ValidatorData} object containing an `id`, `validator`, and `weight` attributes; `validator` is the only
 * required attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the validator; recommended strings or numbers. This
 * allows validators to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows validators to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted validator always
 * runs before a higher weighted validator. If no weight is specified the default of '1' is assigned and it is appended
 * to the end of the validators list.
 *
 * This class forms the public API which is accessible from the `.validators` getter in the main Position instance.
 * ```
 * const position = new Position(<PositionData>);
 * position.validators.add(...);
 * position.validators.clear();
 * position.validators.length;
 * position.validators.remove(...);
 * position.validators.removeBy(...);
 * position.validators.removeById(...);
 * ```
 */
declare class AdapterValidators {
    /**
     * @param {boolean}  enabled - Sets enabled state.
     */
    set enabled(arg: boolean);
    /**
     * @returns {boolean} Returns the enabled state.s
     */
    get enabled(): boolean;
    /**
     * @returns {number} Returns the length of the validators array.
     */
    get length(): number;
    /**
     * @param {...(ValidatorFn|ValidatorData)}   validators -
     */
    add(...validators: (ValidatorFn | ValidatorData)[]): void;
    clear(): void;
    /**
     * @param {...(ValidatorFn|ValidatorData)}   validators -
     */
    remove(...validators: (ValidatorFn | ValidatorData)[]): void;
    /**
     * Remove validators by the provided callback. The callback takes 3 parameters: `id`, `validator`, and `weight`.
     * Any truthy value returned will remove that validator.
     *
     * @param {function(*, ValidatorFn, number): boolean} callback - Callback function to evaluate each validator
     *                                                                  entry.
     */
    removeBy(callback: (arg0: any, arg1: ValidatorFn, arg2: number) => boolean): void;
    removeById(...ids: any[]): void;
    /**
     * Provides an iterator for validators.
     *
     * @returns {Generator<ValidatorData|undefined>} Generator / iterator of validators.
     * @yields {ValidatorData}
     */
    [Symbol.iterator](): Generator<ValidatorData | undefined>;
    #private;
}
/**
 * - Position validator function that takes a {@link PositionData } instance potentially
 *                             modifying it or returning null if invalid.
 */
type ValidatorFn = (valData: ValidationData) => PositionData | null;
type ValidatorData = {
    /**
     * - An ID associated with this validator. Can be used to remove the validator.
     */
    id?: any;
    /**
     * - Position validator function that takes a {@link PositionData } instance
     *   potentially modifying it or returning null if invalid.
     */
    validator: ValidatorFn;
    /**
     * - A number between 0 and 1 inclusive to position this validator against others.
     */
    weight?: number;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};

/**
 * Defines stored positional data.
 */
declare class PositionData$1 {
    constructor({ height, left, maxHeight, maxWidth, minHeight, minWidth, rotateX, rotateY, rotateZ, scale, translateX, translateY, translateZ, top, transformOrigin, width, zIndex }?: {
        height?: any;
        left?: any;
        maxHeight?: any;
        maxWidth?: any;
        minHeight?: any;
        minWidth?: any;
        rotateX?: any;
        rotateY?: any;
        rotateZ?: any;
        scale?: any;
        translateX?: any;
        translateY?: any;
        translateZ?: any;
        top?: any;
        transformOrigin?: any;
        width?: any;
        zIndex?: any;
    });
    /**
     * @type {number|'auto'|'inherit'|null}
     */
    height: number | 'auto' | 'inherit' | null;
    /**
     * @type {number|null}
     */
    left: number | null;
    /**
     * @type {number|null}
     */
    maxHeight: number | null;
    /**
     * @type {number|null}
     */
    maxWidth: number | null;
    /**
     * @type {number|null}
     */
    minHeight: number | null;
    /**
     * @type {number|null}
     */
    minWidth: number | null;
    /**
     * @type {number|null}
     */
    rotateX: number | null;
    /**
     * @type {number|null}
     */
    rotateY: number | null;
    /**
     * @type {number|null}
     */
    rotateZ: number | null;
    /**
     * @type {number|null}
     */
    scale: number | null;
    /**
     * @type {number|null}
     */
    top: number | null;
    /**
     * @type {string|null}
     */
    transformOrigin: string | null;
    /**
     * @type {number|null}
     */
    translateX: number | null;
    /**
     * @type {number|null}
     */
    translateY: number | null;
    /**
     * @type {number|null}
     */
    translateZ: number | null;
    /**
     * @type {number|'auto'|'inherit'|null}
     */
    width: number | 'auto' | 'inherit' | null;
    /**
     * @type {number|null}
     */
    zIndex: number | null;
    /**
     * Copies given data to this instance.
     *
     * @param {PositionData}   data - Copy from this instance.
     *
     * @returns {PositionData} This instance.
     */
    copy(data: PositionData$1): PositionData$1;
}

/**
 * Provides a public API for grouping multiple {@link Position} animations together with the AnimationManager.
 *
 * Note: To remove cyclic dependencies as this class provides the Position static / group Animation API `instanceof`
 * checks are not done against Position. Instead, a check for the animate property being an instanceof
 * {@link AnimationAPI} is performed in {@link AnimationGroupAPI.#isPosition}.
 *
 * @see AnimationAPI
 */
declare class AnimationGroupAPI {
    /**
     * Checks of the given object is a Position instance by checking for AnimationAPI.
     *
     * @param {*}  object - Any data.
     *
     * @returns {boolean} Is Position.
     */
    static "__#4@#isPosition"(object: any): boolean;
    /**
     * Cancels any animation for given Position data.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     */
    static cancel(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>): void;
    /**
     * Cancels all Position animation.
     */
    static cancelAll(): void;
    /**
     * Gets all animation controls for the given position data.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     *
     * @returns {{position: Position, data: object|void, controls: AnimationControl[]}[]} Results array.
     */
    static getScheduled(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>): {
        position: Position;
        data: object | void;
        controls: AnimationControl[];
    }[];
    /**
     * Provides the `from` animation tween for one or more Position instances as a group.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     *
     * @param {object|Function}   fromData -
     *
     * @param {object|Function}   options -
     *
     * @returns {TJSBasicAnimation} Basic animation control.
     */
    static from(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>, fromData: object | Function, options: object | Function): TJSBasicAnimation;
    /**
     * Provides the `fromTo` animation tween for one or more Position instances as a group.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     *
     * @param {object|Function}   fromData -
     *
     * @param {object|Function}   toData -
     *
     * @param {object|Function}   options -
     *
     * @returns {TJSBasicAnimation} Basic animation control.
     */
    static fromTo(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>, fromData: object | Function, toData: object | Function, options: object | Function): TJSBasicAnimation;
    /**
     * Provides the `to` animation tween for one or more Position instances as a group.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     *
     * @param {object|Function}   toData -
     *
     * @param {object|Function}   options -
     *
     * @returns {TJSBasicAnimation} Basic animation control.
     */
    static to(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>, toData: object | Function, options: object | Function): TJSBasicAnimation;
    /**
     * Provides the `to` animation tween for one or more Position instances as a group.
     *
     * @param {Position|{position: Position}|Iterable<Position>|Iterable<{position: Position}>} position -
     *
     * @param {Iterable<string>}  keys -
     *
     * @param {object|Function}   options -
     *
     * @returns {quickToCallback} Basic animation control.
     */
    static quickTo(position: Position | {
        position: Position;
    } | Iterable<Position> | Iterable<{
        position: Position;
    }>, keys: Iterable<string>, options: object | Function): quickToCallback;
}

declare class Transforms {
    _data: {};
    /**
     * @returns {boolean} Whether there are active transforms in local data.
     */
    get isActive(): boolean;
    /**
     * Sets the local rotateX data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateX(arg: number);
    /**
     * @returns {number|undefined} Any local rotateX data.
     */
    get rotateX(): number;
    /**
     * Sets the local rotateY data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateY(arg: number);
    /**
     * @returns {number|undefined} Any local rotateY data.
     */
    get rotateY(): number;
    /**
     * Sets the local rotateZ data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set rotateZ(arg: number);
    /**
     * @returns {number|undefined} Any local rotateZ data.
     */
    get rotateZ(): number;
    /**
     * Sets the local scale data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set scale(arg: number);
    /**
     * @returns {number|undefined} Any local rotateZ scale.
     */
    get scale(): number;
    /**
     * Sets the local translateX data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateX(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateX(): number;
    /**
     * Sets the local translateY data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateY(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateY(): number;
    /**
     * Sets the local translateZ data if the value is a finite number otherwise removes the local data.
     *
     * @param {number|null|undefined}   value - A value to set.
     */
    set translateZ(arg: number);
    /**
     * @returns {number|undefined} Any local translateZ data.
     */
    get translateZ(): number;
    /**
     * Returns the matrix3d CSS transform for the given position / transform data.
     *
     * @param {object} [data] - Optional position data otherwise use local stored transform data.
     *
     * @returns {string} The CSS matrix3d string.
     */
    getCSS(data?: object): string;
    /**
     * Returns the matrix3d CSS transform for the given position / transform data.
     *
     * @param {object} [data] - Optional position data otherwise use local stored transform data.
     *
     * @returns {string} The CSS matrix3d string.
     */
    getCSSOrtho(data?: object): string;
    /**
     * Collects all data including a bounding rect, transform matrix, and points array of the given {@link PositionData}
     * instance with the applied local transform data.
     *
     * @param {PositionData} position - The position data to process.
     *
     * @param {TransformData} [output] - Optional TransformData output instance.
     *
     * @param {object} [validationData] - Optional validation data for adjustment parameters.
     *
     * @returns {TransformData} The output TransformData instance.
     */
    getData(position: PositionData, output?: TransformData$1, validationData?: object): TransformData$1;
    /**
     * Creates a transform matrix based on local data applied in order it was added.
     *
     * If no data object is provided then the source is the local transform data. If another data object is supplied
     * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
     * construction of a transform matrix in advance of setting local data and is useful in collision detection.
     *
     * @param {object}   [data] - PositionData instance or local transform data.
     *
     * @param {Matrix4}  [output] - The output mat4 instance.
     *
     * @returns {Matrix4} Transform matrix.
     */
    getMat4(data?: object, output?: Matrix4): Matrix4;
    /**
     * Provides an orthographic enhancement to convert left / top positional data to a translate operation.
     *
     * This transform matrix takes into account that the remaining operations are , but adds any left / top attributes from passed in data to
     * translate X / Y.
     *
     * If no data object is provided then the source is the local transform data. If another data object is supplied
     * then the stored local transform order is applied then all remaining transform keys are applied. This allows the
     * construction of a transform matrix in advance of setting local data and is useful in collision detection.
     *
     * @param {object}   [data] - PositionData instance or local transform data.
     *
     * @param {Matrix4}  [output] - The output mat4 instance.
     *
     * @returns {Matrix4} Transform matrix.
     */
    getMat4Ortho(data?: object, output?: Matrix4): Matrix4;
    /**
     * Tests an object if it contains transform keys and the values are finite numbers.
     *
     * @param {object} data - An object to test for transform data.
     *
     * @returns {boolean} Whether the given PositionData has transforms.
     */
    hasTransform(data: object): boolean;
    /**
     * Resets internal data from the given object containing valid transform keys.
     *
     * @param {object}   data - An object with transform data.
     */
    reset(data: object): void;
    #private;
}

/**
 * Provides a store for position following the subscriber protocol in addition to providing individual writable derived
 * stores for each independent variable.
 */
declare class Position$1 {
    /**
     * @returns {AnimationGroupAPI} Public Animation API.
     */
    static get Animate(): AnimationGroupAPI;
    /**
     * @returns {{browserCentered?: Centered, Centered?: *}} Initial position helpers.
     */
    static get Initial(): {
        browserCentered?: Centered;
        Centered?: any;
    };
    /**
     * Returns TransformData class / constructor.
     *
     * @returns {TransformData} TransformData class / constructor.
     */
    static get TransformData(): TransformData$1;
    /**
     * Returns default validators.
     *
     * Note: `basicWindow` and `BasicBounds` will eventually be removed.
     *
     * @returns {{basicWindow?: BasicBounds, transformWindow?: TransformBounds, TransformBounds?: *, BasicBounds?: *}}
     *  Available validators.
     */
    static get Validators(): {
        basicWindow?: BasicBounds;
        transformWindow?: TransformBounds;
        TransformBounds?: any;
        BasicBounds?: any;
    };
    /**
     * Returns a duplicate of a given position instance copying any options and validators.
     *
     * // TODO: Consider more safety over options processing.
     *
     * @param {Position}          position - A position instance.
     *
     * @param {PositionOptions}   options - Position options.
     *
     * @returns {Position} A duplicate position instance.
     */
    static duplicate(position: Position$1, options: PositionOptions): Position$1;
    /**
     * @param {PositionParent|PositionOptionsAll}   [parent] - A potential parent element or object w/ `elementTarget`
     *                                                      getter. May also be the PositionOptions object w/ 1 argument.
     *
     * @param {PositionOptionsAll}   [options] - Default values.
     */
    constructor(parent?: PositionParent | PositionOptionsAll, options?: PositionOptionsAll);
    /**
     * Returns the animation API.
     *
     * @returns {AnimationAPI} Animation API.
     */
    get animate(): AnimationAPI;
    /**
     * Returns the dimension data for the readable store.
     *
     * @returns {{width: number | 'auto', height: number | 'auto'}} Dimension data.
     */
    get dimension(): {
        width: number | 'auto';
        height: number | 'auto';
    };
    /**
     * Sets the enabled state.
     *
     * @param {boolean}  enabled - New enabled state.
     */
    set enabled(arg: boolean);
    /**
     * Returns the enabled state.
     *
     * @returns {boolean} Enabled state.
     */
    get enabled(): boolean;
    /**
     * Returns the current HTMLElement being positioned.
     *
     * @returns {HTMLElement|undefined} Current HTMLElement being positioned.
     */
    get element(): HTMLElement;
    /**
     * Returns a promise that is resolved on the next element update with the time of the update.
     *
     * @returns {Promise<number>} Promise resolved on element update.
     */
    get elementUpdated(): Promise<number>;
    /**
     * Sets the associated {@link PositionParent} instance. Resets the style cache and default data.
     *
     * @param {PositionParent|void} parent - A PositionParent instance.
     */
    set parent(arg: any);
    /**
     * Returns the associated {@link PositionParent} instance.
     *
     * @returns {PositionParent} The PositionParent instance.
     */
    get parent(): any;
    /**
     * Returns the state API.
     *
     * @returns {PositionStateAPI} Position state API.
     */
    get state(): PositionStateAPI;
    /**
     * Returns the derived writable stores for individual data variables.
     *
     * @returns {StorePosition} Derived / writable stores.
     */
    get stores(): StorePosition;
    /**
     * Returns the transform data for the readable store.
     *
     * @returns {TransformData} Transform Data.
     */
    get transform(): TransformData$1;
    /**
     * Returns the validators.
     *
     * @returns {AdapterValidators} validators.
     */
    get validators(): AdapterValidators;
    /**
     * @param {number|string|null} height -
     */
    set height(arg: number | "auto" | "inherit");
    /**
     * @returns {number|'auto'|'inherit'|null} height
     */
    get height(): number | "auto" | "inherit";
    /**
     * @param {number|string|null} left -
     */
    set left(arg: number);
    /**
     * @returns {number|null} left
     */
    get left(): number;
    /**
     * @param {number|string|null} maxHeight -
     */
    set maxHeight(arg: number);
    /**
     * @returns {number|null} maxHeight
     */
    get maxHeight(): number;
    /**
     * @param {number|string|null} maxWidth -
     */
    set maxWidth(arg: number);
    /**
     * @returns {number|null} maxWidth
     */
    get maxWidth(): number;
    /**
     * @param {number|string|null} minHeight -
     */
    set minHeight(arg: number);
    /**
     * @returns {number|null} minHeight
     */
    get minHeight(): number;
    /**
     * @param {number|string|null} minWidth -
     */
    set minWidth(arg: number);
    /**
     * @returns {number|null} minWidth
     */
    get minWidth(): number;
    /**
     * @param {number|string|null} rotateX -
     */
    set rotateX(arg: number);
    /**
     * @returns {number|null} rotateX
     */
    get rotateX(): number;
    /**
     * @param {number|string|null} rotateY -
     */
    set rotateY(arg: number);
    /**
     * @returns {number|null} rotateY
     */
    get rotateY(): number;
    /**
     * @param {number|string|null} rotateZ -
     */
    set rotateZ(arg: number);
    /**
     * @returns {number|null} rotateZ
     */
    get rotateZ(): number;
    /**
     * @param {number|string|null} rotateZ - alias for rotateZ
     */
    set rotation(arg: number);
    /**
     * @returns {number|null} alias for rotateZ
     */
    get rotation(): number;
    /**
     * @param {number|string|null} scale -
     */
    set scale(arg: number);
    /**
     * @returns {number|null} scale
     */
    get scale(): number;
    /**
     * @param {number|string|null} top -
     */
    set top(arg: number);
    /**
     * @returns {number|null} top
     */
    get top(): number;
    /**
     * @param {string} transformOrigin -
     */
    set transformOrigin(arg: string);
    /**
     * @returns {string} transformOrigin
     */
    get transformOrigin(): string;
    /**
     * @param {number|string|null} translateX -
     */
    set translateX(arg: number);
    /**
     * @returns {number|null} translateX
     */
    get translateX(): number;
    /**
     * @param {number|string|null} translateY -
     */
    set translateY(arg: number);
    /**
     * @returns {number|null} translateY
     */
    get translateY(): number;
    /**
     * @param {number|string|null} translateZ -
     */
    set translateZ(arg: number);
    /**
     * @returns {number|null} translateZ
     */
    get translateZ(): number;
    /**
     * @param {number|string|null} width -
     */
    set width(arg: number | "auto" | "inherit");
    /**
     * @returns {number|'auto'|'inherit'|null} width
     */
    get width(): number | "auto" | "inherit";
    /**
     * @param {number|string|null} zIndex -
     */
    set zIndex(arg: number);
    /**
     * @returns {number|null} z-index
     */
    get zIndex(): number;
    /**
     * Assigns current position to object passed into method.
     *
     * @param {object|PositionData}  [position] - Target to assign current position data.
     *
     * @param {PositionGetOptions}   [options] - Defines options for specific keys and substituting null for numeric
     *                                           default values.
     *
     * @returns {PositionData} Passed in object with current position data.
     */
    get(position?: object | PositionData$1, options?: PositionGetOptions): PositionData$1;
    /**
     * @returns {PositionData} Current position data.
     */
    toJSON(): PositionData$1;
    /**
     * All calculation and updates of position are implemented in {@link Position}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * Note: the logic for updating position is improved and changes a few aspects from the default
     * {@link Application.setPosition}. The gate on `popOut` is removed, so to ensure no positional application occurs
     * popOut applications can set `this.options.positionable` to false ensuring no positional inline styles are
     * applied.
     *
     * The initial set call on an application with a target element will always set width / height as this is
     * necessary for correct calculations.
     *
     * When a target element is present updated styles are applied after validation. To modify the behavior of set
     * implement one or more validator functions and add them from the application via
     * `this.position.validators.add(<Function>)`.
     *
     * Updates to any target element are decoupled from the underlying Position data. This method returns this instance
     * that you can then await on the target element inline style update by using {@link Position.elementUpdated}.
     *
     * @param {PositionDataExtended} [position] - Position data to set.
     *
     * @returns {Position} This Position instance.
     */
    set(position?: PositionDataExtended$1): Position$1;
    /**
     *
     * @param {function(PositionData): void} handler - Callback function that is invoked on update / changes. Receives
     *                                                 a copy of the PositionData.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: PositionData$1) => void): (() => void);
    #private;
}
type PositionInitialHelper = {
    /**
     * - Returns the left position given the width of the browser window.
     */
    getLeft: (width: number) => number;
    /**
     * - Returns the top position given the height of the browser window.
     */
    getTop: (height: number) => number;
};
type PositionDataExtended$1 = {
    /**
     * -
     */
    height?: number | string | null;
    /**
     * -
     */
    left?: number | string | null;
    /**
     * -
     */
    maxHeight?: number | string | null;
    /**
     * -
     */
    maxWidth?: number | string | null;
    /**
     * -
     */
    minHeight?: number | string | null;
    /**
     * -
     */
    minWidth?: number | string | null;
    /**
     * -
     */
    rotateX?: number | string | null;
    /**
     * -
     */
    rotateY?: number | string | null;
    /**
     * -
     */
    rotateZ?: number | string | null;
    /**
     * -
     */
    scale?: number | string | null;
    /**
     * -
     */
    top?: number | string | null;
    /**
     * -
     */
    transformOrigin?: string | null;
    /**
     * -
     */
    translateX?: number | string | null;
    /**
     * -
     */
    translateY?: number | string | null;
    /**
     * -
     */
    translateZ?: number | string | null;
    /**
     * -
     */
    width?: number | string | null;
    /**
     * -
     *
     * Extended properties -----------------------------------------------------------------------------------------------
     */
    zIndex?: number | string | null;
    /**
     * - When true any associated element is updated immediately.
     */
    immediateElementUpdate?: boolean;
    /**
     * - Alias for `rotateZ`.
     */
    rotation?: number | null;
};
type PositionGetOptions = {
    /**
     * - When provided only these keys are copied.
     */
    keys: Iterable<string>;
    /**
     * - When provided these keys are excluded.
     */
    exclude: Iterable<string>;
    /**
     * - When true any `null` values are converted into defaults.
     */
    numeric: boolean;
};
/**
 * - Options set in constructor.
 */
type PositionOptions = {
    /**
     * - When true always calculate transform data.
     */
    calculateTransform: boolean;
    /**
     * - Provides a helper for setting initial position data.
     */
    initialHelper: PositionInitialHelper;
    /**
     * - Sets Position to orthographic mode using just transform / matrix3d for positioning.
     */
    ortho: boolean;
    /**
     * - Set to true when there are subscribers to the readable transform store.
     */
    transformSubscribed: boolean;
};
type PositionOptionsAll = PositionOptions & PositionData$1;
type PositionParent = HTMLElement | object;
type ResizeObserverData = {
    /**
     * -
     */
    contentHeight: number | undefined;
    /**
     * -
     */
    contentWidth: number | undefined;
    /**
     * -
     */
    offsetHeight: number | undefined;
    /**
     * -
     */
    offsetWidth: number | undefined;
};
/**
 * - Provides individual writable stores for {@link Position }.
 */
type StorePosition = {
    /**
     * - Readable store for dimension
     *   data.
     */
    dimension: any;
    /**
     * - Readable store for current element.
     */
    element: any;
    /**
     * - Derived store for `left` updates.
     */
    left: any;
    /**
     * - Derived store for `top` updates.
     */
    top: any;
    /**
     * - Derived store for `width` updates.
     */
    width: any;
    /**
     * - Derived store for `height` updates.
     */
    height: any;
    /**
     * - Derived store for `maxHeight` updates.
     */
    maxHeight: any;
    /**
     * - Derived store for `maxWidth` updates.
     */
    maxWidth: any;
    /**
     * - Derived store for `minHeight` updates.
     */
    minHeight: any;
    /**
     * - Derived store for `minWidth` updates.
     */
    minWidth: any;
    /**
     * - Readable store for `contentHeight`.
     */
    resizeContentHeight: any;
    /**
     * - Readable store for `contentWidth`.
     */
    resizeContentWidth: any;
    /**
     * - Protected store for resize observer updates.
     */
    resizeObserved: any;
    /**
     * - Readable store for `offsetHeight`.
     */
    resizeOffsetHeight: any;
    /**
     * - Readable store for `offsetWidth`.
     */
    resizeOffsetWidth: any;
    /**
     * - Derived store for `rotate` updates.
     */
    rotate: any;
    /**
     * - Derived store for `rotateX` updates.
     */
    rotateX: any;
    /**
     * - Derived store for `rotateY` updates.
     */
    rotateY: any;
    /**
     * - Derived store for `rotateZ` updates.
     */
    rotateZ: any;
    /**
     * - Derived store for `scale` updates.
     */
    scale: any;
    /**
     * - Readable store for transform data.
     */
    transform: any;
    /**
     * - Derived store for `transformOrigin`.
     */
    transformOrigin: any;
    /**
     * - Derived store for `translateX` updates.
     */
    translateX: any;
    /**
     * - Derived store for `translateY` updates.
     */
    translateY: any;
    /**
     * - Derived store for `translateZ` updates.
     */
    translateZ: any;
    /**
     * - Derived store for `zIndex` updates.
     */
    zIndex: any;
};
type ValidationData$1 = {
    /**
     * -
     */
    position: PositionData$1;
    /**
     * -
     */
    parent: PositionParent;
    /**
     * -
     */
    el: HTMLElement;
    /**
     * -
     */
    computed: CSSStyleDeclaration;
    /**
     * -
     */
    transforms: Transforms;
    /**
     * -
     */
    height: number;
    /**
     * -
     */
    width: number;
    /**
     * -
     */
    marginLeft: number | undefined;
    /**
     * -
     */
    marginTop: number | undefined;
    /**
     * -
     */
    maxHeight: number | undefined;
    /**
     * -
     */
    maxWidth: number | undefined;
    /**
     * -
     */
    minHeight: number | undefined;
    /**
     * -
     */
    minWidth: number | undefined;
    /**
     * - The rest of any data submitted to {@link Position.set }
     */
    rest: object;
};

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately. You can declaratively
 * load one or more components from `defaultOptions`.
 */
declare class SvelteApplication$1 {
    /**
     * @param {SvelteApplicationOptions} options - The options for the application.
     *
     * @inheritDoc
     */
    constructor(options?: ApplicationOptions);
    /**
     * Returns the content element if an application shell is mounted.
     *
     * @returns {HTMLElement} Content element.
     */
    get elementContent(): HTMLElement;
    /**
     * Returns the target element or main element if no target defined.
     *
     * @returns {HTMLElement} Target element.
     */
    get elementTarget(): HTMLElement;
    /**
     * Returns the reactive accessors & Svelte stores for SvelteApplication.
     *
     * @returns {SvelteReactive} The reactive accessors & Svelte stores.
     */
    get reactive(): SvelteReactive;
    /**
     * Returns the application state manager.
     *
     * @returns {ApplicationState} The application state manager.
     */
    get state(): ApplicationState;
    /**
     * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
     *
     * @returns {GetSvelteData} GetSvelteData
     */
    get svelte(): GetSvelteData;
    /**
     * Provides a mechanism to update the UI options store for maximized.
     *
     * Note: the sanity check is duplicated from {@link Application.maximize} the store is updated _before_
     * performing the rest of animations. This allows application shells to remove / show any resize handlers
     * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
     * to animate the content area.
     *
     * @param {object}   [opts] - Optional parameters.
     *
     * @param {boolean}  [opts.animate=true] - When true perform default maximizing animation.
     *
     * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
     */
    maximize({ animate, duration }?: {
        animate?: boolean;
        duration?: number;
    }): Promise<void>;
    /**
     * Provides a mechanism to update the UI options store for minimized.
     *
     * Note: the sanity check is duplicated from {@link Application.minimize} the store is updated _before_
     * performing the rest of animations. This allows application shells to remove / show any resize handlers
     * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
     * to animate the content area.
     *
     * @param {object}   [opts] - Optional parameters
     *
     * @param {boolean}  [opts.animate=true] - When true perform default minimizing animation.
     *
     * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
     */
    minimize({ animate, duration }?: {
        animate?: boolean;
        duration?: number;
    }): Promise<void>;
    /**
     * Provides a callback after all Svelte components are initialized.
     *
     * @param {object}      [opts] - Optional parameters.
     *
     * @param {HTMLElement} [opts.element] - HTMLElement container for main application element.
     *
     * @param {HTMLElement} [opts.elementContent] - HTMLElement container for content area of application shells.
     *
     * @param {HTMLElement} [opts.elementTarget] - HTMLElement container for main application target element.
     */
    onSvelteMount({ element, elementContent, elementTarget }?: {
        element?: HTMLElement;
        elementContent?: HTMLElement;
        elementTarget?: HTMLElement;
    }): void;
    /**
     * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
     * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
     * context.
     *
     * @param {object}      [opts] - Optional parameters.
     *
     * @param {HTMLElement} [opts.element] - HTMLElement container for main application element.
     *
     * @param {HTMLElement} [opts.elementContent] - HTMLElement container for content area of application shells.
     *
     * @param {HTMLElement} [opts.elementTarget] - HTMLElement container for main application target element.
     */
    onSvelteRemount({ element, elementContent, elementTarget }?: {
        element?: HTMLElement;
        elementContent?: HTMLElement;
        elementTarget?: HTMLElement;
    }): void;
    /**
     * All calculation and updates of position are implemented in {@link Position.set}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
     * to update to using the {@link Position.validators} functionality.
     *
     * @param {PositionDataExtended}   [position] - Position data.
     *
     * @returns {Position} The updated position object for the application containing the new values
     */
    setPosition(position?: PositionDataExtended): Position$1;
    #private;
}
type SvelteApplicationOptions$1 = ApplicationOptions;
type SvelteData$1 = {
    /**
     * -
     */
    config: object;
    /**
     * -
     */
    component: any;
    /**
     * -
     */
    element: HTMLElement;
    /**
     * -
     */
    injectHTML: boolean;
};
type SvelteStores$1 = {
    /**
     * - Update function for app options store.
     */
    appOptionsUpdate: any;
    /**
     * - Subscribes to local stores.
     */
    subscribe: Function;
    /**
     * - Update function for UI options store.
     */
    uiOptionsUpdate: any;
    /**
     * - Unsubscribes from local stores.
     */
    unsubscribe: Function;
};

/**
 * Provides storage for all dialog options adding `get`, `merge` and `set` methods that safely access and update
 * data changed to the mounted DialogShell component reactively.
 */
declare class TJSDialogData {
    /**
     * @param {SvelteApplication} application - The host Foundry application.
     */
    constructor(application: SvelteApplication);
    /**
     * Provides configuration of the dialog button bar.
     *
     * @type {Record<string, TJSDialogButtonData>}
     */
    buttons: Record<string, TJSDialogButtonData>;
    /**
     * A Svelte configuration object or HTML string content.
     *
     * @type {object|string}
     */
    content: object | string;
    /**
     * The default button ID to focus initially.
     *
     * @type {string}
     */
    default: string;
    /**
     * The dialog is draggable when true.
     *
     * @type {boolean}
     */
    draggable: boolean;
    /**
     * When true auto-management of app focus is enabled.
     *
     * @type {boolean}
     */
    focusAuto: boolean;
    /**
     * When true the first focusable element that isn't a button is focused.
     *
     * @type {boolean}
     */
    focusFirst: boolean;
    /**
     * When `focusAuto` and `focusKeep` is true; keeps internal focus.
     *
     * @type {boolean}
     */
    focusKeep: boolean;
    /**
     * When true the dialog is minimizable.
     *
     * @type {boolean}
     */
    minimizable: boolean;
    /**
     * When true a modal dialog is displayed.
     *
     * @type {boolean}
     */
    modal: boolean;
    /**
     * Additional options for modal dialog display.
     *
     * @type {object}
     * TODO: Better specify type / options.
     */
    modalOptions: object;
    /**
     * When true and an error is raised in dialog callback functions post a UI error notification.
     *
     * @type {boolean}
     */
    notifyError: boolean;
    /**
     * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
     * by name exported from content Svelte component is invoked.
     *
     * @type {string|((application: TJSDialog) => any)}
     */
    onClose: string | ((application: TJSDialog) => any);
    /**
     * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
     * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
     * will cause the Promise to then be rejected.
     *
     * @type {boolean}
     */
    rejectClose: boolean;
    /**
     * When true the dialog is resizable.
     *
     * @type {boolean}
     */
    resizable: boolean;
    /**
     * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
     * resolved.
     *
     * @type {boolean}
     */
    resolveId: boolean;
    /**
     * The dialog window title.
     *
     * @type {string}
     */
    title: string;
    /**
     * Transition options for the dialog.
     *
     * @type {object}
     * TODO: Better specify type / options.
     */
    transition: object;
    /**
     * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
     * top when activated.
     *
     * @type {number|null}
     */
    zIndex: number | null;
    /**
     * Provides a way to safely get this dialogs data given an accessor string which describes the
     * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
     * to walk.
     *
     * // TODO DOCUMENT the accessor in more detail.
     *
     * @param {string}   accessor - The path / key to set. You can set multiple levels.
     *
     * @param {*}        [defaultValue] - A default value returned if the accessor is not found.
     *
     * @returns {*} Value at the accessor.
     */
    get(accessor: string, defaultValue?: any): any;
    /**
     * @param {object} data - Merge provided data object into Dialog data.
     */
    merge(data: object): void;
    /**
     * Provides a way to safely set this dialogs data given an accessor string which describes the
     * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
     * to walk.
     *
     * Automatically the dialog data will be updated in the associated DialogShell Svelte component.
     *
     * // TODO DOCUMENT the accessor in more detail.
     *
     * @param {string}   accessor - The path / key to set. You can set multiple levels.
     *
     * @param {*}        value - Value to set.
     *
     * @returns {boolean} True if successful.
     */
    set(accessor: string, value: any): boolean;
    #private;
}

/**
 * Provides a reactive dialog implementation configured from a unique dialog options object. The dialog features a
 * bottom button bar for user selection.
 *
 * A glasspane / modal option with various styling and transition capabilities is available when setting `modal: true`.
 *
 * Most importantly the `content` attribute of dialog data can be a Svelte component configuration object to render
 * your custom component as the dialog content. When using a Svelte component as the content you can assign a string
 * to the various `on<XXX>` dialog callbacks and an exported function from your component will be invoked to handle the
 * button callback. All dialog button callbacks and `onClose` callback receive a single argument which is the dialog /
 * application instance.
 *
 * When making a form with form validation or other dialog that you don't want to close immediately on button press you
 * can set `autoClose: false`, however you are 100% in control of resolving any Promise callbacks from button presses
 * and also closing the application. Each button can also be configured with `autoClose: false` in the button data.
 *
 * There is a handy Promise management capability to track a single Promise for the lifetime of a dialog available
 * at {@link TJSDialog.managedPromise}. By default when the user closes the dialog / application any managed Promise is
 * resolved with `null`. The managed Promise is available in any Svelte content component by using
 * `const managedPromise = getContext('#managedPromise')`. When handling any custom resolution particularly when
 * setting `autoClose: false` for a given button you are 100% in control of resolving or rejecting asynchronous data to
 * return from the dialog.
 *
 * To create and wait upon a managed promise for asynchronous return results use the static or member variation of
 * {@link TJSDialog.wait}.
 *
 * Please refer to {@link TJSDialogOptions} for the various options used to construct the dialog.
 *
 * There are a couple of static helper methods to quickly create standard dialogs such as a 'yes' / 'no' confirmation
 * dialog with {@link TJSDialog.confirm} and an 'ok' single button dialog with {@link TJSDialog.prompt}.
 *
 * TODO: document all extended dialog data parameters such as transition options / modal transitions.
 */
declare class TJSDialog$1 extends SvelteApplication$1 {
    /**
     * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
     * If you require more flexibility, a custom TJSDialog instance is preferred. The default focused button is 'yes'.
     * You can change the default focused button by setting `default` to `yes` or `no`.
     *
     * @template T
     *
     * @param {TJSDialogOptions} data - Confirm dialog options.
     *
     * @param {string|((application: TJSDialog) => any)} [data.onYes] - Callback function upon `yes`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {string|((application: TJSDialog) => any)} [data.onNo] - Callback function upon `no`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} A promise which resolves with result of yes / no callbacks or true / false.
     *
     * @example
     * const result = await TJSDialog.confirm({
     *  title: 'A Yes or No Question',
     *  content: '<p>Choose wisely.</p>',
     *  onYes: () => 'YES Result'
     *  onNo: () => 'NO Result'
     * });
     *
     * // Logs 'YES result', 'NO Result', or null if the user closed the dialog without making a selection.
     * console.log(result);
     */
    static confirm<T_1>({ onYes, onNo, ...data }?: TJSDialogOptions, options?: SvelteApplicationOptions): Promise<T_1>;
    /**
     * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
     *
     * @template T
     *
     * @param {TJSDialogOptions} [data] - Prompt dialog options.
     *
     * @param {string|((application: TJSDialog) => any)} [data.onOk] - Callback function upon `ok`; may be an async
     *        function. When defined as a string any matching function by name exported from content Svelte component is
     *        invoked.
     *
     * @param {string}   [data.label] - The OK prompt button text.
     *
     * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} The returned value from the provided callback function or `true` if the button
     *          is pressed.
     *
     * @example
     * const result = await TJSDialog.prompt({
     *  title: 'Are you OK?',
     *  content: '<p>Are you OK?.</p>',
     *  label: 'Feeling Fine!'
     *  onOk: () => 'OK'
     * });
     *
     * // Logs 'OK' or null if the user closed the dialog without making a selection.
     * console.log(result);
     */
    static prompt<T_2>({ onOk, label, icon, ...data }?: TJSDialogOptions, options?: SvelteApplicationOptions): Promise<T_2>;
    /**
     * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
     * choice.
     *
     * Note: By default `null` is returned if the dialog is closed without a user making a choice.
     *
     * @template T
     *
     * @param {TJSDialogOptions}  data - Dialog data passed to the TJSDialog constructor.
     *
     * @param {SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog constructor.
     *
     * @returns {Promise<T>} A Promise that resolves to the chosen result.
     */
    static wait<T_3>(data: TJSDialogOptions, options?: SvelteApplicationOptions): Promise<T_3>;
    /**
     * @param {TJSDialogOptions}           data - Dialog options.
     *
     * @param {SvelteApplicationOptions}   [options] - SvelteApplication options.
     */
    constructor(data: TJSDialogOptions, options?: SvelteApplicationOptions);
    /**
     * Sets the dialog data; this is reactive.
     *
     * @param {object}   data - Dialog data.
     */
    set data(arg: TJSDialogData);
    /**
     * Returns the dialog data.
     *
     * @returns {TJSDialogData} Dialog data.
     */
    get data(): TJSDialogData;
    /**
     * @returns {ManagedPromise} Returns the managed promise.
     */
    get managedPromise(): ManagedPromise;
    /**
     * Brings to top or renders this dialog returning a Promise that is resolved any button pressed or when the dialog
     * is closed.
     *
     * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
     * choice.
     *
     * Note: `null` is returned if the dialog is closed without a user making a choice.
     *
     * @template T
     *
     * @param {object}   [options] - Options.
     *
     * @param {boolean}  [options.reuse=false] - When true if there is an existing managed Promise this allows multiple
     *        sources to await on the same result.
     *
     * @returns {Promise<T>} A promise for dialog resolution.
     */
    wait<T>(options?: {
        reuse?: boolean;
    }): Promise<T>;
    #private;
}
/**
 * - Defines the common dialog configuration data.
 */
type TJSDialogOptions = {
    /**
     * - Provides configuration of the dialog button bar.
     */
    buttons?: Record<string, TJSDialogButtonData$1>;
    /**
     * - A Svelte configuration object or HTML string content.
     */
    content: object | string;
    /**
     * - The default button ID to focus initially.
     */
    default?: string;
    /**
     * - The dialog is draggable when true.
     */
    draggable?: boolean;
    /**
     * - When true auto-management of app focus is enabled.
     */
    focusAuto?: boolean;
    /**
     * - When true the first focusable element that isn't a button is focused.
     */
    focusFirst?: boolean;
    /**
     * - When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    focusKeep?: boolean;
    /**
     * - When true focus trapping / wrapping is enabled keeping focus inside app.
     */
    focusTrap?: boolean;
    /**
     * - When true the dialog is minimizable.
     */
    minimizable?: boolean;
    /**
     * - When true a modal dialog is displayed.
     */
    modal?: boolean;
    /**
     * - Additional options for modal dialog display.
     */
    modalOptions?: object;
    /**
     * - When true and an error is raised in dialog callback functions post a UI
     * error notification.
     */
    notifyError?: boolean;
    /**
     * - Callback invoked when dialog is closed; no button
     * option selected. When defined as a string any matching function by name exported from content Svelte
     * component is invoked.
     */
    onClose?: string | ((application: TJSDialog$1) => any);
    /**
     * - When true and a Promise has been created by {@link TJSDialog.wait } and
     * the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
     * function is invoked and any result that is undefined will cause the Promise to then be rejected.
     */
    rejectClose?: boolean;
    /**
     * - When true the dialog is resizable.
     */
    resizable?: boolean;
    /**
     * - When true and resolving any Promises and there are undefined results from
     * any button callbacks the button ID is resolved.
     */
    resolveId?: boolean;
    /**
     * - The dialog window title.
     */
    title?: string;
    /**
     * - Transition options for the dialog.
     */
    transition?: object;
    /**
     * - A specific z-index for the dialog. Pass null for the dialog to act like other
     * applications in regard bringing to top when activated.
     */
    zIndex?: number | null;
};
/**
 * - TJSDialog button data.
 */
type TJSDialogButtonData$1 = {
    /**
     * - When false the dialog does not automatically close when button selected.
     */
    autoClose?: boolean;
    /**
     * - Determines if the button is accessible providing a truthy value.
     */
    condition?: boolean | (() => boolean);
    /**
     * - Button label; will be localized.
     */
    label?: string;
    /**
     * - Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
     */
    icon?: string;
    /**
     * - Callback for button press. When defined as a
     * string any matching function by name exported from content Svelte component is invoked.
     */
    onPress?: string | ((application: TJSDialog$1) => any);
    /**
     * - Inline styles to apply to the button.
     */
    styles?: Record<string, string>;
};

/**
 * - Application shell contract for Svelte components.
 */
type MountedAppShell$1 = {
    /**
     * - The root element / exported prop.
     */
    elementRoot: HTMLElement;
    /**
     * - The content element / exported prop.
     */
    elementContent?: HTMLElement;
    /**
     * - The target element / exported prop.
     */
    elementTarget?: HTMLElement;
};
type ApplicationShellExt$1 = ApplicationShell;
/**
 * - Provides a custom readable Svelte store for Application options state.
 */
type StoreAppOptions$1 = {
    /**
     * - Subscribe to all app options updates.
     */
    subscribe: any;
    /**
     * - Derived store for `draggable` updates.
     */
    draggable: any;
    /**
     * - Derived store for `focusAuto` updates.
     */
    focusAuto: any;
    /**
     * - Derived store for `focusKeep` updates.
     */
    focusKeep: any;
    /**
     * - Derived store for `focusTrap` updates.
     */
    focusTrap: any;
    /**
     * - Derived store for `headerButtonNoClose`
     *   updates.
     */
    headerButtonNoClose: any;
    /**
     * - Derived store for `headerButtonNoLabel`
     *   updates.
     */
    headerButtonNoLabel: any;
    /**
     * - Derived store for `headerIcon` updates.
     */
    headerIcon: any;
    /**
     * - Derived store for
     *   `headerNoTitleMinimized` updates.
     */
    headerNoTitleMinimized: any;
    /**
     * - Derived store for `minimizable` updates.
     */
    minimizable: any;
    /**
     * - Derived store for `popOut` updates.
     */
    popOut: any;
    /**
     * - Derived store for `positionable` updates.
     */
    positionable: any;
    /**
     * - Derived store for `resizable` updates.
     */
    resizable: any;
    /**
     * - Derived store for `title` updates.
     */
    title: any;
};
/**
 * - Provides a custom readable Svelte store for UI options state.
 */
type StoreUIOptions$1 = {
    /**
     * - Subscribe to all UI options updates.
     */
    subscribe: any;
    /**
     * - Derived store for `dragging` updates.
     */
    dragging: any;
    /**
     * - Derived store for
     *   `headerButtons` updates.
     */
    headerButtons: any;
    /**
     * - Derived store for `minimized` updates.
     */
    minimized: any;
    /**
     * - Derived store for `resizing` updates.
     */
    resizing: any;
};
type TransformData = {
    /**
     * - A transition applying to both in & out.
     */
    transition: Function;
    /**
     * - A transition applying to in.
     */
    inTransition: Function;
    /**
     * - A transition applying to out.
     */
    outTransition: Function;
    /**
     * - The options config object for in & out transitions.
     */
    transitionOptions: object;
    /**
     * - The options config object for in transitions.
     */
    inTransitionOptions: object;
    /**
     * - The options config object for out transitions.
     */
    outTransitionOptions: object;
};

export { ApplicationShellExt$1 as ApplicationShellExt, MountedAppShell$1 as MountedAppShell, Position$1 as Position, PositionDataExtended$1 as PositionDataExtended, PositionGetOptions, PositionInitialHelper, PositionOptions, PositionOptionsAll, PositionParent, ResizeObserverData, StoreAppOptions$1 as StoreAppOptions, StorePosition, StoreUIOptions$1 as StoreUIOptions, SvelteApplication$1 as SvelteApplication, SvelteApplicationOptions$1 as SvelteApplicationOptions, SvelteData$1 as SvelteData, SvelteStores$1 as SvelteStores, TJSDialog$1 as TJSDialog, TJSDialogButtonData$1 as TJSDialogButtonData, TJSDialogOptions, TransformData, ValidationData$1 as ValidationData };
