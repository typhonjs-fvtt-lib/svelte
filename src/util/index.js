// Normally we can just export the module; maybe an issue w/ nodenext & submodule exports.
// export * from '@typhonjs-svelte/lib/util';

import {
   hasAccessor,
   hasGetter,
   hasSetter,
   isSvelteComponent,
   outroAndDestroy,
   parseSvelteConfig } from '@typhonjs-svelte/lib/util';

// Typescript was complaining, so explicit import / export.
export { hasAccessor, hasGetter, hasSetter, isSvelteComponent, outroAndDestroy, parseSvelteConfig };

export * from './isApplicationShell.js';
