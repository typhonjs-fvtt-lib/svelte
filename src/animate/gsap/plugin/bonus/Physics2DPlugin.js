import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const Physics2DPlugin = await gsapLoadPlugin('Physics2DPlugin');

gsap.registerPlugin(Physics2DPlugin);

export { Physics2DPlugin };
