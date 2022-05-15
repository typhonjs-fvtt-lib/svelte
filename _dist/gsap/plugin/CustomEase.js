import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const CustomEase = await gsapLoadPlugin('CustomEase');

gsap.registerPlugin(CustomEase);

export { CustomEase };
