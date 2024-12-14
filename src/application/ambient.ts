import { SvelteApplicationOptions } from './types';

declare global {
   interface Application<Options> {}
}

// @ts-ignore This is bundled and is not an error.
declare module '@typhonjs-fvtt/svelte/application' {
   export interface SvelteApplication<Options extends SvelteApplicationOptions> extends Application<Options>
   {
      options: Options;
   }
}
