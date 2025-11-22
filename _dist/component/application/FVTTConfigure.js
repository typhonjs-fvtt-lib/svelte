import { FoundryStyles }      from '@typhonjs-fvtt/svelte/application';

import {
   StyleParse,
   StyleManager,
   StyleMetric }              from '@typhonjs-svelte/runtime-base/util/dom/style';

import { getRoutePrefix }     from '@typhonjs-svelte/runtime-base/util/path';

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
         version: '0.1.2',
         layerName: 'variables.tjs-runtime-vars',
         rules: {
            themeDark: 'body, .themed.theme-dark',
            themeLight: '.themed.theme-light',
            contentVars: '.tjs-content-vars'
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
      const contentVars = manager.get('contentVars');

      // On `ready` hook evaluate top level `<html>` element for core inline style overrides.
      Hooks.once('ready', () => this.#setCoreInlineStyles(themeDarkRoot));

      // Set all default TJS cursor CSS variables.
      themeDarkRoot.setProperties(cursorCSSVariables);

      // Configure app CSS variables.
      this.#app(themeDarkRoot, themeLight);

      // Configure content CSS variables.
      this.#contentVars(contentVars);

      Hooks.on('PopOut:loading', (app, popout) =>
      {
         // Clone and load the `runtime` library CSS variables into the new window document regardless of the app type.
         popout.document.addEventListener('DOMContentLoaded',
          () => manager.clone({ document: popout.document, force: true }));
      });
   }

   /**
    * @param {import('@typhonjs-svelte/runtime-base/util/dom/style').StyleManager.RuleManager}  themeDarkRoot -
    *
    * @param {import('@typhonjs-svelte/runtime-base/util/dom/style').StyleManager.RuleManager}  themeLight -
    */
   static #app(themeDarkRoot, themeLight)
   {
      const opts = { camelCase: true };

      // Core does not distinguish between dark / light themes.
      const propsApp = FoundryStyles.ext.get('.application', opts);
      const propsAppDark = FoundryStyles.ext.get('.application', { ...opts, resolve: [
       '.themed.theme-dark .application'] });

      const propsAppHeader = FoundryStyles.ext.get('.application .window-header', { ...opts, resolve: [
       '.application', '.themed.theme-dark .application'] });

      const propsAppHeaderBtn = FoundryStyles.ext.get('.application .window-header button.header-control', opts);
      const propsAppHandle = FoundryStyles.ext.get('.application .window-resize-handle', opts);

      const propsAppHandleDark = FoundryStyles.ext.get('.themed.theme-dark.application .window-resize-handle', opts);

      const propsBody = FoundryStyles.ext.get('body', opts);

      /**
       * Provides default CSS variables for core components.
       */
      themeDarkRoot.setProperties({
         // `:root` properties applying to all themes ----------------------------------------------------------------

         // For `TJSApplicationShell.svelte` app background.
         '--tjs-app-background': `url(${getRoutePrefix('/ui/denim075.png')})`,
         '--tjs-app-color': propsApp?.color ?? 'var(--color-text-primary)',
         '--tjs-app-font-family': propsBody?.fontFamily ?? 'var(--font-body)',
         '--tjs-app-font-size': propsApp?.fontSize ?? 'var(--font-size-14)',

         // For `TJSApplicationHeader.svelte`
         '--tjs-app-header-flex': propsAppHeader?.flex ?? '0 0 var(--header-height)',
         '--tjs-app-header-font-size': propsAppHeader?.fontSize ?? 'var(--font-size-13)',
         '--tjs-app-header-height': propsApp?.['--header-height'] ?? '36px',

         // For `TJSHeaderButton.svelte / core only provides one set of properties across themes.
         '--tjs-app-header-button-border': propsAppHeaderBtn?.border ?? 'none',
         '--tjs-app-header-button-margin': propsAppHeaderBtn?.margin ?? '0',
         '--tjs-app-header-button-size': propsAppHeaderBtn?.['--button-size'] ?? '1.5rem',
         '--tjs-app-header-button-color': propsAppHeaderBtn?.['--button-text-color'] ?? 'var(--color-light-1)',

         // For `ResizeHandle.svelte` / the resize handle.
         '--tjs-app-resize-handle-background': propsAppHandle?.background ??
          `url(${getRoutePrefix('/ui/resize-handle.webp')}) center center / contain no-repeat transparent`,

         '--tjs-app-resize-handle-inset': propsAppHandle?.inset ?? 'auto 1px 1px auto',
         '--tjs-app-resize-handle-position': propsAppHandle?.position ?? 'absolute',
         '--tjs-app-resize-handle-height': propsAppHandle?.height ?? '11x',
         '--tjs-app-resize-handle-width': propsAppHandle?.width ?? '11px',

         // Explicit dark theme properties ---------------------------------------------------------------------------

         // For `TJSApplicationShell.svelte`.
         '--tjs-app-border': propsAppDark?.border ?? '1px solid var(--color-cool-4)',

         // For `TJSApplicationHeader.svelte
         '--tjs-app-header-background': propsAppHeader?.background ?? 'rgba(0, 0, 0, 0.5)',
         '--tjs-app-header-border-bottom': propsAppHeader?.borderBottom ?? '1px solid var(--color-cool-4)',
         '--tjs-app-header-color': propsAppHeader?.color ?? 'var(--color-light-1)',

         // For `ResizeHandle.svelte` / invert the resize handle.
         '--tjs-app-resize-handle-filter': propsAppHandleDark?.filter ?? 'invert(1)'
      });

      const propsAppLight = FoundryStyles.ext.get('.application', {
         camelCase: true,
         resolve: 'body.theme-light .application'
      });

      const propsAppHeaderLight = FoundryStyles.ext.get('.application .window-header', {
         camelCase: true,
         resolve: 'body.theme-light .application'
      });

      /**
       * Explicit light theme properties.
       */
      themeLight.setProperties({
         // For `TJSApplicationShell.svelte`.
         '--tjs-app-border': propsAppLight?.border ?? '1px solid var(--color-cool-4)',

         // For `TJSApplicationHeader.svelte`
         '--tjs-app-header-background': propsAppHeaderLight?.background ?? 'var(--color-dark-3)',
         '--tjs-app-header-border-bottom': propsAppHeaderLight?.borderBottom ?? '1px solid green', // '1px solid var(--color-cool-4)',

         // For `ResizeHandle.svelte` / cancel invert of the resize handle / there is no core style to set.
         '--tjs-app-resize-handle-filter': 'none'
      });
   }

   /**
    * @param {import('@typhonjs-svelte/runtime-base/util/dom/style').StyleManager.RuleManager}  contentVars -
    */
   static #contentVars(contentVars)
   {
      const scrollbarWidth = `${StyleMetric.getScrollbarWidth()}px`;

      /**
       * Assign all TyphonJS content vars
       */
      contentVars.setProperties({
         // Default element scrollbar width.
         '--_tjs-default-scrollbar-width': scrollbarWidth,

         '--_tjs-content-padding-length': 'var(--tjs-content-padding-length, 1rem)',
         '--_tjs-content-padding-length-half': 'calc(var(--_tjs-content-padding-length) / 2)',

         '--_tjs-content-padding-top': 'var(--tjs-content-padding-top, var(--_tjs-content-padding-length))',
         '--_tjs-content-padding-right': 'var(--tjs-content-padding-right, var(--_tjs-content-padding-length))',
         '--_tjs-content-padding-bottom': 'var(--tjs-content-padding-bottom, var(--_tjs-content-padding-length))',
         '--_tjs-content-padding-left': 'var(--tjs-content-padding-left, var(--_tjs-content-padding-length))',

         // Complete basic content padding for all sides.
         '--tjs-content-padding': 'var(--_tjs-content-padding-top) var(--_tjs-content-padding-right) var(--_tjs-content-padding-bottom) var(--_tjs-content-padding-left)',
         '--tjs-content-padding-half': 'calc(var(--_tjs-content-padding-top) / 2) calc(var(--_tjs-content-padding-right) / 2) calc(var(--_tjs-content-padding-bottom) / 2) calc(var(--_tjs-content-padding-left) / 2)',

         // Inline left / right basic content padding.
         '--tjs-content-padding-inline': '0 var(--_tjs-content-padding-right) 0 var(--_tjs-content-padding-left)',
         '--tjs-content-padding-inline-half': '0 calc(var(--_tjs-content-padding-right) / 2) 0 calc(var(--_tjs-content-padding-left) / 2)',

         // Complete content padding for all sides with adjustments to right padding for `scrollbar-gutter: stable`.
         '--tjs-scrollbar-gutter-stable-padding': `var(--_tjs-content-padding-top) calc(max(calc(${scrollbarWidth} + 0.25rem), var(--_tjs-content-padding-right)) - ${scrollbarWidth}) var(--_tjs-content-padding-bottom) var(--_tjs-content-padding-left)`,
         '--tjs-scrollbar-gutter-stable-padding-half': `calc(var(--_tjs-content-padding-top) / 2) calc(max(calc(${scrollbarWidth} + 0.25rem), calc(var(--_tjs-content-padding-right) / 2)) - ${scrollbarWidth}) calc(var(--_tjs-content-padding-bottom) / 2) calc(var(--_tjs-content-padding-left) / 2)`,

         // Inline left / right padding taking into consideration `scrollbar-gutter: stable`.
         '--tjs-scrollbar-gutter-stable-padding-inline': `0 calc(max(calc(${scrollbarWidth} + 0.25rem), var(--_tjs-content-padding-right)) - ${scrollbarWidth}) 0 var(--_tjs-content-padding-left)`,
         '--tjs-scrollbar-gutter-stable-padding-inline-half': `0 calc(max(calc(${scrollbarWidth} + 0.25rem), calc(var(--_tjs-content-padding-right) / 2)) - ${scrollbarWidth}) 0 calc(var(--_tjs-content-padding-left) / 2)`,

         // Right padding taking into consideration `scrollbar-gutter: stable`.
         '--tjs-scrollbar-gutter-stable-padding-right': `0 calc(max(calc(${scrollbarWidth} + 0.25rem), var(--_tjs-content-padding-right)) - ${scrollbarWidth}) 0 0`,
         '--tjs-scrollbar-gutter-stable-padding-right-half': `0 calc(max(calc(${scrollbarWidth} + 0.25rem), calc(var(--_tjs-content-padding-right) / 2)) - ${scrollbarWidth}) 0 0`,
      });
   }

   /**
    * Sets any top level inline styles to TRL CSS variables defined in root `<html>` element by Foundry or game system
    * override.
    *
    * @param {import('@typhonjs-svelte/runtime-base/util/dom/style').StyleManager.RuleManager}   ruleManager - Target rule manager.
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
