import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const Draggable = await gsapLoadPlugin('Draggable'); // eslint-disable-line no-shadow

gsap.registerPlugin(Draggable);

export { Draggable };
