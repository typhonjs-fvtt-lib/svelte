import * as easingFuncs from 'svelte/easing';

let gsap = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/index.js');

try
{
   const module = await import(modulePath);
   gsap = module.gsap;

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

export { gsap };
