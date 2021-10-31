function noop() {}

function assign(tar, src) {
  // @ts-ignore
  for (const k in src) tar[k] = src[k];

  return tar;
}

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

function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);

  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element('style');
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}

function get_root_for_style(node) {
  if (!node) return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;

  if (root && root.host) {
    return root;
  }

  return node.ownerDocument;
}

function append_stylesheet(node, style) {
  append(node.head || node, style);
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

function empty() {
  return text('');
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

function getContext(key) {
  return get_current_component().$$.context.get(key);
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

function get_spread_update(levels, updates) {
  const update = {};
  const to_null_out = {};
  const accounted_for = {
    $$scope: 1
  };
  let i = levels.length;

  while (i--) {
    const o = levels[i];
    const n = updates[i];

    if (n) {
      for (const key in o) {
        if (!(key in n)) to_null_out[key] = 1;
      }

      for (const key in n) {
        if (!accounted_for[key]) {
          update[key] = n[key];
          accounted_for[key] = 1;
        }
      }

      levels[i] = n;
    } else {
      for (const key in o) {
        accounted_for[key] = 1;
      }
    }
  }

  for (const key in to_null_out) {
    if (!(key in update)) update[key] = undefined;
  }

  return update;
}

function get_spread_object(spread_props) {
  return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
} // source: https://html.spec.whatwg.org/multipage/indices.html

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

/* src\modules\components\Container.svelte generated by Svelte v3.44.0 */

function add_css$1(target) {
	append_styles(target, "svelte-1s361pr", "p.svelte-1s361pr{color:red;font-size:18px}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i];
	return child_ctx;
}

// (11:0) {:else}
function create_else_block(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Container warning: No children.";
			attr(p, "class", "svelte-1s361pr");
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

// (7:0) {#if Array.isArray(children)}
function create_if_block(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*children*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*children*/ 1) {
				each_value = /*children*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (8:4) {#each children as child}
function create_each_block$1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*child*/ ctx[1].props];
	var switch_value = /*child*/ ctx[1].class;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*children*/ 1)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*child*/ ctx[1].props)])
			: {};

			if (switch_value !== (switch_value = /*child*/ ctx[1].class)) {
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
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment$4(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (show_if == null || dirty & /*children*/ 1) show_if = !!Array.isArray(/*children*/ ctx[0]);
		if (show_if) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { children } = $$props;

	$$self.$$set = $$props => {
		if ('children' in $$props) $$invalidate(0, children = $$props.children);
	};

	return [children];
}

class Container extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { children: 0 }, add_css$1);
	}
}

/* src\modules\components\ComponentShell.svelte generated by Svelte v3.44.0 */

