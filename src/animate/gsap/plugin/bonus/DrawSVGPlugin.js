import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const DrawSVGPlugin = await gsapLoadPlugin('DrawSVGPlugin');

gsap.registerPlugin(DrawSVGPlugin);

export { DrawSVGPlugin };
