/**
 * Provides a way to easily remove the application from active window tracking setting `popOut` to false and
 * z-index to above the TJS dialog level effectively making the app always on top. When disabled, adds the
 * application back as a `popOut` window and brings it to the top of tracked windows.
 *
 * Note: This is used by:
 * - SvelteReactive when `alwaysOnTop` changes.
 * - SvelteApp when initially rendering for the first time.
 * - SvelteApp when a new root element is swapped during Vite dev mode / elementRootUpdate.
 *
 * Note: A benefit of changing `zIndex` is that this allows the `alwaysOnTop` app state to be captured by changes in
 * position when serializing `app.state.current()`.
 *
 * @param {import('../SvelteApp').SvelteApp}  application - Target application / SvelteApp.
 *
 * @param {boolean}  enabled - Enabled state for always on top.
 */
export function handleAlwaysOnTop(application, enabled)
{
   if (typeof enabled !== 'boolean')
   {
      throw new TypeError(`[SvelteApp handleAlwaysOnTop error]: 'enabled' is not a boolean.`);
   }

   if (enabled)
   {
      globalThis.requestAnimationFrame(() =>
      {
         // Set z-index to above the TJS dialog level (2 ** 31 - 50).
         application.position.zIndex = (2 ** 31) - 25;

         application.reactive.popOut = false;
      });
   }
   else
   {
      globalThis.requestAnimationFrame(() =>
      {
         // TODO: Note direct Foundry API access.
         application.position.zIndex = foundry.applications.api.ApplicationV2._maxZ - 1;

         application.reactive.popOut = true;

         // Wait for `rAF` then bring to the top.
         globalThis.requestAnimationFrame(() => application.bringToTop());
      });
   }
}
