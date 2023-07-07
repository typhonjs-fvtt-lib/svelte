import * as _typhonjs_fvtt_svelte_application from '@typhonjs-fvtt/svelte/application';
import { SvelteApplication } from '@typhonjs-fvtt/svelte/application';
import * as _typhonjs_svelte_runtime_base_svelte_store_position from '@typhonjs-svelte/runtime-base/svelte/store/position';
import { TJSPosition } from '@typhonjs-svelte/runtime-base/svelte/store/position';

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
 * Provides a Svelte aware extension to FormApplication to control the app lifecycle appropriately. You can
 * declaratively load one or more components from `defaultOptions`. It is not recommended that you use or depend on
 * this class as it only exists to support {@link HandlebarsFormApplication} due to the OOP nature of the Foundry VTT
 * platform. This should only be an interim or stepwise solution as you convert your package over to fully using TRL &
 * Svelte.
 */
declare class SvelteFormApplication {
    /**
     * @inheritDoc
     */
    constructor(object: any, options: any);
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
     * @returns {import('@typhonjs-fvtt/svelte/application').SvelteReactive} The reactive accessors & Svelte stores.
     */
    get reactive(): _typhonjs_fvtt_svelte_application.SvelteReactive;
    /**
     * Returns the application state manager.
     *
     * @returns {import('@typhonjs-fvtt/svelte/application').ApplicationState<SvelteFormApplication>} The application state
     *          manager.
     */
    get state(): _typhonjs_fvtt_svelte_application.ApplicationState<SvelteFormApplication>;
    /**
     * Returns the Svelte helper class w/ various methods to access mounted Svelte components.
     *
     * @returns {import('@typhonjs-fvtt/svelte/application').GetSvelteData} GetSvelteData
     */
    get svelte(): _typhonjs_fvtt_svelte_application.GetSvelteData;
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
     * @param {object}   [opts] - Optional parameters.
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
     * @param {import('@typhonjs-fvtt/svelte/application').MountedAppShell} [mountedAppShell] - The mounted app shell elements.
     */
    onSvelteMount(mountedAppShell?: _typhonjs_fvtt_svelte_application.MountedAppShell): void;
    /**
     * Provides a callback after the main application shell is remounted. This may occur during HMR / hot module
     * replacement or directly invoked from the `elementRootUpdate` callback passed to the application shell component
     * context.
     *
     * @param {import('@typhonjs-fvtt/svelte/application').MountedAppShell} [mountedAppShell] - The mounted app shell elements.
     */
    onSvelteRemount(mountedAppShell?: _typhonjs_fvtt_svelte_application.MountedAppShell): void;
    /**
     * All calculation and updates of position are implemented in {@link TJSPosition.set}. This allows position to be fully
     * reactive and in control of updating inline styles for the application.
     *
     * This method remains for backward compatibility with Foundry. If you have a custom override quite likely you need
     * to update to using the {@link TJSPosition.validators} functionality.
     *
     * @param {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPositionDataExtended}   [position] - TJSPosition data.
     *
     * @returns {TJSPosition} The updated position object for the application containing the new values.
     * @ignore
     */
    setPosition(position?: _typhonjs_svelte_runtime_base_svelte_store_position.TJSPositionDataExtended): TJSPosition;
    #private;
}

/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use HandlebarsFormApplication in a similar manner as the core Foundry `FormApplication`
 * class. This should only be an interim or stepwise solution as you convert your package over to fully using TRL &
 * Svelte.
 */
declare class HandlebarsFormApplication extends SvelteFormApplication {
    form: any;
    #private;
}

export { HandlebarsApplication, HandlebarsFormApplication, SvelteFormApplication };
