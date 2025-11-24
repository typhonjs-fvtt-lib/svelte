import type { Readable } from 'svelte/store';

/**
 * Provides the data and types for application shells `#internal` context.
 */
export declare namespace AppShell {
   /**
    * All context data.
    */
   export namespace Context {

      /**
       * Defines the internal stores available for application shells.
       */
      export type InternalAppStores = {
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

         /**
          * The visual edge insets of the window content area.
          */
         visualEdgeInsets: Readable<{ top: number, right: number, bottom: number, left: number }>
      };

      /**
       * The `#internal` context data.
       */
      export interface Internal {
         /**
          * Returns stores holding the current container query enabled state and `elementRoot` / `elementContent`
          * instances.
          */
         get stores(): Readonly<InternalAppStores>;
      }
   }
}
