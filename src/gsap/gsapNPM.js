import {
   gsap,

   Flip,
   MotionPathPlugin,
   Observer,
   PixiPlugin,
   ScrollToPlugin,
   ScrollTrigger,
} from '../../node_modules/gsap/src/all.js';

import * as easingFuncs from 'svelte/easing';

// Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
for (const prop of Object.keys(easingFuncs))
{
   const name = `svelte-${prop}`;
   gsap.registerEase(name, easingFuncs[prop]);
}

// Plugins

export {
   gsap,

   // Plugins
   Flip,
   MotionPathPlugin,
   Observer,
   PixiPlugin,
   ScrollToPlugin,
   ScrollTrigger
};

