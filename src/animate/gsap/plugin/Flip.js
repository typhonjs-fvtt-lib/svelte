import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const Flip = await gsapLoadPlugin('Flip');

gsap.registerPlugin(Flip);

export { Flip };
