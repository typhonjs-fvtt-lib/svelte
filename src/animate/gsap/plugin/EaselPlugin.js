import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const EaselPlugin = await gsapLoadPlugin('EaselPlugin');

gsap.registerPlugin(EaselPlugin);

export { EaselPlugin };
