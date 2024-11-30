import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const MotionPathPlugin = await gsapLoadPlugin('MotionPathPlugin');

gsap.registerPlugin(MotionPathPlugin);

export { MotionPathPlugin };