function create_fragment$3(ctx) {
	let container;
	let current;
	container = new Container({ props: { children: /*children*/ ctx[0] } });

	return {
		c() {
			create_component(container.$$.fragment);
		},
		m(target, anchor) {
			mount_component(container, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(container.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(container.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(container, detaching);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	setContext('external', () => context);
	let { context } = $$props;
	let children = getContext('external')().children;

	$$self.$$set = $$props => {
		if ('context' in $$props) $$invalidate(1, context = $$props.context);
	};

	return [children, context];
}

class ComponentShell extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { context: 1 });
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

function add_css(target) {
	append_styles(target, "svelte-185y963", ".typhonjs-app{max-height:100%;background:url(/ui/denim075.png) repeat;border-radius:5px;box-shadow:0 0 20px #000;margin:3px 0;color:#f0f0e0;position:absolute}.typhonjs-window-app{display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:flex-start;padding:0;z-index:99}.typhonjs-window-app .window-content{display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:flex-start;padding:8px;color:#191813;overflow-y:auto;overflow-x:hidden}.typhonjs-window-app .window-header{flex:0 0 30px;overflow:hidden;padding:0 8px;line-height:30px;border-bottom:1px solid #000;pointer-events:auto}.typhonjs-window-app .window-header a{flex:none;margin:0 0 0 8px}.typhonjs-window-app .window-header h4{font-family:Signika, sans-serif}.typhonjs-window-app .window-header i[class^=fa]{margin-right:3px}.typhonjs-window-app .window-header .window-title{margin:0;word-break:break-all}.typhonjs-window-app .window-resizable-handle{width:20px;height:20px;position:absolute;bottom:-1px;right:0;background:#444;padding:2px;border:1px solid #111;border-radius:4px 0 0 0}.typhonjs-window-app &.minimized .window-header{border:1px solid #000}.typhonjs-window-app &.minimized .window-resizable-handle{display:none}");
}

function create_fragment(ctx) {
	let div;
	let applicationheader;
	let t;
	let section;
	let container;
	let current;

	applicationheader = new ApplicationHeader({
			props: {
				title: /*foundryApp*/ ctx[1].title,
				headerButtons: /*foundryApp*/ ctx[1]._getHeaderButtons()
			}
		});

	container = new Container({ props: { children: /*children*/ ctx[0] } });

	return {
		c() {
			div = element("div");
			create_component(applicationheader.$$.fragment);
			t = space();
			section = element("section");
			create_component(container.$$.fragment);
			attr(section, "class", "window-content");
			attr(div, "id", /*foundryApp*/ ctx[1].id);
			attr(div, "class", "typhonjs-app typhonjs-window-app");
			attr(div, "data-appid", /*foundryApp*/ ctx[1].appId);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(applicationheader, div, null);
			append(div, t);
			append(div, section);
			mount_component(container, section, null);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(applicationheader.$$.fragment, local);
			transition_in(container.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(applicationheader.$$.fragment, local);
			transition_out(container.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(applicationheader);
			destroy_component(container);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	setContext('external', () => context);
	let { context } = $$props;
	let children = getContext('external')().children;
	let foundryApp = getContext('external')().foundryApp;

	$$self.$$set = $$props => {
		if ('context' in $$props) $$invalidate(2, context = $$props.context);
	};

	return [children, foundryApp, context];
}

class ApplicationShell extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { context: 2 }, add_css);
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
  delete config.options;
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

  if (typeof SvelteComponent !== 'function') {
    throw new Error(`SvelteApplication - s_LOAD_CONFIG - class is not defined for config:\n${JSON.stringify(config)}`);
  }

  const svelteConfig = _objectSpread2(_objectSpread2({}, config), {}, {
    target
  });

  let externalContext = {}; // If a context callback function is provided then invoke it with `this` being the Foundry app.
  // If an object is returned it adds the entries to external context.

  if (typeof svelteConfig.context === 'function') {
    const context = svelteConfig.context;
    delete svelteConfig.context;

    const _result = context.call(app);

    if (typeof _result === 'object') {
      externalContext = _objectSpread2(_objectSpread2({}, externalContext), _result);
    }
  } // Process children components attaching to external context.


  if (Array.isArray(svelteConfig.children)) {
    externalContext.children = [];

    for (let cntr = 0; cntr < svelteConfig.children.length; cntr++) {
      const child = svelteConfig.children[cntr];

      if (typeof child.class !== 'function') {
        throw new Error(`SvelteApplication - s_LOAD_CONFIG - class is not defined for child[${cntr}] for config:\n${JSON.stringify(config)}`);
      }

      externalContext.children.push(child);
    }

    delete svelteConfig.children;
  } else if (typeof svelteConfig.children === 'object') {
    if (typeof svelteConfig.children.class !== 'function') {
      throw new Error(`SvelteApplication - s_LOAD_CONFIG - class is not defined for children object for config:\n${JSON.stringify(config)}`);
    }

    externalContext.children = [svelteConfig.children];
    delete svelteConfig.children;
  } // Potentially inject the Foundry application instance as a Svelte prop.


  if (injectApp) {
    externalContext.foundryApp = app;
  } // Potentially inject any TyphonJS eventbus.
  // TODO: Verify TyphonJS eventbus and create a proxy for the component. Listen to onDestroy to cleanup resources.


  if (injectEventbus) {
    externalContext.eventbus = app._eventbus;
  } // If there is a context object then set it to props.


  if (Object.keys(externalContext).length > 0) {
    // Add props object if not defined.
    if (typeof svelteConfig.props !== 'object') {
      svelteConfig.props = {};
    }

    svelteConfig.props.context = externalContext;
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

export { ApplicationHeader, ApplicationShell, ComponentShell, Container, HeaderButton, SvelteApplication };
//# sourceMappingURL=index.js.map
