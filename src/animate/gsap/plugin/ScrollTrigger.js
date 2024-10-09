import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const ScrollTrigger = await gsapLoadPlugin('ScrollTrigger');

gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
