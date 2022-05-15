import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const PixiPlugin = await gsapLoadPlugin('PixiPlugin');

gsap.registerPlugin(PixiPlugin);

export { PixiPlugin };
