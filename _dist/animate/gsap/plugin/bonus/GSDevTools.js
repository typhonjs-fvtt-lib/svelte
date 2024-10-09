import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const GSDevTools = await gsapLoadPlugin('GSDevTools');

gsap.registerPlugin(GSDevTools);

export { GSDevTools };
