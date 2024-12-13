import { SvelteApplicationOptions } from '@typhonjs-fvtt/svelte/application';

declare global {
   interface Application<Options> {}
}

declare module '@typhonjs-fvtt/svelte/application' {
   export interface SvelteApplication<Options extends SvelteApplicationOptions> extends Application<Options>
   {
      options: Options;
   }
}
