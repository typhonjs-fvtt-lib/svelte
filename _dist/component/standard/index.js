import { SvelteComponent, init, safe_not_equal, append_styles, create_slot, element, svg_element, space, attr, set_style, insert, append, listen, action_destroyer, update_slot_base, get_all_dirty_from_scope, get_slot_changes, is_function, transition_in, transition_out, detach, run_all, text, set_data, bubble, binding_callbacks, null_to_empty, add_render_callback, create_bidirectional_transition, destroy_each, globals, current_component } from 'svelte/internal';
import { onDestroy, createEventDispatcher } from 'svelte';
import { writable } from 'svelte/store';
import { toggleDetails, applyStyles } from '@typhonjs-fvtt/svelte/action';
import { localize } from '@typhonjs-fvtt/svelte/helper';
import { slideFade } from '@typhonjs-fvtt/svelte/transition';
import { outroAndDestroy } from '@typhonjs-fvtt/svelte/util';

/* src\component\standard\TJSFolder.svelte generated by Svelte v3.44.3 */

function add_css$1(target) {
	append_styles(target, "svelte-1c70idv", "details.svelte-1c70idv.svelte-1c70idv{margin-left:-5px;padding-left:var(--tjs-details-padding-left, 5px)}summary.svelte-1c70idv.svelte-1c70idv{display:flex;position:relative;align-items:center;background-blend-mode:var(--tjs-summary-background-blend-mode, initial);background:var(--tjs-summary-background, none);border:var(--tjs-summary-border, none);cursor:var(--tjs-summary-cursor, pointer);font-size:var(--tjs-summary-font-size, inherit);font-weight:var(--tjs-summary-font-weight, bold);list-style:none;margin:0 0 0 -5px;padding:var(--tjs-summary-padding, 4px) 0;user-select:none;width:var(--tjs-summary-width, fit-content)}summary.svelte-1c70idv svg.svelte-1c70idv{width:var(--tjs-summary-chevron-size, var(--tjs-summary-font-size, 15px));height:var(--tjs-summary-chevron-size, var(--tjs-summary-font-size, 15px));color:var(--tjs-summary-chevron-color, currentColor);opacity:var(--tjs-summary-chevron-opacity, 0.2);margin:0 5px 0 0;transition:opacity 0.2s, transform 0.1s;transform:rotate(var(--tjs-summary-chevron-rotate-closed, -90deg))}summary.svelte-1c70idv:hover svg.svelte-1c70idv{opacity:var(--tjs-summary-chevron-opacity-hover, 1)}[open].svelte-1c70idv>summary svg.svelte-1c70idv{transform:rotate(var(--tjs-summary-chevron-rotate-open, 0))}.contents.svelte-1c70idv.svelte-1c70idv{position:relative;background-blend-mode:var(--tjs-contents-background-blend-mode, initial);background:var(--tjs-contents-background, none);border:var(--tjs-contents-border, none);margin:var(--tjs-contents-margin, 0 0 0 -5px);padding:var(--tjs-contents-padding, 0 0 0 calc(var(--tjs-summary-font-size, 13px) * 0.8))}.contents.svelte-1c70idv.svelte-1c70idv::before{content:'';position:absolute;width:0;height:calc(100% + 8px);left:0;top:-8px}summary.svelte-1c70idv:focus-visible+.contents.svelte-1c70idv::before{height:100%;top:0}");
}

const get_summary_end_slot_changes = dirty => ({});
const get_summary_end_slot_context = ctx => ({});
const get_label_slot_changes = dirty => ({});
const get_label_slot_context = ctx => ({});

