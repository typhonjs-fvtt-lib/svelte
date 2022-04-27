# Changelog
## Release 0.0.10 (large update)
- Further refinement of position / Position system.
  - Orthographic mode
    - top / left positional data is converted to translate X / Y in matrix3d transform.   
    - SvelteApplication boolean option `positionOrtho` to turn off orthographic mode. 
- `resizeObserver` action performance improvements.
  - All resizeObserver actions share a single ResizeObserver instance.
  - resizeObserver now caches both content & offset width / height.

## Release 0.0.9 (large update)
- Further refinement of position / Position system.
  - Translation + min / max height & width.
  - Massive performance improvements.
  - Ability to apply Position to any element.
    - New `applyPosition` action.
- New `resizeObserver` action that is far more performance oriented than stock Svelte monitoring of offset width & height.

## Release 0.0.8 (medium update)
- Continued refinement of position / Position in SvelteApplication.
  - Transforms are now handled by matrix3d.
- New math package w/ glmatrix and other supporting functions.
- Can now use a Svelte component as a header button. 
- TJSDialog sets height as `auto` by default.
- TJSDocument has `setFromUUID` and `setFromDataTransfer` methods

## Release 0.0.7 (large update)
- Complete overhaul of position / setPosition implementation making positional aspects reactive.
  - Setting any `this.position.<XXX>` value is reactive.
  - New `this.position.set` method. `setPosition` simply invokes it.
  - New position validators that make advanced window management easy.
- Introduction of Application state. this.state.save / restore and other methods including animating to a saved state
  are now possible.

## Release 0.0.6 (large update)
- Breaking changes (rename of variables): 
  - When creating a Svelte component the Foundry application accessible by 
  `getContext('external').foundryApp` is renamed to `application` and accessible by `getContext('external').application`. 
  - SvelteApplication / SvelteReactive `IE this.reactive.storeUIOptions` renamed to `this.reactive.storeUIState`. Added
    two new stores for `dragging` and `resizing` that are true when the app is being dragged or resized.

- TJSDocumentDialog and individual dialogs for working with documents added to 
new sub-module `@typhonjs-fvtt/svelte/application/dialog`.

- TJSDocument and TJSDocumentCollection to make documents and document collections reactive / store / subscriber 
protocol support available via `@typhonjs-fvtt/svelte/store`

- Many refinements to TJSDialog smoothing out developer experience. 
  - Added `autoClose` option to not automatically close on button press. You must manually close the app in button
  callback. 
  - Normalized options for icon: you can now just pass a string for the FA icon class.
  - Normalized callback option / you can also use `onclick`
  - If you are using a Svelte component for the dialog content the callback can be a text string for an exported 
  - function in the Svelte component to invoke on button press.
  - Added `styles` option / object to specify inline styles on the button.
  - Added `title` option to add a title / tooltip to buttons.
  
- The SvelteApplication `position` object is not a specific class `Position` that has the same API / shape as the 
default core `position` object. 
  - The new position implementation is a Svelte store / reactive.
  - `this.position.validators` provides an API to add validation functions that are invoked on position changes allowing
  modification of position data or cancelling an update. This allows the easy creation of window / app management code.
  
- Really fine-tuned `setPosition` fixing outstanding issues / integrated position validation.
  - `max-width` / `max-height` set in styles is now included in calculations, so when resizing an app the position data 
  correctly stops at any max value set.
  - Validation via Position is engaged allowing much easier window management functionality.

## Release 0.0.5 (medium update)
- Skipped 0.0.4 release to bring version parity with @typhonjs-fvtt/runtime.
- Added gameState Svelte store to access Foundry global `game` in Svelte templates.
- Better typescript type definitions.
- Updated @typhonjs-svelte/lib (more utility functions)

## Release 0.0.3 (large update)
- Fixed all edge cases between Svelte integration and SvelteApplication
- reactive z-index support
- A bunch more refinement; too much to list.

## Release 0.0.2
- Updated SvelteApplication / SvelteFormApplication to properly handle z-index management including legacy Handlebars 
support.

- Added `setPosition` option that by default is true. When set to false the `setPosition` method takes no effect.

- Added `headerButtonNoClose` and `headerButtonNoLabel` options to remove close button and labels from header buttons.

- Made storeAppOptions derived stores writable. 

## Release 0.0.1
- Updated SvelteApplication / SvelteFormApplication `setPosition` to automatically determine `noHeight` / `noWidth` from 
style `height` or `width`.

## Release 0.0.0
- Initial release
