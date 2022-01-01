export const externalPathsNPM = {
   '@typhonjs-svelte/lib/action': '@typhonjs-fvtt/runtime/svelte/action',
   '@typhonjs-svelte/lib/component/core': '@typhonjs-fvtt/runtime/svelte/component/core',
   '@typhonjs-svelte/lib/component/standard': '@typhonjs-fvtt/runtime/svelte/component/standard',
   '@typhonjs-svelte/lib/handler': '@typhonjs-fvtt/runtime/svelte/handler',
   '@typhonjs-svelte/lib/helper': '@typhonjs-fvtt/runtime/svelte/helper',
   '@typhonjs-svelte/lib/plugin/data': '@typhonjs-fvtt/runtime/svelte/plugin/data',
   '@typhonjs-svelte/lib/plugin/system': '@typhonjs-fvtt/runtime/svelte/plugin/system',
   '@typhonjs-svelte/lib/store': '@typhonjs-fvtt/runtime/svelte/store',
   '@typhonjs-svelte/lib/transition': '@typhonjs-fvtt/runtime/svelte/transition',
   '@typhonjs-svelte/lib/util': '@typhonjs-fvtt/runtime/svelte/util',

   // Exclude as external, but do not translate module references.
   'svelte': 'svelte',
   'svelte/animate': 'svelte/animate',
   'svelte/easing': 'svelte/easing',
   'svelte/internal': 'svelte/internal',
   'svelte/motion': 'svelte/motion',
   'svelte/store': 'svelte/store',
   'svelte/transition': 'svelte/transition'
};
