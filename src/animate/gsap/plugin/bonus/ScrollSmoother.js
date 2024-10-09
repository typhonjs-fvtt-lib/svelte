import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const ScrollSmoother = await gsapLoadPlugin('ScrollSmoother');

gsap.registerPlugin(ScrollSmoother);

export { ScrollSmoother };
