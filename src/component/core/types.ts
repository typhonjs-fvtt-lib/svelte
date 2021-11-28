import type { SvelteComponent }         from 'svelte';
import type { Readable, Subscriber }    from 'svelte/store';
import type { TransitionConfig }        from "svelte/transition";

// declare global {
//     // @ts-ignore
//     let ui: {
//         /**
//          * @defaultValue `Notifications`
//          */
//         notifications: ConstructorOf<Notifications>;
//     };
// }

type ContextExternal<Options extends Application.Options = Application.Options,
 FoundryApp extends Application<Options> = Application<Options>> = {
    foundryApp: FoundryApp,

    children: SvelteComponent[] | void,

    storeAppOptions: StoreAppOptions<Options>,

    storeUIOptions: StoreUIOptions
}

// TODO: Move to SvelteApplication.HeaderButton
type HeaderButton = {
    class?: string,
    icon?: string,
    label?: string,
    title?: string
    onclick?: Function
};

type HTMLElementGet = () => HTMLElement;

type MenuItemContext = {
    icon?: string,
    label?: string,
    onclick?: Function
}

/**
 * - Application shell contract for Svelte components.
 */
type MountedAppShell = {
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

/**
 * - Provides a custom readable Svelte store for Application options state.
 */
type StoreAppOptions<Options extends Application.Options = Application.Options> = {
    /**
     * - Subscribe to all app options updates.
     */
    subscribe: Subscriber<Options>,
    /**
     * - Derived store for `draggable` updates.
     */
    draggable: Readable<boolean>,
    /**
     * - Derived store for `minimizable` updates.
     */
    minimizable: Readable<boolean>,
    /**
     * - Derived store for `popOut` updates.
     */
    popOut: Readable<boolean>,
    /**
     * - Derived store for `resizable` updates.
     */
    resizable: Readable<boolean>,
    /**
     * - Derived store for `title` updates.
     */
    title: Readable<string>,
    /**
     * - Derived store for `zIndex` updates.
     */
    zIndex: Readable<number>
};

/**
 * - Provides a custom readable Svelte store for UI options state.
 */
type StoreUIOptions = {
    /**
     * - Subscribe to all UI options updates.
     */
    subscribe: Subscriber<{ headerButtons: HeaderButton[], minimized: boolean }>;
    /**
     * - Derived store for `headerButtons` updates.
     */
    headerButtons: Readable<HeaderButton[]>;
    /**
     * - Derived store for `minimized` updates.
     */
    minimized: Readable<boolean>;
};

// interface TJSDialogData extends Dialog.Data
// {
//     draggable?: boolean;
//
//     modal?: boolean;
//
//     modalOptions?: {
//         background?: string;
//         transition?: TransitionData;
//     }
//
//     popOut?: boolean;
//
//     resizable?: boolean;
//
//     transition?: TransitionData;
//
//     zIndex?: number | null;
// }

interface TJSDialogData
{
    draggable?: boolean;

    modal?: boolean;

    modalOptions?: {
        background?: string;
        transition?: TransitionData;
    }

    popOut?: boolean;

    resizable?: boolean;

    transition?: TransitionData;

    zIndex?: number | null;

    /**
     * From Dialog.Data - copied; would like to extend Dialog.Data instead
     * TODO TYPES
     */
    /**
     * The window title
     */
    title: string;

    /**
     * HTML content
     */
    content: string;

    /**
     * A callback function invoked when the dialog is rendered
     */
    render?: (element: JQuery | HTMLElement) => void;

    /**
     * Common callback operations to perform when the dialog is closed
     */
    close?: (element: JQuery | HTMLElement) => void;

    /**
     * The buttons which are displayed as action choices for the dialog
     */
    buttons: Record<string, Dialog.Button>;

    /**
     * The name of the default button which should be triggered on Enter
     */
    default: string;
}

type TransitionData = {
    /**
     * - A transition for in / out.
     */
    transition?: (options?: object) => TransitionConfig,
    /**
     * - A transition for in.
     */
    inTransition?: (options?: object) => TransitionConfig,
    /**
     * - A transition for out.
     */
    outTransition?: (options?: object) => TransitionConfig,
    /**
     * - Options for transition.
     */
    transitionOptions?: object,
    /**
     * - Options for transition in.
     */
    inTransitionOptions?: object,
    /**
     * - Options for transition out.
     */
    outTransitionOptions?: object,
}

export type {
    ContextExternal,
    HeaderButton,
    HTMLElementGet,
    MenuItemContext,
    MountedAppShell,
    StoreAppOptions,
    StoreUIOptions,
    TJSDialogData,
    TransitionData
};
