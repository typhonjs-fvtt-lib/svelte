import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const ScrambleTextPlugin = await gsapLoadPlugin('ScrambleTextPlugin');

gsap.registerPlugin(ScrambleTextPlugin);

export { ScrambleTextPlugin };
