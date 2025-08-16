import { FoundryStyles }      from '#svelte-fvtt/application';

import {
   StyleParse,
   StyleManager }             from '#runtime/util/dom/style';

import { getRoutePrefix }     from '#runtime/util/path';

import { cursorCSSVariables } from './data';

/**
 * Provides global CSS variable configuration based on Foundry styles loaded.
 */
export class FVTTConfigure
{
   static #initialized = false;

   static initialize()
   {
      if (this.#initialized) { return; }

      const manager = StyleManager.create({
         id: '__tjs-runtime-vars',
         version: '0.1.0',
         layerName: 'variables.tjs-runtime-vars',
         rules: {
            themeDark: 'body, .themed.theme-dark',
            themeLight: '.themed.theme-light'
         }
      });

      // Early out if the style manager version is outdated.
      if (!manager?.isConnected)
      {
         this.#initialized = true;
         return;
      }

      this.#initialized = true;

      // Remove `0.2.x` and below root styles. -- TODO: REMOVE AT `0.5.0`
      document?.['#__trl-root-styles']?.remove?.();

      const themeDarkRoot = manager.get('themeDark');
      const themeLight = manager.get('themeLight');

      // On `ready` hook evaluate top level `<html>` element for core inline style overrides.
      Hooks.once('ready', () => this.#setCoreInlineStyles(themeDarkRoot));

      // Set all default TJS cursor CSS variables.
      themeDarkRoot.setProperties(cursorCSSVariables);

      const opts = { camelCase: true };

      {
         // Core does not distinguish between dark / light themes.
         const propsApp = FoundryStyles.ext.get('.application', opts);
         const propsAppHeader = FoundryStyles.ext.get('.application .window-header', opts);
         const propsAppHeaderBtn = FoundryStyles.ext.get('.application .window-header button.header-control', opts);
         const propsAppHandle = FoundryStyles.ext.get('.application .window-resize-handle', opts);

         const propsAppHandleDark = FoundryStyles.ext.get('.themed.theme-dark.application .window-resize-handle', opts);

         /**
          * Provides default CSS variables for core components.
          */
         themeDarkRoot.setProperties({
            // `:root` properties applying to all themes -------------------------------------------------------------------

            // For `TJSApplicationShell.svelte` app background.
            '--tjs-app-background': `url("${getRoutePrefix('/ui/denim075.png')}")`,

            // For `ResizeHandle.svelte` / the resize handle.
            '--tjs-app-resize-handle-background': propsAppHandle.background ?? 'BAD',

            // '--tjs-app-resize-handle-background': propsAppHandle.background ??
            //  `transparent url("${getRoutePrefix('/ui/resize-handle.webp')}") no-repeat center / contain`,

            '--tjs-app-resize-handle-inset': propsAppHandle.inset ?? 'auto 1px 1px auto',
            '--tjs-app-resize-handle-position': propsAppHandle.position ?? 'absolute',
            '--tjs-app-resize-handle-height': propsAppHandle.height ?? '11x',
            '--tjs-app-resize-handle-width': propsAppHandle.width ?? '11px',

            '--tjs-app-font-size': propsApp.fontSize ?? 'var(--font-size-14)',
            '--tjs-app-header-font-size': propsAppHeader.fontSize ?? 'var(--font-size-13)',

            // For `TJSHeaderButton.svelte / core only provides one set of properties across themes.
            '--tjs-app-header-button-size': propsAppHeaderBtn['--button-size'] ?? '1.5rem',
            '--tjs-app-header-button-color': propsAppHeaderBtn['--button-text-color'] ?? 'var(--color-light-1)',

            // Explicit dark theme properties ------------------------------------------------------------------------------

            // For `ApplicationShell.svelte`.
            '--tjs-app-header-background': propsAppHeader.background ?? 'var(--color-header-background)',

            // For `ResizeHandle.svelte` / invert the resize handle.
            '--tjs-app-resize-handle-filter': propsAppHandleDark.filter ?? 'invert(1)'
         });
      }

      {
         const propsAppHeader = FoundryStyles.ext.get('.application .window-header', {
            camelCase: true,
            resolve: 'body.theme-light .application'
         });

         // const propsAppLight = FoundryStyles.ext.get('body.theme-light .application', opts);

         /**
          * Explicit light theme properties.
          */
         themeLight.setProperties({
            // For `ApplicationShell.svelte` / `EmptyApplicationShell.svelte`.
            '--tjs-app-header-background': propsAppHeader.background ?? 'blue', // 'var(--color-dark-3)',

            // For `ResizeHandle.svelte` / cancel invert of the resize handle / there is no style to set.
            '--tjs-app-resize-handle-filter': 'none'
         });
      }
   }

   /**
    * Sets any top level inline styles to TRL CSS variables defined in root `<html>` element by Foundry or game system
    * override.
    *
    * @param {import('#runtime/util/dom/style').StyleManager.RuleManager}   ruleManager - Target rule manager.
    */
   static #setCoreInlineStyles(ruleManager)
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
}
