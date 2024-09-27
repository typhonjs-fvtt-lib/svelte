/**
 * Provides an internal package of Svelte component resources that are not publicly exposed in documentation, but
 * accessible by `@typhonjs-svelte/runtime-base/svelte/component/internal`.
 *
 * @ignore
 *
 * @module
 */

import { SvelteComponent } from 'svelte';

/**
 * TODO: Add description
 *
 * @internal
 */
declare class DialogShell extends SvelteComponent<DialogShell.Props, DialogShell.Events, DialogShell.Slots> {
  /** Setter for {@link DialogShell.Props.elementContent | elementContent} prop. */
  set elementContent(_: any);

  /** Getter for {@link DialogShell.Props.elementContent | elementContent} prop. */
  get elementContent(): any;

  /** Setter for {@link DialogShell.Props.elementRoot | elementRoot} prop. */
  set elementRoot(_: any);

  /** Getter for {@link DialogShell.Props.elementRoot | elementRoot} prop. */
  get elementRoot(): any;

  /** Setter for {@link DialogShell.Props.data | data} prop. */
  set data(_: {});

  /** Getter for {@link DialogShell.Props.data | data} prop. */
  get data(): {};

  /** Setter for {@link DialogShell.Props.dialogComponent | dialogComponent} prop. */
  set dialogComponent(_: any);

  /** Getter for {@link DialogShell.Props.dialogComponent | dialogComponent} prop. */
  get dialogComponent(): any;

  /** Setter for {@link DialogShell.Props.managedPromise | managedPromise} prop. */
  set managedPromise(_: any);

  /** Getter for {@link DialogShell.Props.managedPromise | managedPromise} prop. */
  get managedPromise(): any;
}

/**
 * Event / Prop / Slot type aliases for {@link DialogShell | associated component}.
 * @internal
 */
declare namespace DialogShell {
  /** Props type alias for {@link DialogShell | associated component}. */
  export type Props = {
    data?: {};
    elementContent?: any;
    elementRoot?: any;
    dialogComponent?: any;
    managedPromise?: any;
  };
  /** Events type alias for {@link DialogShell | associated component}. */
  export type Events = { [evt: string]: CustomEvent<any> };
  /** Slots type alias for {@link DialogShell | associated component}. */
  export type Slots = {};
}

export { DialogShell };
