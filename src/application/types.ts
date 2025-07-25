import type {
   ComponentEvents,
   ComponentProps,
   SvelteComponent }             from 'svelte';

import type {
   Readable,
   Writable }                    from 'svelte/store';

import type { A11yFocusSource }  from '#runtime/util/a11y';

import type { EasingReference }  from '#runtime/svelte/easing';

import type { TJSPosition }      from '#runtime/svelte/store/position';

import type { WebStorage }       from '#runtime/svelte/store/web-storage';

import type { TJSSvelte }        from '#runtime/svelte/util';

/**
 * Provides all types associated with {@link SvelteApp}.
 */
declare namespace SvelteAppNS {
   /**
    * Defines the application header button data handled in {@link SvelteApp._getHeaderButtons} and associated
    * `getApplicationHeaderButtons` hooks. SvelteApp extends the header button data from
    * {@link fvtt!ApplicationHeaderButton} bringing an expanded feature set.
    */
   export type HeaderButton = {
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
       * Text label or language key to associate with button.
       */
      label?: string;

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
      styles?: { [key: string]: string | null };

      /**
       * You may load a custom Svelte component into the header to replace a button.
       *
       * Note: supports just `class`, `props` definition.
       */
      svelte?: TJSSvelte.Config.Embed;

      /**
       * A tooltip to display when hovered.
       */
      title?: string;
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
   export type HeaderButtonCallback = (args: {
      button: SvelteAppNS.HeaderButton;
      event: PointerEvent | KeyboardEvent
   }) => void;

   // Main composition API additions to `SvelteApp` ------------------------------------------------------------------

   export namespace API {
      // Reactive API ------------------------------------------------------------------------------------------------

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
       * There are also reactive getters / setters for {@link SvelteAppNS.Options} and Foundry
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
       * - {@link Reactive.title}
       *
       * An instance of TJSWebStorage (session) / TJSSessionStorage is accessible via
       * {@link Reactive.sessionStorage}. Optionally you can pass in an existing TJSWebStorage instance that can
       * be shared across multiple SvelteApps by setting {@link SvelteAppNS.Options.sessionStorage}.
       */
      export interface Reactive
      {
         /**
          * @returns Returns WebStorage (session) instance.
          */
         get sessionStorage(): WebStorage;

         /**
          * Provides a custom readable Svelte store for {@link SvelteAppNS.Options} state.
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

         // Accessors for App state ----------------------------------------------------------------------------------

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
          * Returns the positionable app option; {@link SvelteAppNS.Options.positionable}
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

         // Accessors for UI state -----------------------------------------------------------------------------------

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
          * Serializes the main {@link SvelteAppNS.Options} for common application state.
          */
         toJSON(): Reactive.SerializedData;

         /**
          * Updates the UI Options store with the current header buttons. You may dynamically add / remove header
          * buttons if using an application shell Svelte component. In either overriding `_getHeaderButtons` or
          * responding to the Hooks fired return a new button array, and the uiOptions store is updated, and the
          * application shell will render the new buttons.
          *
          * Optionally you can set in the SvelteApp app options {@link SvelteAppNS.Options.headerButtonNoClose}
          * to remove the close button from the header buttons.
          *
          * @param [opts] - Optional parameters (for internal use)
          *
          * @param [opts.headerButtonNoClose] - The value for `headerButtonNoClose`.
          */
         updateHeaderButtons({ headerButtonNoClose }?: {
            headerButtonNoClose?: boolean;
         }): void;
      }

      export namespace Reactive {
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
         }

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
            headerButtons: SvelteAppNS.HeaderButton;

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
          * Provides a custom readable Svelte store for {@link SvelteAppNS.Options} state.
          */
         interface AppOptions extends Readable<SvelteAppNS.Options> {
            /**
             * Derived store for `alwaysOnTop` updates.
             */
            alwaysOnTop: Writable<boolean>;

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
             * Derived store for `dragging` updates.
             */
            dragging: Readable<boolean>;

            /**
             * Derived store for `headerButtons` updates.
             */
            headerButtons: Readable<SvelteAppNS.HeaderButton>;

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

      // State API ---------------------------------------------------------------------------------------------------

      /**
       * Provides the ability the save / restore / serialize application state for positional and UI state such as
       * minimized status.
       *
       * You can restore a saved state with animation; please see the options of {@link State.restore}.
       */
      export interface State {
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
         get({ name }: {
            name: string;
         }): State.Data | undefined;

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
         remove({ name }: {
            name: string;
         }): State.Data | undefined;

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
         restore({ name, remove, animateTo, duration, ease }: {
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
         save({ name, ...extra }: {
            name: string;
            extra?: any[];
         }): State.Data;

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
         set(data: State.Data, { animateTo, duration, ease }?: {
            async?: boolean;
            animateTo?: boolean;
            duration?: number;
            ease?: EasingReference;
         }): void;
      }

      export namespace State {
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
               constraints: { maxHeight: string, paddingTop: string, paddingBottom: string }
            };

            /**
             * Common SvelteApp reactive app options.
             */
            options: SvelteAppNS.API.Reactive.SerializedData;

            /**
             * Application UI state.
             */
            ui: { minimized: boolean };
         };
      }

      // Svelte API --------------------------------------------------------------------------------------------------

      /**
       * Provides a mechanism to retrieve and query mounted Svelte application shell.
       */
      export interface Svelte<Options extends SvelteAppNS.Options>
      {
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

         /**
          * Returns mounted application shell data / config.
          *
          * @internal
          */
         get appShellData(): SvelteData | null;
      }
   }

   /**
    * Svelte context interfaces for {@link SvelteApp}.
    */
   export namespace Context {
      /**
       * For clean generics / templating / substitution purposes avoiding circular dependencies.
       * Please use {@link External}.
       */
      export interface AbstractExternal {
         application: unknown;
         elementRootUpdate: unknown;
         sessionStorage: unknown;
      }

      /**
       * The `#external` context.
       */
      // @ts-ignore
      export interface External<App extends import('./SvelteApp').SvelteApp =
       // @ts-ignore
       import('./SvelteApp').SvelteApp> extends AbstractExternal {
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
   interface OptionsCore
   {
      /**
       * If true, then application shells are always on top.
       *
       * @defaultValue `false`
       */
      alwaysOnTop?: boolean;

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
       * By default, 'top / left' respects rotation when minimizing.
       *
       * @defaultValue `'top left'`
       */
      transformOrigin?: TJSPosition.API.Transform.TransformOrigin;

      // The following are overrides of core Foundry `ApplicationOptions` providing type expansion and comments.

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
      left?: number | string |  null;
   }

   /**
    * Options for SvelteApp including the `svelte` property which defines the Svelte component to load as the
    * "application shell".
    *
    * Note: Unlike standard Svelte component loading, any `context` provided is loaded as additional data into the
    * `#external` context key along with data such as the outer application instance reference. This allows one to
    * extend the {@link SvelteAppNS.Context.External} interface with additional data that you are loading and use one
    * type to conveniently retrieve all external context data inside a Svelte component.
    *
    * Note that the `svelte` configuration includes dynamic options to define `context` and `props` as a `function` as
    * well as an `object`. There are times when the `context` and `prop` data to load needs to come from data associated
    * with the instance of the application. When defining the configuration from the overloaded static accessor
    * {@link SvelteApp.defaultOptions} you may use a standard function IE `function() {}` for `context` or
    * `props`. When `SvelteApp` loads the component, these functions will be invoked with the `this` reference of the
    * actual instance allowing association of instance data from within a static context.
    */
   interface Options<Component extends SvelteComponent = SvelteComponent,
    ContextExternal extends SvelteAppNS.Context.AbstractExternal = SvelteAppNS.Context.AbstractExternal> extends
     OptionsCore
   {
      /**
       * A Svelte configuration object defining the main component loaded.
       *
       * Note: that `svelte.class` is required; this is due to type inference requirements by TypeScript.
       */
      svelte: TJSSvelte.Config.Dynamic<Component, {
         PropsOmit: 'elementContent' | 'elementRoot' | 'elementTarget',
         ContextOmit: 'application' | 'elementRootUpdate'| 'sessionStorage',
         ContextShape: ContextExternal,
      }>;
   }
}

export { SvelteAppNS };

// Internal types ----------------------------------------------------------------------------------------------------

/**
 * Omits the protected application shell contract properties.
 */
type OmitPropsTRL<Options extends SvelteAppNS.Options> = Omit<
   ComponentProps<InstanceType<Options['svelte']['class']>>,
   'elementRoot' | 'elementContent' | 'elementTarget'
>;

/**
 * Based on the `SvelteApp.Options` -> `svelte.class` property limit the props exposed and add the safe methods that
 * can be accessed
 */
type AppShell<Options extends SvelteAppNS.Options> = OmitPropsTRL<Options> & {
   /**
    * Register an event callback.
    *
    * @param type - Event type.
    *
    * @param callback - Callback function
    *
    * @returns Unsubscriber function.
    */
   $on<K extends Extract<keyof ComponentEvents<InstanceType<Options['svelte']['class']>>, string>>(type: K, callback:
    ((e: ComponentEvents<InstanceType<Options['svelte']['class']>>[K]) => void) | null | undefined): () => void;

   /**
    * Set props of the component.
    *
    * @param props - Props to set.
    */
   $set(props: Partial<OmitPropsTRL<Options>>): void;
};

/**
 * Provides access to a mounted Svelte component for internal use. The access point is marked with `@internal` via
 * `SvelteApp.svelte.appShellData`.
 */
type SvelteData = {
   /**
    * The Svelte configuration object for this component.
    */
   config: TJSSvelte.Config.Dynamic;
   /**
    * The svelte component instance.
    */
   component: SvelteComponent;
   /**
    * The main bound element.
    */
   element: HTMLElement;
};
