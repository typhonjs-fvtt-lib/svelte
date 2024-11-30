import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const CustomEase = await gsapLoadPlugin('CustomEase');

gsap.registerPlugin(CustomEase);

export { CustomEase };
