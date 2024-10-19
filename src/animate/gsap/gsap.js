import { easingFunc } from '#runtime/svelte/easing';

/**
 * The main GSAP object.
 *
 * @see https://greensock.com/docs/v3/GSAP
 */
let gsap = void 0;

/**
 * Note usage of `globalThis.location.origin` as this is the origin of the importing location which is necessary for
 * connecting to the Foundry server when the package is located on a CDN.
 *
 * @type {string}
 */
const modulePath = `${globalThis.location.origin}${foundry.utils.getRoute(`/scripts/greensock/esm/index.js`)}`;

/**
 * Provides a list of Gsap easing functions that are preconfigured and registered with `gsap`. `gsapEasingList`
 * is an index of all the function names that are available in the {@link gsapEasingFunc} object. Additionally, all
 * Svelte easing functions are loaded and prepended with `svelte-<function name>`.
 *
 * @type {ReadonlyArray<import('./types').GsapEasingFunctionName>}
 */
const gsapEasingList = [
   'back.in(1)',
   'back.inOut(1)',
   'back.out(1)',
   'back.in(10)',
   'back.inOut(10)',
   'back.out(10)',
   'bounce.in',
   'bounce.inOut',
   'bounce.out',
   'circ.in',
   'circ.inOut',
   'circ.out',
   'elastic.in(1, 0.5)',
   'elastic.inOut(1, 0.5)',
   'elastic.out(1, 0.5)',
   'elastic.in(10, 5)',
   'elastic.inOut(10, 5)',
   'elastic.out(10, 5)',
   'expo.in',
   'expo.inOut',
   'expo.out',
   'linear', // same as 'none'
   'power1.in',
   'power1.inOut',
   'power1.out',
   'power2.in',
   'power2.inOut',
   'power2.out',
   'power3.in',
   'power3.inOut',
   'power3.out',
   'power4.in',
   'power4.inOut',
   'power4.out',
   'sine.in',
   'sine.inOut',
   'sine.out',
   'steps(10)',
   'steps(100)'
];

/**
 * Provides an object of Gsap and Svelte easing functions that are preconfigured and registered with `gsap`.
 * {@link gsapEasingList} is an index of all the function names that are available in the `gsapEasingFunc` object. You may
 * use these functions with Gsap or Svelte.
 *
 * @type {Readonly<{ [key in import('./types').GsapEasingFunctionName]: import('#runtime/svelte/easing').EasingFunction }>}
 */
const gsapEasingFunc = {};

try
{
   const module = await import(/* @vite-ignore */modulePath);
   gsap = module.gsap;

   for (const entry of gsapEasingList)
   {
      gsapEasingFunc[entry] = entry === 'linear' ? (t) => t : gsap.parseEase(entry);
   }

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(easingFunc))
   {
      const name = `svelte-${prop}`;
      gsapEasingList.push(name);
      gsapEasingFunc[name] = easingFunc[prop];
      gsap.registerEase(name, easingFunc[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

gsapEasingList.sort();

Object.freeze(gsapEasingFunc);
Object.freeze(gsapEasingList);

/**
 * Performs a lookup for standard Gsap easing functions by name. All Svelte easing functions are also available by
 * prepending `svelte-<EASE_NAME>`. For convenience if passing in a function it is returned verbatim.
 *
 * @param {import('./types').GsapEasingReference} easingRef - The name of a standard GSAP easing function or an
 *        existing supplied easing function.
 *
 * @param {object}   [options] - Optional parameters.
 *
 * @param {import('./types').GsapEasingFunctionName | false} [options.default='linear'] - The default easing function
 *        name to apply. When specified as `false` no default fallback easing function is selected.
 *
 * @returns {import('#runtime/svelte/easing').EasingFunction} The requested easing function.
 */
function getGsapEasingFunc(easingRef, options)
{
   if (typeof easingRef === 'function') { return easingRef; }

   const easingFn = gsapEasingFunc[easingRef];

   return easingFn ? easingFn : gsapEasingFunc[options?.default ?? 'linear'];
}


export { getGsapEasingFunc, gsap, gsapEasingFunc, gsapEasingList };
