/**
 * This sub-path is an ambient import bridging the {@link #runtime/svelte/application|} package to the Foundry community
 * types or other Typescript declarations that provide a global `AppV1` declaration for {@link Application}.
 *
 * When using Typescript and an appropriate set of FVTT declarations simply add the following to the entry point of
 * your package:
 * ```js
 * import '#runtime/svelte/application/ambient-ts';
 * ```
 * @see https://github.com/7H3LaughingMan/foundry-pf2e
 * @see https://github.com/League-of-Foundry-Developers/foundry-vtt-types
 *
 * @packageDocumentation
 */

import { SvelteApplicationOptions } from '@typhonjs-fvtt/svelte/application';

declare global {
  interface Application<Options> {}
}
declare module '@typhonjs-fvtt/svelte/application' {
  interface SvelteApplication<Options extends SvelteApplicationOptions> extends Application<Options> {
    options: Options;
  }
}
