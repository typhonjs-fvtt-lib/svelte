import type { EasingFunction } from '#runtime/svelte/easing';

/**
 * Defines all the standard 1-dimensional Gsap easing function names.
 */
type GsapEasingFunctionName = 'back.in(1)' | 'back.inOut(1)' | 'back.out(1)' | 'back.in(10)' | 'back.inOut(10)' |
 'back.out(10)' | 'bounce.in' | 'bounce.inOut' | 'bounce.out' | 'circ.in' | 'circ.inOut' | 'circ.out' |
 'elastic.in(1, 0.5)' | 'elastic.inOut(1, 0.5)' | 'elastic.out(1, 0.5)' | 'elastic.in(10, 5)' |
 'elastic.inOut(10, 5)' | 'elastic.out(10, 5)' | 'expo.in' | 'expo.inOut' | 'expo.out' | 'linear' | 'power1.in' |
 'power1.inOut' | 'power1.out' | 'power2.in' | 'power2.inOut' | 'power2.out' | 'power3.in' | 'power3.inOut' |
 'power3.out' | 'power4.in' | 'power4.inOut' | 'power4.out' | 'sine.in' | 'sine.inOut' | 'sine.out' | 'steps(10)' |
 'steps(100)' | 'svelte-backIn' | 'svelte-backInOut' | 'svelte-backOut' | 'svelte-bounceIn' | 'svelte-bounceInOut' |
 'svelte-bounceOut' | 'svelte-circIn' | 'svelte-circInOut' | 'svelte-circOut' | 'svelte-cubicIn' | 'svelte-cubicInOut' |
 'svelte-cubicOut' | 'svelte-elasticIn' | 'svelte-elasticInOut' | 'svelte-elasticOut' | 'svelte-expoIn' |
 'svelte-expoInOut' | 'svelte-expoOut' | 'svelte-linear' | 'svelte-quadIn' | 'svelte-quadInOut' | 'svelte-quadOut' |
 'svelte-quartIn' | 'svelte-quartInOut' | 'svelte-quartOut' | 'svelte-quintIn' | 'svelte-quintInOut' |
 'svelte-quintOut' | 'svelte-sineIn' | 'svelte-sineInOut' | 'svelte-sineOut';

/**
 * Defines an easing input as either a predefined GSAP easing function name or a custom easing function.
 */
type GsapEasingReference = GsapEasingFunctionName | EasingFunction;

export {
   GsapEasingFunctionName,
   GsapEasingReference
};
