import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const Observer = await gsapLoadPlugin('Observer');

gsap.registerPlugin(Observer);

export { Observer };
