import { SvelteComponent } from 'svelte';

/**
 * TODO: Add description
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
    /** @type {number} */
    zIndex?: number;
    /** @type {boolean} */
    captureInput?: boolean;
    /**
     * When true any input fires an event `glasspane:close`.
     *
     * @type {boolean}
     */
    closeOnInput?: boolean;
    /** @type {boolean} */
    slotSeparate?: boolean;
    /** @type {Record<string, string>} */
    styles?: Record<string, string>;
    inTransition?: any;
    outTransition?: any;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
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
 * Provides an application shell is a main top level slotted component that provides a reactive
 * outer wrapper and header bar for the main content component.
 */
declare class ApplicationShell extends SvelteComponent<
  ApplicationShell.Props,
  ApplicationShell.Events,
  ApplicationShell.Slots
> {
  /** Setter for {@link ApplicationShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: any);

  /** Getter for {@link ApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): any;

  /** Setter for {@link ApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: any);

  /** Getter for {@link ApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): any;

  /** Setter for {@link ApplicationShell.Props.draggable | draggable} prop. */
  set draggable(_: any);

  /** Getter for {@link ApplicationShell.Props.draggable | draggable} prop. */
  get draggable(): any;

  /** Setter for {@link ApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  set draggableOptions(_: any);

  /** Getter for {@link ApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  get draggableOptions(): any;

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
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
    elementContent?: any;
    elementRoot?: any;
    draggableOptions?: any;
    stylesApp?: any;
    stylesContent?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
    contentOffsetHeight?: boolean;
    contentOffsetWidth?: boolean;
  };
  /** Events type alias for {@link ApplicationShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link ApplicationShell | associated component}. */
  export type Slots = { default: {} };
}

/**
 * Provides an empty application shell as a main top level slotted component.
 */
declare class EmptyApplicationShell extends SvelteComponent<
  EmptyApplicationShell.Props,
  EmptyApplicationShell.Events,
  EmptyApplicationShell.Slots
> {
  /** Setter for {@link EmptyApplicationShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: any);

  /** Getter for {@link EmptyApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): any;

  /** Setter for {@link EmptyApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: any);

  /** Getter for {@link EmptyApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): any;

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
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
    elementContent?: any;
    elementRoot?: any;
    stylesApp?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
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
 * ### CSS variables
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
  set elementContent(_: any);

  /** Getter for {@link TjsApplicationShell.Props.elementContent | elementContent} prop. */
  get elementContent(): any;

  /** Setter for {@link TjsApplicationShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: any);

  /** Getter for {@link TjsApplicationShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): any;

  /** Setter for {@link TjsApplicationShell.Props.draggable | draggable} prop. */
  set draggable(_: any);

  /** Getter for {@link TjsApplicationShell.Props.draggable | draggable} prop. */
  get draggable(): any;

  /** Setter for {@link TjsApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  set draggableOptions(_: any);

  /** Getter for {@link TjsApplicationShell.Props.draggableOptions | draggableOptions} prop. */
  get draggableOptions(): any;

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
    inTransition?: () => undefined;
    outTransition?: () => undefined;
    transitionOptions?: any;
    inTransitionOptions?: {};
    outTransitionOptions?: {};
    elementContent?: any;
    elementRoot?: any;
    draggableOptions?: any;
    stylesApp?: any;
    stylesContent?: any;
    appOffsetHeight?: boolean;
    appOffsetWidth?: boolean;
    contentOffsetHeight?: boolean;
    contentOffsetWidth?: boolean;
  };
  /** Events type alias for {@link TjsApplicationShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link TjsApplicationShell | associated component}. */
  export type Slots = { default: {} };
}

/**
 * TODO: Add description
 */
declare class TjsFocusWrap extends SvelteComponent<TjsFocusWrap.Props, TjsFocusWrap.Events, TjsFocusWrap.Slots> {}

/** Event / Prop / Slot type aliases for {@link TjsFocusWrap | associated component}. */
declare namespace TjsFocusWrap {
  /** Props type alias for {@link TjsFocusWrap | associated component}. */
  export type Props = {
    /** @type {HTMLElement} */
    elementRoot?: HTMLElement;
    /** @type {boolean} */
    enabled?: boolean;
  };
  /** Events type alias for {@link TjsFocusWrap | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link TjsFocusWrap | associated component}. */
  export type Slots = {};
}

export {
  ApplicationShell,
  EmptyApplicationShell,
  TjsApplicationShell as TJSApplicationShell,
  TjsFocusWrap as TJSFocusWrap,
  TjsGlassPane as TJSGlassPane,
};
