import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const MotionPathHelper = await gsapLoadPlugin('MotionPathHelper');

gsap.registerPlugin(MotionPathHelper);

export { MotionPathHelper };
