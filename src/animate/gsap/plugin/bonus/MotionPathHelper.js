import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const MotionPathHelper = await gsapLoadPlugin('MotionPathHelper');

gsap.registerPlugin(MotionPathHelper);

export { MotionPathHelper };
