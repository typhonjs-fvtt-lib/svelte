import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const MorphSVGPlugin = await gsapLoadPlugin('MorphSVGPlugin');

gsap.registerPlugin(MorphSVGPlugin);

export { MorphSVGPlugin };