// (153:25) {label}
function fallback_block(ctx) {
	let t;

	return {
		c() {
			t = text(/*label*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*label*/ 4) set_data(t, /*label*/ ctx[2]);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment$1(ctx) {
	let details;
	let summary;
	let svg;
	let path;
	let t0;
	let t1;
	let t2;
	let div;
	let toggleDetails_action;
	let applyStyles_action;
	let current;
	let mounted;
	let dispose;
	const label_slot_template = /*#slots*/ ctx[7].label;
	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[6], get_label_slot_context);
	const label_slot_or_fallback = label_slot || fallback_block(ctx);
	const summary_end_slot_template = /*#slots*/ ctx[7]["summary-end"];
	const summary_end_slot = create_slot(summary_end_slot_template, ctx, /*$$scope*/ ctx[6], get_summary_end_slot_context);
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			details = element("details");
			summary = element("summary");
			svg = svg_element("svg");
			path = svg_element("path");
			t0 = space();
			if (label_slot_or_fallback) label_slot_or_fallback.c();
			t1 = space();
			if (summary_end_slot) summary_end_slot.c();
			t2 = space();
			div = element("div");
			if (default_slot) default_slot.c();
			attr(path, "fill", "currentColor");
			attr(path, "stroke", "currentColor");
			set_style(path, "stroke-linejoin", "round");
			set_style(path, "stroke-width", "3");
			attr(path, "d", "M5,8L19,8L12,15Z");
			attr(svg, "viewBox", "0 0 24 24");
			attr(svg, "class", "svelte-1c70idv");
			attr(summary, "class", "svelte-1c70idv");
			attr(div, "class", "contents svelte-1c70idv");
			attr(details, "class", "tjs-folder svelte-1c70idv");
			attr(details, "data-id", /*id*/ ctx[1]);
			attr(details, "data-label", /*label*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, details, anchor);
			append(details, summary);
			append(summary, svg);
			append(svg, path);
			append(summary, t0);

			if (label_slot_or_fallback) {
				label_slot_or_fallback.m(summary, null);
			}

			append(summary, t1);

			if (summary_end_slot) {
				summary_end_slot.m(summary, null);
			}

			append(details, t2);
			append(details, div);

			if (default_slot) {
				default_slot.m(div, null);
			}

			/*details_binding*/ ctx[13](details);
			current = true;

			if (!mounted) {
				dispose = [
					listen(details, "click", /*click_handler*/ ctx[8]),
					listen(details, "open", /*open_handler*/ ctx[9]),
					listen(details, "close", /*close_handler*/ ctx[10]),
					listen(details, "openAny", /*openAny_handler*/ ctx[11]),
					listen(details, "closeAny", /*closeAny_handler*/ ctx[12]),
					action_destroyer(toggleDetails_action = toggleDetails.call(null, details, /*store*/ ctx[3])),
					action_destroyer(applyStyles_action = applyStyles.call(null, details, /*styles*/ ctx[0]))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (label_slot) {
				if (label_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						label_slot,
						label_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[6], dirty, get_label_slot_changes),
						get_label_slot_context
					);
				}
			} else {
				if (label_slot_or_fallback && label_slot_or_fallback.p && (!current || dirty & /*label*/ 4)) {
					label_slot_or_fallback.p(ctx, !current ? -1 : dirty);
				}
			}

			if (summary_end_slot) {
				if (summary_end_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						summary_end_slot,
						summary_end_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(summary_end_slot_template, /*$$scope*/ ctx[6], dirty, get_summary_end_slot_changes),
						get_summary_end_slot_context
					);
				}
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*id*/ 2) {
				attr(details, "data-id", /*id*/ ctx[1]);
			}

			if (!current || dirty & /*label*/ 4) {
				attr(details, "data-label", /*label*/ ctx[2]);
			}

			if (toggleDetails_action && is_function(toggleDetails_action.update) && dirty & /*store*/ 8) toggleDetails_action.update.call(null, /*store*/ ctx[3]);
			if (applyStyles_action && is_function(applyStyles_action.update) && dirty & /*styles*/ 1) applyStyles_action.update.call(null, /*styles*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(label_slot_or_fallback, local);
			transition_in(summary_end_slot, local);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(label_slot_or_fallback, local);
			transition_out(summary_end_slot, local);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(details);
			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
			if (summary_end_slot) summary_end_slot.d(detaching);
			if (default_slot) default_slot.d(detaching);
			/*details_binding*/ ctx[13](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { styles } = $$props;
	let { folder } = $$props;
	let { id = folder ? folder.id : void 0 } = $$props;
	let { label = folder ? folder.label : '' } = $$props;
	let { store = folder ? folder.store : writable(false) } = $$props;
	let detailsEl;

	/**
 * Create a CustomEvent with details object containing relevant element and props.
 *
 * @param {string}   type - Event name / type.
 *
 * @param {boolean}  [bubbles=false] - Does the event bubble.
 *
 * @returns {CustomEvent<object>}
 */
	function createEvent(type, bubbles = false) {
		return new CustomEvent(type,
		{
				detail: {
					element: detailsEl,
					folder,
					id,
					label,
					store
				},
				bubbles
			});
	}

	// Manually subscribe to store in order to trigger only on changes; avoids initial dispatch on mount as `detailsEl`
	// is not set yet. Directly dispatch custom events as Svelte 3 does not support bubbling of custom events by
	// `createEventDispatcher`.
	const unsubscribe = store.subscribe(value => {
		if (detailsEl) {
			detailsEl.dispatchEvent(createEvent(value ? 'open' : 'close'));
			detailsEl.dispatchEvent(createEvent(value ? 'openAny' : 'closeAny', true));
		}
	});

	onDestroy(unsubscribe);

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function open_handler(event) {
		bubble.call(this, $$self, event);
	}

	function close_handler(event) {
		bubble.call(this, $$self, event);
	}

	function openAny_handler(event) {
		bubble.call(this, $$self, event);
	}

	function closeAny_handler(event) {
		bubble.call(this, $$self, event);
	}

	function details_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			detailsEl = $$value;
			$$invalidate(4, detailsEl);
		});
	}

	$$self.$$set = $$props => {
		if ('styles' in $$props) $$invalidate(0, styles = $$props.styles);
		if ('folder' in $$props) $$invalidate(5, folder = $$props.folder);
		if ('id' in $$props) $$invalidate(1, id = $$props.id);
		if ('label' in $$props) $$invalidate(2, label = $$props.label);
		if ('store' in $$props) $$invalidate(3, store = $$props.store);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	return [
		styles,
		id,
		label,
		store,
		detailsEl,
		folder,
		$$scope,
		slots,
		click_handler,
		open_handler,
		close_handler,
		openAny_handler,
		closeAny_handler,
		details_binding
	];
}

class TJSFolder extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{
				styles: 0,
				folder: 5,
				id: 1,
				label: 2,
				store: 3
			},
			add_css$1
		);
	}
}

