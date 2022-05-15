import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const Observer = await gsapLoadPlugin('Observer');

gsap.registerPlugin(Observer);

export { Observer };
