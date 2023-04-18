// From: position/animation/AnimationAPI.js --------------------------------------------------------------------------

/**
 * @callback quickToCallback
 *
 * @param {...number|object} args - Either individual numbers corresponding to the order in which keys are specified or
 *                                  a single object with keys specified and numerical values.
 *
 * @property {(data: {duration?: number, ease?: Function, interpolate?: Function}) => quickToCallback} options - A
 *                                  function to update options for quickTo function.
 */

// From: position/Position.js ----------------------------------------------------------------------------------------

/**
 * @typedef {object} PositionInitialHelper
 *
 * @property {(width: number) => number} getLeft - Returns the left position given the width of the browser window.
 *
 * @property {(height: number) => number} getTop - Returns the top position given the height of the browser window.
 */

/**
 * @typedef {object} PositionGetOptions
 *
 * @property {Iterable<string>} keys - When provided only these keys are copied.
 *
 * @property {Iterable<string>} exclude - When provided these keys are excluded.
 *
 * @property {boolean} numeric - When true any `null` values are converted into defaults.
 */

/**
 * @typedef {object} PositionOptions - Options set in constructor.
 *
 * @property {boolean} calculateTransform - When true always calculate transform data.
 *
 * @property {PositionInitialHelper} initialHelper - Provides a helper for setting initial position data.
 *
 * @property {boolean} ortho - Sets Position to orthographic mode using just transform / matrix3d for positioning.
 *
 * @property {boolean} transformSubscribed - Set to true when there are subscribers to the readable transform store.
 */

/**
 * @typedef {PositionOptions & PositionData} PositionOptionsAll
 */

/**
 * @typedef {HTMLElement | object} PositionParent
 *
 * @property {Function} [elementTarget] - Potentially returns any parent object.
 */

/**
 * @typedef {object} ResizeObserverData
 *
 * @property {number|undefined} contentHeight -
 *
 * @property {number|undefined} contentWidth -
 *
 * @property {number|undefined} offsetHeight -
 *
 * @property {number|undefined} offsetWidth -
 */

/**
 * @typedef {object} StorePosition - Provides individual writable stores for {@link Position}.
 *
 * @property {import('svelte/store').Readable<{width: number, height: number}>} dimension - Readable store for dimension
 *                                                                                          data.
 *
 * @property {import('svelte/store').Readable<HTMLElement>} element - Readable store for current element.
 *
 * @property {import('svelte/store').Writable<number|null>} left - Derived store for `left` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} top - Derived store for `top` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} width - Derived store for `width` updates.
 *
 * @property {import('svelte/store').Writable<number|'auto'|null>} height - Derived store for `height` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} maxHeight - Derived store for `maxHeight` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} maxWidth - Derived store for `maxWidth` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} minHeight - Derived store for `minHeight` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} minWidth - Derived store for `minWidth` updates.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeContentHeight - Readable store for `contentHeight`.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeContentWidth - Readable store for `contentWidth`.
 *
 * @property {import('svelte/store').Writable<ResizeObserverData>} resizeObserved - Protected store for resize observer updates.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeOffsetHeight - Readable store for `offsetHeight`.
 *
 * @property {import('svelte/store').Readable<number|undefined>} resizeOffsetWidth - Readable store for `offsetWidth`.
 *
 * @property {import('svelte/store').Writable<number|null>} rotate - Derived store for `rotate` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateX - Derived store for `rotateX` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateY - Derived store for `rotateY` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} rotateZ - Derived store for `rotateZ` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} scale - Derived store for `scale` updates.
 *
 * @property {import('svelte/store').Readable<TransformData>} transform - Readable store for transform data.
 *
 * @property {import('svelte/store').Writable<string>} transformOrigin - Derived store for `transformOrigin`.
 *
 * @property {import('svelte/store').Writable<number|null>} translateX - Derived store for `translateX` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} translateY - Derived store for `translateY` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} translateZ - Derived store for `translateZ` updates.
 *
 * @property {import('svelte/store').Writable<number|null>} zIndex - Derived store for `zIndex` updates.
 */

