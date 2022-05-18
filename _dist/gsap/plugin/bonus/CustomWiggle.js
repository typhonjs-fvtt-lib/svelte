import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const CustomWiggle = await gsapLoadPlugin('CustomWiggle');

gsap.registerPlugin(CustomWiggle);

export { CustomWiggle };
