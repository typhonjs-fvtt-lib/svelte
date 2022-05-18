import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const Draggable = await gsapLoadPlugin('Draggable'); // eslint-disable-line no-shadow

gsap.registerPlugin(Draggable);

export { Draggable };
