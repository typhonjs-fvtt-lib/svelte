import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const Flip = await gsapLoadPlugin('Flip');

gsap.registerPlugin(Flip);

export { Flip };
