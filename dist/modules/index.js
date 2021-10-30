function noop() {}

function run(fn) {
  return fn();
}

function blank_object() {
  return Object.create(null);
}

function run_all(fns) {
  fns.forEach(run);
}

function is_function(thing) {
  return typeof thing === 'function';
}

function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === 'object' || typeof a === 'function';
}

function is_empty(obj) {
  return Object.keys(obj).length === 0;
}

function append(target, node) {
  target.appendChild(node);
}

function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}

function detach(node) {
  node.parentNode.removeChild(node);
}

function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i]) iterations[i].d(detaching);
  }
}

function element(name) {
  return document.createElement(name);
}

function text(data) {
  return document.createTextNode(data);
}

function space() {
  return text(' ');
}

function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}

function attr(node, attribute, value) {
  if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

function children(element) {
  return Array.from(element.childNodes);
}

function set_data(text, data) {
  data = '' + data;
  if (text.wholeText !== data) text.data = data;
}

let current_component;

function set_current_component(component) {
  current_component = component;
}

function get_current_component() {
  if (!current_component) throw new Error('Function called outside component initialization');
  return current_component;
}

function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;

function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}

function add_render_callback(fn) {
  render_callbacks.push(fn);
}

let flushing = false;
const seen_callbacks = new Set();

function flush() {
  if (flushing) return;
  flushing = true;

  do {
    // first, call beforeUpdate functions
    // and update components
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }

    set_current_component(null);
    dirty_components.length = 0;

    while (binding_callbacks.length) binding_callbacks.pop()(); // then, once components are updated, call
    // afterUpdate functions. This may cause
    // subsequent updates...


    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];

      if (!seen_callbacks.has(callback)) {
        // ...so guard against infinite loops
        seen_callbacks.add(callback);
        callback();
      }
    }

    render_callbacks.length = 0;
  } while (dirty_components.length);

  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }

  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}

function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}

const outroing = new Set();
let outros;

function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros // parent group

  };
}

function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }

  outros = outros.p;
}

function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}

function transition_out(block, local, detach, callback) {
  if (block && block.o) {
    if (outroing.has(block)) return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);

      if (callback) {
        if (detach) block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}

function create_component(block) {
  block && block.c();
}

function mount_component(component, target, anchor, customElement) {
  const {
    fragment,
    on_mount,
    on_destroy,
    after_update
  } = component.$$;
  fragment && fragment.m(target, anchor);

  if (!customElement) {
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
  }

  after_update.forEach(add_render_callback);
}

function destroy_component(component, detaching) {
  const $$ = component.$$;

  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
    // preserve final state?)

    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}

function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }

  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}

function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance ? instance(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;

    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
      if (ready) make_dirty(component, i);
    }

    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update); // `false` as a special case of no DOM component

  $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      $$.fragment && $$.fragment.c();
    }

    if (options.intro) transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }

  set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */


class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }

  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }

  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }

}

/**
 * Localize a string including variable formatting for input arguments. Provide a string ID which defines the localized
 * template. Variables can be included in the template enclosed in braces and will be substituted using those named
 * keys.
 *
 * @param {string}   stringId - The string ID to translate.
 *
 * @param {object}   [data] - Provided input data.
 *
 * @returns {string} The translated and formatted string
 */
function localize(stringId, data) {
  const result = typeof data !== 'object' ? game.i18n.localize(stringId) : game.i18n.format(stringId, data);
  return result !== void 0 ? result : '';
}

/* src\modules\components\application\HeaderButton.svelte generated by Svelte v3.44.0 */

function create_fragment$2(ctx) {
	let a;
	let i;
	let i_class_value;
	let i_title_value;
	let t_value = localize(/*button*/ ctx[0].label) + "";
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			a = element("a");
			i = element("i");
			t = text(t_value);
			attr(i, "class", i_class_value = /*button*/ ctx[0].icon);
			attr(i, "title", i_title_value = localize(/*button*/ ctx[0].title));
			attr(a, "class", "header-button");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, i);
			append(a, t);

			if (!mounted) {
				dispose = listen(a, "click", /*onClick*/ ctx[1]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*button*/ 1 && i_class_value !== (i_class_value = /*button*/ ctx[0].icon)) {
				attr(i, "class", i_class_value);
			}

			if (dirty & /*button*/ 1 && i_title_value !== (i_title_value = localize(/*button*/ ctx[0].title))) {
				attr(i, "title", i_title_value);
			}

			if (dirty & /*button*/ 1 && t_value !== (t_value = localize(/*button*/ ctx[0].label) + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(a);
			mounted = false;
			dispose();
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { button } = $$props;

	function onClick() {
		if (typeof button.onclick === 'function') {
			button.onclick.call(button);
			$$invalidate(0, button);
		}
	}

	$$self.$$set = $$props => {
		if ('button' in $$props) $$invalidate(0, button = $$props.button);
	};

	return [button, onClick];
}

class HeaderButton extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { button: 0 });
	}
}

