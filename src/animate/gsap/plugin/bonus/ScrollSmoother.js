import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const ScrollSmoother = await gsapLoadPlugin('ScrollSmoother');

gsap.registerPlugin(ScrollSmoother);

export { ScrollSmoother };
