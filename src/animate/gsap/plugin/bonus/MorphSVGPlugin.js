import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const MorphSVGPlugin = await gsapLoadPlugin('MorphSVGPlugin');

gsap.registerPlugin(MorphSVGPlugin);

export { MorphSVGPlugin };
