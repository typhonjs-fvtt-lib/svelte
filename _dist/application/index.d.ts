import * as _typhonjs_svelte_runtime_base_svelte_util from '@typhonjs-svelte/runtime-base/svelte/util';
import { TJSSvelteConfig } from '@typhonjs-svelte/runtime-base/svelte/util';
import * as _typhonjs_svelte_runtime_base_svelte_store_web_storage from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';
import { TJSWebStorage } from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';
import * as _typhonjs_svelte_runtime_base_svelte_store_position from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { Data, TJSPositionTypes, TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';
import * as _typhonjs_svelte_runtime_base_util_a11y from '@typhonjs-svelte/runtime-base/util/a11y';
import { SvelteComponent } from 'svelte';
import { EasingReference } from '@typhonjs-svelte/runtime-base/svelte/easing';
import { Readable, Writable } from 'svelte/store';
import * as _typhonjs_fvtt_svelte_application from '@typhonjs-fvtt/svelte/application';
import { TransitionFunction } from '@typhonjs-svelte/runtime-base/svelte/transition';
import { ManagedPromise } from '@typhonjs-svelte/runtime-base/util/async';

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
 * Provides a Svelte aware extension to the Foundry {@link Application} class to manage the app lifecycle
 * appropriately. You can declaratively load one or more components from `defaultOptions` using a
 * {@link TJSSvelteConfig} object in the SvelteApplicationOptions `options` {@link SvelteApplicationOptions.svelte}
 * property.
 *
 * @implements {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPositionTypes.Positionable}
 */
declare class SvelteApplication implements TJSPositionTypes.Positionable {
  /**
   * @param {import('@typhonjs-fvtt/svelte/application').SvelteApplicationOptions} options - The options for the application.
   *
   * @inheritDoc
   */
  constructor(options?: _typhonjs_fvtt_svelte_application.SvelteApplicationOptions);
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
   * Returns the reactive accessors & Svelte stores for SvelteApplication.
   *
   * @returns {import('./internal/state-reactive/types').SvelteReactive} The reactive accessors & Svelte stores.
   */
  get reactive(): SvelteReactive;
  /**
   * Returns the application state manager.
   *
   * @returns {import('./internal/state-app/types').ApplicationState} The application state manager.
   */
  get state(): ApplicationState;
  /**
   * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
   *
   * @returns {import('./internal/state-svelte/types').GetSvelteData} GetSvelteData
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
   * @param {import('./internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell
   *        elements.
   */
  onSvelteMount(mountedAppShell?: MountedAppShell): void;
  /**
   * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
   * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
   * context.
   *
   * @param {import('./internal/state-svelte/types').MountedAppShell} [mountedAppShell] - The mounted app shell
   *        elements.
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
 * Provides storage for all dialog options through individual accessors and `get`, `merge`, `replace` and `set` methods
 * that safely access and update data changed to the mounted DialogShell component reactively.
 */
declare interface TJSDialogData {
  /**
   * @returns {Record<string, TJSDialogButtonData>} The dialog button configuration.
   */
  get buttons(): Record<string, TJSDialogButtonData>;
  /**
   * Set the dialog button configuration.
   *
   * @param {Record<string, TJSDialogButtonData>} buttons - New dialog button configuration.
   */
  set buttons(buttons: Record<string, TJSDialogButtonData>);
  /**
   * @returns {TJSSvelteConfig | string} The Svelte configuration object or HTML string content.
   */
  get content(): TJSSvelteConfig | string;
  /**
   * Set the Svelte configuration object or HTML string content.
   *
   * @param {TJSSvelteConfig | string} content - New Svelte configuration object or HTML string content.
   */
  set content(content: TJSSvelteConfig | string);
  /**
   * @returns {string} The default button ID to focus initially.
   */
  get default(): string;
  /**
   * Set the default button ID to focus initially.
   *
   * @param {string} newDefault - New default button ID to focus initially.
   */
  set default(newDefault: string);
  /**
   * @returns {boolean} The dialog draggable state; draggable when true.
   */
  get draggable(): boolean;
  /**
   * Set the dialog state; draggable when true.
   *
   * @param {boolean} draggable - New dialog draggable state; draggable when true.
   */
  set draggable(draggable: boolean);
  /**
   * @returns {boolean} When true auto-management of app focus is enabled.
   */
  get focusAuto(): boolean;
  /**
   * Set the dialog auto-management of app focus.
   *
   * @param {boolean} focusAuto - New dialog auto-management of app focus.
   */
  set focusAuto(focusAuto: boolean);
  /**
   * @returns {boolean} When true the first focusable element that isn't a button is focused.
   */
  get focusFirst(): boolean;
  /**
   * Set the dialog first focusable element state.
   *
   * @param {boolean} focusFirst - New dialog first focusable element state.
   */
  set focusFirst(focusFirst: boolean);
  /**
   * @returns {boolean} When `focusAuto` and `focusKeep` is true; keeps internal focus.
   */
  get focusKeep(): boolean;
  /**
   * Set the dialog `focusKeep` state. When `focusAuto` and `focusKeep` is true; keeps internal focus.
   *
   * @param {boolean} focusKeep - New dialog `focusKeep` state.
   */
  set focusKeep(focusKeep: boolean);
  /**
   * @returns {boolean} When true the dialog is minimizable.
   */
  get minimizable(): boolean;
  /**
   * Set the dialog `minimizable` state. When true the dialog is minimizable.
   *
   * @param {boolean} minimizable - New dialog `minimizable` state.
   */
  set minimizable(minimizable: boolean);
  /**
   * @returns {boolean} When true a modal dialog is displayed.
   */
  get modal(): boolean;
  /**
   * Set the dialog `modal` state. When true a modal dialog is displayed.
   *
   * @param {boolean} modal - New dialog `modal` state.
   */
  set modal(modal: boolean);
  /**
   * @returns {object} Additional options for modal dialog display.
   */
  get modalOptions(): TJSDialogModalOptions;
  /**
   * Set additional options for modal dialog display.
   *
   * @param {TJSDialogModalOptions} modalOptions - New additional options for modal dialog display.
   */
  set modalOptions(modalOptions: TJSDialogModalOptions);
  /**
   * @returns {boolean} When true and an error is raised in dialog callback functions post a UI error notification.
   */
  get notifyError(): boolean;
  /**
   * Set the dialog `notifyError` state. When true and an error is raised in dialog callback functions post a UI error
   * notification.
   *
   * @param {boolean} notifyError - New dialog `notifyError` state.
   */
  set notifyError(notifyError: boolean);
  /**
   * @returns {string | ((data?: { application?: TJSDialog }) => any)} Callback invoked when dialog is
   *          closed; no button option selected. When defined as a string any matching function by name exported from
   *          content Svelte component is invoked.
   */
  get onClose(): string | ((data?: { application?: TJSDialog }) => any);
  /**
   * Set callback invoked when dialog is closed; no button option selected. When defined as a string any matching
   * function by name exported from content Svelte component is invoked..
   *
   * @param {string | ((data?: { application: TJSDialog }) => any)} onClose - New dialog `onClose` state.
   */
  set onClose(onClose: string | ((data?: { application?: TJSDialog }) => any));
  /**
   * @returns {boolean} Dialog `rejectClose` state. When true and a Promise has been created by {@link TJSDialog.wait}
   *          and the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
   *          function is invoked and any result that is undefined will cause the Promise to then be rejected..
   */
  get rejectClose(): boolean;
  /**
   * Set the dialog `rejectClose` state.
   *
   * @param {boolean} rejectClose - New dialog `rejectClose` state.
   */
  set rejectClose(rejectClose: boolean);
  /**
   * @returns {boolean} When true the dialog is resizable.
   */
  get resizable(): boolean;
  /**
   * Set the dialog `resizable` state. When true the dialog is resizable.
   *
   * @param {boolean} resizable - New dialog `resizable` state.
   */
  set resizable(resizable: boolean);
  /**
   * @returns {boolean} When true and resolving any Promises and there are undefined results from any button callbacks
   *          the button ID is resolved.
   */
  get resolveId(): boolean;
  /**
   * Set the dialog `resolveId` state. When true and resolving any Promises and there are undefined results from any
   * button callbacks the button ID is resolved.
   *
   * @param {boolean} resolveId - New dialog `resolveId` state.
   */
  set resolveId(resolveId: boolean);
  /**
   * @returns {string} The dialog window title.
   */
  get title(): string;
  /**
   * Set the dialog window title.
   *
   * @param {string} title - New dialog window title.
   */
  set title(title: string);
  /**
   * @returns {TJSDialogTransitionOptions} Transition options for the dialog.
   */
  get transition(): TJSDialogTransitionOptions;
  /**
   * Set transition options for the dialog.
   *
   * @param {TJSDialogTransitionOptions} transition - New transition options for the dialog.
   */
  set transition(transition: TJSDialogTransitionOptions);
  /**
   * @returns {number | null} A specific z-index for the dialog. Pass null for the dialog to act like other
   *          applications in regard bringing to top when activated.
   */
  get zIndex(): number | null;
  /**
   * Set specific z-index for the dialog.
   *
   * @param {number | null} zIndex - New z-index for the dialog.
   */
  set zIndex(zIndex: number | null);
  /**
   * Provides a cloned copy of the dialog data.
   * Note: The content attribute is not cloned as complex / props may be present.
   *
   * @returns {import('./types').TJSDialogOptions} A clone of the dialog data.
   */
  clone(): TJSDialogOptions;
  /**
   * Provides a way to safely get this dialogs data given an accessor string which describes the
   * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
   * to walk.
   *
   * @param {string}   accessor - The path / key to set. You can set multiple levels.
   *
   * @param {any}      [defaultValue] - A default value returned if the accessor is not found.
   *
   * @returns {any} Value at the accessor.
   */
  get(accessor: string, defaultValue: any): any;
  /**
   * @param {TJSDialogOptions} data - Merge provided data object into Dialog data.
   */
  merge(data: TJSDialogOptions): void;
  /**
   * Replaces all dialog data; this is reactive.
   *
   * @param {TJSDialogOptions}   data - Dialog data.
   */
  replace(data: any): void;
  /**
   * Provides a way to safely set this dialogs data given an accessor string which describes the
   * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
   * to walk.
   *
   * Automatically the dialog data will be updated in the associated DialogShell Svelte component.
   *
   * @param {string}   accessor - The path / key to set. You can set multiple levels.
   *
   * @param {any}      value - Value to set.
   *
   * @returns {boolean} True if successful.
   */
  set(accessor: string, value: any): boolean;
}
/**
 * TJSDialog button data.
 */
type TJSDialogButtonData = {
  /**
   * When false the dialog does not automatically close when button selected; default: true.
   */
  autoClose?: boolean;
  /**
   * Determines if the button is accessible providing a truthy value.
   */
  condition?: boolean | (() => boolean);
  /**
   * Button label; will be localized.
   */
  label?: string;
  /**
   * Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
   */
  icon?: string;
  /**
   * Callback for button press. When defined as a string any matching function by name exported from content Svelte
   * component is invoked.
   */
  onPress?: string | ((data?: { application?: TJSDialog }) => any);
  /**
   * Inline styles to apply to the button.
   */
  styles?: Record<string, string>;
};
/**
 * Defines the common dialog configuration data.
 */
type TJSDialogOptions = {
  /**
   * Provides configuration of the dialog button bar.
   */
  buttons?: Record<string, TJSDialogButtonData>;
  /**
   * A Svelte configuration object or HTML string content.
   */
  content?: TJSSvelteConfig | string;
  /**
   * The default button ID to focus initially.
   */
  default?: string;
  /**
   * The dialog is draggable when true; default: true.
   */
  draggable?: boolean;
  /**
   * When true auto-management of app focus is enabled; default: true.
   */
  focusAuto?: boolean;
  /**
   * When true the first focusable element that isn't a button is focused; default: false.
   */
  focusFirst?: boolean;
  /**
   * When `focusAuto` and `focusKeep` is true; keeps internal focus; default: false.
   */
  focusKeep?: boolean;
  /**
   * When true focus trapping / wrapping is enabled keeping focus inside app; default: true.
   */
  focusTrap?: boolean;
  /**
   * When true the dialog is minimizable; default: true.
   */
  minimizable?: boolean;
  /**
   * When true a modal dialog is displayed; default: false.
   */
  modal?: boolean;
  /**
   * Additional options for modal dialog display.
   */
  modalOptions?: TJSDialogModalOptions;
  /**
   * When true and an error is thrown in dialog callback functions post a UI error notification; default: false.
   */
  notifyError?: boolean;
  /**
   * Callback invoked when dialog is closed; no button option selected. When defined as a string any matching function
   * by name exported from content Svelte component is invoked.
   */
  onClose?: string | ((data?: { application: TJSDialog }) => any);
  /**
   * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of being
   * resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is undefined
   * will cause the Promise to then be rejected; default: false.
   */
  rejectClose?: boolean;
  /**
   * When true the dialog is resizable; default: false.
   */
  resizable?: boolean;
  /**
   * When true and resolving any Promises and there are undefined results from any button callbacks the button ID is
   * resolved; default: false.
   */
  resolveId?: boolean;
  /**
   * The dialog window title.
   */
  title?: string;
  /**
   * Transition options for the dialog.
   */
  transition?: TJSDialogTransitionOptions;
  /**
   * A specific z-index for the dialog. Pass null for the dialog to act like other applications in regard bringing to
   * top when activated.
   */
  zIndex?: number | null;
};
/**
 *
 */
type TJSDialogTransitionOptions = {
  /**
   * A Svelte transition function applied to both in / out transitions.
   */
  transition?: TransitionFunction;
  /**
   * A Svelte transition applied to the `in` transition.
   */
  inTransition?: TransitionFunction;
  /**
   * A Svelte transition applied to tbe `out` transition.
   */
  outTransition?: TransitionFunction;
  /**
   * Additional transition options applied to both in / out transitions.
   */
  transitionOptions?: Record<string, any>;
  /**
   * Additional transition options applied to the `in` transition.
   */
  inTransitionOptions?: Record<string, any>;
  /**
   * Additional transition options applied to the `out` transition.
   */
  outTransitionOptions?: Record<string, any>;
};
/**
 * Defines additional modal options to control the display of the modal dialog and glasspane.
 */
type TJSDialogModalOptions = {
  /**
   * CSS background style for glasspane.
   */
  background?: string;
  /**
   * When true modal dialog is closed on any click / pointer down event on the glasspane.
   */
  closeOnInput?: boolean;
  /**
   * Creates a separate DIV element container for slot content.
   */
  slotSeparate?: boolean;
  /**
   * Custom styles applied to glasspane. Provide an object with CSS style properties with keys in kebab case.
   * @see https://www.w3.org/Style/CSS/all-properties.en.html
   */
  styles?: Record<string, string>;
  /**
   * Custom transition options for modal background / glasspane.
   */
  transition?: TJSDialogTransitionOptions;
};

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
 */
declare class TJSDialog extends SvelteApplication {
  /**
   * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
   * If you require more flexibility, a custom TJSDialog instance is preferred. The default focused button is 'yes'.
   * You can change the default focused button by setting `default` to `yes` or `no`.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialogOptions & {
   *    onYes?: string | ((data?: { application?: TJSDialog }) => any),
   *    onNo?: string | ((data?: { application?: TJSDialog }) => any)
   * }} [data] - Confirm dialog options.
   *
   * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onYes] - Callback function upon `yes`; may be
   *        an async function. When defined as a string any matching function by name exported from content Svelte
   *        component is invoked.
   *
   * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onNo] - Callback function upon `no`; may be an
   *        async function. When defined as a string any matching function by name exported from content Svelte
   *        component is invoked.
   *
   * @param {import('./').SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog
   *        constructor.
   *
   * @returns {Promise<T>} A promise which resolves with result of yes / no callbacks or true / false.
   *
   * @example
   * const result = await TJSDialog.confirm({
   *  title: 'A Yes or No Question',
   *  content: '<p>Choose wisely.</p>',
   *  onYes: () => 'YES Result',
   *  onNo: () => 'NO Result'
   * });
   *
   * // Logs 'YES result', 'NO Result', or null if the user closed the dialog without making a selection.
   * console.log(result);
   */
  static confirm<T>(
    {
      onYes,
      onNo,
      ...data
    }?: TJSDialogOptions & {
      onYes?: string | ((data?: { application?: TJSDialog }) => any);
      onNo?: string | ((data?: { application?: TJSDialog }) => any);
    },
    options?: SvelteApplicationOptions,
  ): Promise<T>;
  /**
   * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialogOptions & {
   *    onOk?: string | ((data?: { application?: TJSDialog }) => any),
   *    label?: string,
   *    icon?: string
   * }} [data] - Prompt dialog options that includes any TJSDialog options along with the following optional fields:
   *
   * @param {string|((data?: { application?: TJSDialog }) => any)} [data.onOk] - Callback function upon `ok`; may be
   *        an async function. When defined as a string any matching function by name exported from content Svelte
   *        component is invoked.
   *
   * @param {string}   [data.label] - The OK prompt button text.
   *
   * @param {string}   [data.icon="fas fa-check"] - Set another icon besides `fas fa-check` for button.
   *
   * @param {import('./').SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog
   *        constructor.
   *
   * @returns {Promise<T>} The returned value from the provided callback function or `true` if the button
   *          is pressed.
   *
   * @example
   * const result = await TJSDialog.prompt({
   *  title: 'Are you OK?',
   *  content: '<p>Are you OK?.</p>',
   *  label: 'Feeling Fine!',
   *  onOk: () => 'OK'
   * });
   *
   * // Logs 'OK' or null if the user closed the dialog without making a selection.
   * console.log(result);
   */
  static prompt<T>(
    {
      onOk,
      label,
      icon,
      ...data
    }?: TJSDialogOptions & {
      onOk?: string | ((data?: { application?: TJSDialog }) => any);
      label?: string;
      icon?: string;
    },
    options?: SvelteApplicationOptions,
  ): Promise<T>;
  /**
   * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
   * choice.
   *
   * Note: By default `null` is returned if the dialog is closed without a user making a choice.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialogOptions}  data - Dialog data passed to the TJSDialog constructor.
   *
   * @param {import('./').SvelteApplicationOptions}  [options]  SvelteApplication options passed to the TJSDialog
   *        constructor.
   *
   * @returns {Promise<T>} A Promise that resolves to the chosen result.
   */
  static wait<T>(data: TJSDialogOptions, options?: SvelteApplicationOptions): Promise<T>;
  /**
   * @param {import('./internal/state-dialog/types').TJSDialogOptions}           data - Dialog options.
   *
   * @param {import('./').SvelteApplicationOptions}   [options] - SvelteApplication options.
   */
  constructor(data: TJSDialogOptions, options?: SvelteApplicationOptions);
  /**
   * Returns the dialog data.
   *
   * @returns {import('./internal/state-dialog/types').TJSDialogData} Dialog data.
   */
  get data(): TJSDialogData;
  /**
   * @returns {import('@typhonjs-svelte/runtime-base/util/async').ManagedPromise} Returns the managed promise.
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
  wait<T>(options?: { reuse?: boolean }): Promise<T>;
  #private;
}

/**
 * Options for SvelteApplication. Note: that this extends the Foundry
 * {@link ApplicationOptions}.
 */
type SvelteApplicationOptions = {
  /**
   * If false the default slide close animation is not run.
   */
  defaultCloseAnimation?: boolean;
  /**
   * If true then application shells are draggable.
   */
  draggable?: boolean;
  /**
   * When true auto-management of app focus is enabled.
   */
  focusAuto?: boolean;
  /**
   * When `focusAuto` and `focusKeep` is true; keeps internal focus.
   */
  focusKeep?: boolean;
  /**
   * - Defines A11yHelper focus source to
   * apply when application closes.
   */
  focusSource?: _typhonjs_svelte_runtime_base_util_a11y.A11yFocusSource;
  /**
   * When true focus trapping / wrapping is enabled keeping focus inside app.
   */
  focusTrap?: boolean;
  /**
   * If true then the close header button is removed.
   */
  headerButtonNoClose?: boolean;
  /**
   * If true then header button labels are removed.
   */
  headerButtonNoLabel?: boolean;
  /**
   * Sets a header icon given an image URL.
   */
  headerIcon?: string;
  /**
   * If true then header title is hidden when minimized.
   */
  headerNoTitleMinimized?: boolean;
  /**
   * Assigned to position. Number specifying minimum
   * window height.
   */
  minHeight?: number;
  /**
   * Assigned to position. Number specifying minimum
   * window width.
   */
  minWidth?: number;
  /**
   * If false then `position.set` does not take effect.
   */
  positionable?: boolean;
  /**
   * A helper for
   * initial position placement.
   */
  positionInitial?: _typhonjs_svelte_runtime_base_svelte_store_position.System.Initial.InitialSystem;
  /**
   * When true TJSPosition is optimized for orthographic use.
   */
  positionOrtho?: boolean;
  /**
   * A validator
   * function or data or list of validators.
   */
  positionValidator?: _typhonjs_svelte_runtime_base_svelte_store_position.ValidatorAPI.ValidatorOption;
  /**
   * An instance of
   * TJSWebStorage (session) to share across SvelteApplications.
   */
  sessionStorage?: _typhonjs_svelte_runtime_base_svelte_store_web_storage.TJSWebStorage;
  /**
   * A Svelte configuration object defining
   * the main component.
   */
  svelte?: _typhonjs_svelte_runtime_base_svelte_util.TJSSvelteConfig;
  /**
   * By
   * default, 'top / left' respects rotation when minimizing.
   */
  transformOrigin?: _typhonjs_svelte_runtime_base_svelte_store_position.TransformAPI.TransformOrigin;
};

export {
  type ApplicationState,
  type ApplicationStateData,
  type GetSvelteData,
  type MountedAppShell,
  type StoreAppOptions,
  type StoreUIOptions,
  SvelteApplication,
  type SvelteApplicationOptions,
  type SvelteData,
  type SvelteReactive,
  type SvelteReactiveData,
  TJSDialog,
  type TJSDialogButtonData,
  type TJSDialogData,
  type TJSDialogModalOptions,
  type TJSDialogOptions,
  type TJSDialogTransitionOptions,
};
