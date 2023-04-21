import { TJSStyleManager } from '@typhonjs-fvtt/svelte/util';

const s_STYLE_KEY = '#__trl-root-styles';

const cssVariables = new TJSStyleManager({ docKey: s_STYLE_KEY, version: 1 });

export { cssVariables };
