import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const PhysicsPropsPlugin = await gsapLoadPlugin('PhysicsPropsPlugin');

gsap.registerPlugin(PhysicsPropsPlugin);

export { PhysicsPropsPlugin };
