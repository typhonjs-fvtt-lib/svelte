import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const EasePack = await gsapLoadPlugin('EasePack');

gsap.registerPlugin(EasePack);

export { EasePack };
