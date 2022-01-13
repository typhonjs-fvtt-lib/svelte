# Changelog
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
