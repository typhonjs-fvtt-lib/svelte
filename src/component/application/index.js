import {
   StyleParse,
   TJSStyleManager }                         from '#runtime/util/dom/style';

import { getRoutePrefix }                    from '#runtime/util/path';

export { default as ApplicationShell }       from './ApplicationShell.svelte';
export { default as EmptyApplicationShell }  from './EmptyApplicationShell.svelte';
export { default as TJSApplicationShell }    from './TJSApplicationShell.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

import { cursorCSSVariables }                from './data';

const styleManager = TJSStyleManager.create({
   id: '__tjs-runtime-vars',
   version: '0.1.0',
   layerName: 'variables.tjs-runtime-vars',
   rules: {
      themeDark: ':root, .themed.theme-dark',
      themeLight: '.themed.theme-light'
   }
});

if (styleManager?.isConnected)
{
   // Remove `0.2.x` and below root styles. -- TODO: REMOVE AT `0.5.0`
   document?.['#__trl-root-styles']?.remove?.();

   const themeDark = styleManager.get('themeDark');
   const themeLight = styleManager.get('themeLight');

   // On `ready` hook evaluate top level `<html>` element for core inline style overrides.
   Hooks.once('ready', () => setCoreInlineStyles(themeDark));

   // Set all default TJS cursor CSS variables.
   themeDark.setProperties(cursorCSSVariables);

   /**
    * Provides default CSS variables for core components.
    */
   themeDark.setProperties({
      // `:root` properties applying to all themes -------------------------------------------------------------------

      // For `TJSApplicationShell.svelte` app background.
      '--tjs-app-background': `url("${getRoutePrefix('/ui/denim075.png')}")`,

      // For `ResizeHandle.svelte` / the resize handle.
      '--tjs-app-resize-handle-background':
       `transparent url("${getRoutePrefix('/ui/resize-handle.webp')}") no-repeat center / contain`,

      '--tjs-app-font-size': '0.875rem',              // --font-size-14 defined on `body`
      '--tjs-app-header-font-size': '0.8125rem',      // --font-size-13 defined on `body`
      '--tjs-app-header-button-size': '1.5rem',       // defined by --buttons size on .application .window-header button.header-control
      '--tjs-app-header-button-background': 'none',
      '--tjs-app-header-button-color': '#f7f3e8',     //  --color-light-1 defined on 'body'

      // Explicit dark theme properties ------------------------------------------------------------------------------

      // For `ApplicationShell.svelte` / `EmptyApplicationShell.svelte`.
      '--tjs-app-header-background': 'var(--color-header-background)',

      // For `ResizeHandle.svelte` / invert the resize handle.
      '--tjs-app-resize-handle-filter': 'invert(1)'
   }, false);

   /*
   --button-text-color: var(--color-light-1);
    --button-background-color: none;
    --button-size: 1.5rem;
    */

   /**
    * Explicit light theme properties.
    */
   themeLight.setProperties({
      // For `ApplicationShell.svelte` / `EmptyApplicationShell.svelte`.
      '--tjs-app-header-background': 'var(--color-header-background)',

      // For `ResizeHandle.svelte` / cancel invert of the resize handle.
      '--tjs-app-resize-handle-filter': 'none'
   });
}

/**
 * Sets any top level inline styles to TRL CSS variables defined in root `<html>` element by Foundry or game system
 * override.
 *
 * @param {import('#runtime/util/dom/style').CSSRuleManager}   ruleManager - Target rule manager.
 */
function setCoreInlineStyles(ruleManager)
{
   const htmlStyles = StyleParse.cssText(document.documentElement.style.cssText);

   for (const key in htmlStyles)
   {
      // Copy over any `--cursor` CSS vars to TRL cursor vars.
      if (key.startsWith('--cursor-'))
      {
         const tjsCursorKey = key.replace(/^--cursor-/, '--tjs-cursor-');

         if (ruleManager.hasProperty(tjsCursorKey)) { ruleManager.setProperty(tjsCursorKey, htmlStyles[key]); }
      }
   }
}