/* src\component\standard\TJSStyleProperties.svelte generated by Svelte v3.44.3 */

function create_fragment$2(ctx) {
	let div;
	let applyStyles_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(applyStyles_action = applyStyles.call(null, div, /*styles*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}

			if (applyStyles_action && is_function(applyStyles_action.update) && dirty & /*styles*/ 1) applyStyles_action.update.call(null, /*styles*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { styles } = $$props;

	$$self.$$set = $$props => {
		if ('styles' in $$props) $$invalidate(0, styles = $$props.styles);
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	return [styles, $$scope, slots];
}

class TJSStyleProperties extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { styles: 0 });
	}
}

/* src\component\standard\contextmenu\TJSContextMenu.svelte generated by Svelte v3.44.3 */

const { document: document_1 } = globals;

function add_css(target) {
	append_styles(target, "svelte-1ykoenx", ".tjs-context-menu.svelte-1ykoenx.svelte-1ykoenx.svelte-1ykoenx{position:fixed;width:fit-content;font-size:14px;box-shadow:0 0 10px var(--color-shadow-dark, var(--typhonjs-color-shadow, #000));height:max-content;min-width:150px;max-width:360px;background:var(--typhonjs-color-content-window, #23221d);border:1px solid var(--color-border-dark, var(--typhonjs-color-border, #000));border-radius:5px;color:var(--color-text-light-primary, var(--typhonjs-color-text-secondary, #EEE))}.tjs-context-menu.svelte-1ykoenx ol.tjs-context-items.svelte-1ykoenx.svelte-1ykoenx{list-style:none;margin:0;padding:0}.tjs-context-menu.svelte-1ykoenx li.tjs-context-item.svelte-1ykoenx.svelte-1ykoenx{padding:0 5px;line-height:32px}.tjs-context-menu.svelte-1ykoenx li.tjs-context-item.svelte-1ykoenx.svelte-1ykoenx:hover{color:var(--typhonjs-color-text-primary, #FFF);text-shadow:0 0 4px var(--color-text-hyperlink, var(--typhonjs-color-accent-tertiary, red))}.tjs-context-menu.svelte-1ykoenx li.tjs-context-item.svelte-1ykoenx>i.svelte-1ykoenx{margin-right:5px}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	return child_ctx;
}

// (96:8) {#each items as item}
function create_each_block(ctx) {
	let li;
	let i;
	let i_class_value;
	let t_value = localize(/*item*/ ctx[15].label) + "";
	let t;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[10](/*item*/ ctx[15]);
	}

	return {
		c() {
			li = element("li");
			i = element("i");
			t = text(t_value);
			attr(i, "class", i_class_value = "" + (null_to_empty(/*item*/ ctx[15].icon) + " svelte-1ykoenx"));
			attr(li, "class", "tjs-context-item svelte-1ykoenx");
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

			if (dirty & /*items*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*item*/ ctx[15].icon) + " svelte-1ykoenx"))) {
				attr(i, "class", i_class_value);
			}

			if (dirty & /*items*/ 2 && t_value !== (t_value = localize(/*item*/ ctx[15].label) + "")) set_data(t, t_value);
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
	let each_value = /*items*/ ctx[1];
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

			attr(ol, "class", "tjs-context-items svelte-1ykoenx");
			attr(nav, "id", /*id*/ ctx[0]);
			attr(nav, "class", "tjs-context-menu svelte-1ykoenx");
			set_style(nav, "z-index", /*zIndex*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, nav, anchor);
			append(nav, ol);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ol, null);
			}

			/*nav_binding*/ ctx[11](nav);
			current = true;

			if (!mounted) {
				dispose = listen(document_1.body, "pointerdown", /*onClose*/ ctx[6]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*onClick, items, localize*/ 34) {
				each_value = /*items*/ ctx[1];
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

			if (!current || dirty & /*id*/ 1) {
				attr(nav, "id", /*id*/ ctx[0]);
			}

			if (!current || dirty & /*zIndex*/ 4) {
				set_style(nav, "z-index", /*zIndex*/ ctx[2]);
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (!nav_transition) nav_transition = create_bidirectional_transition(nav, /*animate*/ ctx[4], {}, true);
				nav_transition.run(1);
			});

			current = true;
		},
		o(local) {
			if (!nav_transition) nav_transition = create_bidirectional_transition(nav, /*animate*/ ctx[4], {}, false);
			nav_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(nav);
			destroy_each(each_blocks, detaching);
			/*nav_binding*/ ctx[11](null);
			if (detaching && nav_transition) nav_transition.end();
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { id = '' } = $$props;
	let { x = 0 } = $$props;
	let { y = 0 } = $$props;
	let { items = [] } = $$props;
	let { zIndex = 10000 } = $$props;
	let { transitionOptions = void 0 } = $$props;

	// Bound to the nav element / menu.
	let menuEl;

	// Store this component reference.
	const local = current_component;

	// Dispatches `close` event.
	const dispatch = createEventDispatcher();

	// Stores if this context menu is closed.
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
		}

		// Early out if the event page X / Y is the same as this context menu.
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

	return [
		id,
		items,
		zIndex,
		menuEl,
		animate,
		onClick,
		onClose,
		x,
		y,
		transitionOptions,
		click_handler,
		nav_binding
	];
}

class TJSContextMenu extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				id: 0,
				x: 7,
				y: 8,
				items: 1,
				zIndex: 2,
				transitionOptions: 9
			},
			add_css
		);
	}
}

export { TJSContextMenu, TJSFolder, TJSStyleProperties };
//# sourceMappingURL=index.js.map
