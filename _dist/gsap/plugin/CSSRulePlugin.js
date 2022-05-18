import { gsap, gsapLoadPlugin } from '@typhonjs-fvtt/svelte/gsap';

const CSSRulePlugin = await gsapLoadPlugin('CSSRulePlugin');

gsap.registerPlugin(CSSRulePlugin);

export { CSSRulePlugin };