/**
 * @typedef {object} PositionDataExtended
 *
 * @property {number|string|null} [height] -
 *
 * @property {number|string|null} [left] -
 *
 * @property {number|string|null} [maxHeight] -
 *
 * @property {number|string|null} [maxWidth] -
 *
 * @property {number|string|null} [minHeight] -
 *
 * @property {number|string|null} [minWidth] -
 *
 * @property {number|string|null} [rotateX] -
 *
 * @property {number|string|null} [rotateY] -
 *
 * @property {number|string|null} [rotateZ] -
 *
 * @property {number|string|null} [scale] -
 *
 * @property {number|string|null} [top] -
 *
 * @property {string|null} [transformOrigin] -
 *
 * @property {number|string|null} [translateX] -
 *
 * @property {number|string|null} [translateY] -
 *
 * @property {number|string|null} [translateZ] -
 *
 * @property {number|string|null} [width] -
 *
 * @property {number|string|null} [zIndex] -
 *
 * Extended properties -----------------------------------------------------------------------------------------------
 *
 * @property {boolean} [immediateElementUpdate] - When true any associated element is updated immediately.
 *
 * @property {number|null} [rotation] - Alias for `rotateZ`.
 */

/**
 * @typedef {object} ValidationData
 *
 * @property {PositionData} position -
 *
 * @property {PositionParent} parent -
 *
 * @property {HTMLElement} el -
 *
 * @property {CSSStyleDeclaration} computed -
 *
 * @property {Transforms} transforms -
 *
 * @property {number} height -
 *
 * @property {number} width -
 *
 * @property {number|undefined} marginLeft -
 *
 * @property {number|undefined} marginTop -
 *
 * @property {number|undefined} maxHeight -
 *
 * @property {number|undefined} maxWidth -
 *
 * @property {number|undefined} minHeight -
 *
 * @property {number|undefined} minWidth -
 *
 * @property {object} rest - The rest of any data submitted to {@link Position.set}
 */

// From: position/validators/AdapterValidators.js ----------------------------------------------------------------------------------------

/**
 * @typedef {object} ValidationData
 *
 * @property {PositionData} position -
 *
 * @property {PositionParent} parent -
 *
 * @property {HTMLElement} el -
 *
 * @property {CSSStyleDeclaration} computed -
 *
 * @property {Transforms} transforms -
 *
 * @property {number} height -
 *
 * @property {number} width -
 *
 * @property {number|undefined} marginLeft -
 *
 * @property {number|undefined} marginTop -
 *
 * @property {number|undefined} maxHeight -
 *
 * @property {number|undefined} maxWidth -
 *
 * @property {number|undefined} minHeight -
 *
 * @property {number|undefined} minWidth -
 *
 * @property {object} rest - The rest of any data submitted to {@link Position.set}
 */

/**
 * @callback ValidatorFn - Position validator function that takes a {@link PositionData} instance potentially
 *                             modifying it or returning null if invalid.
 *
 * @param {ValidationData} valData - Validation data.
 *
 * @returns {PositionData|null} The validated position data or null to cancel position update.
 *
 */

/**
 * @typedef {object} ValidatorData
 *
 * @property {*}           [id=undefined] - An ID associated with this validator. Can be used to remove the validator.
 *
 * @property {ValidatorFn} validator - Position validator function that takes a {@link PositionData} instance
 *                                     potentially modifying it or returning null if invalid.
 *
 * @property {number}      [weight=1] - A number between 0 and 1 inclusive to position this validator against others.
 *
 * @property {Function}    [subscribe] - Optional subscribe function following the Svelte store / subscribe pattern.
 */

/**
 * @typedef {ValidatorFn|ValidatorData|Iterable<ValidatorFn|ValidatorData>} PositionValidatorOptions Defines the
 *          position validator options.
 */

// From: SvelteApplication.js ----------------------------------------------------------------------------------------

/**
 * @typedef {object} MountedAppShell - Application shell contract for Svelte components.
 *
 * @property {HTMLElement} elementRoot - The root element / exported prop.
 *
 * @property {HTMLElement} [elementContent] - The content element / exported prop.
 *
 * @property {HTMLElement} [elementTarget] - The target element / exported prop.
 */

/**
 * @typedef {object} SvelteApplicationOptions
 *
 * @property {boolean}  [defaultCloseAnimation=true] - If false the default slide close animation is not run.
 *
 * @property {boolean}  [draggable=true] - If true then application shells are draggable.
 *
 * @property {boolean}  [focusAuto=true] - When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusKeep=false] - When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {object}   [focusSource] - Defines A11yHelper focus source to apply when application closes.
 *
 * @property {boolean}  [headerButtonNoClose=false] - If true then the close header button is removed.
 *
 * @property {boolean}  [headerButtonNoLabel=false] - If true then header button labels are removed.
 *
 * @property {boolean}  [headerNoTitleMinimized=false] - If true then header title is hidden when minimized.
 *
 * @property {number}   [minHeight=globalThis.MIN_WINDOW_HEIGHT] - Assigned to position. Number specifying minimum
 *           window height.
 *
 * @property {number}   [minWidth=globalThis.MIN_WINDOW_WIDTH] - Assigned to position. Number specifying minimum
 *           window width.
 *
 * @property {boolean}  [positionable=true] - If false then `position.set` does not take effect.
 *
 * @property {PositionInitialHelper}   [positionInitial] - A helper for initial position placement.
 *
 * @property {boolean}  [positionOrtho=true] - When true Position is optimized for orthographic use.
 *
 * @property {PositionValidatorOptions}   [positionValidator] - A validator function or data or list of validators.
 *
 * @property {object}   [sessionStorage] - An instance of TJSSessionStorage to share across SvelteApplications.
 *
 * @property {object}   [svelte] - A Svelte configuration object defining the main component.
 *
 * @property {string}   [transformOrigin='top left'] - By default, 'top / left' respects rotation when minimizing.
 */

