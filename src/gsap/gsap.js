import * as svelteEasingFunc from '#svelte/easing';

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
 * Provides a list of Gsap easing functions that are preconfigured and registered with `gsap`. `easingList`
 * is an index of all the function names that are available in the {@link easingFunc} object. Additionally, all Svelte
 * easing functions are loaded and prepended with `svelte-<function name>`.
 *
 * The easing list include:
 * - back.in(1)
 * - back.inOut(1)
 * - back.out(1)
 * - back.in(10)
 * - back.inOut(10)
 * - back.out(10)
 * - bounce.in
 * - bounce.inOut
 * - bounce.out
 * - circ.in
 * - circ.inOut
 * - circ.out
 * - elastic.in(1, 0.5)
 * - elastic.inOut(1, 0.5)
 * - elastic.out(1, 0.5)
 * - elastic.in(10, 5)
 * - elastic.inOut(10, 5)
 * - elastic.out(10, 5)
 * - expo.in
 * - expo.inOut
 * - expo.out
 * - linear // same as 'none'
 * - power1.in
 * - power1.inOut
 * - power1.out
 * - power2.in
 * - power2.inOut
 * - power2.out
 * - power3.in
 * - power3.inOut
 * - power3.out
 * - power4.in
 * - power4.inOut
 * - power4.out
 * - sine.in
 * - sine.inOut
 * - sine.out
 * - steps(10)
 * - steps(100)'
 * - svelte-backIn
 * - svelte-backInOut
 * - svelte-backOut
 * - svelte-bounceIn
 * - svelte-bounceInOut
 * - svelte-bounceOut
 * - svelte-circIn
 * - svelte-circInOut
 * - svelte-circOut
 * - svelte-cubicIn
 * - svelte-cubicInOut
 * - svelte-cubicOut
 * - svelte-elasticIn
 * - svelte-elasticInOut
 * - svelte-elasticOut
 * - svelte-expoIn
 * - svelte-expoInOut
 * - svelte-expoOut
 * - svelte-linear
 * - svelte-quadIn
 * - svelte-quadInOut
 * - svelte-quadOut
 * - svelte-quartIn
 * - svelte-quartInOut
 * - svelte-quartOut
 * - svelte-quintIn
 * - svelte-quintInOut
 * - svelte-quintOut
 * - svelte-sineIn
 * - svelte-sineInOut
 * - svelte-sineOut
 *
 * @type {string[]}
 */
const easingList = [
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
 * {@link easingList} is an index of all the function names that are available in the `easingFunc` object. You may
 * use these functions with Gsap or Svelte.
 *
 * @type {{ [key: string]: import('svelte/transition').EasingFunction }}
 */
const easingFunc = {};

try
{
   const module = await import(/* @vite-ignore */modulePath);
   gsap = module.gsap;

   for (const entry of easingList)
   {
      easingFunc[entry] = entry === 'linear' ? (t) => t : gsap.parseEase(entry);
   }

   // Load Svelte easing functions by prepending them w/ `svelte-`; `linear` becomes `svelte-linear`, etc.
   for (const prop of Object.keys(svelteEasingFunc))
   {
      const name = `svelte-${prop}`;
      easingList.push(name);
      easingFunc[name] = svelteEasingFunc[prop];
      gsap.registerEase(name, svelteEasingFunc[prop]);
   }
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

easingList.sort();

Object.freeze(easingFunc);
Object.freeze(easingList);

export { gsap, easingFunc, easingList };
