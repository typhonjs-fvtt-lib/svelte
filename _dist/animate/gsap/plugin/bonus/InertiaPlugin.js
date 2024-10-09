import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const InertiaPlugin = await gsapLoadPlugin('InertiaPlugin');

gsap.registerPlugin(InertiaPlugin);

export { InertiaPlugin };
