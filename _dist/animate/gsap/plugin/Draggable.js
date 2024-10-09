import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const Draggable = await gsapLoadPlugin('Draggable'); // eslint-disable-line no-shadow

gsap.registerPlugin(Draggable);

export { Draggable };
