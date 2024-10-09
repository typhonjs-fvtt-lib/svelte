import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const TextPlugin = await gsapLoadPlugin('TextPlugin');

gsap.registerPlugin(TextPlugin);

export { TextPlugin };
