import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const ScrollTrigger = await gsapLoadPlugin('ScrollTrigger');

gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
