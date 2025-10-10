import * as _runtime_util_async from '@typhonjs-svelte/runtime-base/util/async';
import { TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { ComponentProps, ComponentEvents, SvelteComponent } from 'svelte';
import { Readable, Writable } from 'svelte/store';
import { A11yFocusSource } from '@typhonjs-svelte/runtime-base/util/a11y';
import { EasingReference } from '@typhonjs-svelte/runtime-base/svelte/easing';
import { SvelteSet } from '@typhonjs-svelte/runtime-base/svelte/reactivity';
import { WebStorage } from '@typhonjs-svelte/runtime-base/svelte/store/web-storage';
import { TJSSvelte } from '@typhonjs-svelte/runtime-base/svelte/util';
import { TransitionFunction } from '@typhonjs-svelte/runtime-base/svelte/transition';
import { StyleSheetResolve } from '@typhonjs-svelte/runtime-base/util/dom/style';

/**
 * Provides a Svelte aware extension to the Foundry {@link Application} class to manage the app lifecycle
 * appropriately. You can declaratively load one or more components from `defaultOptions` using a
 * {@link #runtime/svelte/util!TJSSvelte.Config.Dynamic} object in the {@link SvelteApp.Options.svelte} property.
 *
 * @implements {TJSPosition.Positionable}
 */
declare class SvelteApp<Options extends SvelteApp.Options = SvelteApp.Options>
  extends foundry.appv1.api.Application<Options>
  implements TJSPosition.Positionable
{
  /**
   * Specifies the default options that SvelteApp supports.
   *
   * @returns {import('./types').SvelteApp.Options} options - Application options.
   * @see https://foundryvtt.com/api/interfaces/client.ApplicationOptions.html
   */
  static get defaultOptions(): SvelteApp.Options;
  /**
   * @param {Partial<import('./types').SvelteApp.Options>} [options] - The options for the application.
   */
  constructor(options?: Partial<SvelteApp.Options>);
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
   * Returns the reactive accessors & Svelte stores for SvelteApp.
   *
   * @returns {import('./types').SvelteApp.API.Reactive} The reactive accessors & Svelte stores.
   */
  get reactive(): SvelteApp.API.Reactive;
  /**
   * Returns the application state manager.
   *
   * @returns {import('./types').SvelteApp.API.State} The application state manager.
   */
  get state(): SvelteApp.API.State;
  /**
   * Returns the `Svelte` helper class w/ various methods to access the mounted application shell component.
   *
   * @returns {import('./types').SvelteApp.API.Svelte<Options>} `Svelte` / mounted application shell API.
   */
  get svelte(): SvelteApp.API.Svelte<Options>;
  /**
   * Specify the set of config buttons which should appear in the SvelteApp header. Buttons should be returned as
   * an Array of objects. The header buttons which are added to the application can be modified by the
   * `getApplicationHeaderButtons` hook.
   *
   * SvelteApp extends the button functionality with full reactivity for state changes during callbacks. Callbacks
   * receive the button data and can modify it to update the button state.
   *
   * @privateRemarks Provide a basic override implementation to extend types with additional SvelteApp functionality.
   *
   * @returns {import('./types').SvelteApp.HeaderButton[]} All header buttons.
   * @protected
   */
  protected _getHeaderButtons(): SvelteApp.HeaderButton[];
  /**
   * Provides a mechanism to update the UI options store for maximized.
   *
   * Note: the sanity check is duplicated from {@link Application.maximize} the store is updated _before_
   * performing the rest of animations. This allows application shells to remove / show any resize handlers
   * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApp.minimize}
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
   * correctly. Extra constraint data is stored in a saved position state in {@link SvelteApp.minimize}
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
   */
  onSvelteMount(): void;
  /**
   * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
   * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
   * context.
   */
  onSvelteRemount(): void;
  /**
   * All calculation and updates of position are implemented in {@link TJSPosition.set}.
   * This allows position to be fully reactive and in control of updating inline styles for the application.
   *
   * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
   * to update to using the {@link TJSPosition.validators} / ValidatorAPI functionality.
   *
   * @param {TJSPosition.API.Data.TJSPositionDataRelative}   [position] - TJSPosition data.
   *
   * @returns {TJSPosition} The updated position object for the application containing the new values.
   * @ignore
   */
  setPosition(position?: TJSPosition.API.Data.TJSPositionDataRelative): TJSPosition;
  #private;
}

/**
 * Provides all types associated with {@link SvelteApp}.
 */
declare namespace SvelteApp {
  /**
   * Defines the application header button data handled in {@link SvelteApp._getHeaderButtons} and associated
   * `getApplicationHeaderButtons` hooks. SvelteApp extends the header button data from
   * {@link fvtt!ApplicationHeaderButton} bringing an expanded feature set.
   */
  type HeaderButton = {
    /**
     * When true, the button is left aligned after the window title.
     *
     * @defaultValue `false`
     */
    alignLeft?: boolean;
    /**
     * Additional CSS class to add to the header button.
     */
    class?: string;
    /**
     * Icon class identifier.
     */
    icon?: string;
    /**
     * Keep the header button visible when the app is minimized.
     */
    keepMinimized?: boolean;
    /**
     * Defines the KeyboardEvent 'code' that activates the button.
     *
     * @defaultValue `Enter`
     */
    keyCode?: string;
    /**
     * Text label or language key to associate with button; used for tooltip.
     */
    label?: string;
    /**
     * Tooltip direction; valid options include: `UP`, `DOWN`, `LEFT`, `RIGHT`, `CENTER`.
     *
     * @defaultValue `DOWN`
     */
    tooltipDirection?: string;
    /**
     * Same as {@link HeaderButton.onPress}; supported for Foundry core backward compatibility. Use `onPress`.
     *
     * @hidden
     * @deprecated
     */
    onclick?: HeaderButtonCallback;
    /**
     * Callback when context menu activated. You may modify and return the button data to update it.
     */
    onContextMenu?: HeaderButtonCallback;
    /**
     * Callback when pressed. You may modify and return the button data to update it.
     */
    onPress?: HeaderButtonCallback;
    /**
     * Hyphen case CSS property key / value object of properties to add as additional inline CSS styles to the button.
     */
    styles?: {
      [key: string]: string | null;
    };
    /**
     * You may load a custom Svelte component into the header to replace a button.
     *
     * Note: supports just `class`, `props` definition.
     */
    svelte?: TJSSvelte.Config.Embed;
  };
  /**
   * Defines a callback function in {@link HeaderButton} for `onContextMenu` / `onPress` handlers.
   * You may modify the button data received to update it.
   *
   * @param args - The data object containing the button data and source invoking event.
   *
   * @param args.button - The header button data associated with the interaction.
   *
   * @param args.event - The event triggering the callback (pointer or keyboard).
   */
  type HeaderButtonCallback = (args: { button: SvelteApp.HeaderButton; event: PointerEvent | KeyboardEvent }) => void;
  namespace API {
    /**
     * Contains the reactive functionality / Svelte stores associated with SvelteApp and retrievable by
     * {@link SvelteApp.reactive}.
     *
     * There are several reactive getters for UI state such and for two-way bindings / stores see
     * {@link Reactive.storeUIState}:
     * - {@link Reactive.dragging}
     * - {@link Reactive.minimized}
     * - {@link Reactive.resizing}
     *
     * There are also reactive getters / setters for {@link SvelteApp.Options} and Foundry
     * {@link fvtt!ApplicationOptions}. You can use the following as one way bindings and update the associated
     * stores. For two-way bindings / stores see {@link Reactive.storeAppOptions}.
     *
     * - {@link Reactive.draggable}
     * - {@link Reactive.focusAuto}
     * - {@link Reactive.focusKeep}
     * - {@link Reactive.focusTrap}
     * - {@link Reactive.headerButtonNoClose}
     * - {@link Reactive.headerButtonNoLabel}
     * - {@link Reactive.headerIcon}
     * - {@link Reactive.headerNoTitleMinimized}
     * - {@link Reactive.minimizable}
     * - {@link Reactive.popOut}
     * - {@link Reactive.positionable}
     * - {@link Reactive.resizable}
     * - {@link Reactive.themeName}
     * - {@link Reactive.title}
     *
     * A reactive Set of currently applied CSS classes to the app window is available via
     * {@link Reactive.activeClasses}. Altering the classes applied does not change the original app
     * `options.classes`.
     *
     * An instance of TJSWebStorage (session) / TJSSessionStorage is accessible via
     * {@link Reactive.sessionStorage}. Optionally you can pass in an existing TJSWebStorage instance that can
     * be shared across multiple SvelteApps by setting {@link SvelteApp.Options.sessionStorage}.
     */
    interface Reactive {
      /**
       * Returns the current active CSS classes Set applied to the app window. This is reactive for any
       * modifications.
       *
       * @returns Active app CSS classes Set.
       */
      get activeClasses(): SvelteSet<string>;
      /**
       * @returns Returns WebStorage (session) instance.
       */
      get sessionStorage(): WebStorage;
      /**
       * Provides a custom readable Svelte store for {@link SvelteApp.Options} state.
       *
       * @returns App options store.
       */
      get storeAppOptions(): Reactive.AppOptions;
      /**
       * Returns the store for UI options.
       *
       * @returns UI state store.
       */
      get storeUIState(): Reactive.UIState;
      /**
       * Sets `this.options.alwaysOnTop`, which is reactive for application shells.
       *
       * @param alwaysOnTop - Sets the `alwaysOnTop` option.
       */
      set alwaysOnTop(alwaysOnTop: boolean);
      /**
       * Returns the alwaysOnTop app option.
       *
       * @returns Always on top app option.
       */
      get alwaysOnTop(): boolean;
      /**
       * Sets `this.options.containerQueryType`, which is reactive for application shells.
       *
       * @param containerQueryType - Sets the `containerQueryType` option.
       */
      set containerQueryType(containerQueryType: string);
      /**
       * Returns the containerQueryType app option.
       *
       * @returns App content container query app option.
       */
      get containerQueryType(): boolean;
      /**
       * Returns the draggable app option.
       *
       * @returns Draggable app option.
       */
      get draggable(): boolean;
      /**
       * Sets `this.options.draggable`, which is reactive for application shells.
       *
       * @param draggable - Sets the draggable option.
       */
      set draggable(draggable: boolean);
      /**
       * Returns the focusAuto app option.
       *
       * @returns When true auto-management of app focus is enabled.
       */
      get focusAuto(): boolean;
      /**
       * Sets `this.options.focusAuto`, which is reactive for application shells.
       *
       * @param focusAuto - Sets the focusAuto option.
       */
      set focusAuto(focusAuto: boolean);
      /**
       * Returns the focusKeep app option.
       *
       * @returns When `focusAuto` and `focusKeep` is true; keeps internal focus.
       */
      get focusKeep(): boolean;
      /**
       * Sets `this.options.focusKeep`, which is reactive for application shells.
       *
       * @param focusKeep - Sets the focusKeep option.
       */
      set focusKeep(focusKeep: boolean);
      /**
       * Returns the focusTrap app option.
       *
       * @returns When true focus trapping / wrapping is enabled keeping focus inside app.
       */
      get focusTrap(): boolean;
      /**
       * Sets `this.options.focusTrap`, which is reactive for application shells.
       *
       * @param focusTrap - Sets the focusTrap option.
       */
      set focusTrap(focusTrap: boolean);
      /**
       * Returns the headerButtonNoClose app option.
       *
       * @returns Remove the close the button in header app option.
       */
      get headerButtonNoClose(): boolean;
      /**
       * Sets `this.options.headerButtonNoClose`, which is reactive for application shells.
       *
       * @param headerButtonNoClose - Sets the headerButtonNoClose option.
       */
      set headerButtonNoClose(headerButtonNoClose: boolean);
      /**
       * Returns the headerButtonNoLabel app option.
       *
       * @returns Remove the labels from buttons in the header app option.
       */
      get headerButtonNoLabel(): boolean;
      /**
       * Sets `this.options.headerButtonNoLabel`, which is reactive for application shells.
       *
       * @param headerButtonNoLabel - Sets the headerButtonNoLabel option.
       */
      set headerButtonNoLabel(headerButtonNoLabel: boolean);
      /**
       * Returns the headerIcon app option.
       *
       * @returns URL for header app icon.
       */
      get headerIcon(): string | undefined;
      /**
       * Sets `this.options.headerIcon`, which is reactive for application shells.
       *
       * @param headerIcon - Sets the headerButtonNoLabel option.
       */
      set headerIcon(headerIcon: string | undefined);
      /**
       * Returns the headerNoTitleMinimized app option.
       *
       * @returns When true removes the header title when minimized.
       */
      get headerNoTitleMinimized(): boolean;
      /**
       * Sets `this.options.headerNoTitleMinimized`, which is reactive for application shells.
       *
       * @param headerNoTitleMinimized - Sets the headerNoTitleMinimized option.
       */
      set headerNoTitleMinimized(headerNoTitleMinimized: boolean);
      /**
       * Returns the minimizable app option.
       *
       * @returns Minimizable app option.
       */
      get minimizable(): boolean;
      /**
       * Sets `this.options.minimizable`, which is reactive for application shells that are also pop out.
       *
       * @param minimizable - Sets the minimizable option.
       */
      set minimizable(minimizable: boolean);
      /**
       * Returns the Foundry popOut state; {@link fvtt!ApplicationOptions.popOut}
       *
       * @returns Positionable app option.
       */
      get popOut(): boolean;
      /**
       * Sets `this.options.popOut`, which is reactive for application shells. This will add / remove this
       * application from `ui.windows`.
       *
       * @param popOut - Sets the popOut option.
       */
      set popOut(popOut: boolean);
      /**
       * Returns the positionable app option; {@link SvelteApp.Options.positionable}
       *
       * @returns Positionable app option.
       */
      get positionable(): boolean;
      /**
       * Sets `this.options.positionable` enabling / disabling {@link SvelteApp.position}.
       *
       * @param positionable - Sets the positionable option.
       */
      set positionable(positionable: boolean);
      /**
       * Returns the resizable option.
       *
       * @returns Resizable app option.
       */
      get resizable(): boolean;
      /**
       * Sets `this.options.resizable`, which is reactive for application shells.
       *
       * @param resizable - Sets the resizable option.
       */
      set resizable(resizable: boolean);
      /**
       * Returns the themeName option.
       *
       * @returns themeName app option.
       */
      get themeName(): string | undefined;
      /**
       * Sets `this.options.themeName`, which is reactive for application shells.
       *
       * @param themeName - Sets the themeName option.
       */
      set themeName(themeName: string | undefined);
      /**
       * Returns the title accessor from the parent Application class; {@link fvtt!ApplicationOptions}.
       *
       * @returns Title.
       */
      get title(): string;
      /**
       * Sets `this.options.title`, which is reactive for application shells.
       *
       * Note: Will set empty string if title is undefined or null.
       *
       * @param title - Application title; will be localized, so a translation key is fine.
       */
      set title(title: string | undefined | null);
      /**
       * Returns the current active Window / WindowProxy UI state.
       *
       * @returns Active window UI state.
       */
      get activeWindow(): Window;
      /**
       * Returns the current dragging UI state.
       *
       * @returns Dragging UI state.
       */
      get dragging(): boolean;
      /**
       * Returns whether the app is detached from the main browser window.
       *
       * @returns {boolean} App detached state.
       */
      get detached(): boolean;
      /**
       * Returns the current minimized UI state.
       *
       * @returns Minimized UI state.
       */
      get minimized(): boolean;
      /**
       * Returns the current resizing UI state.
       *
       * @returns Resizing UI state.
       */
      get resizing(): boolean;
      /**
       * Sets the current active Window / WindowProxy UI state.
       *
       * Note: This is protected usage and used internally.
       *
       * @param activeWindow - Active Window / WindowProxy UI state.
       *
       * @hidden
       */
      set activeWindow(activeWindow: Window);
      /**
       * Provides a way to safely get the application options given an accessor string which describes the
       * entries to walk. To access deeper entries into the object format, the accessor string with `.` between
       * entries to walk.
       *
       * @param accessor - The path / key to set. You can set multiple levels.
       *
       * @param [defaultValue] - A default value returned if the accessor is not found.
       *
       * @returns Value at the accessor.
       */
      getOptions(accessor: string, defaultValue?: any): any;
      /**
       * Provides a way to merge `options` into the application options and update the appOptions store.
       *
       * @param options - The options object to merge with `this.options`.
       */
      mergeOptions(options: object): void;
      /**
       * Provides a way to safely set the application options given an accessor string which describes the
       * entries to walk. To access deeper entries into the object format, the accessor string with `.` between
       * entries to walk.
       *
       * Additionally, if an application shell Svelte component is mounted and exports the `appOptions` property,
       * then the application options are set to `appOptions` potentially updating the application shell / Svelte
       * component.
       *
       * @param accessor - The path / key to set. You can set multiple levels.
       *
       * @param value - Value to set.
       */
      setOptions(accessor: string, value: any): void;
      /**
       * Serializes the main {@link SvelteApp.Options} for common application state.
       */
      toJSON(): Reactive.SerializedData;
      /**
       * Updates the UI Options store with the current header buttons. You may dynamically add / remove header
       * buttons if using an application shell Svelte component. In either overriding `_getHeaderButtons` or
       * responding to the Hooks fired return a new button array, and the uiOptions store is updated, and the
       * application shell will render the new buttons.
       *
       * Optionally you can set in the SvelteApp app options {@link SvelteApp.Options.headerButtonNoClose}
       * to remove the close button from the header buttons.
       *
       * @param [opts] - Optional parameters (for internal use)
       *
       * @param [opts.headerButtonNoClose] - The value for `headerButtonNoClose`.
       */
      updateHeaderButtons({ headerButtonNoClose }?: { headerButtonNoClose?: boolean }): void;
    }
    namespace Reactive {
      /**
       * Defines the bulk serializable data from {@link Reactive.toJSON} for common application state.
       */
      type SerializedData = {
        /**
         * If true, then application shells are always on top.
         */
        alwaysOnTop: boolean;
        /**
         * If true, then application shells are draggable.
         */
        draggable: boolean;
        /**
         * When true, auto-management of app focus is enabled.
         */
        focusAuto: boolean;
        /**
         * When `focusAuto` and `focusKeep` is true; keeps internal focus.
         */
        focusKeep: boolean;
        /**
         * When true, focus trapping / wrapping is enabled keeping focus inside the app.
         */
        focusTrap: boolean;
        /**
         * If true, then the close header button is removed.
         */
        headerButtonNoClose: boolean;
        /**
         * If true, then the header button labels are removed.
         */
        headerButtonNoLabel: boolean;
        /**
         * If true, then the header title is hidden when minimized.
         */
        headerNoTitleMinimized: boolean;
        /**
         * If true, then application shells are minimizable.
         */
        minimizable: boolean;
        /**
         * If false, then `position.set` does not take effect.
         */
        positionable: boolean;
        /**
         * If true, then application shells are resizable.
         */
        resizable: boolean;
        /**
         * Current explicit app theme name override.
         */
        themeName: string | undefined;
      };
      /**
       * UI state data accessible by {@link UIState} store.
       */
      type UIStateData = {
        /**
         * Active browser window for the app.
         */
        activeWindow: Window;
        /**
         * App dragging state.
         */
        dragging: boolean;
        /**
         * Current app header buttons.
         */
        headerButtons: SvelteApp.HeaderButton[];
        /**
         * App minimized state.
         */
        minimized: boolean;
        /**
         * App resizing state.
         */
        resizing: boolean;
      };
      /**
       * Provides a custom readable Svelte store for {@link SvelteApp.Options} state.
       */
      interface AppOptions extends Readable<SvelteApp.Options> {
        /**
         * Derived store for `alwaysOnTop` updates.
         */
        alwaysOnTop: Writable<boolean>;
        /**
         * Derived store for `containerQueryType` updates.
         */
        containerQueryType: Writable<string>;
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
        headerIcon: Writable<string | undefined>;
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
         * Derived store for `theme` updates.
         */
        themeName: Writable<string | undefined>;
        /**
         * Derived store for `title` updates.
         */
        title: Writable<string>;
      }
      /**
       * Provides a custom readable Svelte store for UI state.
       */
      interface UIState extends Readable<UIStateData> {
        /**
         * Active browser window for the app.
         */
        activeWindow: Readable<Window>;
        /**
         * Derived store for `detached` updates.
         */
        detached: Readable<boolean>;
        /**
         * Derived store for `dragging` updates.
         */
        dragging: Readable<boolean>;
        /**
         * Derived store for `headerButtons` updates.
         */
        headerButtons: Readable<SvelteApp.HeaderButton>;
        /**
         * Derived store for `minimized` updates.
         */
        minimized: Readable<boolean>;
        /**
         * Derived store for `resizing` updates.
         */
        resizing: Readable<boolean>;
      }
    }
    /**
     * Provides the ability the save / restore / serialize application state for positional and UI state such as
     * minimized status.
     *
     * You can restore a saved state with animation; please see the options of {@link State.restore}.
     */
    interface State {
      /**
       * Clears all saved application state.
       */
      clear(): void;
      /**
       * Returns current application state along with any extra data passed into method.
       *
       * @param [extra] - Extra data to add to application state.
       *
       * @returns The passed in extra object with current application state.
       */
      current(extra?: object): State.Data;
      /**
       * Gets any saved application state by name.
       *
       * @param options - Options.
       *
       * @param options.name - Saved data set name.
       *
       * @returns Any saved application state.
       */
      get({ name }: { name: string }): State.Data | undefined;
      /**
       * @returns The saved application state names / keys.
       */
      keys(): IterableIterator<string>;
      /**
       * Removes and returns any saved application state by name.
       *
       * @param options - Options.
       *
       * @param options.name - Name to remove and retrieve.
       *
       * @returns Any saved application state.
       */
      remove({ name }: { name: string }): State.Data | undefined;
      /**
       * Restores a previously saved application state by `name` returning the data. Several optional parameters are
       * available to animate / tween to the new state. When `animateTo` is true, an animation is scheduled via
       * {@link #runtime/svelte/store/position!AnimationAPI.to} and the duration and easing name or function may be
       * specified.
       *
       * @param options - Parameters
       *
       * @param options.name - Saved data set name.
       *
       * @param [options.remove=false] - Remove data set.
       *
       * @param [options.animateTo=false] - Animate to restore data.
       *
       * @param [options.duration=0.1] - Duration in seconds.
       *
       * @param [options.ease='linear'] - Easing function name or function.
       *
       * @returns Any saved application state.
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
      }): State.Data | undefined;
      /**
       * Saves the current application state with the opportunity to add extra data to the saved state.
       *
       * @param options - Options.
       *
       * @param options.name - Name to index this saved state.
       *
       * @param [options.extra] - Extra data to add to saved state.
       *
       * @returns Current saved application state.
       */
      save({ name, ...extra }: { name: string; extra?: any[] }): State.Data;
      /**
       * Sets application state from the given {@link State.Data} instance. Several optional parameters are
       * available to animate / tween to the new state. When `animateTo` is true, an animation is scheduled via
       * {@link #runtime/svelte/store/position!TJSPosition.API.Animation.to} and the duration and easing name or
       * function may be specified.
       *
       * Note: If serializing application state, any minimized apps will use the before minimized state on initial
       * render of the app as it is currently not possible to render apps with Foundry VTT core API in the minimized
       * state.
       *
       * @param data - Saved data set name.
       *
       * @param [options] - Optional parameters
       *
       * @param [options.animateTo=false] - Animate to restore data.
       *
       * @param [options.duration=0.1] - Duration in seconds.
       *
       * @param [options.ease='linear'] - Easing function.
       */
      set(
        data: State.Data,
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
    namespace State {
      /**
       * Defines common application state including positional data and options generated by the {@link State} API.
       */
      type Data = {
        /**
         * Application position.
         */
        position: TJSPosition.API.Data.TJSPositionData;
        /**
         * Any application saved position state for #beforeMinimized including maximized constraints.
         */
        beforeMinimized?: TJSPosition.API.Data.TJSPositionData & {
          constraints: {
            maxHeight: string;
            paddingTop: string;
            paddingBottom: string;
          };
        };
        /**
         * Common SvelteApp reactive app options.
         */
        options: SvelteApp.API.Reactive.SerializedData;
        /**
         * Application UI state.
         */
        ui: {
          minimized: boolean;
        };
      };
    }
    /**
     * Provides a mechanism to retrieve and query mounted Svelte application shell.
     */
    interface Svelte<Options extends SvelteApp.Options> {
      /**
       * Returns the mounted application shell Svelte component.
       *
       * @deprecated Use {@link Svelte.appShell}; since `0.2.0` removal in `0.5.0`.
       *
       * @returns Any mounted application shell.
       */
      get applicationShell(): AppShell<Options> | null;
      /**
       * Returns the mounted application shell Svelte component.
       *
       * @returns Any mounted application shell.
       */
      get appShell(): AppShell<Options> | null;
    }
  }
  /**
   * Svelte context interfaces for {@link SvelteApp}.
   */
  namespace Context {
    /**
     * For clean generics / templating / substitution purposes avoiding circular dependencies.
     * Please use {@link External}.
     */
    interface AbstractExternal {
      application: unknown;
      elementRootUpdate: unknown;
      sessionStorage: unknown;
    }
    /**
     * The `#external` context.
     */
    interface External<App extends SvelteApp = SvelteApp> extends AbstractExternal {
      /**
       * The external application instance.
       */
      application: App;
      /**
       * Create a function to generate a callback for Svelte components to invoke to update the tracked `elementRoot`
       * for application shells in the external application instance. There are rare cases that the main element root
       * changes in a mounted application component. The update is only triggered on successive changes of
       * `elementRoot`. Returns a boolean to indicate the element roots are updated.
       */
      elementRootUpdate: () => (elementRoot: HTMLElement) => boolean;
      /**
       * The session storage store manager associated with the external application.
       */
      sessionStorage: WebStorage;
    }
  }
  /**
   * Base options for SvelteApp. Defines all core options not related to defining a Svelte component to load.
   * It is useful to use `OptionsCore` when defining APIs of extended classes that internally handle loading a Svelte
   * component where the intention is to only allow modification of other core options.
   *
   * @privateRemarks Note: that this extends the Foundry `ApplicationOptions` in the build process.
   */
  interface OptionsCore extends Partial<fvtt.ApplicationOptions> {
    /**
     * If true, then application shells are always on top.
     *
     * @defaultValue `false`
     */
    alwaysOnTop?: boolean;
    /**
     * Defines the app window content container query type. The default container type is `inline-size` allowing
     * size queries for `width`. The other valid option is `size` which allows width and height queries.
     *
     * @defaultValue `inline-size`
     */
    containerQueryType?: string;
    /**
     * If false, the default slide close animation is not run.
     *
     * @defaultValue `true`
     */
    defaultCloseAnimation?: boolean;
    /**
     * If true, then application shells are draggable.
     *
     * @defaultValue `true`
     */
    draggable?: boolean;
    /**
     * When true, auto-management of app focus is enabled.
     *
     * @defaultValue `true`
     */
    focusAuto?: boolean;
    /**
     * When `focusAuto` and `focusKeep` is true; keeps internal focus.
     *
     * @defaultValue `false`
     */
    focusKeep?: boolean;
    /**
     * Defines A11yHelper focus source to apply when the application closes.
     *
     * @defaultValue: `undefined`
     */
    focusSource?: A11yFocusSource;
    /**
     * When true focus trapping / wrapping is enabled keeping focus inside app.
     *
     * @defaultValue `true`
     */
    focusTrap?: boolean;
    /**
     * If true, then the close header button is removed.
     *
     * @defaultValue `false`
     */
    headerButtonNoClose?: boolean;
    /**
     * If true, then the header button labels are removed.
     *
     * @defaultValue `false`
     */
    headerButtonNoLabel?: boolean;
    /**
     * Sets a header icon given an image URL.
     *
     * @defaultValue `undefined`
     */
    headerIcon?: string;
    /**
     * If true, then the header title is hidden when minimized.
     *
     * @defaultValue `false`
     */
    headerNoTitleMinimized?: boolean;
    /**
     * Assigned to position. Number specifying maximum window height.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    maxHeight?: number | string | null;
    /**
     * Assigned to position. Number specifying maximum window width.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    maxWidth?: number | string | null;
    /**
     * Assigned to position. Number specifying minimum window height.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `50`
     */
    minHeight?: number | string | null;
    /**
     * Assigned to position. Number specifying minimum window width.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `200`
     */
    minWidth?: number | string | null;
    /**
     * If false, then `position.set` does not take effect.
     *
     * @defaultValue `true`
     */
    positionable?: boolean;
    /**
     * A helper for initial position placement.
     *
     * @defaultValue `TJSPosition.Initial.browserCentered`
     */
    positionInitial?: TJSPosition.API.System.Initial.InitialSystem;
    /**
     * When true, TJSPosition is optimized for orthographic use.
     *
     * @defaultValue `true`
     */
    positionOrtho?: boolean;
    /**
     * A validator function or data or list of validators.
     *
     * @defaultValue `TJSPosition.Validators.transformWindow`
     */
    positionValidator?: TJSPosition.API.Validators.ValidatorOption;
    /**
     * Assigned to position. Number specifying the window rotation around the X-axis in degrees.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for values supported.
     *
     * @defaultValue `null`
     */
    rotateX?: number | string | null;
    /**
     * Assigned to position. Number specifying the window rotation around the Y-axis in degrees.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for values supported.
     *
     * @defaultValue `null`
     */
    rotateY?: number | string | null;
    /**
     * Assigned to position. Number specifying the window rotation around the Z-axis in degrees.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for values supported.
     *
     * @defaultValue `null`
     */
    rotateZ?: number | string | null;
    /**
     * Assigned to position. Number specifying the window rotation around the Z-axis in degrees. Alias for `rotateZ`.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for values supported.
     *
     * @defaultValue `null`
     */
    rotation?: number | string | null;
    /**
     * An instance of WebStorage (session) to share across SvelteApps. This is only required to share a
     * WebStorage instance across multiple SvelteApps. By default, a unique
     * {@link #runtime/svelte/store/web-storage!TJSSessionStorage} instance is created per SvelteApp.
     *
     * @defaultValue `TJSSessionStorage`
     */
    sessionStorage?: WebStorage;
    /**
     * An explicit theme name to apply to the application shell. Presently valid options are `dark` or `light`. If
     * not explicit theme is provided the current core platform theme is applied.
     */
    themeName?: string;
    /**
     * By default, 'top / left' respects rotation when minimizing.
     *
     * @defaultValue `'top left'`
     */
    transformOrigin?: TJSPosition.API.Transform.TransformOrigin;
    /**
     * The default pixel height for app; may use percentage.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    width?: number | string | null;
    /**
     * The default pixel height for app; may use percentage.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    height?: number | string | null;
    /**
     * The default top offset position for app; may use percentage.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    top?: number | string | null;
    /**
     * The default left offset position for app; may use percentage.
     *
     * When defined as a string see {@link TJSPosition.API.Data.TJSPositionDataRelative} for relative values
     * supported.
     *
     * @defaultValue `null`
     */
    left?: number | string | null;
  }
  /**
   * Options for SvelteApp including the `svelte` property which defines the Svelte component to load as the
   * "application shell".
   *
   * Note: Unlike standard Svelte component loading, any `context` provided is loaded as additional data into the
   * `#external` context key along with data such as the outer application instance reference. This allows one to
   * extend the {@link SvelteApp.Context.External} interface with additional data that you are loading and use one
   * type to conveniently retrieve all external context data inside a Svelte component.
   *
   * Note that the `svelte` configuration includes dynamic options to define `context` and `props` as a `function` as
   * well as an `object`. There are times when the `context` and `prop` data to load needs to come from data associated
   * with the instance of the application. When defining the configuration from the overloaded static accessor
   * {@link SvelteApp.defaultOptions} you may use a standard function IE `function() {}` for `context` or
   * `props`. When `SvelteApp` loads the component, these functions will be invoked with the `this` reference of the
   * actual instance allowing association of instance data from within a static context.
   */
  interface Options<
    Component extends SvelteComponent = SvelteComponent,
    ContextExternal extends SvelteApp.Context.AbstractExternal = SvelteApp.Context.AbstractExternal,
  > extends OptionsCore {
    /**
     * A Svelte configuration object defining the main component loaded.
     *
     * Note: that `svelte.class` is required; this is due to type inference requirements by TypeScript.
     */
    svelte: TJSSvelte.Config.Dynamic<
      Component,
      {
        PropsOmit: 'elementContent' | 'elementRoot' | 'elementTarget';
        ContextOmit: 'application' | 'elementRootUpdate' | 'sessionStorage';
        ContextShape: ContextExternal;
      }
    >;
  }
}

/**
 * Omits the protected application shell contract properties.
 */
type OmitPropsTRL<Options extends SvelteApp.Options> = Omit<
  ComponentProps<InstanceType<Options['svelte']['class']>>,
  'elementRoot' | 'elementContent' | 'elementTarget'
>;
/**
 * Based on the `SvelteApp.Options` -> `svelte.class` property limit the props exposed and add the safe methods that
 * can be accessed
 */
type AppShell<Options extends SvelteApp.Options> = OmitPropsTRL<Options> & {
  /**
   * Register an event callback.
   *
   * @param type - Event type.
   *
   * @param callback - Callback function
   *
   * @returns Unsubscriber function.
   */
  $on<K extends Extract<keyof ComponentEvents<InstanceType<Options['svelte']['class']>>, string>>(
    type: K,
    callback: ((e: ComponentEvents<InstanceType<Options['svelte']['class']>>[K]) => void) | null | undefined,
  ): () => void;
  /**
   * Set props of the component.
   *
   * @param props - Props to set.
   */
  $set(props: Partial<OmitPropsTRL<Options>>): void;
};

declare namespace TJSDialog {
  /**
   * TJSDialog button data.
   */
  type ButtonData = {
    /**
     * When false, the dialog does not automatically close when button selected.
     *
     * @defaultValue `true`
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
     * Callback for button press. When defined as a string, any matching function by name exported from the content
     * Svelte component is invoked.
     */
    onPress?: string | ((data?: { application?: TJSDialog }) => any);
    /**
     * Inline styles to apply to the button.
     */
    styles?: {
      [key: string]: string | null;
    };
  };
  /**
   * Provides storage for all dialog options through individual accessors and `get`, `merge`, `replace` and `set`
   * methods that safely access and update data changed to the mounted DialogShell component reactively.
   */
  interface Data {
    /**
     * @returns The dialog always on top state.
     */
    get alwaysOnTop(): boolean;
    /**
     * Set the dialog always on top state.
     *
     * @param alwaysOnTop - New dialog always on top state.
     */
    set alwaysOnTop(alwaysOnTop: boolean);
    /**
     * @returns The dialog button configuration.
     */
    get buttons(): {
      [key: string]: ButtonData;
    };
    /**
     * Set the dialog button configuration.
     *
     * @param buttons - New dialog button configuration.
     */
    set buttons(buttons: { [key: string]: ButtonData });
    /**
     * @returns The Svelte configuration object or HTML string content.
     */
    get content(): TJSSvelte.Config.Embed | string;
    /**
     * Set the Svelte configuration object or HTML string content.
     *
     * @param content - New Svelte configuration object or HTML string content.
     */
    set content(content: TJSSvelte.Config.Embed | string);
    /**
     * @returns The default button ID to focus initially.
     */
    get default(): string;
    /**
     * Set the default button ID to focus initially.
     *
     * @param newDefault - New default button ID to focus initially.
     */
    set default(newDefault: string);
    /**
     * @returns The dialog `draggable` state; draggable when true.
     */
    get draggable(): boolean;
    /**
     * Set the dialog state; draggable when true.
     *
     * @param draggable - New dialog `draggable` state; draggable when true.
     */
    set draggable(draggable: boolean);
    /**
     * @returns When true auto-management of app focus is enabled.
     */
    get focusAuto(): boolean;
    /**
     * Set the dialog auto-management of app focus.
     *
     * @param focusAuto - New dialog auto-management of app focus.
     */
    set focusAuto(focusAuto: boolean);
    /**
     * @returns When true the first focusable element that isn't a button is focused.
     */
    get focusFirst(): boolean;
    /**
     * Set the dialog first focusable element state.
     *
     * @param focusFirst - New dialog first focusable element state.
     */
    set focusFirst(focusFirst: boolean);
    /**
     * @returns When `focusAuto` and `focusKeep` is true; keeps internal focus.
     */
    get focusKeep(): boolean;
    /**
     * Set the dialog `focusKeep` state. When `focusAuto` and `focusKeep` are true, then keep internal focus.
     *
     * @param focusKeep - New dialog `focusKeep` state.
     */
    set focusKeep(focusKeep: boolean);
    /**
     * @returns When true the dialog is minimizable.
     */
    get minimizable(): boolean;
    /**
     * Set the dialog `minimizable` state. When true, the dialog is minimizable.
     *
     * @param minimizable - New dialog `minimizable` state.
     */
    set minimizable(minimizable: boolean);
    /**
     * @returns When true a modal dialog is displayed.
     */
    get modal(): boolean;
    /**
     * Set the dialog `modal` state. When true, a modal dialog is displayed.
     *
     * @param modal - New dialog `modal` state.
     */
    set modal(modal: boolean);
    /**
     * @returns Additional options for modal dialog display.
     */
    get modalOptions(): OptionsModal;
    /**
     * Set additional options for modal dialog display.
     *
     * @param modalOptions - New additional options for modal dialog display.
     */
    set modalOptions(modalOptions: OptionsModal);
    /**
     * @returns When true and an error is raised in dialog callback functions post a UI error notification.
     */
    get notifyError(): boolean;
    /**
     * Set the dialog `notifyError` state. When true and an error is raised in the dialog, callback functions post a
     * UI error notification.
     *
     * @param notifyError - New dialog `notifyError` state.
     */
    set notifyError(notifyError: boolean);
    /**
     * @returns Callback invoked when dialog is closed; no button option selected. When defined as a string, any
     *          matching function by name exported from the content Svelte component is invoked.
     */
    get onClose(): string | ((data?: { application?: TJSDialog }) => any);
    /**
     * Set callback invoked when the dialog is closed; no button option selected. When defined as a string, any
     * matching function by name exported from the content Svelte component is invoked.
     *
     * @param onClose - New dialog `onClose` state.
     */
    set onClose(onClose: string | ((data?: { application?: TJSDialog }) => any));
    /**
     * @returns Dialog `rejectClose` state. When true and a Promise has been created by {@link TJSDialog.wait}
     *          and the Promise is not in the process of being resolved or rejected on close of the dialog any
     *          `onClose` function is invoked and any result that is undefined will cause the Promise to then be
     *          rejected.
     */
    get rejectClose(): boolean;
    /**
     * Set the dialog `rejectClose` state.
     *
     * @param rejectClose - New dialog `rejectClose` state.
     */
    set rejectClose(rejectClose: boolean);
    /**
     * @returns When true the dialog is resizable.
     */
    get resizable(): boolean;
    /**
     * Set the dialog `resizable` state. When true, the dialog is resizable.
     *
     * @param resizable - New dialog `resizable` state.
     */
    set resizable(resizable: boolean);
    /**
     * @returns When true and resolving any Promises and there are undefined results from any button callbacks
     *          the button ID is resolved.
     */
    get resolveId(): boolean;
    /**
     * Set the dialog `resolveId` state. When true and resolving any Promises and there are undefined results from any
     * button callbacks, the button ID is resolved.
     *
     * @param resolveId - New dialog `resolveId` state.
     */
    set resolveId(resolveId: boolean);
    /**
     * @returns The dialog window title.
     */
    get title(): string;
    /**
     * Set the dialog window title.
     *
     * @param title - New dialog window title.
     */
    set title(title: string);
    /**
     * @returns Transition options for the dialog.
     */
    get transition(): OptionsTransition;
    /**
     * Set transition options for the dialog.
     *
     * @param transition - New transition options for the dialog.
     */
    set transition(transition: OptionsTransition);
    /**
     * @returns A specific z-index for the dialog.
     */
    get zIndex(): number | null;
    /**
     * Set specific z-index for the dialog.
     *
     * @param zIndex - New z-index for the dialog.
     */
    set zIndex(zIndex: number | null);
    /**
     * Provides a cloned copy of the dialog data.
     * Note: The content attribute is not cloned as complex / props may be present.
     *
     * @returns A clone of the dialog data.
     */
    clone(): OptionsData;
    /**
     * Provides a way to safely get this dialogs data given an accessor string which describes the
     * entries to walk. To access deeper entries into the object, then format the accessor string with `.` between
     * entries to walk.
     *
     * @param accessor - The path / key to set. You can set multiple levels.
     *
     * @param [defaultValue] - A default value returned if the accessor is not found.
     *
     * @returns Value at the accessor.
     */
    get(accessor: string, defaultValue?: any): any;
    /**
     * @param data - Merge provided data object into Dialog data.
     */
    merge(data: OptionsData): void;
    /**
     * Replaces all dialog data; this is reactive.
     *
     * @param data - Dialog data.
     */
    replace(data: OptionsData): void;
    /**
     * Provides a way to safely set this dialog data given an accessor string which describes the
     * entries to walk. To access deeper entries into the object, then format the accessor string with `.` between
     * entries to walk.
     *
     * Automatically, the dialog data will be updated in the associated DialogShell Svelte component.
     *
     * @param accessor - The path / key to set. You can set multiple levels.
     *
     * @param value - Value to set.
     *
     * @returns True if successful.
     */
    set(accessor: string, value: any): boolean;
  }
  /**
   * Defines additional modal options to control the display of the modal dialog and glasspane.
   */
  type OptionsModal = {
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
    styles?: {
      [key: string]: string | null;
    };
    /**
     * Custom transition options for the modal background / glasspane.
     */
    transition?: OptionsTransition;
  };
  /**
   * Defines the common dialog configuration data.
   */
  type OptionsData = {
    /**
     * The dialog is always on top when true.
     *
     * @defaultValue `false`
     */
    alwaysOnTop?: boolean;
    /**
     * Provides configuration of the dialog button bar.
     */
    buttons?: {
      [key: string]: ButtonData;
    };
    /**
     * A Svelte configuration object or HTML string content.
     */
    content?: TJSSvelte.Config.Embed | string;
    /**
     * The default button ID to focus initially.
     */
    default?: string;
    /**
     * The dialog is draggable when true.
     *
     * @defaultValue `true`
     */
    draggable?: boolean;
    /**
     * When true, auto-management of app focus is enabled.
     *
     * @defaultValue `true`
     */
    focusAuto?: boolean;
    /**
     * When true, the first focusable element that isn't a button is focused.
     *
     * @defaultValue `false`
     */
    focusFirst?: boolean;
    /**
     * When `focusAuto` and `focusKeep` is true; keeps internal focus.
     *
     * @defaultValue `false`
     */
    focusKeep?: boolean;
    /**
     * When true, focus trapping / wrapping is enabled keeping focus inside the app.
     *
     * @defaultValue `true`
     */
    focusTrap?: boolean;
    /**
     * When true, the dialog is minimizable.
     *
     * @defaultValue `true`
     */
    minimizable?: boolean;
    /**
     * When true, a modal dialog is displayed.
     *
     * @defaultValue `false`
     */
    modal?: boolean;
    /**
     * Additional options for modal dialog display.
     */
    modalOptions?: OptionsModal;
    /**
     * When true and an error is thrown in dialog callback functions post a UI error notification.
     *
     * @defaultValue `false`
     */
    notifyError?: boolean;
    /**
     * Callback invoked when the dialog is closed; no button option selected. When defined as a string, any matching
     * function by name exported from the content Svelte component is invoked.
     */
    onClose?: string | ((data?: { application: TJSDialog }) => any);
    /**
     * When true and a Promise has been created by {@link TJSDialog.wait} and the Promise is not in the process of
     * being resolved or rejected on close of the dialog any `onClose` function is invoked and any result that is
     * undefined will cause the Promise to then be rejected.
     *
     * @defaultValue `false`
     */
    rejectClose?: boolean;
    /**
     * When true, the dialog is resizable.
     *
     * @defaultValue `false`
     */
    resizable?: boolean;
    /**
     * When true and resolving any Promises and there are undefined results from any of the button callbacks, the
     * button ID is resolved.
     *
     * @defaultValue `false`
     */
    resolveId?: boolean;
    /**
     * The dialog window title.
     */
    title?: string;
    /**
     * Transition options for the dialog.
     */
    transition?: OptionsTransition;
    /**
     * A specific z-index for the dialog.
     */
    zIndex?: number | null;
  };
  /**
   * Defines the transition options when the dialog is rendered / closed.
   */
  type OptionsTransition = {
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
    transitionOptions?: {
      [key: string]: any;
    };
    /**
     * Additional transition options applied to the `in` transition.
     */
    inTransitionOptions?: {
      [key: string]: any;
    };
    /**
     * Additional transition options applied to the `out` transition.
     */
    outTransitionOptions?: {
      [key: string]: any;
    };
  };
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
 * Please refer to {@link TJSDialog.OptionsData} for the various options used to construct the dialog.
 *
 * There are a couple of static helper methods to quickly create standard dialogs such as a 'yes' / 'no' confirmation
 * dialog with {@link TJSDialog.confirm} and an 'ok' single button dialog with {@link TJSDialog.prompt}.
 */
declare class TJSDialog extends SvelteApp {
  /**
   * A helper factory method to create simple confirmation dialog windows which consist of simple yes / no prompts.
   * If you require more flexibility, a custom TJSDialog instance is preferred. The default focused button is 'yes'.
   * You can change the default focused button by setting `default` to `yes` or `no`.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialog.OptionsData & {
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
   * @param {import('./types').SvelteApp.OptionsCore}  [options]  SvelteApp options passed to the
   *        TJSDialog constructor.
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
    }?: TJSDialog.OptionsData & {
      onYes?: string | ((data?: { application?: TJSDialog }) => any);
      onNo?: string | ((data?: { application?: TJSDialog }) => any);
    },
    options?: SvelteApp.OptionsCore,
  ): Promise<T>;
  /**
   * A helper factory method to display a basic "prompt" style TJSDialog with a single button.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialog.OptionsData & {
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
   * @param {import('./types').SvelteApp.OptionsCore}  [options]  SvelteApp options passed to the
   *        TJSDialog constructor.
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
    }?: TJSDialog.OptionsData & {
      onOk?: string | ((data?: { application?: TJSDialog }) => any);
      label?: string;
      icon?: string;
    },
    options?: SvelteApp.OptionsCore,
  ): Promise<T>;
  /**
   * Creates an anonymous data defined TJSDialog returning a Promise that can be awaited upon for the user to make a
   * choice.
   *
   * Note: By default `null` is returned if the dialog is closed without a user making a choice.
   *
   * @template T
   *
   * @param {import('./internal/state-dialog/types').TJSDialog.OptionsData}  data - Dialog data passed to the
   *        TJSDialog constructor.
   *
   * @param {import('./types').SvelteApp.OptionsCore}  [options]  SvelteApp options passed to the
   *        TJSDialog constructor.
   *
   * @returns {Promise<T>} A Promise that resolves to the chosen result.
   */
  static wait<T>(data: TJSDialog.OptionsData, options?: SvelteApp.OptionsCore): Promise<T>;
  /**
   * @param {import('./internal/state-dialog/types').TJSDialog.OptionsData} data - Dialog options.
   *
   * @param {import('./types').SvelteApp.OptionsCore}   [options] - SvelteApp options.
   */
  constructor(data: TJSDialog.OptionsData, options?: SvelteApp.OptionsCore);
  /**
   * Returns the dialog data.
   *
   * @returns {import('./internal/state-dialog/types').TJSDialog.Data} Dialog data.
   */
  get data(): TJSDialog.Data;
  /**
   * @returns {import('#runtime/util/async').ManagedPromise} Returns the managed promise.
   */
  get managedPromise(): _runtime_util_async.ManagedPromise;
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
 * Provides runtime-parsed styles for the core Foundry stylesheet and an extended merged version with all game system
 * and module overrides. Both, {@link FoundryStyles.core} and {@link FoundryStyles.ext} return an instance of
 * {@link #runtime/util/dom/style!StyleSheetResolve} that has a reduced amount of parsed style information relevant to
 * configuring essential styling. `StyleSheetResolve` allows access to discrete CSS selectors and associated properties
 * including resolving CSS variables across selectors / elements.
 *
 * `FoundryStyles` is used internally by TRL to construct the flattened CSS variables generated at runtime to match
 * the platform theming. The core Foundry styles are not flat with many CSS variables having extended element scoping.
 *
 * The following CSS layers are parsed from Foundry core styles:
 * ```
 * - `applications`
 * - `blocks.ui`
 * - `variables.base`
 * - `variables.themes.*`
 * - `elements.*`
 * ```
 */
declare class FoundryStyles {
  /**
   * @returns {StyleSheetResolve} Core parsed styles.
   */
  static get core(): StyleSheetResolve;
  /**
   * @returns {StyleSheetResolve} Core parsed styles with extended game system / module overrides.
   */
  static get ext(): StyleSheetResolve;
}

export { FoundryStyles, SvelteApp, SvelteApp as SvelteApplication, TJSDialog };
