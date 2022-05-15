import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const Flip = await gsapLoadPlugin('Flip');

gsap.registerPlugin(Flip);

export { Flip };