/**
 * @typedef {object} SvelteData
 *
 * @property {object}                           config -
 *
 * @property {import('svelte').SvelteComponent} component -
 *
 * @property {HTMLElement}                      element -
 *
 * @property {boolean}                          injectHTML -
 */

/**
 * @typedef {object} SvelteStores
 *
 * @property {import('svelte/store').Writable.update} appOptionsUpdate - Update function for app options store.
 *
 * @property {Function} subscribe - Subscribes to local stores.
 *
 * @property {import('svelte/store').Writable.update} uiOptionsUpdate - Update function for UI options store.
 *
 * @property {Function} unsubscribe - Unsubscribes from local stores.
 */

// From: TJSDialog.js ------------------------------------------------------------------------------------------------

/**
 * @typedef {object} TJSDialogOptions - Defines the common dialog configuration data.
 *
 * @property {Record<string, TJSDialogButtonData>}  [buttons={}] - Provides configuration of the dialog button bar.
 *
 * @property {object|string}  content - A Svelte configuration object or HTML string content.
 *
 * @property {string}   [default] - The default button ID to focus initially.
 *
 * @property {boolean}  [draggable=true] - The dialog is draggable when true.
 *
 * @property {boolean}  [focusAuto=true] - When true auto-management of app focus is enabled.
 *
 * @property {boolean}  [focusFirst=false] - When true the first focusable element that isn't a button is focused.
 *
 * @property {boolean}  [focusKeep=false] - When `focusAuto` and `focusKeep` is true; keeps internal focus.
 *
 * @property {boolean}  [focusTrap=true] - When true focus trapping / wrapping is enabled keeping focus inside app.
 *
 * @property {boolean}  [minimizable=true] - When true the dialog is minimizable.
 *
 * @property {boolean}  [modal=false] - When true a modal dialog is displayed.
 *
 * @property {object}   [modalOptions] - Additional options for modal dialog display.
 *
 * @property {boolean}  [notifyError=true] - When true and an error is raised in dialog callback functions post a UI
 *           error notification.
 *
 * @property {string|((application: TJSDialog) => any)} [onClose] - Callback invoked when dialog is closed; no button
 *           option selected. When defined as a string any matching function by name exported from content Svelte
 *           component is invoked.
 *
 * @property {boolean}  [rejectClose=false] - When true and a Promise has been created by {@link TJSDialog.wait} and
 *           the Promise is not in the process of being resolved or rejected on close of the dialog any `onClose`
 *           function is invoked and any result that is undefined will cause the Promise to then be rejected.
 *
 * @property {boolean}  [resizable=false] - When true the dialog is resizable.
 *
 * @property {boolean}  [resolveId=false] - When true and resolving any Promises and there are undefined results from
 *           any button callbacks the button ID is resolved.
 *
 * @property {string}   [title] - The dialog window title.
 *
 * @property {object}   [transition] - Transition options for the dialog.
 *
 * @property {number|null} [zIndex] - A specific z-index for the dialog. Pass null for the dialog to act like other
 *           applications in regard bringing to top when activated.
 */

/**
 * @typedef {object} TJSDialogButtonData - TJSDialog button data.
 *
 * @property {boolean} [autoClose=true] - When false the dialog does not automatically close when button selected.
 *
 * @property {boolean|(() => boolean)} [condition] - Determines if the button is accessible providing a truthy value.
 *
 * @property {string} [label] - Button label; will be localized.
 *
 * @property {string} [icon] - Button icon; you should supply the direct Font Awesome class names: IE "fas fa-check".
 *
 * @property {string|((application: TJSDialog) => any)} [onPress] - Callback for button press. When defined as a
 *           string any matching function by name exported from content Svelte component is invoked.
 *
 * @property {Record<string, string>} [styles] - Inline styles to apply to the button.
 */
