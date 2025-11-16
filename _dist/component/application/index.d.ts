import { SvelteComponent } from 'svelte';
import { Readable } from 'svelte/store';

/**
 * Provides an application shell is a main top level slotted component that provides a reactive
 * outer wrapper and header bar for the main content component.
 *
 * Container queries (`inline-size`) are supported for `width` queries. The main app window container is named
 * `tjs-app-window` and the window content container is `tjs-app-content`. Take note that the width available
 * is the inline-size width of the app window or content minus the border constraints. Container queries will be
 * disabled if the `width` app option is `auto` or not an explicit constraint. Just a precautionary warning that If
 * you set `width` to `auto` during runtime unexpected behavior or a collapse of the app window will occur which is
 * to be expected.
 *
 */
declare class ApplicationShell extends SvelteComponent<
  ApplicationShell.Props,
  ApplicationShell.Events,
  ApplicationShell.Slots
> {
  /** Setter for {@link ApplicationShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: HTMLElement);

  /** Getter for {@link ApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): HTMLElement;

  /** Setter for {@link ApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: HTMLElement);

  /** Getter for {@link ApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): HTMLElement;

  /** Setter for {@link ApplicationShell.Props.draggable | draggable} prop. */
  set draggable(_: any);

  /** Getter for {@link ApplicationShell.Props.draggable | draggable} prop. */
  get draggable(): any;

  /** Setter for {@link ApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  set draggableOptions(_: any);

  /** Getter for {@link ApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  get draggableOptions(): any;

  /** Setter for {@link ApplicationShell.Props.padToVisualEdge | padToVisualEdge} prop. */
  set padToVisualEdge(_: boolean);

  /** Getter for {@link ApplicationShell.Props.padToVisualEdge | padToVisualEdge} prop. */
  get padToVisualEdge(): boolean;

  /** Setter for {@link ApplicationShell.Props.stylesApp | stylesApp} prop. */
  set stylesApp(_: any);

  /** Getter for {@link ApplicationShell.Props.stylesApp | stylesApp} prop. */
  get stylesApp(): any;

  /** Setter for {@link ApplicationShell.Props.stylesContent | stylesContent} prop. */
  set stylesContent(_: any);

  /** Getter for {@link ApplicationShell.Props.stylesContent | stylesContent} prop. */
  get stylesContent(): any;

  /** Setter for {@link ApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  set appOffsetHeight(_: boolean);

  /** Getter for {@link ApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  get appOffsetHeight(): boolean;

  /** Setter for {@link ApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  set appOffsetWidth(_: boolean);

  /** Getter for {@link ApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  get appOffsetWidth(): boolean;

  /** Setter for {@link ApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  set contentOffsetHeight(_: boolean);

  /** Getter for {@link ApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  get contentOffsetHeight(): boolean;

  /** Setter for {@link ApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  set contentOffsetWidth(_: boolean);

  /** Getter for {@link ApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  get contentOffsetWidth(): boolean;

  /** Setter for {@link ApplicationShell.Props.contentHeight | contentHeight} prop. */
  set contentHeight(_: boolean);

  /** Getter for {@link ApplicationShell.Props.contentHeight | contentHeight} prop. */
  get contentHeight(): boolean;

  /** Setter for {@link ApplicationShell.Props.contentWidth | contentWidth} prop. */
  set contentWidth(_: boolean);

  /** Getter for {@link ApplicationShell.Props.contentWidth | contentWidth} prop. */
  get contentWidth(): boolean;

  /** Setter for {@link ApplicationShell.Props.transition | transition} prop. */
  set transition(_: () => undefined);

  /** Getter for {@link ApplicationShell.Props.transition | transition} prop. */
  get transition(): () => undefined;

  /** Setter for {@link ApplicationShell.Props.inTransition | inTransition} prop. */
  set inTransition(_: () => undefined);

  /** Getter for {@link ApplicationShell.Props.inTransition | inTransition} prop. */
  get inTransition(): () => undefined;

  /** Setter for {@link ApplicationShell.Props.outTransition | outTransition} prop. */
  set outTransition(_: () => undefined);

  /** Getter for {@link ApplicationShell.Props.outTransition | outTransition} prop. */
  get outTransition(): () => undefined;

  /** Setter for {@link ApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  set transitionOptions(_: any);

  /** Getter for {@link ApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  get transitionOptions(): any;

  /** Setter for {@link ApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  set inTransitionOptions(_: {});

  /** Getter for {@link ApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  get inTransitionOptions(): {};

  /** Setter for {@link ApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  set outTransitionOptions(_: {});

  /** Getter for {@link ApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  get outTransitionOptions(): {};
}

/** Event / Prop / Slot type aliases for {@link ApplicationShell | associated component}. */
declare namespace ApplicationShell {
  /** Props type alias for {@link ApplicationShell | associated component}. */
  export type Props = {
    transition?: () => undefined;
    draggable?: any;
    /** @type {HTMLElement} */
    elementContent?: HTMLElement;
    /** @type {HTMLElement} */
    elementRoot?: HTMLElement;
    contentOffsetWidth?: boolean;
    contentOffsetHeight?: boolean;
    contentWidth?: boolean;
    contentHeight?: boolean;
    draggableOptions?: any;
    /**
     * When true, the inline styles for padding of the `.window-content` / main slot is adjusted for any visual edge
     * insets / border image applied to `.window-content` allowing the main slot to take up the entire visual content
     * space.
     *
     * @type {boolean}
     */
    padToVisualEdge?: boolean;
    stylesApp?: any;
    stylesContent?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
  };
  /** Events type alias for {@link ApplicationShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link ApplicationShell | associated component}. */
  export type Slots = { default: {} };
}

/**
 * Provides an empty application shell as a main top level slotted component.
 *
 * Container queries (`inline-size`) are supported for `width` queries. The main app window container is named
 * `tjs-app-window` and the window content container is `tjs-app-content`. Take note that the width available
 * is the inline-size width of the app window or content minus the border constraints. Container queries will be
 * disabled if the `width` app option is `auto` or not an explicit constraint. Just a precautionary warning that If
 * you set `width` to `auto` during runtime unexpected behavior or a collapse of the app window will occur which is
 * to be expected.
 *
 */
declare class EmptyApplicationShell extends SvelteComponent<
  EmptyApplicationShell.Props,
  EmptyApplicationShell.Events,
  EmptyApplicationShell.Slots
> {
  /** Setter for {@link EmptyApplicationShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: HTMLElement);

  /** Getter for {@link EmptyApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): HTMLElement;

  /** Setter for {@link EmptyApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: HTMLElement);

  /** Getter for {@link EmptyApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): HTMLElement;

  /** Setter for {@link EmptyApplicationShell.Props.stylesApp | stylesApp} prop. */
  set stylesApp(_: any);

  /** Getter for {@link EmptyApplicationShell.Props.stylesApp | stylesApp} prop. */
  get stylesApp(): any;

  /** Setter for {@link EmptyApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  set appOffsetHeight(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  get appOffsetHeight(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  set appOffsetWidth(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  get appOffsetWidth(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  set contentOffsetHeight(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  get contentOffsetHeight(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  set contentOffsetWidth(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  get contentOffsetWidth(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.contentHeight | contentHeight} prop. */
  set contentHeight(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.contentHeight | contentHeight} prop. */
  get contentHeight(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.contentWidth | contentWidth} prop. */
  set contentWidth(_: boolean);

  /** Getter for {@link EmptyApplicationShell.Props.contentWidth | contentWidth} prop. */
  get contentWidth(): boolean;

  /** Setter for {@link EmptyApplicationShell.Props.transition | transition} prop. */
  set transition(_: () => undefined);

  /** Getter for {@link EmptyApplicationShell.Props.transition | transition} prop. */
  get transition(): () => undefined;

  /** Setter for {@link EmptyApplicationShell.Props.inTransition | inTransition} prop. */
  set inTransition(_: () => undefined);

  /** Getter for {@link EmptyApplicationShell.Props.inTransition | inTransition} prop. */
  get inTransition(): () => undefined;

  /** Setter for {@link EmptyApplicationShell.Props.outTransition | outTransition} prop. */
  set outTransition(_: () => undefined);

  /** Getter for {@link EmptyApplicationShell.Props.outTransition | outTransition} prop. */
  get outTransition(): () => undefined;

  /** Setter for {@link EmptyApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  set transitionOptions(_: any);

  /** Getter for {@link EmptyApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  get transitionOptions(): any;

  /** Setter for {@link EmptyApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  set inTransitionOptions(_: {});

  /** Getter for {@link EmptyApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  get inTransitionOptions(): {};

  /** Setter for {@link EmptyApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  set outTransitionOptions(_: {});

  /** Getter for {@link EmptyApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  get outTransitionOptions(): {};
}

/** Event / Prop / Slot type aliases for {@link EmptyApplicationShell | associated component}. */
declare namespace EmptyApplicationShell {
  /** Props type alias for {@link EmptyApplicationShell | associated component}. */
  export type Props = {
    transition?: () => undefined;
    /** @type {HTMLElement} */
    elementContent?: HTMLElement;
    /** @type {HTMLElement} */
    elementRoot?: HTMLElement;
    contentOffsetWidth?: boolean;
    contentOffsetHeight?: boolean;
    contentWidth?: boolean;
    contentHeight?: boolean;
    stylesApp?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
  };
  /** Events type alias for {@link EmptyApplicationShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link EmptyApplicationShell | associated component}. */
  export type Slots = { default: {} };
}

/**
 * Provides an alternate application shell that is scoped by slightly different CSS classes than
 * {@link ApplicationShell}. An application shell is a main top level slotted component that provides a reactive
 * outer wrapper and header bar for the main content component.
 *
 * Container queries (`inline-size`) are supported for `width` queries. The main app window container is named
 * `tjs-app-window` and the window content container is `tjs-app-content`. Take note that the width available
 * is the inline-size width of the app window or content minus the border constraints. Container queries will be
 * disabled if the `width` app option is `auto` or not an explicit constraint. Just a precautionary warning that If
 * you set `width` to `auto` during runtime unexpected behavior or a collapse of the app window will occur which is
 * to be expected.
 *
 * ### CSS variables
 *
 * ```
 * '--tjs-app-background': Controls the app background image; set in main `index.js`.
 * ```
 */
declare class TjsApplicationShell extends SvelteComponent<
  TjsApplicationShell.Props,
  TjsApplicationShell.Events,
  TjsApplicationShell.Slots
> {
  /** Setter for {@link TjsApplicationShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: HTMLElement);

  /** Getter for {@link TjsApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): HTMLElement;

  /** Setter for {@link TjsApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: HTMLElement);

  /** Getter for {@link TjsApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): HTMLElement;

  /** Setter for {@link TjsApplicationShell.Props.draggable | draggable} prop. */
  set draggable(_: any);

  /** Getter for {@link TjsApplicationShell.Props.draggable | draggable} prop. */
  get draggable(): any;

  /** Setter for {@link TjsApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  set draggableOptions(_: any);

  /** Getter for {@link TjsApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  get draggableOptions(): any;

  /** Setter for {@link TjsApplicationShell.Props.padToVisualEdge | padToVisualEdge} prop. */
  set padToVisualEdge(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.padToVisualEdge | padToVisualEdge} prop. */
  get padToVisualEdge(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.stylesApp | stylesApp} prop. */
  set stylesApp(_: any);

  /** Getter for {@link TjsApplicationShell.Props.stylesApp | stylesApp} prop. */
  get stylesApp(): any;

  /** Setter for {@link TjsApplicationShell.Props.stylesContent | stylesContent} prop. */
  set stylesContent(_: any);

  /** Getter for {@link TjsApplicationShell.Props.stylesContent | stylesContent} prop. */
  get stylesContent(): any;

  /** Setter for {@link TjsApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  set appOffsetHeight(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.appOffsetHeight | appOffsetHeight} prop. */
  get appOffsetHeight(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  set appOffsetWidth(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.appOffsetWidth | appOffsetWidth} prop. */
  get appOffsetWidth(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  set contentOffsetHeight(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.contentOffsetHeight | contentOffsetHeight} prop. */
  get contentOffsetHeight(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  set contentOffsetWidth(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.contentOffsetWidth | contentOffsetWidth} prop. */
  get contentOffsetWidth(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.contentHeight | contentHeight} prop. */
  set contentHeight(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.contentHeight | contentHeight} prop. */
  get contentHeight(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.contentWidth | contentWidth} prop. */
  set contentWidth(_: boolean);

  /** Getter for {@link TjsApplicationShell.Props.contentWidth | contentWidth} prop. */
  get contentWidth(): boolean;

  /** Setter for {@link TjsApplicationShell.Props.transition | transition} prop. */
  set transition(_: () => undefined);

  /** Getter for {@link TjsApplicationShell.Props.transition | transition} prop. */
  get transition(): () => undefined;

  /** Setter for {@link TjsApplicationShell.Props.inTransition | inTransition} prop. */
  set inTransition(_: () => undefined);

  /** Getter for {@link TjsApplicationShell.Props.inTransition | inTransition} prop. */
  get inTransition(): () => undefined;

  /** Setter for {@link TjsApplicationShell.Props.outTransition | outTransition} prop. */
  set outTransition(_: () => undefined);

  /** Getter for {@link TjsApplicationShell.Props.outTransition | outTransition} prop. */
  get outTransition(): () => undefined;

  /** Setter for {@link TjsApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  set transitionOptions(_: any);

  /** Getter for {@link TjsApplicationShell.Props.transitionOptions | transitionOptions} prop. */
  get transitionOptions(): any;

  /** Setter for {@link TjsApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  set inTransitionOptions(_: {});

  /** Getter for {@link TjsApplicationShell.Props.inTransitionOptions | inTransitionOptions} prop. */
  get inTransitionOptions(): {};

  /** Setter for {@link TjsApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  set outTransitionOptions(_: {});

  /** Getter for {@link TjsApplicationShell.Props.outTransitionOptions | outTransitionOptions} prop. */
  get outTransitionOptions(): {};
}

/** Event / Prop / Slot type aliases for {@link TjsApplicationShell | associated component}. */
declare namespace TjsApplicationShell {
  /** Props type alias for {@link TjsApplicationShell | associated component}. */
  export type Props = {
    transition?: () => undefined;
    draggable?: any;
    /** @type {HTMLElement} */
    elementContent?: HTMLElement;
    /** @type {HTMLElement} */
    elementRoot?: HTMLElement;
    contentOffsetWidth?: boolean;
    contentOffsetHeight?: boolean;
    contentWidth?: boolean;
    contentHeight?: boolean;
    draggableOptions?: any;
    /**
     * When true, the inline styles for padding of the `.window-content` / main slot is adjusted for any visual edge
     * insets / border image applied to `.window-content` allowing the main slot to take up the entire visual content
     * space.
     *
     * @type {boolean}
     */
    padToVisualEdge?: boolean;
    stylesApp?: any;
    stylesContent?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
  };
  /** Events type alias for {@link TjsApplicationShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link TjsApplicationShell | associated component}. */
  export type Slots = { default: {} };
}

/**
 * @privateRemarks
 * TODO: Add description
 *
 */
declare class TjsGlassPane extends SvelteComponent<TjsGlassPane.Props, TjsGlassPane.Events, TjsGlassPane.Slots> {}

/** Event / Prop / Slot type aliases for {@link TjsGlassPane | associated component}. */
declare namespace TjsGlassPane {
  /** Props type alias for {@link TjsGlassPane | associated component}. */
  export type Props = {
    /** @type {string} */
    id?: string;
    /** @type {string} */
    background?: string;
    transition?: any;
    inTransition?: any;
    outTransition?: any;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
    /** @type {boolean} */
    captureInput?: boolean;
    /**
     * When true, any input fires an event `glasspane:close`.
     *
     * @type {boolean}
     */
    closeOnInput?: boolean;
    /** @type {boolean} */
    slotSeparate?: boolean;
    /** @type {{ [key: string]: string | null }} */
    styles?: { [key: string]: string | null };
  };
  /** Events type alias for {@link TjsGlassPane | associated component}. */
  export type Events = {
    'glasspane:close':
      | PointerEvent
      | MouseEvent
      | UIEvent
      | Event
      | ErrorEvent
      | AnimationEvent
      | ClipboardEvent
      | CompositionEvent
      | DragEvent
      | FocusEvent
      | FormDataEvent
      | InputEvent
      | KeyboardEvent
      | ProgressEvent<EventTarget>
      | SecurityPolicyViolationEvent
      | SubmitEvent
      | TouchEvent
      | TransitionEvent
      | WheelEvent;
    'glasspane:keydown:escape':
      | PointerEvent
      | MouseEvent
      | UIEvent
      | Event
      | ErrorEvent
      | AnimationEvent
      | ClipboardEvent
      | CompositionEvent
      | DragEvent
      | FocusEvent
      | FormDataEvent
      | InputEvent
      | KeyboardEvent
      | ProgressEvent<EventTarget>
      | SecurityPolicyViolationEvent
      | SubmitEvent
      | TouchEvent
      | TransitionEvent
      | WheelEvent;
    'glasspane:pointerdown':
      | PointerEvent
      | MouseEvent
      | UIEvent
      | Event
      | ErrorEvent
      | AnimationEvent
      | ClipboardEvent
      | CompositionEvent
      | DragEvent
      | FocusEvent
      | FormDataEvent
      | InputEvent
      | KeyboardEvent
      | ProgressEvent<EventTarget>
      | SecurityPolicyViolationEvent
      | SubmitEvent
      | TouchEvent
      | TransitionEvent
      | WheelEvent;
  } & { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link TjsGlassPane | associated component}. */
  export type Slots = { default: {} };
}

/**
 * Provides the data and types for application shells `#internal` context.
 */
declare namespace AppShell {
  /**
   * All context data.
   */
  namespace Context {
    /**
     * Defines the internal stores available for application shells.
     */
    type InternalAppStores = {
      /**
       * Content offset width when content resize observation enabled.
       */
      contentOffsetWidth: Readable<number>;
      /**
       * Content offset height when content resize observation enabled.
       */
      contentOffsetHeight: Readable<number>;
      /**
       * Content width minus padding / border when content resize observation enabled.
       */
      contentWidth: Readable<number>;
      /**
       * Content height minus padding / border when content resize observation enabled.
       */
      contentHeight: Readable<number>;
      /**
       * Are container queries enabled.
       */
      cqEnabled: Readable<boolean>;
      /**
       * The content element.
       */
      elementContent: Readable<HTMLElement>;
      /**
       * The main app shell element.
       */
      elementRoot: Readable<HTMLElement>;
    };
    /**
     * The `#internal` context data.
     */
    interface Internal {
      /**
       * Returns stores holding the current container query enabled state and `elementRoot` / `elementContent`
       * instances.
       */
      get stores(): Readonly<InternalAppStores>;
    }
  }
}

export {
  AppShell,
  ApplicationShell,
  EmptyApplicationShell,
  TjsApplicationShell as TJSApplicationShell,
  TjsGlassPane as TJSGlassPane,
};
