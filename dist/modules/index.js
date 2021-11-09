import { outroAndDestroy, parseSvelteConfig } from '@typhonjs-fvtt/svelte/util';
import { SvelteComponent, init, safe_not_equal, append_styles, element, text, attr, null_to_empty, insert, append, listen, set_data, detach, space, set_style, add_render_callback, create_bidirectional_transition, destroy_each, globals, binding_callbacks, current_component } from 'svelte/internal';
import { createEventDispatcher } from 'svelte';
import { localize } from '@typhonjs-fvtt/svelte/helper';
import { slideFade } from '@typhonjs-fvtt/svelte/transition';

/**
 * Defines the application shell contract. If Svelte components export getter / setters for the following properties
 * then that component is considered an application shell.
 *
 * @type {string[]}
 */
const applicationShellContract = ['elementRoot'];
Object.freeze(applicationShellContract);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  _classCheckPrivateStaticFieldDescriptor(descriptor, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  _classCheckPrivateStaticFieldDescriptor(descriptor, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

function _classCheckPrivateStaticAccess(receiver, classConstructor) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
}

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
  if (descriptor === undefined) {
    throw new TypeError("attempted to " + action + " private static field before its declaration");
  }
}

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately. You can declaratively
 * load one or more components from `defaultOptions`. For the time being please refer to this temporary demo code
 * in `typhonjs-quest-log` for examples of how to declare Svelte components.
 * {@link https://github.com/typhonjs-fvtt/typhonjs-quest-log/tree/master/src/view/demo}
 *
 * A repository of demos will be available soon.
 */

var _svelteData = /*#__PURE__*/new WeakMap();

var _targetElement = /*#__PURE__*/new WeakMap();

class SvelteApplication extends Application {
  /**
   * Stores SvelteData entries with instantiated Svelte components.
   *
   * @type {object[]}
   * @private
   */

  /**
   * Stores the target element which may not necessarily be the main element.
   *
   * @type {JQuery}
   */

  /**
   * @inheritDoc
   */
  constructor(options) {
    super(options);

    _classPrivateFieldInitSpec(this, _svelteData, {
      writable: true,
      value: []
    });

    _classPrivateFieldInitSpec(this, _targetElement, {
      writable: true,
      value: null
    });
  }
  /**
   * Returns the length of the SvelteData entry array.
   *
   * @returns {number} Number of SvelteData entries loaded.
   */


  get svelteDataLength() {
    return _classPrivateFieldGet(this, _svelteData).length;
  }
  /**
   * Returns the target element or main element if no target defined.
   *
   * @returns {JQuery} Target element.
   */


  get targetElement() {
    return _classPrivateFieldGet(this, _targetElement);
  }
  /**
   * Note: This method is fully overridden and duplicated as Svelte components need to be destroyed manually and the
   * best visual result is to destroy them after the default JQuery slide up animation occurs, but before the element
   * is removed from the DOM.
   *
   * If you destroy the Svelte components before the slide up animation the Svelte elements are removed immediately
   * from the DOM. The purpose of overriding ensures the slide up animation is always completed before
   * the Svelte components are destroyed and then the element is removed from the DOM.
   *
   * Close the application and un-register references to it within UI mappings.
   * This function returns a Promise which resolves once the window closing animation concludes
   *
   * @param {object}   options - Optional parameters.
   *
   * @param {boolean}  options.force - Force close regardless of render state.
   *
   * @returns {Promise<void|number>}    A Promise which resolves once the application is closed
   */


  async close(options = {}) {
    const states = Application.RENDER_STATES;

    if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) {
      return;
    }

    this._state = states.CLOSING;
    /**
     * Get the element.
     *
     * @type {JQuery}
     */

    const el = _classPrivateFieldGet(this, _targetElement);

    if (!el) {
      return this._state = states.CLOSED;
    }

    el[0].style.minHeight = '0'; // Dispatch Hooks for closing the base and subclass applications

    for (const cls of this.constructor._getInheritanceChain()) {
      /**
       * A hook event that fires whenever this Application is closed.
       *
       * @param {Application} app                     The Application instance being closed
       *
       * @param {jQuery[]} html                       The application HTML when it is closed
       *
       * @function closeApplication
       *
       * @memberof hookEvents
       */
      Hooks.call(`close${cls.name}`, this, el);
    } // Await on JQuery to slide up the main element.


    await new Promise(resolve => {
      el.slideUp(200, () => resolve());
    }); // Stores the Promises returned from running outro transitions and destroying each Svelte component.

    const svelteDestroyPromises = []; // Manually invoke the destroy callbacks for all Svelte components.

    for (const entry of _classPrivateFieldGet(this, _svelteData)) {
      // Use `outroAndDestroy` to run outro transitions before destroying.
      svelteDestroyPromises.push(outroAndDestroy(entry.component)); // If any proxy eventbus has been added then remove all event registrations from the component.

      const eventbus = entry.config.eventbus;

      if (typeof eventbus === 'object' && typeof eventbus.off === 'function') {
        eventbus.off();
        entry.config.eventbus = void 0;
      }
    }

    _classPrivateFieldSet(this, _svelteData, []); // Await all Svelte components to destroy.


    await Promise.all(svelteDestroyPromises);
    el.remove(); // Clean up data

    this._element = null;

    _classPrivateFieldSet(this, _targetElement, null);

    delete ui.windows[this.appId];
    this._minimized = false;
    this._scrollPositions = null;
    this._state = states.CLOSED;
  }
  /**
   * Returns the indexed SvelteData entry.
   *
   * @param {number}   index -
   *
   * @returns {object} The loaded Svelte config + component.
   */


  getSvelteData(index) {
    return _classPrivateFieldGet(this, _svelteData)[index];
  }
  /**
   * Returns the SvelteData entries iterator.
   *
   * @returns {IterableIterator<[number, Object]>} SvelteData entries iterator.
   */


  getSvelteDataEntries() {
    return _classPrivateFieldGet(this, _svelteData).entries();
  }
  /**
   * Returns the SvelteData values iterator.
   *
   * @returns {IterableIterator<Object>} SvelteData values iterator.
   */


  getSvelteDataValues() {
    return _classPrivateFieldGet(this, _svelteData).values();
  }
  /**
   * Inject the Svelte components defined in `this.options.svelte`. The Svelte component can attach to the existing
   * pop-out of Application or provide no template and render into a document fragment which is then attached to the
   * DOM.
   *
   * @param {JQuery} html -
   *
   * @override
   * @inheritDoc
   */


  _injectHTML(html) {
    if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte)) {
      throw new Error('SvelteApplication - _injectHTML - A popout app with no template can only support one Svelte component.');
    }

    if (Array.isArray(this.options.svelte)) {
      for (const svelteConfig of this.options.svelte) {
        _classPrivateFieldGet(this, _svelteData).push(s_LOAD_CONFIG(this, html, svelteConfig));
      }
    } else if (typeof this.options.svelte === 'object') {
      _classPrivateFieldGet(this, _svelteData).push(s_LOAD_CONFIG(this, html, this.options.svelte));
    } else {
      throw new TypeError(`SvelteApplication - _injectHTML - this.options.svelte not an array or object.`);
    } // Detect if this is a synthesized DocumentFragment.


    const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;

    super._injectHTML(html); // Set the element of the app to the first child element in order of Svelte components mounted.


    if (isDocumentFragment) {
      for (const svelteData of _classPrivateFieldGet(this, _svelteData)) {
        if (svelteData.element instanceof HTMLElement) {
          this._element = $(svelteData.element);
          break;
        }
      }
    } // Potentially retrieve a specific target element if `selectorTarget` is defined otherwise make the target the
    // main element.


    _classPrivateFieldSet(this, _targetElement, typeof this.options.selectorTarget === 'string' ? this._element.find(this.options.selectorTarget) : this._element);

    if (_classPrivateFieldGet(this, _targetElement) === null || _classPrivateFieldGet(this, _targetElement) === void 0 || _classPrivateFieldGet(this, _targetElement).length === 0) {
      throw new Error(`SvelteApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
    }

    this.onSvelteMount({
      element: this._element[0],
      targetElement: _classPrivateFieldGet(this, _targetElement)[0]
    });
  }
  /**
   * Provides a callback after all Svelte components are initialized.
   *
   * @param {object}      opts - Options.
   *
   * @param {HTMLElement} opts.element - HTMLElement container for main application element.
   *
   * @param {HTMLElement} opts.targetElement - HTMLElement container for main application target element.
   */


  onSvelteMount({
    element,
    targetElement
  }) {} // eslint-disable-line no-unused-vars

  /**
   * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
   * application frame / title for pop-out applications.
   *
   * @override
   * @inheritDoc
   */


  _replaceHTML(element, html) // eslint-disable-line no-unused-vars
  {
    if (!element.length) {
      return;
    } // For pop-out windows update the window title


    if (this.popOut) {
      element.find('.window-title').text(this.title);
    }
  }
  /**
   * Render the inner application content. Only render a template if one is defined otherwise provide an empty
   * JQuery element.
   *
   * @param {Object} data         The data used to render the inner template
   *
   * @returns {Promise.<JQuery>}   A promise resolving to the constructed jQuery object
   *
   * @override
   * @private
   */


  async _renderInner(data) {
    const html = typeof this.template === 'string' ? await renderTemplate(this.template, data) : document.createDocumentFragment();
    return $(html);
  }
  /**
   * Modified Application `setPosition` to support QuestTrackerApp for switchable resizable window.
   * Set the application position and store its new location.
   *
   * @param {object}               [opts] - Optional parameters.
   *
   * @param {number|null}          [opts.left] - The left offset position in pixels
   *
   * @param {number|null}          [opts.top] - The top offset position in pixels
   *
   * @param {number|null}          [opts.width] - The application width in pixels
   *
   * @param {number|string|null}   [opts.height] - The application height in pixels
   *
   * @param {number|null}          [opts.scale] - The application scale as a numeric factor where 1.0 is default
   *
   * @param {boolean}              [opts.noHeight] - When true no element height is modified.
   *
   * @param {boolean}              [opts.noWidth] - When true no element Width is modified.
   *
   * @returns {{left: number, top: number, width: number, height: number, scale:number}}
   * The updated position object for the application containing the new values
   */


  setPosition({
    left,
    top,
    width,
    height,
    scale,
    noHeight = false,
    noWidth = false
  } = {}) {
    const el = this.targetElement[0];
    const currentPosition = this.position;
    const styles = window.getComputedStyle(el); // Update width if an explicit value is passed, or if no width value is set on the element

    if (!el.style.width || width) {
      const tarW = width || el.offsetWidth;
      const minW = parseInt(styles.minWidth) || MIN_WINDOW_WIDTH;
      const maxW = el.style.maxWidth || window.innerWidth;
      currentPosition.width = width = Math.clamped(tarW, minW, maxW);

      if (!noWidth) {
        el.style.width = `${width}px`;
      }

      if (width + currentPosition.left > window.innerWidth) {
        left = currentPosition.left;
      }
    }

    width = el.offsetWidth; // Update height if an explicit value is passed, or if no height value is set on the element

    if (!el.style.height || height) {
      const tarH = height || el.offsetHeight + 1;
      const minH = parseInt(styles.minHeight) || MIN_WINDOW_HEIGHT;
      const maxH = el.style.maxHeight || window.innerHeight;
      currentPosition.height = height = Math.clamped(tarH, minH, maxH);

      if (!noHeight) {
        el.style.height = `${height}px`;
      }

      if (height + currentPosition.top > window.innerHeight + 1) {
        top = currentPosition.top - 1;
      }
    }

    height = el.offsetHeight; // Update Left

    if (!el.style.left || Number.isFinite(left)) {
      const tarL = Number.isFinite(left) ? left : (window.innerWidth - width) / 2;
      const maxL = Math.max(window.innerWidth - width, 0);
      currentPosition.left = left = Math.clamped(tarL, 0, maxL);
      el.style.left = `${left}px`;
    } // Update Top


    if (!el.style.top || Number.isFinite(top)) {
      const tarT = Number.isFinite(top) ? top : (window.innerHeight - height) / 2;
      const maxT = Math.max(window.innerHeight - height, 0);
      currentPosition.top = top = Math.clamped(tarT, 0, maxT);
      el.style.top = `${currentPosition.top}px`;
    } // Update Scale


    if (scale) {
      currentPosition.scale = Math.max(scale, 0);

      if (scale === 1) {
        el.style.transform = "";
      } else {
        el.style.transform = `scale(${scale})`;
      }
    } // Return the updated position object


    return currentPosition;
  }

}
/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {Application} app - The application
 *
 * @param {JQuery}      html - The inserted HTML.
 *
 * @param {object}      config - Svelte component options
 *
 * @returns {object} The config + instantiated Svelte component.
 */

function s_LOAD_CONFIG(app, html, config) {
  const svelteOptions = typeof config.options === 'object' ? config.options : {};
  const injectApp = typeof svelteOptions.injectApp === 'boolean' ? svelteOptions.injectApp : false;
  const injectEventbus = typeof svelteOptions.injectEventbus === 'boolean' ? svelteOptions.injectEventbus : false;

  if (typeof app.template === 'string' && typeof config.target !== 'string') {
    throw new TypeError(`SvelteApplication - s_LOAD_CONFIG - Template defined and target selector not a string for config:\n${JSON.stringify(config)}`);
  }

  if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== 'string') {
    throw new Error(`SvelteApplication - s_LOAD_CONFIG - HTMLElement target with no 'selectorElement' defined for config:\n${JSON.stringify(config)}`);
  }

  let target;

  if (config.target instanceof HTMLElement) // A specific HTMLElement to append Svelte component.
    {
      target = config.target;
    } else if (typeof config.target === 'string') // A string target defines a selector to find in existing HTML.
    {
      target = html.find(config.target).get(0);
    } else // No target defined, create a document fragment.
    {
      target = document.createDocumentFragment();
    }

  if (target === void 0) {
    throw new Error(`SvelteApplication - s_LOAD_CONFIG - could not find target selector: ${config.target} for config:\n${JSON.stringify(config)}`);
  }

  const SvelteComponent = config.class;
  const svelteConfig = parseSvelteConfig(_objectSpread2(_objectSpread2({}, config), {}, {
    target
  }), app); // Potentially inject the Foundry application instance as a Svelte prop.

  if (injectApp) {
    svelteConfig.context.get('external').foundryApp = app;
  }

  let eventbus; // Potentially inject any TyphonJS eventbus and track the proxy in the options.

  if (injectEventbus && typeof app._eventbus === 'object' && typeof app._eventbus.createProxy === 'function') {
    eventbus = app._eventbus.createProxy();
    svelteConfig.context.get('external').eventbus = eventbus;
  } // Create the Svelte component.


  const component = new SvelteComponent(svelteConfig); // Set any eventbus to the config.

  svelteConfig.eventbus = eventbus;
  let element; // Detect if target is a synthesized DocumentFragment with an child element. Child elements will be present
  // if the Svelte component mounts and renders initial content into the document fragment.

  if (target instanceof DocumentFragment && target.firstElementChild) {
    element = target.firstElementChild;
    html.append(target);
  } else if (config.target instanceof HTMLElement) {
    // The target is an HTMLElement so find the Application element from `selectorElement` option.
    element = target.querySelector(svelteOptions.selectorElement);

    if (element === null || element === void 0) {
      throw new Error(`SvelteApplication - s_LOAD_CONFIG - HTMLElement target - could not find 'selectorElement' for config:\n${JSON.stringify(config)}`);
    }
  }

  const result = {
    config: svelteConfig,
    component,
    element
  };
  Object.freeze(result);
  return {
    config: svelteConfig,
    component,
    element
  };
}

/* src\modules\component\contextmenu\TJSContextMenu.svelte generated by Svelte v3.44.1 */


const {
  document: document_1
} = globals;

function add_css(target) {
  append_styles(target, "svelte-thdn97", ".tjs-context-menu.svelte-thdn97.svelte-thdn97.svelte-thdn97{position:fixed;width:fit-content;font-size:14px;box-shadow:0 0 10px #000;height:max-content;min-width:150px;max-width:360px;background:#23221d;border:1px solid #000;border-radius:5px;color:#EEE}.tjs-context-menu.svelte-thdn97 ol.tjs-context-items.svelte-thdn97.svelte-thdn97{list-style:none;margin:0;padding:0}.tjs-context-menu.svelte-thdn97 li.tjs-context-item.svelte-thdn97.svelte-thdn97{padding:0 5px;line-height:32px}.tjs-context-menu.svelte-thdn97 li.tjs-context-item.svelte-thdn97.svelte-thdn97:hover{color:#FFF;text-shadow:0 0 4px red}.tjs-context-menu.svelte-thdn97 li.tjs-context-item.svelte-thdn97>i.svelte-thdn97{margin-right:5px}");
}

function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
} // (96:8) {#each items as item}


function create_each_block(ctx) {
  let li;
  let i;
  let i_class_value;
  let t_value = localize(
  /*item*/
  ctx[15].label) + "";
  let t;
  let mounted;
  let dispose;

  function click_handler() {
    return (
      /*click_handler*/
      ctx[10](
      /*item*/
      ctx[15])
    );
  }

  return {
    c() {
      li = element("li");
      i = element("i");
      t = text(t_value);
      attr(i, "class", i_class_value = "" + (null_to_empty(
      /*item*/
      ctx[15].icon) + " svelte-thdn97"));
      attr(li, "class", "tjs-context-item svelte-thdn97");
    },

    m(target, anchor) {
      insert(target, li, anchor);
      append(li, i);
      append(li, t);

      if (!mounted) {
        dispose = listen(li, "click", click_handler);
        mounted = true;
      }
    },

    p(new_ctx, dirty) {
      ctx = new_ctx;

      if (dirty &
      /*items*/
      2 && i_class_value !== (i_class_value = "" + (null_to_empty(
      /*item*/
      ctx[15].icon) + " svelte-thdn97"))) {
        attr(i, "class", i_class_value);
      }

      if (dirty &
      /*items*/
      2 && t_value !== (t_value = localize(
      /*item*/
      ctx[15].label) + "")) set_data(t, t_value);
    },

    d(detaching) {
      if (detaching) detach(li);
      mounted = false;
      dispose();
    }

  };
}

function create_fragment(ctx) {
  let t;
  let nav;
  let ol;
  let nav_transition;
  let current;
  let mounted;
  let dispose;
  let each_value =
  /*items*/
  ctx[1];
  let each_blocks = [];

  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }

  return {
    c() {
      t = space();
      nav = element("nav");
      ol = element("ol");

      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }

      attr(ol, "class", "tjs-context-items svelte-thdn97");
      attr(nav, "id",
      /*id*/
      ctx[0]);
      attr(nav, "class", "tjs-context-menu svelte-thdn97");
      set_style(nav, "z-index",
      /*zIndex*/
      ctx[2]);
    },

    m(target, anchor) {
      insert(target, t, anchor);
      insert(target, nav, anchor);
      append(nav, ol);

      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(ol, null);
      }
      /*nav_binding*/


      ctx[11](nav);
      current = true;

      if (!mounted) {
        dispose = listen(document_1.body, "pointerdown",
        /*onClose*/
        ctx[6]);
        mounted = true;
      }
    },

    p(ctx, [dirty]) {
      if (dirty &
      /*onClick, items, localize*/
      34) {
        each_value =
        /*items*/
        ctx[1];
        let i;

        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx, each_value, i);

          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ol, null);
          }
        }

        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }

        each_blocks.length = each_value.length;
      }

      if (!current || dirty &
      /*id*/
      1) {
        attr(nav, "id",
        /*id*/
        ctx[0]);
      }

      if (!current || dirty &
      /*zIndex*/
      4) {
        set_style(nav, "z-index",
        /*zIndex*/
        ctx[2]);
      }
    },

    i(local) {
      if (current) return;
      add_render_callback(() => {
        if (!nav_transition) nav_transition = create_bidirectional_transition(nav,
        /*animate*/
        ctx[4], {}, true);
        nav_transition.run(1);
      });
      current = true;
    },

    o(local) {
      if (!nav_transition) nav_transition = create_bidirectional_transition(nav,
      /*animate*/
      ctx[4], {}, false);
      nav_transition.run(0);
      current = false;
    },

    d(detaching) {
      if (detaching) detach(t);
      if (detaching) detach(nav);
      destroy_each(each_blocks, detaching);
      /*nav_binding*/

      ctx[11](null);
      if (detaching && nav_transition) nav_transition.end();
      mounted = false;
      dispose();
    }

  };
}

function instance($$self, $$props, $$invalidate) {
  let {
    id = ''
  } = $$props;
  let {
    x = 0
  } = $$props;
  let {
    y = 0
  } = $$props;
  let {
    items = []
  } = $$props;
  let {
    zIndex = 10000
  } = $$props;
  let {
    transitionOptions = void 0
  } = $$props; // Bound to the nav element / menu.

  let menuEl; // Store this component reference.

  const local = current_component; // Dispatches `close` event.

  const dispatch = createEventDispatcher(); // Stores if this context menu is closed.

  let closed = false;
  /**
  * Provides a custom animate callback allowing inspection of the element to change positioning styles based on the
  * height / width of the element and `document.body`. This allows the context menu to expand up when the menu
  * is outside the height bound of `document.body` and expand to the left if width is greater than `document.body`.
  *
  * @param {HTMLElement} node - nav element.
  *
  * @returns {object} Transition object.
  */

  function animate(node) {
    const expandUp = y + node.clientHeight > document.body.clientHeight;
    const expandLeft = x + node.clientWidth > document.body.clientWidth;
    node.style.top = expandUp ? null : `${y}px`;
    node.style.bottom = expandUp ? `${document.body.clientHeight - y}px` : null;
    node.style.left = expandLeft ? null : `${x}px`;
    node.style.right = expandLeft ? `${document.body.clientWidth - x}px` : null;
    return slideFade(node, transitionOptions);
  }
  /**
  * Invokes a function on click of a menu item then fires the `close` event and automatically runs the outro
  * transition and destroys the component.
  *
  * @param {function} callback - Function to invoke on click.
  */


  function onClick(callback) {
    if (typeof callback === 'function') {
      callback();
    }

    if (!closed) {
      dispatch('close');
      closed = true;
      outroAndDestroy(local);
    }
  }
  /**
  * Determines if a pointer pressed to the document body closes the context menu. If the click occurs outside the
  * context menu then fire the `close` event and run the outro transition then destroy the component.
  *
  * @param {PointerEvent}   event - Pointer event from document body click.
  */


  async function onClose(event) {
    // Early out if the pointer down is inside the menu element.
    if (event.target === menuEl || menuEl.contains(event.target)) {
      return;
    } // Early out if the event page X / Y is the same as this context menu.


    if (Math.floor(event.pageX) === x && Math.floor(event.pageY) === y) {
      return;
    }

    if (!closed) {
      dispatch('close');
      closed = true;
      outroAndDestroy(local);
    }
  }

  const click_handler = item => onClick(item.onclick);

  function nav_binding($$value) {
    binding_callbacks[$$value ? 'unshift' : 'push'](() => {
      menuEl = $$value;
      $$invalidate(3, menuEl);
    });
  }

  $$self.$$set = $$props => {
    if ('id' in $$props) $$invalidate(0, id = $$props.id);
    if ('x' in $$props) $$invalidate(7, x = $$props.x);
    if ('y' in $$props) $$invalidate(8, y = $$props.y);
    if ('items' in $$props) $$invalidate(1, items = $$props.items);
    if ('zIndex' in $$props) $$invalidate(2, zIndex = $$props.zIndex);
    if ('transitionOptions' in $$props) $$invalidate(9, transitionOptions = $$props.transitionOptions);
  };

  return [id, items, zIndex, menuEl, animate, onClick, onClose, x, y, transitionOptions, click_handler, nav_binding];
}

class TJSContextMenu extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      id: 0,
      x: 7,
      y: 8,
      items: 1,
      zIndex: 2,
      transitionOptions: 9
    }, add_css);
  }

}

const _excluded = ["id", "x", "y", "items", "zIndex"];
/**
 * Provides game wide menu functionality.
 */

class TJSMenu {
  /**
   * Stores any active context menu.
   */

  /**
   * Creates and manages a game wide context menu.
   *
   * @param {object}   opts - Optional parameters.
   *
   * @param {string}   [opts.id] - A custom CSS ID to add to the menu.
   *
   * @param {number}   opts.x - X position for the top / left of the menu.
   *
   * @param {number}   opts.y - Y position for the top / left of the menu.
   *
   * @param {object[]} opts.items - Menu items to display.
   *
   * @param {number}   [opts.zIndex=10000] - Z-index for context menu.
   *
   * @param {...*}     [opts.transitionOptions] - The rest of opts defined the slideFade transition options.
   */
  static createContext(_ref = {}) {
    let {
      id = '',
      x = 0,
      y = 0,
      items = [],
      zIndex = 10000
    } = _ref,
        transitionOptions = _objectWithoutProperties(_ref, _excluded);

    if (_classStaticPrivateFieldSpecGet(this, TJSMenu, _contextMenu) !== void 0) {
      return;
    } // Create the new context menu with the last click x / y point.


    _classStaticPrivateFieldSpecSet(this, TJSMenu, _contextMenu, new TJSContextMenu({
      target: document.body,
      intro: true,
      props: {
        id,
        x,
        y,
        items,
        zIndex,
        transitionOptions
      }
    })); // Register an event listener to remove any active context menu if closed from a menu selection or pointer
    // down event to `document.body`.


    _classStaticPrivateFieldSpecGet(this, TJSMenu, _contextMenu).$on('close', () => {
      _classStaticPrivateFieldSpecSet(this, TJSMenu, _contextMenu, void 0);
    });
  }

}
var _contextMenu = {
  writable: true,
  value: void 0
};

export { SvelteApplication, TJSMenu, applicationShellContract };
//# sourceMappingURL=index.js.map
