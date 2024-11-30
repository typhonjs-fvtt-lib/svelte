import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const ScrollToPlugin = await gsapLoadPlugin('ScrollToPlugin');

gsap.registerPlugin(ScrollToPlugin);

export { ScrollToPlugin };

