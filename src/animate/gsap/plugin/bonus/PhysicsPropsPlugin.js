import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const PhysicsPropsPlugin = await gsapLoadPlugin('PhysicsPropsPlugin');

gsap.registerPlugin(PhysicsPropsPlugin);

export { PhysicsPropsPlugin };
