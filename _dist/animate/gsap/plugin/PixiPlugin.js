import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const PixiPlugin = await gsapLoadPlugin('PixiPlugin');

gsap.registerPlugin(PixiPlugin);

export { PixiPlugin };
