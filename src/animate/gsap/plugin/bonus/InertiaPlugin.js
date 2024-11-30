import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const InertiaPlugin = await gsapLoadPlugin('InertiaPlugin');

gsap.registerPlugin(InertiaPlugin);

export { InertiaPlugin };
