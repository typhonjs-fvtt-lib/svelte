import { TJSStyleManager }                   from '@typhonjs-svelte/runtime-base/util/dom/style';
import { getRoutePrefix }                    from '@typhonjs-svelte/runtime-base/util/path';

export { default as ApplicationShell }       from './ApplicationShell.svelte';
export { default as EmptyApplicationShell }  from './EmptyApplicationShell.svelte';
export { default as TJSApplicationShell }    from './TJSApplicationShell.svelte';
export { default as TJSGlassPane }           from './TJSGlassPane.svelte';

const styleManager = new TJSStyleManager({
   id: '__tjs-runtime-vars',
   version: 1,
   layerName: 'variables.tjs-runtime-vars',
   rules: {
      themeDark: ':root, .themed.theme-dark',
      themeLight: '.themed.theme-light'
   }
});

if (styleManager.isConnected())
{
   // Remove `0.2.x` and below root styles. -- REMOVE AT `0.5.0`
   document?.['#__trl-root-styles']?.remove?.();

   const themeDark = styleManager.get('themeDark');
   const themeLight = styleManager.get('themeLight');

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

      // Explicit dark theme properties ------------------------------------------------------------------------------

      // For `ResizeHandle.svelte` / invert the resize handle.
      '--tjs-app-resize-handle-filter': 'invert(1)'
   }, false);

   /**
    * Explicit light theme properties.
    */
   themeLight.setProperties({
      // For `ResizeHandle.svelte` / cancel invert of the resize handle.
      '--tjs-app-resize-handle-filter': 'none'
   });
}
