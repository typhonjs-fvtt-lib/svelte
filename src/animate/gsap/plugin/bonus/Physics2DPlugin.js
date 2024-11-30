import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const Physics2DPlugin = await gsapLoadPlugin('Physics2DPlugin');

gsap.registerPlugin(Physics2DPlugin);

export { Physics2DPlugin };
