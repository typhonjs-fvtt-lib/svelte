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

      // Configure app CSS variables.
      this.#app(themeDarkRoot, themeLight);

      Hooks.on('PopOut:loading', (app, popout) =>
      {
         // Clone and load the `runtime` library CSS variables into the new window document regardless of the app type.
         popout.document.addEventListener('DOMContentLoaded',
            () => manager.clone({ document: popout.document, force: true }));
      });
   }

   /**
    * @param {import('#runtime/util/dom/style').StyleManager.RuleManager}  themeDarkRoot -
    *
    * @param {import('#runtime/util/dom/style').StyleManager.RuleManager}  themeLight -
    */
   static #app(themeDarkRoot, themeLight)
   {
      const opts = { camelCase: true };

      // Core does not distinguish between dark / light themes.
      const propsApp = FoundryStyles.ext.get('.application', opts);

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
         '--tjs-app-font-family': propsBody?.fontFamily ?? 'var(--font-body)',
         '--tjs-app-font-size': propsApp?.fontSize ?? 'var(--font-size-14)',

         '--tjs-app-header-flex': propsAppHeader?.flex ?? '0 0 var(--header-height)',
         '--tjs-app-header-font-size': propsAppHeader?.fontSize ?? 'var(--font-size-13)',

         // For `TJSHeaderButton.svelte / core only provides one set of properties across themes.
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

         // For `TJSApplicationHeader.svelte
         '--tjs-app-header-background': propsAppHeader?.background ?? 'rgba(0, 0, 0, 0.5)',

         // For `ResizeHandle.svelte` / invert the resize handle.
         '--tjs-app-resize-handle-filter': propsAppHandleDark?.filter ?? 'invert(1)'
      });

      const propsAppHeaderLight = FoundryStyles.ext.get('.application .window-header', {
         camelCase: true,
         resolve: 'body.theme-light .application'
      });

      /**
       * Explicit light theme properties.
       */
      themeLight.setProperties({
         // For `ApplicationShell.svelte` / `EmptyApplicationShell.svelte`.
         '--tjs-app-header-background': propsAppHeaderLight?.background ?? 'var(--color-dark-3)',

         // For `ResizeHandle.svelte` / cancel invert of the resize handle / there is no core style to set.
         '--tjs-app-resize-handle-filter': 'none'
      });
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
