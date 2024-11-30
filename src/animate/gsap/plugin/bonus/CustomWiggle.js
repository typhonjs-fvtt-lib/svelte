import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const CustomWiggle = await gsapLoadPlugin('CustomWiggle');

gsap.registerPlugin(CustomWiggle);

export { CustomWiggle };
