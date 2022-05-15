import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const DrawSVGPlugin = await gsapLoadPlugin('DrawSVGPlugin');

gsap.registerPlugin(DrawSVGPlugin);

export { DrawSVGPlugin };
