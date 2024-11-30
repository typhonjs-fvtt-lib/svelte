import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const GSDevTools = await gsapLoadPlugin('GSDevTools');

gsap.registerPlugin(GSDevTools);

export { GSDevTools };
