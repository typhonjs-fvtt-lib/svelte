import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const ScrambleTextPlugin = await gsapLoadPlugin('ScrambleTextPlugin');

gsap.registerPlugin(ScrambleTextPlugin);

export { ScrambleTextPlugin };
