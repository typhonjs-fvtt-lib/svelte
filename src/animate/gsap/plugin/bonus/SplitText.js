import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const SplitText = await gsapLoadPlugin('SplitText');

gsap.registerPlugin(SplitText);

export { SplitText };
