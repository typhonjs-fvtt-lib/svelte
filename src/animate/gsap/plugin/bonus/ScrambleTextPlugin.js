import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const ScrambleTextPlugin = await gsapLoadPlugin('ScrambleTextPlugin');

gsap.registerPlugin(ScrambleTextPlugin);

export { ScrambleTextPlugin };
