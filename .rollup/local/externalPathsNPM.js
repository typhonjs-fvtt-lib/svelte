export const externalPathsNPM = {
   '@typhonjs-svelte/lib/action': '@typhonjs-fvtt/svelte/action',
   '@typhonjs-svelte/lib/animate': '@typhonjs-fvtt/svelte/animate',
   '@typhonjs-svelte/lib/component/core': '@typhonjs-fvtt/svelte/component/core',
   '@typhonjs-svelte/lib/component/standard': '@typhonjs-fvtt/svelte/component/standard',
   '@typhonjs-svelte/lib/handler': '@typhonjs-fvtt/svelte/handler',
   '@typhonjs-svelte/lib/helper': '@typhonjs-fvtt/svelte/helper',
   '@typhonjs-svelte/lib/plugin/data': '@typhonjs-fvtt/svelte/plugin/data',
   '@typhonjs-svelte/lib/plugin/system': '@typhonjs-fvtt/svelte/plugin/system',
   '@typhonjs-svelte/lib/store': '@typhonjs-fvtt/svelte/store',
   '@typhonjs-svelte/lib/transition': '@typhonjs-fvtt/svelte/transition',
   '@typhonjs-svelte/lib/util': '@typhonjs-fvtt/svelte/util',

   // Exclude as external, but do not translate module references.
   'svelte': 'svelte',
   'svelte/animate': 'svelte/animate',
   'svelte/easing': 'svelte/easing',
   'svelte/internal': 'svelte/internal',
   'svelte/motion': 'svelte/motion',
   'svelte/store': 'svelte/store',
   'svelte/transition': 'svelte/transition'
};
