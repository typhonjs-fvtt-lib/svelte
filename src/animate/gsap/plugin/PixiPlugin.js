import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const PixiPlugin = await gsapLoadPlugin('PixiPlugin');

gsap.registerPlugin(PixiPlugin);

export { PixiPlugin };