/* src\modules\components\application\ApplicationHeader.svelte generated by Svelte v3.44.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i];
	return child_ctx;
}

// (10:4) {#each headerButtons as button}
function create_each_block(ctx) {
	let headerbutton;
	let current;
	headerbutton = new HeaderButton({ props: { button: /*button*/ ctx[2] } });

	return {
		c() {
			create_component(headerbutton.$$.fragment);
		},
		m(target, anchor) {
			mount_component(headerbutton, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const headerbutton_changes = {};
			if (dirty & /*headerButtons*/ 2) headerbutton_changes.button = /*button*/ ctx[2];
			headerbutton.$set(headerbutton_changes);
		},
		i(local) {
			if (current) return;
			transition_in(headerbutton.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(headerbutton.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(headerbutton, detaching);
		}
	};
}

function create_fragment$1(ctx) {
	let header;
	let h4;
	let t0;
	let t1;
	let current;
	let each_value = /*headerButtons*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			header = element("header");
			h4 = element("h4");
			t0 = text(/*title*/ ctx[0]);
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(h4, "class", "window-title");
			attr(header, "class", "window-header flexrow");
		},
		m(target, anchor) {
			insert(target, header, anchor);
			append(header, h4);
			append(h4, t0);
			append(header, t1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(header, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*title*/ 1) set_data(t0, /*title*/ ctx[0]);

			if (dirty & /*headerButtons*/ 2) {
				each_value = /*headerButtons*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(header, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(header);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { title = '' } = $$props;
	let { headerButtons = [] } = $$props;

	$$self.$$set = $$props => {
		if ('title' in $$props) $$invalidate(0, title = $$props.title);
		if ('headerButtons' in $$props) $$invalidate(1, headerButtons = $$props.headerButtons);
	};

	return [title, headerButtons];
}

class ApplicationHeader extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { title: 0, headerButtons: 1 });
	}
}

/* src\modules\components\application\ApplicationShell.svelte generated by Svelte v3.44.0 */

function create_fragment(ctx) {
	let div;
	let applicationheader;
	let t;
	let section;
	let switch_instance;
	let div_id_value;
	let div_data_appid_value;
	let current;

	applicationheader = new ApplicationHeader({
			props: {
				title: /*_foundryApp*/ ctx[0].title,
				headerButtons: /*_foundryApp*/ ctx[0]._getHeaderButtons()
			}
		});

	var switch_value = /*component*/ ctx[1];

	function switch_props(ctx) {
		return {};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			div = element("div");
			create_component(applicationheader.$$.fragment);
			t = space();
			section = element("section");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr(section, "class", "window-content");
			attr(div, "id", div_id_value = /*_foundryApp*/ ctx[0].id);
			attr(div, "class", "typhonjs-app typhonjs-window-app");
			attr(div, "data-appid", div_data_appid_value = /*_foundryApp*/ ctx[0].appId);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(applicationheader, div, null);
			append(div, t);
			append(div, section);

			if (switch_instance) {
				mount_component(switch_instance, section, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			const applicationheader_changes = {};
			if (dirty & /*_foundryApp*/ 1) applicationheader_changes.title = /*_foundryApp*/ ctx[0].title;
			if (dirty & /*_foundryApp*/ 1) applicationheader_changes.headerButtons = /*_foundryApp*/ ctx[0]._getHeaderButtons();
			applicationheader.$set(applicationheader_changes);

			if (switch_value !== (switch_value = /*component*/ ctx[1])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, section, null);
				} else {
					switch_instance = null;
				}
			}

			if (!current || dirty & /*_foundryApp*/ 1 && div_id_value !== (div_id_value = /*_foundryApp*/ ctx[0].id)) {
				attr(div, "id", div_id_value);
			}

			if (!current || dirty & /*_foundryApp*/ 1 && div_data_appid_value !== (div_data_appid_value = /*_foundryApp*/ ctx[0].appId)) {
				attr(div, "data-appid", div_data_appid_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(applicationheader.$$.fragment, local);
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(applicationheader.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(applicationheader);
			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	setContext('foundryApp', () => _foundryApp);
	setContext('eventbus', () => _eventbus);
	let { _eventbus } = $$props;
	let { _foundryApp } = $$props;
	let { component } = $$props;

	$$self.$$set = $$props => {
		if ('_eventbus' in $$props) $$invalidate(2, _eventbus = $$props._eventbus);
		if ('_foundryApp' in $$props) $$invalidate(0, _foundryApp = $$props._foundryApp);
		if ('component' in $$props) $$invalidate(1, component = $$props.component);
	};

	return [_foundryApp, component, _eventbus];
}

class ApplicationShell extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			_eventbus: 2,
			_foundryApp: 0,
			component: 1
		});
	}
}

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

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

var _svelteComponents = /*#__PURE__*/new WeakMap();

/**
 * Provides a Svelte aware extension to Application to control the app lifecycle appropriately.
 */
class SvelteApplication extends Application {
  /**
   * Stores instantiated Svelte components.
   *
   * @type {object[]}
   * @private
   */

  /**
   * @inheritDoc
   */
  constructor(options) {
    super(options);

    _classPrivateFieldInitSpec(this, _svelteComponents, {
      writable: true,
      value: []
    });
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

    const el = this.element;

    if (!el) {
      return this._state = states.CLOSED;
    }

    el.css({
      minHeight: 0
    }); // Dispatch Hooks for closing the base and subclass applications

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
    } // Animate closing the element


    return new Promise(resolve => {
      el.slideUp(200, () => {
        // Manually invoke the destroy callbacks for all Svelte components.
        for (const entry of _classPrivateFieldGet(this, _svelteComponents)) {
          var _entry$component;

          (_entry$component = entry.component) === null || _entry$component === void 0 ? void 0 : _entry$component.$destroy();
        }

        _classPrivateFieldSet(this, _svelteComponents, []);

        el.remove(); // Clean up data

        this._element = null;
        delete ui.windows[this.appId];
        this._minimized = false;
        this._scrollPositions = null;
        this._state = states.CLOSED;
        resolve();
      });
    });
  }
  /**
   * Returns the indexed Svelte component
   * @param {number}   index -
   *
   * @returns {object}
   */


  getSvelteComponent(index) {
    return _classPrivateFieldGet(this, _svelteComponents)[index];
  }
  /**
   * Inject the Svelte components defined in `this.options.svelte`.
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
        _classPrivateFieldGet(this, _svelteComponents).push(s_LOAD_CONFIG(this, html, svelteConfig));
      }
    } else if (typeof this.options.svelte === 'object') {
      _classPrivateFieldGet(this, _svelteComponents).push(s_LOAD_CONFIG(this, html, this.options.svelte));
    } else {
      throw new TypeError(`SvelteApplication - _injectHTML - this.options.svelte not an array or object.`);
    } // Detect if this is a synthesized DocumentFragment.


    const isDocumentFragment = html.length && html[0] instanceof DocumentFragment && html[0].firstElementChild; // Store first child element if DocumentFragment.

    const newElement = isDocumentFragment ? $(html[0].firstElementChild) : void 0;

    super._injectHTML(html); // Set the element of the app to the first child of any document fragment.


    if (isDocumentFragment) {
      this._element = newElement;
    }

    this.onSvelteMount(this.element);
  }
  /**
   * Provides a callback after all Svelte components are initialized.
   *
   * @param {JQuery} element - JQuery container for main application element.
   */


  onSvelteMount(element) {} // eslint-disable-line no-unused-vars

  /**
   * Override replacing HTML as Svelte components control the rendering process. Only potentially change the outer
   * application frame / title for popout applications.
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
  const hasTemplate = typeof app.template === 'string';
  const hasTarget = typeof config.target === 'string';

  if (typeof config.class !== 'function') {
    throw new TypeError(`SvelteApplication - s_LOAD_CONFIG - class not a constructor for config:\n${JSON.stringify(config)}.`);
  }

  if (hasTemplate && !hasTarget) {
    throw new TypeError(`SvelteApplication - s_LOAD_CONFIG - target selector not a string for config:\n${JSON.stringify(config)}`);
  } // If a target selector is defined then find it in the JQuery `html` otherwise create an empty fragment.


  const target = hasTarget ? html.find(config.target).get(0) : document.createDocumentFragment();

  if (target === void 0) {
    throw new Error(`SvelteApplication - s_LOAD_CONFIG - could not find target selector: ${config.target} for config:\n${JSON.stringify(config)}`);
  }

  const SvelteComponent = config.class;

  const svelteConfig = _objectSpread2(_objectSpread2({}, config), {}, {
    target
  }); // Potentially inject the Foundry application instance as a Svelte prop.


  if (injectApp) {
    // Add props object if not defined.
    if (typeof svelteConfig.props !== 'object') {
      svelteConfig.props = {};
    }

    svelteConfig.props._foundryApp = app;
  } // Potentially inject any TyphonJS eventbus.
  // TODO: Verify TyphonJS eventbus and create a proxy for the component. Listen to onDestroy to cleanup resources.


  if (injectEventbus) {
    // Add props object if not defined.
    if (typeof svelteConfig.props !== 'object') {
      svelteConfig.props = {};
    }

    svelteConfig.props._eventbus = app._eventbus;
  }

  const result = {
    config: svelteConfig,
    component: new SvelteComponent(svelteConfig)
  };

  if (!hasTarget) {
    html.append(target);
  }

  return result;
}

export { ApplicationHeader, ApplicationShell, HeaderButton, SvelteApplication };
//# sourceMappingURL=index.js.map
