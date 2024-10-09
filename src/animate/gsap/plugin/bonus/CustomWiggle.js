import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const CustomWiggle = await gsapLoadPlugin('CustomWiggle');

gsap.registerPlugin(CustomWiggle);

export { CustomWiggle };
