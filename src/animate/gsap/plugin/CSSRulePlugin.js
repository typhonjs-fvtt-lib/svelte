import { gsap, gsapLoadPlugin } from '#svelte-fvtt/animate/gsap';

const CSSRulePlugin = await gsapLoadPlugin('CSSRulePlugin');

gsap.registerPlugin(CSSRulePlugin);

export { CSSRulePlugin };
