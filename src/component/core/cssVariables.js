import { StyleManager } from '@typhonjs-fvtt/svelte/util';

const s_STYLE_KEY = '#__trl-root-styles';

const cssVariables = new StyleManager({ docKey: s_STYLE_KEY, version: 1 });

export { cssVariables };
