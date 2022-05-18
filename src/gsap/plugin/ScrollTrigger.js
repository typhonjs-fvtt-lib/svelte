import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const ScrollTrigger = await gsapLoadPlugin('ScrollTrigger');

gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
