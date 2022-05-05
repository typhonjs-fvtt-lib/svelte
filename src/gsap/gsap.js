import * as easingFuncs from 'svelte/easing';

let gsap = void 0;

// Plugins
let CustomBounce = void 0;
let CustomEase = void 0;
let CustomWiggle = void 0;
let DrawSVGPlugin = void 0;
let EasePack = void 0;
let GSDevTools = void 0;
let InertiaPlugin = void 0;
let MorphSVGPlugin = void 0;
let MotionPathHelper = void 0;
let MotionPathPlugin = void 0;
let Physics2DPlugin = void 0;
let PhysicsPropsPlugin = void 0;
let PixiPlugin = void 0;
let ScrambleTextPlugin = void 0;
let ScrollToPlugin = void 0;
let ScrollTrigger = void 0;
let SplitText = void 0;
let TextPlugin = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/all.js');

try
{
   const module = await import(modulePath);
   gsap = module.gsap;

   CustomBounce = module.CustomBounce;
   CustomEase = module.CustomEase;
   CustomWiggle = module.CustomWiggle;
   DrawSVGPlugin = module.DrawSVGPlugin;
   EasePack = module.EasePack;
   GSDevTools = module.GSDevTools;
   InertiaPlugin = module.InertiaPlugin;
   MorphSVGPlugin = module.MorphSVGPlugin;
   MotionPathHelper = module.MotionPathHelper;
   MotionPathPlugin = module.MotionPathPlugin;
   Physics2DPlugin = module.Physics2DPlugin;
   PhysicsPropsPlugin = module.PhysicsPropsPlugin;
   PixiPlugin = module.PixiPlugin;
   ScrambleTextPlugin = module.ScrambleTextPlugin;
   ScrollToPlugin = module.ScrollToPlugin;
   ScrollTrigger = module.ScrollTrigger;
   SplitText = module.SplitText;
   TextPlugin = module.TextPlugin;

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(easingFuncs))
   {
      const name = `svelte-${prop}`;
      gsap.registerEase(name, easingFuncs[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

export {
   gsap,

   // Plugins
   CustomBounce,
   CustomEase,
   CustomWiggle,
   DrawSVGPlugin,
   EasePack,
   GSDevTools,
   InertiaPlugin,
   MorphSVGPlugin,
   MotionPathHelper,
   MotionPathPlugin,
   Physics2DPlugin,
   PhysicsPropsPlugin,
   PixiPlugin,
   ScrambleTextPlugin,
   ScrollToPlugin,
   ScrollTrigger,
   SplitText,
   TextPlugin
};
