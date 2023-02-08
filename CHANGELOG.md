# Changelog
## Release 0.0.22 (major)
- Advanced focus management including focus trapping for application shells.
  - Check options `focusAuto`, `focusKeep`, `focusTrap` in SvelteApplication `options` / `reactive`
    - By default `focusAuto` / `focusTrap` is enabled for application shells.
    - `focusSource` for pass-through handling of returning focus to source of action on close.
  - Note: To enable keyboard navigation by `tab` traversal you need to remove / reassign the Foundry key binding for 
    `tab`.
    
- TJSDialog completely overhauled. 
  - Keeps the same configuration options / remove all JQuery support.
  - New `wait` method w/ managed Promise handling. 
    - Inside of dialog Svelte components access managed promise via `getContext('#managedPromise')`

- New options for application header button options:
  - Left align buttons after title w/ `alignLeft: true`.
  - Keep button when minimized w/ `keepMinimized: true`.
  - Context menu / right click support w/ `onContextMenu` callback.
  - Integrated keyboard handling.

- Vite 4 support

## Release 0.0.21 (minor)
- Updated @typhonjs-svelte/lib to latest.
- New utility class to manage CSS variable called `StyleManager` added to `util` subpackage export.

## Release 0.0.20 (minor)
- Added `enabled` option to `Position` to turn on / off Position control instantly. Used in forthcoming `PopOut` module support.
- Moved delete callback in TJSDocument before final update subscribers
- Moved TJSGameSettings to `svelte-standard`.

## Release 0.0.19 (medium)
- Added new reactive embedded collections capability to TJSDocument. 
- DynArrayReducer / DynMapReducer / DerivedArrayReducer / DerivedMapReducer stores added.
- Fixed compatibility aspects w/ Foundry v10.

## Release 0.0.18 (minor)
- Fixed teething issues w/ Vite. 

## Release 0.0.17 (major dependency update)
- Vite is now the recommended bundler / dev setup
- Full support for Svelte HMR in Vite developer mode.

## Release 0.0.16 (small update) 
- Updated `DynArrayReducer` from @typhonjs-svelte/lib to be able to dynamically reverse iteration. Useful for table 
  sorting.
 
- Fixed corner case issues in `SessionStorage` / `LocalStorage`. 

## Release 0.0.15 (medium update / 1 deprecation)
- `action`
  - Added 'applyScrolltop'; stores and applies scrollTop to associated element.
  

- `application`
  - SvelteApplication; fixed application minHeight / minWidth issues.


- `animate`
  - Added 'animateEvents'; provides a wrapper around animate functions (IE flip) providing events for animation start / finish.
    This is useful when needing to alter characteristics / CSS values of the container during animation.
   

- `store`
  - TJSGameSettings
    - External stores may be assigned instead of default basic writable stores created.
    - (deprecation) register options requires 'namespace' instead of 'moduleId'; this will be permanent in a future
      release. A log statement is currently generated.

  - SessionStorage / LocalStorage; refined edge cases / fixed issue w/ 'getItem' and default values.


- Build issues: fixed Rollup build process that mistakenly included source referenced across modules.

- Svelte updated to `3.49.0`

## Release 0.0.14 (massive update / animation stage #2)
- Better error messages for Svelte component mounting.

- TJSApplicationHeader defines styles for .window-title for no-wrap, overflow hidden, and text-overlow as ellipsis.

- TJSDocument / TJSDocumentCollection
  - add a 'subscribe' action; first subscribe callback action will be subscribe.
  - handle var args in constructor

- Position
  - Support for relative data; can use "+2.0", "-1.5", "*0.5" to adjust numeric position data relative to current values.

- Position State API
  - New location (position.state.<xxx>)
  
- AnimationAPI / AnimationManager
  - Fully decoupled AnimationManager from UpdateElementManager.
  - `position.animate.<xxx>` & Position.Animate.<xxx> for grouping multiple position instances in one animation.
    - Animations can have delayed start.
  - Implemented to, from, fromTo tweens
  - `quickTo` function generation for fast restart of to tween.
  - Ability to get all animation controls for a give Position instance.

- AnimationControl / AnimationGroupControl
  - isActive / isFinished getters to determine if animation is active or finished.
  - Cancel implementation

- Actions
  - alwaysBlur; Applied to an element focus is always immediately blurred.
  - autoBlur; Applied to an element focus is blurred when another pointer down event occurs outside the element.

## Release 0.0.12 (massive update / animation stage #1)
- Full integration of GSAP 
  - Proper module loading from remote source (requires top level await).
  - GsapCompose (data oriented GSAP bridge for Position)
  - draggableGsap; provides easing + inertia support.

- Position system
  - immediate element update support; from external rAF callback.
  - animateTo 
    - returns an object w/ cancel method and `finished` for the animation 
      end Promise.
    - ease instead of easing. duration is now specified in seconds instead of milliseconds.
  - start of static public Animation API; support `cancelAll` -> `Position.Animation.cancelAll()`

Demos
  - position-app: cleaned up UI; upgraded w/ GSAP timeline / tween examples + draggable selection.
  - position-box: upgraded w/ GSAP timeline example; draggableGsap
  - position-carousel: upgraded for GSAP timeline / tween to control continuous updates.  

## Skipped 0.0.11 (keep parity w/ TRL)

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
