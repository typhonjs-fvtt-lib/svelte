import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const CustomBounce = await gsapLoadPlugin('CustomBounce');

gsap.registerPlugin(CustomBounce);

export { CustomBounce };
