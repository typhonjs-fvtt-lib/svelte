import * as _typhonjs_fvtt_svelte_application from '@typhonjs-fvtt/svelte/application';
import { SvelteApplication } from '@typhonjs-fvtt/svelte/application';
import * as _typhonjs_svelte_runtime_base_svelte_store_position from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { Data, TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { SvelteComponent } from 'svelte';
import { TJSSvelteConfig } from '@typhonjs-svelte/runtime-base/svelte/util';
import { EasingReference } from '@typhonjs-svelte/runtime-base/svelte/easing';
import { Readable, Writable } from 'svelte/store';
import { TJSWebStorage } from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';

/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use HandlebarsApplication in a similar manner as the core Foundry `Application` class.
 * This should only be an interim or stepwise solution as you convert your package over to fully using TRL & Svelte.
 */
declare class HandlebarsApplication extends SvelteApplication {
  /**
   * @inheritDoc
   */
  constructor(options: any);
  #private;
}

/**
 * Provides a mechanism to retrieve and query all mounted Svelte components including the main application shell.
 */
declare interface GetSvelteData {
  /**
   * Returns any mounted {@link MountedAppShell}.
   *
   * @returns {MountedAppShell | null} Any mounted application shell.
   */
  get applicationShell(): MountedAppShell;
  /**
   * Returns the indexed Svelte component.
   *
   * @param {number}   index - The index of Svelte component to retrieve.
   *
   * @returns {SvelteComponent} The loaded Svelte component.
   */
  component(index: number): object;
  /**
   * Returns the Svelte component entries iterator.
   *
   * @returns {IterableIterator<[number, SvelteComponent]>} Svelte component entries iterator.
   * @yields
   */
  componentEntries(): IterableIterator<[number, SvelteComponent]>;
  /**
   * Returns the Svelte component values iterator.
   *
   * @returns {IterableIterator<SvelteComponent>} Svelte component values iterator.
   * @yields
   */
  componentValues(): IterableIterator<SvelteComponent>;
  /**
   * Returns the indexed SvelteData entry.
   *
   * @param {number}   index - The index of SvelteData instance to retrieve.
   *
   * @returns {SvelteData} The loaded Svelte config + component.
   */
  data(index: number): SvelteData;
  /**
   * Returns the {@link SvelteData} instance for a given component.
   *
   * @param {SvelteComponent} component - Svelte component.
   *
   * @returns {SvelteData} -  The loaded Svelte config + component.
   */
  dataByComponent(component: SvelteComponent): SvelteData;
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
}
/**
 * Application shell contract for Svelte components.
 */
type MountedAppShell = {
  /**
   * The root element / exported prop.
   */
  elementRoot: HTMLElement;
  /**
   * The content element / exported prop.
   */
  elementContent?: HTMLElement;
  /**
   * The target element / exported prop.
   */
  elementTarget?: HTMLElement;
};
/**
 * Provides access to a mounted Svelte component.
 */
type SvelteData = {
  /**
   * The TJSSvelteConfig for this component.
   */
  config: TJSSvelteConfig;
  /**
   * The svelte component instance.
   */
  component: SvelteComponent;
  /**
   * The main bound element.
   */
  element: HTMLElement;
};

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
 * An instance of TJSWebStorage (session) / TJSSessionStorage is accessible via {@link SvelteReactive.sessionStorage}.
 * Optionally you can pass in an existing TJSWebStorage instance that can be shared across multiple SvelteApplications
 * by setting {@link SvelteApplicationOptions.sessionStorage}.
 *
 * -------------------------------------------------------------------------------------------------------------------
 *
 * This API is not sealed, and it is recommended that you extend it with accessors to get / set data that is reactive
 * in your application. An example of setting an exported prop `document` from the main mounted application shell.
 *
 * @example
 * ```js
 * import { hasSetter } from '@typhonjs-svelte/runtime-base/util/object';
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
 * ```
 */
declare interface SvelteReactive {
  /**
   * @returns {TJSWebStorage} Returns TJSWebStorage (session) instance.
   */
  get sessionStorage(): TJSWebStorage;
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
   * Returns the draggable app option.
   *
   * @returns {boolean} Draggable app option.
   */
  get draggable(): boolean;
  /**
   * Sets `this.options.draggable` which is reactive for application shells.
   *
   * @param {boolean}  draggable - Sets the draggable option.
   */
  set draggable(draggable: boolean);
  /**
   * Returns the focusAuto app option.
   *
   * @returns {boolean} When true auto-management of app focus is enabled.
   */
  get focusAuto(): boolean;
  /**
   * Sets `this.options.focusAuto` which is reactive for application shells.
   *
   * @param {boolean}  focusAuto - Sets the focusAuto option.
   */
  set focusAuto(focusAuto: boolean);
  /**
   * Returns the focusKeep app option.
   *
   * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
   */
  get focusKeep(): boolean;
  /**
   * Sets `this.options.focusKeep` which is reactive for application shells.
   *
   * @param {boolean}  focusKeep - Sets the focusKeep option.
   */
  set focusKeep(focusKeep: boolean);
  /**
   * Returns the focusTrap app option.
   *
   * @returns {boolean} When true focus trapping / wrapping is enabled keeping focus inside app.
   */
  get focusTrap(): boolean;
  /**
   * Sets `this.options.focusTrap` which is reactive for application shells.
   *
   * @param {boolean}  focusTrap - Sets the focusTrap option.
   */
  set focusTrap(focusTrap: boolean);
  /**
   * Returns the headerButtonNoClose app option.
   *
   * @returns {boolean} Remove the close the button in header app option.
   */
  get headerButtonNoClose(): boolean;
  /**
   * Sets `this.options.headerButtonNoClose` which is reactive for application shells.
   *
   * @param {boolean}  headerButtonNoClose - Sets the headerButtonNoClose option.
   */
  set headerButtonNoClose(headerButtonNoClose: boolean);
  /**
   * Returns the headerButtonNoLabel app option.
   *
   * @returns {boolean} Remove the labels from buttons in header app option.
   */
  get headerButtonNoLabel(): boolean;
  /**
   * Sets `this.options.headerButtonNoLabel` which is reactive for application shells.
   *
   * @param {boolean}  headerButtonNoLabel - Sets the headerButtonNoLabel option.
   */
  set headerButtonNoLabel(headerButtonNoLabel: boolean);
  /**
   * Returns the headerIcon app option.
   *
   * @returns {string | undefined} URL for header app icon.
   */
  get headerIcon(): string | undefined;
  /**
   * Sets `this.options.headerIcon` which is reactive for application shells.
   *
   * @param {string | undefined}  headerIcon - Sets the headerButtonNoLabel option.
   */
  set headerIcon(headerIcon: string | undefined);
  /**
   * Returns the headerNoTitleMinimized app option.
   *
   * @returns {boolean} When true removes the header title when minimized.
   */
  get headerNoTitleMinimized(): boolean;
  /**
   * Sets `this.options.headerNoTitleMinimized` which is reactive for application shells.
   *
   * @param {boolean}  headerNoTitleMinimized - Sets the headerNoTitleMinimized option.
   */
  set headerNoTitleMinimized(headerNoTitleMinimized: boolean);
  /**
   * Returns the minimizable app option.
   *
   * @returns {boolean} Minimizable app option.
   */
  get minimizable(): boolean;
  /**
   * Sets `this.options.minimizable` which is reactive for application shells that are also pop out.
   *
   * @param {boolean}  minimizable - Sets the minimizable option.
   */
  set minimizable(minimizable: boolean);
  /**
   * Returns the Foundry popOut state; {@link ApplicationOptions.popOut}
   *
   * @returns {boolean} Positionable app option.
   */
  get popOut(): boolean;
  /**
   * Sets `this.options.popOut` which is reactive for application shells. This will add / remove this application
   * from `ui.windows`.
   *
   * @param {boolean}  popOut - Sets the popOut option.
   */
  set popOut(popOut: boolean);
  /**
   * Returns the positionable app option; {@link SvelteApplicationOptions.positionable}
   *
   * @returns {boolean} Positionable app option.
   */
  get positionable(): boolean;
  /**
   * Sets `this.options.positionable` enabling / disabling {@link SvelteApplication.position}.
   *
   * @param {boolean}  positionable - Sets the positionable option.
   */
  set positionable(positionable: boolean);
  /**
   * Returns the resizable option.
   *
   * @returns {boolean} Resizable app option.
   */
  get resizable(): boolean;
  /**
   * Sets `this.options.resizable` which is reactive for application shells.
   *
   * @param {boolean}  resizable - Sets the resizable option.
   */
  set resizable(resizable: boolean);
  /**
   * Returns the title accessor from the parent Application class; {@link ApplicationOptions.title}
   *
   * @returns {string} Title.
   */
  get title(): string;
  /**
   * Sets `this.options.title` which is reactive for application shells.
   *
   * Note: Will set empty string if title is undefined or null.
   *
   * @param {string | undefined | null}   title - Application title; will be localized, so a translation key is fine.
   */
  set title(title: string);
  /**
   * Returns the current active Window / WindowProxy UI state.
   *
   * @returns {Window} Active window UI state.
   */
  get activeWindow(): Window;
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
   * Sets the current active Window / WindowProxy UI state.
   *
   * Note: This is protected usage and used internally.
   *
   * @param {Window} activeWindow - Active Window / WindowProxy UI state.
   */
  set activeWindow(activeWindow: Window);
  /**
   * Provides a way to safely get this applications options given an accessor string which describes the
   * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
   * to walk.
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
   * Additionally, if an application shell Svelte component is mounted and exports the `appOptions` property then
   * the application options is set to `appOptions` potentially updating the application shell / Svelte component.
   *
   * @param {string}   accessor - The path / key to set. You can set multiple levels.
   *
   * @param {any}        value - Value to set.
   */
  setOptions(accessor: string, value: any): void;
  /**
   * Serializes the main {@link SvelteApplicationOptions} for common application state.
   */
  toJSON(): SvelteReactiveData;
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
   * @param {object} [opts] - Optional parameters (for internal use)
   *
   * @param {boolean} [opts.headerButtonNoClose] - The value for `headerButtonNoClose`.
   *
   * @param {boolean} [opts.headerButtonNoLabel] - The value for `headerButtonNoLabel`.
   */
  updateHeaderButtons({
    headerButtonNoClose,
    headerButtonNoLabel,
  }?: {
    headerButtonNoClose?: boolean;
    headerButtonNoLabel?: boolean;
  }): void;
}
/**
 * Provides a custom readable Svelte store for Application options state.
 */
type StoreAppOptions = {
  /**
   * Subscribe to all app options updates.
   */
  subscribe: Readable<object>;
  /**
   * Derived store for `draggable` updates.
   */
  draggable: Writable<boolean>;
  /**
   * Derived store for `focusAuto` updates.
   */
  focusAuto: Writable<boolean>;
  /**
   * Derived store for `focusKeep` updates.
   */
  focusKeep: Writable<boolean>;
  /**
   * Derived store for `focusTrap` updates.
   */
  focusTrap: Writable<boolean>;
  /**
   * Derived store for `headerButtonNoClose` updates.
   */
  headerButtonNoClose: Writable<boolean>;
  /**
   * Derived store for `headerButtonNoLabel` updates.
   */
  headerButtonNoLabel: Writable<boolean>;
  /**
   * Derived store for `headerIcon` updates.
   */
  headerIcon: Writable<string>;
  /**
   * Derived store for `headerNoTitleMinimized` updates.
   */
  headerNoTitleMinimized: Writable<boolean>;
  /**
   * Derived store for `minimizable` updates.
   */
  minimizable: Writable<boolean>;
  /**
   * Derived store for `popOut` updates.
   */
  popOut: Writable<boolean>;
  /**
   * Derived store for `positionable` updates.
   */
  positionable: Writable<boolean>;
  /**
   * Derived store for `resizable` updates.
   */
  resizable: Writable<boolean>;
  /**
   * Derived store for `title` updates.
   */
  title: Writable<string>;
};
/**
 * Provides a custom readable Svelte store for UI options state.
 */
type StoreUIOptions = {
  /**
   * Subscribe to all UI options updates.
   */
  subscribe: Readable<object>;
  /**
   * Derived store for `dragging` updates.
   */
  dragging: Writable<boolean>;
  /**
   * Derived store for `headerButtons` updates.
   */
  headerButtons: Readable<globalThis.ApplicationHeaderButton[]>;
  /**
   * Derived store for `minimized` updates.
   */
  minimized: Readable<boolean>;
  /**
   * Derived store for `resizing` updates.
   */
  resizing: Writable<boolean>;
};
/**
 * Defines the bulk serializable data from {@link SvelteReactive.toJSON} for common application state.
 */
type SvelteReactiveData = {
  /**
   * If true then application shells are draggable.
   */
  draggable: boolean;
  /**
   * When true auto-management of app focus is enabled.
   */
  focusAuto: boolean;
  /**
   * When `focusAuto` and `focusKeep` is true; keeps internal focus.
   */
  focusKeep: boolean;
  /**
   * When true focus trapping / wrapping is enabled keeping focus inside app.
   */
  focusTrap: boolean;
  /**
   * If true then the close header button is removed.
   */
  headerButtonNoClose: boolean;
  /**
   * If true then header button labels are removed.
   */
  headerButtonNoLabel: boolean;
  /**
   * If true then header title is hidden when minimized.
   */
  headerNoTitleMinimized: boolean;
  /**
   * If true then application shells are minimizable.
   */
  minimizable: boolean;
  /**
   * If false then `position.set` does not take effect.
   */
  positionable: boolean;
  /**
   * If true then application shells are resizable.
   */
  resizable: boolean;
};

/**
 * Provides the ability the save / restore / serialize application state for positional and UI state such as minimized
 * status.
 *
 * You can restore a saved state with animation; please see the options of {@link ApplicationState.restore}.
 */
declare interface ApplicationState {
  /**
   * Clears all saved application state.
   */
  clear(): void;
  /**
   * Returns current application state along with any extra data passed into method.
   *
   * @param {object} [extra] - Extra data to add to application state.
   *
   * @returns {ApplicationStateData} Passed in object with current application state.
   */
  current(extra?: object): ApplicationStateData;
  /**
   * Gets any saved application state by name.
   *
   * @param {object}   options - Options.
   *
   * @param {string}   options.name - Saved data set name.
   *
   * @returns {ApplicationStateData | undefined} Any saved application state.
   */
  get({ name }: { name: string }): ApplicationStateData | undefined;
  /**
   * @returns {IterableIterator<string>} The saved application state names / keys.
   */
  keys(): IterableIterator<string>;
  /**
   * Removes and returns any saved application state by name.
   *
   * @param {object}   options - Options.
   *
   * @param {string}   options.name - Name to remove and retrieve.
   *
   * @returns {ApplicationStateData | undefined} Any saved application state.
   */
  remove({ name }: { name: string }): ApplicationStateData | undefined;
  /**
   * Restores a previously saved application state by `name` returning the data. Several optional parameters are
   * available to animate / tween to the new state. When `animateTo` is true an animation is scheduled via
   * {@link AnimationAPI.to} and the duration and easing name or function may be specified.
   *
   * @param {object}            options - Parameters
   *
   * @param {string}            options.name - Saved data set name.
   *
   * @param {boolean}           [options.remove=false] - Remove data set.
   *
   * @param {boolean}           [options.animateTo=false] - Animate to restore data.
   *
   * @param {number}            [options.duration=0.1] - Duration in seconds.
   *
   * @param {EasingReference}   [options.ease='linear'] - Easing function name or function.
   *
   * @returns {ApplicationStateData | undefined} Any saved application state.
   */
  restore({
    name,
    remove,
    animateTo,
    duration,
    ease,
  }: {
    name: string;
    remove?: boolean;
    animateTo?: boolean;
    duration?: number;
    ease?: EasingReference;
  }): ApplicationStateData | undefined;
  /**
   * Saves current application state with the opportunity to add extra data to the saved state.
   *
   * @param {object}   options - Options.
   *
   * @param {string}   options.name - Name to index this saved state.
   *
   * @param {...*}     [options.extra] - Extra data to add to saved state.
   *
   * @returns {ApplicationStateData} Current saved application state.
   */
  save({ name, ...extra }: { name: string; extra?: any[] }): ApplicationStateData;
  /**
   * Sets application state from the given {@link ApplicationStateData} instance. Several optional parameters are
   * available to animate / tween to the new state. When `animateTo` is true an animation is scheduled via
   * {@link AnimationAPI.to} and the duration and easing name or function may be specified.
   *
   * Note: If serializing application state any minimized apps will use the before minimized state on initial render
   * of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized state.
   *
   * @param {ApplicationStateData}   data - Saved data set name.
   *
   * @param {object}            [options] - Optional parameters
   *
   * @param {boolean}           [options.animateTo=false] - Animate to restore data.
   *
   * @param {number}            [options.duration=0.1] - Duration in seconds.
   *
   * @param {EasingReference}   [options.ease='linear'] - Easing function.
   */
  set(
    data: ApplicationStateData,
    {
      animateTo,
      duration,
      ease,
    }?: {
      async?: boolean;
      animateTo?: boolean;
      duration?: number;
      ease?: EasingReference;
    },
  ): void;
}
/**
 * Defines common application state including positional data and options generated by the {@link ApplicationState} API.
 */
type ApplicationStateData = {
  /**
   * Application position.
   */
  position: Data.TJSPositionData;
  /**
   * Any application saved position state for #beforeMinimized including maximized constraints.
   */
  beforeMinimized?: Data.TJSPositionData & {
    constraints: {
      maxHeight: string;
      paddingTop: string;
      paddingBottom: string;
    };
  };
  /**
   * Common SvelteApplication options.
   */
  options: SvelteReactiveData;
  /**
   * Application UI state.
   */
  ui: {
    minimized: boolean;
  };
};

/**
 * Provides a Svelte aware extension to the Foundry {@link FormApplication} class to manage the app lifecycle
 * appropriately. You can declaratively load one or more components from `defaultOptions`. You can declaratively load
 * one or more components from `defaultOptions` using a {@link TJSSvelteConfig} object in the SvelteApplicationOptions
 * `options` {@link SvelteApplicationOptions.svelte} property.
 *
 * Note: It is not recommended that you use or depend on this class as it only exists to support
 * {@link HandlebarsFormApplication} due to the OOP nature of the Foundry VTT platform. This should only be an interim
 * or stepwise solution as you convert your package over to fully using TRL & Svelte.
 */
declare class SvelteFormApplication {
  /**
   * @param {object} object - Foundry document.
   *
   * @param {import('@typhonjs-fvtt/svelte/application').SvelteApplicationOptions} options - The options for the application.
   *
   * @inheritDoc
   */
  constructor(object: object, options?: _typhonjs_fvtt_svelte_application.SvelteApplicationOptions);
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
   * Returns the TJSPosition instance.
   *
   * @returns {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPosition} The TJSPosition instance.
   */
  get position(): TJSPosition;

  /**
   * Returns the reactive accessors & Svelte stores for SvelteFormApplication.
   *
   * @returns {import('../internal/state-reactive/types').SvelteReactive} The reactive accessors & Svelte stores.
   */
  get reactive(): SvelteReactive;
  /**
   * Returns the application state manager.
   *
   * @returns {import('../internal/state-app/types').ApplicationState} The application state manager.
   */
  get state(): ApplicationState;
  /**
   * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
   *
   * @returns {import('../internal/state-svelte/types').GetSvelteData} GetSvelteData
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
  maximize({ animate, duration }?: { animate?: boolean; duration?: number }): Promise<void>;
  /**
   * Provides a mechanism to update the UI options store for minimized.
   *
   * Note: the sanity check is duplicated from {@link Application.minimize} the store is updated _before_
   * performing the rest of animations. This allows application shells to remove / show any resize handlers
   * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApplication.minimize}
   * to animate the content area.
   *
   * @param {object}   [opts] - Optional parameters.
   *
   * @param {boolean}  [opts.animate=true] - When true perform default minimizing animation.
   *
   * @param {number}   [opts.duration=0.1] - Controls content area animation duration in seconds.
   */
  minimize({ animate, duration }?: { animate?: boolean; duration?: number }): Promise<void>;
  /**
   * Provides a callback after all Svelte components are initialized.
   *
   * @param {import('../internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell elements.
   */
  onSvelteMount(mountedAppShell?: MountedAppShell): void;
  /**
   * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
   * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
   * context.
   *
   * @param {import('../internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell elements.
   */
  onSvelteRemount(mountedAppShell?: MountedAppShell): void;
  /**
   * All calculation and updates of position are implemented in {@link TJSPosition.set}. This allows position to be
   * fully reactive and in control of updating inline styles for the application.
   *
   * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
   * to update to using the {@link TJSPosition.validators} / ValidatorAPI functionality.
   *
   * @param {import('@typhonjs-svelte/runtime-base/svelte/store/position').Data.TJSPositionDataRelative}   [position] - TJSPosition data.
   *
   * @returns {TJSPosition} The updated position object for the application containing the new values.
   * @ignore
   */
  setPosition(position?: _typhonjs_svelte_runtime_base_svelte_store_position.Data.TJSPositionDataRelative): TJSPosition;
  #private;
}

/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use HandlebarsFormApplication in a similar manner as the core Foundry `FormApplication`
 * class. This should only be an interim or stepwise solution as you convert your package over to fully using TRL &
 * Svelte.
 */
declare class HandlebarsFormApplication extends SvelteFormApplication {
  /**
   * @inheritDoc
   */
  constructor(object: any, options: any);
  form: any;
  #private;
}

export { HandlebarsApplication, HandlebarsFormApplication, SvelteFormApplication };
