import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const EasePack = await gsapLoadPlugin('EasePack');

gsap.registerPlugin(EasePack);

export { EasePack };
