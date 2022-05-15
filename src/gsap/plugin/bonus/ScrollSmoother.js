import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const ScrollSmoother = await gsapLoadPlugin('ScrollSmoother');

gsap.registerPlugin(ScrollSmoother);

export { ScrollSmoother };
