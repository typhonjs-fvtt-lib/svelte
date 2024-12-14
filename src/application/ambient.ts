import { SvelteApp } from './types';

declare global {
   interface Application<Options> {}
}

// @ts-ignore This is bundled and is not an error.
declare module '@typhonjs-fvtt/svelte/application' {
   export interface SvelteApplication<Options extends SvelteApp.Options = SvelteApp.Options> extends Application<Options>
   {
      options: Options;
   }
}
