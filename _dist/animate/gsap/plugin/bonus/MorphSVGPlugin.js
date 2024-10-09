import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const MorphSVGPlugin = await gsapLoadPlugin('MorphSVGPlugin');

gsap.registerPlugin(MorphSVGPlugin);

export { MorphSVGPlugin };
