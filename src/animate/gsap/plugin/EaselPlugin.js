import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const EaselPlugin = await gsapLoadPlugin('EaselPlugin');

gsap.registerPlugin(EaselPlugin);

export { EaselPlugin };
