import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/animate/gsap';

const CSSRulePlugin = await gsapLoadPlugin('CSSRulePlugin');

gsap.registerPlugin(CSSRulePlugin);

export { CSSRulePlugin };
