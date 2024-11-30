import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const TextPlugin = await gsapLoadPlugin('TextPlugin');

gsap.registerPlugin(TextPlugin);

export { TextPlugin };
