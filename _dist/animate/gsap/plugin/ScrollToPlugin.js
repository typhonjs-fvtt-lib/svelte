import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const ScrollToPlugin = await gsapLoadPlugin('ScrollToPlugin');

gsap.registerPlugin(ScrollToPlugin);

export { ScrollToPlugin };

