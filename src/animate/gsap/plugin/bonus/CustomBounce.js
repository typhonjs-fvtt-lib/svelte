import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const CustomBounce = await gsapLoadPlugin('CustomBounce');

gsap.registerPlugin(CustomBounce);

export { CustomBounce };
