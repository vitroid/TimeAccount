
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
            if (iterations[i])
                iterations[i].d(detaching);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
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
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
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
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
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
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
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
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Components/Tabs/Tabs.svelte generated by Svelte v3.49.0 */
    const file$e = "src/Components/Tabs/Tabs.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tabs");
    			add_location(div, file$e, 47, 0, 1063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, ['default']);
    	const tabs = [];
    	const panels = [];
    	const selectedTab = writable(null);
    	const selectedPanel = writable(null);

    	setContext(TABS, {
    		registerTab: tab => {
    			tabs.push(tab);
    			selectedTab.update(current => current || tab);

    			onDestroy(() => {
    				const i = tabs.indexOf(tab);
    				tabs.splice(i, 1);

    				selectedTab.update(current => current === tab
    				? tabs[i] || tabs[tabs.length - 1]
    				: current);
    			});
    		},
    		registerPanel: panel => {
    			panels.push(panel);
    			selectedPanel.update(current => current || panel);

    			onDestroy(() => {
    				const i = panels.indexOf(panel);
    				panels.splice(i, 1);

    				selectedPanel.update(current => current === panel
    				? panels[i] || panels[panels.length - 1]
    				: current);
    			});
    		},
    		selectTab: tab => {
    			const i = tabs.indexOf(tab);
    			selectedTab.set(tab);
    			selectedPanel.set(panels[i]);
    		},
    		selectedTab,
    		selectedPanel
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		setContext,
    		onDestroy,
    		writable,
    		tabs,
    		panels,
    		selectedTab,
    		selectedPanel
    	});

    	return [$$scope, slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/Components/Tabs/TabList.svelte generated by Svelte v3.49.0 */

    const file$d = "src/Components/Tabs/TabList.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tab-list svelte-8i9hs1");
    			add_location(div, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabList', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/Components/Tabs/TabPanel.svelte generated by Svelte v3.49.0 */

    // (11:0) {#if $selectedPanel === panel}
    function create_if_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(11:0) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $selectedPanel;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanel', slots, ['default']);
    	const panel = {};
    	const { registerPanel, selectedPanel } = getContext(TABS);
    	validate_store(selectedPanel, 'selectedPanel');
    	component_subscribe($$self, selectedPanel, value => $$invalidate(0, $selectedPanel = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		$selectedPanel
    	});

    	return [$selectedPanel, panel, selectedPanel, $$scope, slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/Components/Tabs/Tab.svelte generated by Svelte v3.49.0 */
    const file$c = "src/Components/Tabs/Tab.svelte";

    function create_fragment$e(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-1waq7ws");
    			toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			add_location(button, file$c, 40, 0, 704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*$selectedTab, tab*/ 3) {
    				toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	const tab = {};
    	const { registerTab, selectTab, selectedTab } = getContext(TABS);
    	validate_store(selectedTab, 'selectedTab');
    	component_subscribe($$self, selectedTab, value => $$invalidate(0, $selectedTab = value));
    	registerTab(tab);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectTab(tab);

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		tab,
    		registerTab,
    		selectTab,
    		selectedTab,
    		$selectedTab
    	});

    	return [$selectedTab, tab, selectTab, selectedTab, $$scope, slots, click_handler];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    const palettes = writable([]);
    const huerange = writable([0, 54]);
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0'); // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    function palette(n) {
        if (n < 0) {
            return "#ccc";
        }
        let ra = get_store_value(huerange);
        let hue = (ra[0] + n * (ra[1] - ra[0])) % 360;
        let s = 30;
        let v = 50;
        return hslToHex(hue, s, v);
    }
    huerange.subscribe(values => {
        let pals = [];
        for (let i = 0; i < 50; i++) {
            pals = [...pals, palette(i)];
        }
        palettes.set(pals);
    });

    const date = new Date();
    const hour = writable(date.getHours());
    const minute = writable(date.getMinutes());
    const history = writable([]);
    const cats = writable({});
    // for debug
    const token = writable("");
    const status = writable("Offline");
    const BASEURL = 'http://localhost:8088';
    // const BASEURL = 'http://www.chem.okayama-u.ac.jp:8088'
    // const BASEURL = "https://timeaccount-test-app.herokuapp.com"
    async function getToken(username, password) {
        /* parameters:
           username and password

           then find the user id
           and make a new token

           returns:
           token
           */
        const body_ = JSON.stringify({
            "un": username,
            "pw": password
        });
        const res = await fetch(BASEURL + '/v0/auth/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: body_
        });
        // もし不成功なら空文字列を返す。
        if (res.status != 200) {
            return "";
        }
        let result = await res.json();
        // console.log("RESULT:"+result)
        if (result != "") {
            token.set(result);
            return result;
        }
        return "";
    }
    async function storeAction(endtime, duration, category, action) {
        /*
            parameters:
            endtime: unixtime?
            duration: in minutes
            category: integer
            action: string

            store an action record to the server
        */
        status.set("Updating");
        const body_ = JSON.stringify({
            token: get_store_value(token),
            endtime: endtime,
            duration: duration,
            category: category,
            action: action
        });
        const controller = new AbortController();
        // 5 second timeout:
        setTimeout(() => controller.abort(), 5000);
        const res = await fetch(BASEURL + '/v0/', {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: body_,
            signal: controller.signal // 5 sec
        }).catch(() => { status.set("Offline"); });
        if ((typeof res === 'undefined') || (res.status != 200)) {
            status.set("Uncertain");
            return;
        }
        status.set("");
    }
    async function getHistory() {
        /*
            get the history of actions in descend time order

            store the history and category data (button list)

            This is called every one minute in Main.svelte
         */
        const body_ = JSON.stringify({
            "token": get_store_value(token)
        });
        const controller = new AbortController();
        // 5 second timeout:
        setTimeout(() => controller.abort(), 5000);
        const duration = "10080"; // 10080 minutes == 1 week
        const res = await fetch(BASEURL + '/v0/query/' + duration, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: body_,
            signal: controller.signal // 5 sec
        }).catch(() => { status.set("Offline"); });
        if ((typeof res === 'undefined') || (res.status != 200)) {
            status.set("Uncertain");
            return;
        }
        status.set("");
        res.json().then(result => {
            let remote_history = JSON.parse(result);
            if (remote_history.length > 0) {
                const remotelast = remote_history[0][1];
                minute.set(Math.floor(remotelast % 60));
                hour.set(Math.floor(remotelast / 60 + 9) % 24);
            }
            // もし、読みこんだhistoryの最終データが、クライアント上の最終データと同じ時刻であれば、
            // historyもcatsも更新しない。
            // 更新してしまうと、クライアント側で再表示が必要になる。
            const l = get_store_value(history);
            if (l.length > 0) {
                // 手許の最終actionの時刻
                const locallast = Math.floor(l[0][1]);
                // サーバ上の最終actionの時刻
                const remotelast = remote_history[0][1];
                // もし履歴の最新と、こちらの履歴の最新の時刻が一致するなら
                if (locallast == remotelast) {
                    return;
                }
            }
            let categories = {};
            for (let r in remote_history) {
                let row = remote_history[r];
                // 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes
                // svelteでの表示が楽になるように、時と分を準備する。
                const minutes = Math.floor(row[1] % 60);
                const hours = Math.floor(row[1] / 60 + 9) % 24;
                row.push(hours);
                row.push(minutes);
                // categoryを再構成
                const cat = row[3];
                const endtime = row[1];
                const action = row[4];
                if (!(cat in categories)) {
                    categories[cat] = {};
                }
                if (!(action in categories[cat])) {
                    // 一番新しいものだけを追加する。
                    categories[cat][action] = endtime;
                }
            }
            // writableを更新する。
            history.set(remote_history);
            cats.set(categories);
        });
        return;
    }

    /* src/Category.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$3 } = globals;
    const file$b = "src/Category.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (59:4) {#each sorted as name, i}
    function create_each_block$6(ctx) {
    	let button;
    	let t_value = /*name*/ ctx[11] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-400366");
    			add_location(button, file$b, 59, 4, 1731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sorted*/ 2 && t_value !== (t_value = /*name*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(59:4) {#each sorted as name, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let p;
    	let input;
    	let t;
    	let mounted;
    	let dispose;
    	let each_value = /*sorted*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			input = element("input");
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "placeholder", "What did you do til now?");
    			attr_dev(input, "class", "svelte-400366");
    			add_location(input, file$b, 57, 4, 1602);
    			attr_dev(p, "class", "svelte-400366");
    			set_style(p, "background-color", /*$palettes*/ ctx[3][/*id*/ ctx[0]], false);
    			add_location(p, file$b, 56, 0, 1554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, input);
    			set_input_value(input, /*inputtext*/ ctx[2]);
    			append_dev(p, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "keydown", /*onKeyDown*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputtext*/ 4 && input.value !== /*inputtext*/ ctx[2]) {
    				set_input_value(input, /*inputtext*/ ctx[2]);
    			}

    			if (dirty & /*onClick, sorted*/ 34) {
    				each_value = /*sorted*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$palettes, id*/ 9) {
    				set_style(p, "background-color", /*$palettes*/ ctx[3][/*id*/ ctx[0]], false);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $minute;
    	let $hour;
    	let $palettes;
    	validate_store(minute, 'minute');
    	component_subscribe($$self, minute, $$value => $$invalidate(8, $minute = $$value));
    	validate_store(hour, 'hour');
    	component_subscribe($$self, hour, $$value => $$invalidate(9, $hour = $$value));
    	validate_store(palettes, 'palettes');
    	component_subscribe($$self, palettes, $$value => $$invalidate(3, $palettes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Category', slots, []);
    	let { id } = $$props;

    	// export let whatUdid;
    	let buttons;

    	let sorted;

    	cats.subscribe(value => {
    		if (Object.keys(value).length > 0) {
    			buttons = value[id];
    			$$invalidate(1, sorted = Object.keys(buttons).sort((a, b) => buttons[b] - buttons[a]));
    		}
    	});

    	let inputtext;

    	function update(action) {
    		// 現在時刻
    		const date = new Date();

    		const now = date.getTime() / 1000 / 60; // in minute
    		const h = date.getHours();
    		const m = date.getMinutes();

    		// 開始時刻との差
    		const delta = (h - $hour + 24) % 24 * 60 + (m - $minute);

    		// 1分以上なら
    		if (delta > 0) {
    			// 履歴に記録する
    			history.update(v => [[0, now, delta, id, action, h, m], ...v]);

    			// historyを更新することで、自動的にボタンが更新される、はず。
    			storeAction(now, delta, id, action);
    		}

    		// 最新版では、サーバと矛盾がない限りreloadしないので、ボタンを強制的に追加する。
    		// ボタンを作成または更新
    		buttons[action] = now;

    		// sort and pick 6 newest items
    		$$invalidate(1, sorted = Object.keys(buttons).sort((a, b) => buttons[b] - buttons[a])); //.slice(0,6)

    		// re-make buttons
    		let newbuttons = {};

    		sorted.forEach(element => {
    			newbuttons[element] = buttons[element];
    		});

    		buttons = newbuttons;

    		// 最終操作時刻を更新
    		hour.set(h);

    		minute.set(m);
    	}

    	function onKeyDown(e) {
    		if (e.key == "Enter") {
    			update(inputtext);
    		}
    	} // inputtext = ""

    	function onClick(e) {
    		update(e.target.innerText);
    	}

    	const writable_props = ['id'];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Category> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputtext = this.value;
    		$$invalidate(2, inputtext);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		palettes,
    		hour,
    		minute,
    		history,
    		storeAction,
    		cats,
    		id,
    		buttons,
    		sorted,
    		inputtext,
    		update,
    		onKeyDown,
    		onClick,
    		$minute,
    		$hour,
    		$palettes
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('buttons' in $$props) buttons = $$props.buttons;
    		if ('sorted' in $$props) $$invalidate(1, sorted = $$props.sorted);
    		if ('inputtext' in $$props) $$invalidate(2, inputtext = $$props.inputtext);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, sorted, inputtext, $palettes, onKeyDown, onClick, input_input_handler];
    }

    class Category extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Category",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !('id' in props)) {
    			console.warn("<Category> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Category>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Category>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function handle(node) {
      const onDown = getOnDown(node);

      node.addEventListener("touchstart", onDown);
      node.addEventListener("mousedown", onDown);
      return {
        destroy() {
          node.removeEventListener("touchstart", onDown);
          node.removeEventListener("mousedown", onDown);
        }
      };
    }

    function getOnDown(node) {
      const onMove = getOnMove(node);

      return function (e) {
        e.preventDefault();
        node.dispatchEvent(new CustomEvent("dragstart"));

        const moveevent = "touches" in e ? "touchmove" : "mousemove";
        const upevent = "touches" in e ? "touchend" : "mouseup";

        document.addEventListener(moveevent, onMove);
        document.addEventListener(upevent, onUp);

        function onUp(e) {
          e.stopPropagation();

          document.removeEventListener(moveevent, onMove);
          document.removeEventListener(upevent, onUp);

          node.dispatchEvent(new CustomEvent("dragend"));
        }  };
    }

    function getOnMove(node) {
      const track = node.parentNode;

      return function (e) {
        const { left, width } = track.getBoundingClientRect();
        const clickOffset = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clickPos = Math.min(Math.max((clickOffset - left) / width, 0), 1) || 0;
        node.dispatchEvent(new CustomEvent("drag", { detail: clickPos }));
      };
    }

    /* node_modules/@bulatdashiev/svelte-slider/src/Thumb.svelte generated by Svelte v3.49.0 */
    const file$a = "node_modules/@bulatdashiev/svelte-slider/src/Thumb.svelte";

    function create_fragment$c(ctx) {
    	let div1;
    	let div0;
    	let div1_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "thumb-content svelte-8w8x88");
    			toggle_class(div0, "active", /*active*/ ctx[1]);
    			add_location(div0, file$a, 7, 2, 252);
    			attr_dev(div1, "class", "thumb svelte-8w8x88");
    			attr_dev(div1, "style", div1_style_value = `left: ${/*pos*/ ctx[0] * 100}%;`);
    			add_location(div1, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(handle.call(null, div1)),
    					listen_dev(div1, "dragstart", /*dragstart_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "drag", /*drag_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "dragend", /*dragend_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*active*/ 2) {
    				toggle_class(div0, "active", /*active*/ ctx[1]);
    			}

    			if (!current || dirty & /*pos*/ 1 && div1_style_value !== (div1_style_value = `left: ${/*pos*/ ctx[0] * 100}%;`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Thumb', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let active;
    	let { pos } = $$props;
    	const writable_props = ['pos'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Thumb> was created with unknown prop '${key}'`);
    	});

    	const dragstart_handler = () => ($$invalidate(1, active = true), dispatch('active', true));
    	const drag_handler = ({ detail: v }) => $$invalidate(0, pos = v);
    	const dragend_handler = () => ($$invalidate(1, active = false), dispatch('active', false));

    	$$self.$$set = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		handle,
    		dispatch,
    		pos,
    		active
    	});

    	$$self.$inject_state = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pos,
    		active,
    		dispatch,
    		$$scope,
    		slots,
    		dragstart_handler,
    		drag_handler,
    		dragend_handler
    	];
    }

    class Thumb extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { pos: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumb",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pos*/ ctx[0] === undefined && !('pos' in props)) {
    			console.warn("<Thumb> was created without expected prop 'pos'");
    		}
    	}

    	get pos() {
    		throw new Error("<Thumb>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<Thumb>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@bulatdashiev/svelte-slider/src/Slider.svelte generated by Svelte v3.49.0 */
    const file$9 = "node_modules/@bulatdashiev/svelte-slider/src/Slider.svelte";
    const get_right_slot_changes = dirty => ({});
    const get_right_slot_context = ctx => ({});
    const get_left_slot_changes = dirty => ({});
    const get_left_slot_context = ctx => ({});

    // (2:0) {#if range}
    function create_if_block_1$1(ctx) {
    	let input;
    	let input_value_value;
    	let input_name_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			input.value = input_value_value = /*value*/ ctx[0][1];
    			attr_dev(input, "name", input_name_value = /*name*/ ctx[1][1]);
    			attr_dev(input, "class", "svelte-1q9yxz9");
    			add_location(input, file$9, 2, 2, 72);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && input_value_value !== (input_value_value = /*value*/ ctx[0][1]) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*name*/ 2 && input_name_value !== (input_name_value = /*name*/ ctx[1][1])) {
    				attr_dev(input, "name", input_name_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(2:0) {#if range}",
    		ctx
    	});

    	return block;
    }

    // (11:12)           
    function fallback_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "thumb svelte-1q9yxz9");
    			add_location(div, file$9, 11, 8, 329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(11:12)           ",
    		ctx
    	});

    	return block;
    }

    // (10:22)         
    function fallback_block_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(10:22)         ",
    		ctx
    	});

    	return block;
    }

    // (9:2) <Thumb bind:pos={pos[0]} on:active={({ detail: v }) => active = v}>
    function create_default_slot_1$1(ctx) {
    	let current;
    	const left_slot_template = /*#slots*/ ctx[10].left;
    	const left_slot = create_slot(left_slot_template, ctx, /*$$scope*/ ctx[15], get_left_slot_context);
    	const left_slot_or_fallback = left_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (left_slot_or_fallback) left_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (left_slot_or_fallback) {
    				left_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (left_slot) {
    				if (left_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						left_slot,
    						left_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(left_slot_template, /*$$scope*/ ctx[15], dirty, get_left_slot_changes),
    						get_left_slot_context
    					);
    				}
    			} else {
    				if (left_slot_or_fallback && left_slot_or_fallback.p && (!current || dirty & /*$$scope*/ 32768)) {
    					left_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(left_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(left_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (left_slot_or_fallback) left_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(9:2) <Thumb bind:pos={pos[0]} on:active={({ detail: v }) => active = v}>",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if range}
    function create_if_block$3(ctx) {
    	let thumb;
    	let updating_pos;
    	let current;

    	function thumb_pos_binding_1(value) {
    		/*thumb_pos_binding_1*/ ctx[13](value);
    	}

    	let thumb_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*pos*/ ctx[3][1] !== void 0) {
    		thumb_props.pos = /*pos*/ ctx[3][1];
    	}

    	thumb = new Thumb({ props: thumb_props, $$inline: true });
    	binding_callbacks.push(() => bind(thumb, 'pos', thumb_pos_binding_1));
    	thumb.$on("active", /*active_handler_1*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(thumb.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumb, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const thumb_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				thumb_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_pos && dirty & /*pos*/ 8) {
    				updating_pos = true;
    				thumb_changes.pos = /*pos*/ ctx[3][1];
    				add_flush_callback(() => updating_pos = false);
    			}

    			thumb.$set(thumb_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumb.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumb.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumb, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(16:2) {#if range}",
    		ctx
    	});

    	return block;
    }

    // (19:14)             
    function fallback_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "thumb svelte-1q9yxz9");
    			add_location(div, file$9, 19, 10, 533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(19:14)             ",
    		ctx
    	});

    	return block;
    }

    // (18:25)           
    function fallback_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(18:25)           ",
    		ctx
    	});

    	return block;
    }

    // (17:4) <Thumb bind:pos={pos[1]} on:active={({ detail: v }) => active = v}>
    function create_default_slot$1(ctx) {
    	let current;
    	const right_slot_template = /*#slots*/ ctx[10].right;
    	const right_slot = create_slot(right_slot_template, ctx, /*$$scope*/ ctx[15], get_right_slot_context);
    	const right_slot_or_fallback = right_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (right_slot_or_fallback) right_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (right_slot_or_fallback) {
    				right_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (right_slot) {
    				if (right_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						right_slot,
    						right_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(right_slot_template, /*$$scope*/ ctx[15], dirty, get_right_slot_changes),
    						get_right_slot_context
    					);
    				}
    			} else {
    				if (right_slot_or_fallback && right_slot_or_fallback.p && (!current || dirty & /*$$scope*/ 32768)) {
    					right_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(right_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(right_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (right_slot_or_fallback) right_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(17:4) <Thumb bind:pos={pos[1]} on:active={({ detail: v }) => active = v}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let input;
    	let input_value_value;
    	let input_name_value;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let thumb;
    	let updating_pos;
    	let t3;
    	let current;
    	let if_block0 = /*range*/ ctx[2] && create_if_block_1$1(ctx);

    	function thumb_pos_binding(value) {
    		/*thumb_pos_binding*/ ctx[11](value);
    	}

    	let thumb_props = {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*pos*/ ctx[3][0] !== void 0) {
    		thumb_props.pos = /*pos*/ ctx[3][0];
    	}

    	thumb = new Thumb({ props: thumb_props, $$inline: true });
    	binding_callbacks.push(() => bind(thumb, 'pos', thumb_pos_binding));
    	thumb.$on("active", /*active_handler*/ ctx[12]);
    	let if_block1 = /*range*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = space();
    			create_component(thumb.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(input, "type", "number");
    			input.value = input_value_value = /*value*/ ctx[0][0];
    			attr_dev(input, "name", input_name_value = /*name*/ ctx[1][0]);
    			attr_dev(input, "class", "svelte-1q9yxz9");
    			add_location(input, file$9, 0, 0, 0);
    			attr_dev(div0, "class", "progress svelte-1q9yxz9");
    			attr_dev(div0, "style", /*progress*/ ctx[5]);
    			add_location(div0, file$9, 5, 2, 159);
    			attr_dev(div1, "class", "track svelte-1q9yxz9");
    			add_location(div1, file$9, 4, 0, 136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			mount_component(thumb, div1, null);
    			append_dev(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*value*/ 1 && input_value_value !== (input_value_value = /*value*/ ctx[0][0]) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (!current || dirty & /*name*/ 2 && input_name_value !== (input_name_value = /*name*/ ctx[1][0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (/*range*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*progress*/ 32) {
    				attr_dev(div0, "style", /*progress*/ ctx[5]);
    			}

    			const thumb_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				thumb_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_pos && dirty & /*pos*/ 8) {
    				updating_pos = true;
    				thumb_changes.pos = /*pos*/ ctx[3][0];
    				add_flush_callback(() => updating_pos = false);
    			}

    			thumb.$set(thumb_changes);

    			if (/*range*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*range*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumb.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumb.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(thumb);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkPos(pos) {
    	return [Math.min(...pos), Math.max(...pos)];
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, ['default','left','right']);
    	const dispatch = createEventDispatcher();
    	let { name = [] } = $$props;
    	let { range = false } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = 1 } = $$props;
    	let { value = [min, max] } = $$props;
    	let pos;
    	let active = false;
    	let { order = false } = $$props;

    	function setValue(pos) {
    		const offset = min % step;
    		const width = max - min;
    		$$invalidate(0, value = pos.map(v => min + v * width).map(v => Math.round((v - offset) / step) * step + offset));
    		dispatch("input", value);
    	}

    	function setPos(value) {
    		$$invalidate(3, pos = value.map(v => Math.min(Math.max(v, min), max)).map(v => (v - min) / (max - min)));
    	}

    	function clamp() {
    		setPos(value);
    		setValue(pos);
    	}

    	const writable_props = ['name', 'range', 'min', 'max', 'step', 'value', 'order'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function thumb_pos_binding(value) {
    		if ($$self.$$.not_equal(pos[0], value)) {
    			pos[0] = value;
    			((($$invalidate(3, pos), $$invalidate(2, range)), $$invalidate(9, order)), $$invalidate(4, active));
    		}
    	}

    	const active_handler = ({ detail: v }) => $$invalidate(4, active = v);

    	function thumb_pos_binding_1(value) {
    		if ($$self.$$.not_equal(pos[1], value)) {
    			pos[1] = value;
    			((($$invalidate(3, pos), $$invalidate(2, range)), $$invalidate(9, order)), $$invalidate(4, active));
    		}
    	}

    	const active_handler_1 = ({ detail: v }) => $$invalidate(4, active = v);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('range' in $$props) $$invalidate(2, range = $$props.range);
    		if ('min' in $$props) $$invalidate(6, min = $$props.min);
    		if ('max' in $$props) $$invalidate(7, max = $$props.max);
    		if ('step' in $$props) $$invalidate(8, step = $$props.step);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('order' in $$props) $$invalidate(9, order = $$props.order);
    		if ('$$scope' in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Thumb,
    		dispatch,
    		name,
    		range,
    		min,
    		max,
    		step,
    		value,
    		pos,
    		active,
    		order,
    		setValue,
    		setPos,
    		checkPos,
    		clamp,
    		progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('range' in $$props) $$invalidate(2, range = $$props.range);
    		if ('min' in $$props) $$invalidate(6, min = $$props.min);
    		if ('max' in $$props) $$invalidate(7, max = $$props.max);
    		if ('step' in $$props) $$invalidate(8, step = $$props.step);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('pos' in $$props) $$invalidate(3, pos = $$props.pos);
    		if ('active' in $$props) $$invalidate(4, active = $$props.active);
    		if ('order' in $$props) $$invalidate(9, order = $$props.order);
    		if ('progress' in $$props) $$invalidate(5, progress = $$props.progress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*range, order, active, pos*/ 540) {
    			if (range && order && active) $$invalidate(3, pos = checkPos(pos));
    		}

    		if ($$self.$$.dirty & /*active, pos*/ 24) {
    			if (active) setValue(pos);
    		}

    		if ($$self.$$.dirty & /*active, value*/ 17) {
    			if (!active) setPos(value);
    		}

    		if ($$self.$$.dirty & /*min, max*/ 192) {
    			(clamp());
    		}

    		if ($$self.$$.dirty & /*range, pos*/ 12) {
    			$$invalidate(5, progress = `
    left: ${range ? Math.min(pos[0], pos[1]) * 100 : 0}%;
    right: ${100 - Math.max(pos[0], range ? pos[1] : pos[0]) * 100}%;
  `);
    		}
    	};

    	return [
    		value,
    		name,
    		range,
    		pos,
    		active,
    		progress,
    		min,
    		max,
    		step,
    		order,
    		slots,
    		thumb_pos_binding,
    		active_handler,
    		thumb_pos_binding_1,
    		active_handler_1,
    		$$scope
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			name: 1,
    			range: 2,
    			min: 6,
    			max: 7,
    			step: 8,
    			value: 0,
    			order: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get name() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get range() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set range(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get order() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ColorSelector.svelte generated by Svelte v3.49.0 */

    function create_fragment$a(ctx) {
    	let t;
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[1](value);
    	}

    	let slider_props = {
    		max: "360",
    		step: "10",
    		range: true,
    		order: true
    	};

    	if (/*$huerange*/ ctx[0] !== void 0) {
    		slider_props.value = /*$huerange*/ ctx[0];
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding));

    	const block = {
    		c: function create() {
    			t = text("Color theme\n");
    			create_component(slider.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slider_changes = {};

    			if (!updating_value && dirty & /*$huerange*/ 1) {
    				updating_value = true;
    				slider_changes.value = /*$huerange*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $huerange;
    	validate_store(huerange, 'huerange');
    	component_subscribe($$self, huerange, $$value => $$invalidate(0, $huerange = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorSelector', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorSelector> was created with unknown prop '${key}'`);
    	});

    	function slider_value_binding(value) {
    		$huerange = value;
    		huerange.set($huerange);
    	}

    	$$self.$capture_state = () => ({ Slider, huerange, $huerange });
    	return [$huerange, slider_value_binding];
    }

    class ColorSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorSelector",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Hour.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/Hour.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:1) {#each items as value}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*value*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*value*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$8, 9, 23, 210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(10:1) {#each items as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*$hour*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$8, 8, 0, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$hour*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 2) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$hour, items*/ 3) {
    				select_option(select, /*$hour*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $hour;
    	validate_store(hour, 'hour');
    	component_subscribe($$self, hour, $$value => $$invalidate(0, $hour = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hour', slots, []);
    	const items = [...Array(24).keys()];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hour> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$hour = select_value(this);
    		hour.set($hour);
    		$$invalidate(1, items);
    	}

    	$$self.$capture_state = () => ({ items, hour, $hour });
    	return [$hour, items, select_change_handler];
    }

    class Hour extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hour",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Minute.svelte generated by Svelte v3.49.0 */
    const file$7 = "src/Minute.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:1) {#each items as value}
    function create_each_block$4(ctx) {
    	let option;
    	let t_value = /*value*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*value*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$7, 9, 23, 219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(10:1) {#each items as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*$minute*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$7, 8, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$minute*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 2) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$minute, items*/ 3) {
    				select_option(select, /*$minute*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $minute;
    	validate_store(minute, 'minute');
    	component_subscribe($$self, minute, $$value => $$invalidate(0, $minute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Minute', slots, []);
    	const items = [...Array(60).keys()];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Minute> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$minute = select_value(this);
    		minute.set($minute);
    		$$invalidate(1, items);
    	}

    	$$self.$capture_state = () => ({ items, minute, $minute });
    	return [$minute, items, select_change_handler];
    }

    class Minute extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Minute",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    function accum(tiles, index, category, minute) {
        if (!(index in tiles)) {
            tiles[index] = {};
        }
        if (!(category in tiles[index])) {
            tiles[index][category] = 0;
        }
        tiles[index][category] += minute;
    }

    function statistics(events, binw, oldest) {
        let tiles = {};
        const JSTFIX = 9 * 60;
        const date = new Date();
        const now = date.getTime() / 1000 / 60; // in minute
        const origin = now + JSTFIX;
        tiles = {};
        // ひとつあとのイベントがはじまった時刻
        let laststart = 0;
        // 時間をさかのぼる順序で
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let endtime = event[1];
            if (oldest > endtime) {
                break;
            }
            if (laststart == 0) {
                laststart = endtime;
            }
            let duration = event[2];
            // 重なっている時は、新しい記録を信じ、古いほうを削る。
            if (laststart < endtime) {
                duration -= (endtime - laststart);
                endtime = laststart;
                if (duration < 0) {
                    continue;
                }
            }
            laststart = endtime - duration;
            const category = event[3];
            const bin = Math.floor((endtime + JSTFIX) / binw);
            let dbin = Math.floor(origin / binw) - bin;
            let left = endtime + JSTFIX - bin * binw;
            while (left < duration) {
                accum(tiles, dbin, category, left);
                duration -= left;
                dbin++;
                left = binw;
            }
            if (duration > 0) {
                accum(tiles, dbin, category, duration);
            }
        }
        for (let bin in tiles) {
            let sum = 0;
            for (let cat in tiles[bin]) {
                sum += tiles[bin][cat];
            }
            const unaccounted = binw - sum;
            if (unaccounted > 0) {
                tiles[bin][-1] = unaccounted;
            }
        }
        return tiles;
    }

    /* src/HourStat.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$2 } = globals;
    const file$6 = "src/HourStat.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (17:0) {#if Object.keys(tiles).length}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let each_value = Array(24);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, tiles, $palettes, hours*/ 7) {
    				each_value = Array(24);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(17:0) {#if Object.keys(tiles).length}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if tiles[i]}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = Object.keys(/*tiles*/ ctx[0][/*i*/ ctx[5]]).sort();
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tiles, Object, $palettes*/ 5) {
    				each_value_1 = Object.keys(/*tiles*/ ctx[0][/*i*/ ctx[5]]).sort();
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:4) {#if tiles[i]}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#each Object.keys(tiles[i]).sort() as cat}
    function create_each_block_1$2(ctx) {
    	let div;
    	let t0_value = /*cat*/ ctx[6] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "ca svelte-k4odoq");
    			set_style(div, "width", /*tiles*/ ctx[0][/*i*/ ctx[5]][/*cat*/ ctx[6]] + "%");
    			set_style(div, "background-color", /*$palettes*/ ctx[2][/*cat*/ ctx[6]]);
    			add_location(div, file$6, 22, 4, 647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tiles*/ 1 && t0_value !== (t0_value = /*cat*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*tiles*/ 1) {
    				set_style(div, "width", /*tiles*/ ctx[0][/*i*/ ctx[5]][/*cat*/ ctx[6]] + "%");
    			}

    			if (dirty & /*$palettes, tiles*/ 5) {
    				set_style(div, "background-color", /*$palettes*/ ctx[2][/*cat*/ ctx[6]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(22:4) {#each Object.keys(tiles[i]).sort() as cat}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#each Array(24) as delta, i}
    function create_each_block$3(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*hours*/ ctx[1][/*i*/ ctx[5]] + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block = /*tiles*/ ctx[0][/*i*/ ctx[5]] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(div0, "class", "he svelte-k4odoq");
    			add_location(div0, file$6, 19, 4, 543);
    			attr_dev(div1, "class", "ti svelte-k4odoq");
    			add_location(div1, file$6, 18, 0, 522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hours*/ 2 && t0_value !== (t0_value = /*hours*/ ctx[1][/*i*/ ctx[5]] + "")) set_data_dev(t0, t0_value);

    			if (/*tiles*/ ctx[0][/*i*/ ctx[5]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(18:0) {#each Array(24) as delta, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let show_if = Object.keys(/*tiles*/ ctx[0]).length;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tiles*/ 1) show_if = Object.keys(/*tiles*/ ctx[0]).length;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $palettes;
    	validate_store(palettes, 'palettes');
    	component_subscribe($$self, palettes, $$value => $$invalidate(2, $palettes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HourStat', slots, []);
    	let tiles = {};
    	let hours = [];

    	history.subscribe(events => {
    		const date = new Date();
    		const now = date.getTime() / 1000 / 60; // in minute
    		const h = date.getHours();
    		$$invalidate(0, tiles = statistics(events, 60, now - 60 * 24));

    		for (let i = 0; i < 24; i++) {
    			$$invalidate(1, hours = [...hours, (h - i + 24) % 24]);
    		}
    	});

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HourStat> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		history,
    		palettes,
    		statistics,
    		tiles,
    		hours,
    		$palettes
    	});

    	$$self.$inject_state = $$props => {
    		if ('tiles' in $$props) $$invalidate(0, tiles = $$props.tiles);
    		if ('hours' in $$props) $$invalidate(1, hours = $$props.hours);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tiles, hours, $palettes];
    }

    class HourStat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HourStat",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/DayStat.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$1 } = globals;
    const file$5 = "src/DayStat.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (16:0) {#if Object.keys(tiles).length}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = Object.keys(/*tiles*/ ctx[0]).sort();
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, tiles, $palettes, daynames*/ 7) {
    				each_value = Object.keys(/*tiles*/ ctx[0]).sort();
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(16:0) {#if Object.keys(tiles).length}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#each Object.keys(tiles[day]).sort() as cat}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*cat*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "ca svelte-zxcc2p");
    			set_style(div, "width", /*tiles*/ ctx[0][/*day*/ ctx[3]][/*cat*/ ctx[6]] + "px");
    			set_style(div, "background-color", /*$palettes*/ ctx[1][/*cat*/ ctx[6]]);
    			add_location(div, file$5, 20, 4, 722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tiles*/ 1 && t_value !== (t_value = /*cat*/ ctx[6] + "")) set_data_dev(t, t_value);

    			if (dirty & /*tiles*/ 1) {
    				set_style(div, "width", /*tiles*/ ctx[0][/*day*/ ctx[3]][/*cat*/ ctx[6]] + "px");
    			}

    			if (dirty & /*$palettes, tiles*/ 3) {
    				set_style(div, "background-color", /*$palettes*/ ctx[1][/*cat*/ ctx[6]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(20:4) {#each Object.keys(tiles[day]).sort() as cat}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#each Object.keys(tiles).sort() as day, i}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*daynames*/ ctx[2][/*day*/ ctx[3]] + "";
    	let t0;
    	let t1;
    	let t2;
    	let each_value_1 = Object.keys(/*tiles*/ ctx[0][/*day*/ ctx[3]]).sort();
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(div0, "class", "he svelte-zxcc2p");
    			add_location(div0, file$5, 18, 4, 630);
    			attr_dev(div1, "class", "ti svelte-zxcc2p");
    			add_location(div1, file$5, 17, 0, 609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tiles*/ 1 && t0_value !== (t0_value = /*daynames*/ ctx[2][/*day*/ ctx[3]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*tiles, Object, $palettes*/ 3) {
    				each_value_1 = Object.keys(/*tiles*/ ctx[0][/*day*/ ctx[3]]).sort();
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:0) {#each Object.keys(tiles).sort() as day, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let show_if = Object.keys(/*tiles*/ ctx[0]).length;
    	let if_block = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container svelte-zxcc2p");
    			add_location(div, file$5, 14, 0, 509);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tiles*/ 1) show_if = Object.keys(/*tiles*/ ctx[0]).length;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $palettes;
    	validate_store(palettes, 'palettes');
    	component_subscribe($$self, palettes, $$value => $$invalidate(1, $palettes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DayStat', slots, []);
    	let tiles = {};

    	history.subscribe(events => {
    		const binw = 60 * 24;
    		const date = new Date();
    		const now = date.getTime() / 1000 / 60; // in minute
    		const oldest = now - 24 * 60 * 7;
    		$$invalidate(0, tiles = statistics(events, binw, oldest));
    	});

    	const daynames = [
    		"Today",
    		"Yesterday",
    		"2 days ago",
    		"3 days ago",
    		"4 days ago",
    		"5 days ago",
    		"6 days ago",
    		"A week ago"
    	];

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DayStat> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		history,
    		palettes,
    		statistics,
    		tiles,
    		daynames,
    		$palettes
    	});

    	$$self.$inject_state = $$props => {
    		if ('tiles' in $$props) $$invalidate(0, tiles = $$props.tiles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tiles, $palettes, daynames];
    }

    class DayStat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DayStat",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/EventList.svelte generated by Svelte v3.49.0 */
    const file$4 = "src/EventList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (35:8) {#each events as event, i}
    function create_each_block_1(ctx) {
    	let div;
    	let t0_value = /*event*/ ctx[5][5] + "";
    	let t0;
    	let t1;
    	let t2_value = /*event*/ ctx[5][6] + "";
    	let t2;
    	let t3;
    	let t4_value = /*event*/ ctx[5][4] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = text(t2_value);
    			t3 = text(" | ");
    			t4 = text(t4_value);
    			attr_dev(div, "class", "ev svelte-58lemi");
    			set_style(div, "background-color", /*$palettes*/ ctx[1][/*event*/ ctx[5][3]]);
    			add_location(div, file$4, 36, 8, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*days*/ 1 && t0_value !== (t0_value = /*event*/ ctx[5][5] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*days*/ 1 && t2_value !== (t2_value = /*event*/ ctx[5][6] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*days*/ 1 && t4_value !== (t4_value = /*event*/ ctx[5][4] + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$palettes, days*/ 3) {
    				set_style(div, "background-color", /*$palettes*/ ctx[1][/*event*/ ctx[5][3]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(35:8) {#each events as event, i}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#each days as events}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*events*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "list svelte-58lemi");
    			add_location(div, file$4, 33, 4, 795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$palettes, days*/ 3) {
    				each_value_1 = /*events*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(33:4) {#each days as events}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let each_value = /*days*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-58lemi");
    			add_location(div, file$4, 31, 0, 740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*days, $palettes*/ 3) {
    				each_value = /*days*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $palettes;
    	validate_store(palettes, 'palettes');
    	component_subscribe($$self, palettes, $$value => $$invalidate(1, $palettes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EventList', slots, []);
    	let days = [];
    	let events = [];

    	history.subscribe(h => {
    		$$invalidate(0, days = []);
    		$$invalidate(2, events = []);
    		let today = 0;

    		for (let i = 0; i < h.length; i++) {
    			let event = h[i];
    			let daycode = Math.floor(event[1] / (24 * 60));

    			if (today == 0) {
    				today = daycode;
    			}

    			if (daycode != today) {
    				today = daycode;
    				$$invalidate(0, days = [...days, events]);

    				if (days.length >= 7) {
    					return;
    				}

    				$$invalidate(2, events = []);
    			}

    			$$invalidate(2, events = [...events, event]);
    		}

    		if (events.length > 0) {
    			$$invalidate(0, days = [...days, events]);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EventList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		history,
    		palettes,
    		days,
    		events,
    		$palettes
    	});

    	$$self.$inject_state = $$props => {
    		if ('days' in $$props) $$invalidate(0, days = $$props.days);
    		if ('events' in $$props) $$invalidate(2, events = $$props.events);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [days, $palettes, events];
    }

    class EventList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventList",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Components/LogoutComponent.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/Components/LogoutComponent.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Logout";
    			attr_dev(button, "class", "svelte-2o1wk3");
    			add_location(button, file$3, 12, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*logout*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LogoutComponent', slots, []);

    	const logout = () => {
    		token.set("");
    		history.set([]);
    		cats.set({});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LogoutComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ token, history, cats, logout });
    	return [logout];
    }

    class LogoutComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogoutComponent",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Main.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1 } = globals;
    const file$2 = "src/Main.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:1) {#each Object.keys($cats) as id}
    function create_each_block(ctx) {
    	let category;
    	let current;

    	category = new Category({
    			props: { id: /*id*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(category.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(category, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const category_changes = {};
    			if (dirty & /*$cats*/ 1) category_changes.id = /*id*/ ctx[3];
    			category.$set(category_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(category.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(category.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(category, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:1) {#each Object.keys($cats) as id}",
    		ctx
    	});

    	return block;
    }

    // (41:3) <Tab>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Events");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(41:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (42:3) <Tab>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hourly stat");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(42:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (43:3) <Tab>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Daily stat");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(43:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (44:3) <Tab>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Settings");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(44:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (40:2) <TabList>
    function create_default_slot_5(ctx) {
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tab1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tab2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tab3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tab1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tab2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tab3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(40:2) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (47:2) <TabPanel>
    function create_default_slot_4(ctx) {
    	let eventlist;
    	let current;
    	eventlist = new EventList({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(eventlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eventlist, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eventlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eventlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eventlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(47:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (51:2) <TabPanel>
    function create_default_slot_3(ctx) {
    	let hourstat;
    	let current;
    	hourstat = new HourStat({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(hourstat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hourstat, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hourstat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hourstat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hourstat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(51:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (55:2) <TabPanel>
    function create_default_slot_2(ctx) {
    	let daystat;
    	let current;
    	daystat = new DayStat({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(daystat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(daystat, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(daystat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(daystat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(daystat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(55:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (59:2) <TabPanel>
    function create_default_slot_1(ctx) {
    	let colorselector;
    	let current;
    	colorselector = new ColorSelector({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(colorselector.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(colorselector, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(colorselector, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(59:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (39:1) <Tabs>
    function create_default_slot(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let t2;
    	let tabpanel2;
    	let t3;
    	let tabpanel3;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel2 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel3 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    			t2 = space();
    			create_component(tabpanel2.$$.fragment);
    			t3 = space();
    			create_component(tabpanel3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tabpanel2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabpanel3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    			const tabpanel2_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel2_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel2.$set(tabpanel2_changes);
    			const tabpanel3_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel3_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel3.$set(tabpanel3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			transition_in(tabpanel2.$$.fragment, local);
    			transition_in(tabpanel3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			transition_out(tabpanel2.$$.fragment, local);
    			transition_out(tabpanel3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tabpanel2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabpanel3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(39:1) <Tabs>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let logoutcomponent;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let p;
    	let hour;
    	let t3;
    	let minute;
    	let t4;
    	let t5;
    	let t6;
    	let button;
    	let t8;
    	let tabs;
    	let current;
    	let mounted;
    	let dispose;
    	logoutcomponent = new LogoutComponent({ $$inline: true });
    	hour = new Hour({ $$inline: true });
    	minute = new Minute({ $$inline: true });
    	let each_value = Object.keys(/*$cats*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(logoutcomponent.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*$status*/ ctx[1]);
    			t2 = space();
    			p = element("p");
    			create_component(hour.$$.fragment);
    			t3 = text("時");
    			create_component(minute.$$.fragment);
    			t4 = text("分以降、何をしていましたか?");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			button = element("button");
    			button.textContent = "+ New Category";
    			t8 = space();
    			create_component(tabs.$$.fragment);
    			attr_dev(span, "class", "svelte-l5es51");
    			add_location(span, file$2, 29, 1, 725);
    			attr_dev(p, "class", "svelte-l5es51");
    			add_location(p, file$2, 30, 1, 749);
    			attr_dev(button, "name", "name");
    			add_location(button, file$2, 36, 1, 857);
    			add_location(main, file$2, 27, 0, 696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(logoutcomponent, main, null);
    			append_dev(main, t0);
    			append_dev(main, span);
    			append_dev(span, t1);
    			append_dev(main, t2);
    			append_dev(main, p);
    			mount_component(hour, p, null);
    			append_dev(p, t3);
    			mount_component(minute, p, null);
    			append_dev(p, t4);
    			append_dev(main, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t6);
    			append_dev(main, button);
    			append_dev(main, t8);
    			mount_component(tabs, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addCategory*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$status*/ 2) set_data_dev(t1, /*$status*/ ctx[1]);

    			if (dirty & /*Object, $cats*/ 1) {
    				each_value = Object.keys(/*$cats*/ ctx[0]);
    				validate_each_argument(each_value);
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
    						each_blocks[i].m(main, t6);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logoutcomponent.$$.fragment, local);
    			transition_in(hour.$$.fragment, local);
    			transition_in(minute.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logoutcomponent.$$.fragment, local);
    			transition_out(hour.$$.fragment, local);
    			transition_out(minute.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(logoutcomponent);
    			destroy_component(hour);
    			destroy_component(minute);
    			destroy_each(each_blocks, detaching);
    			destroy_component(tabs);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $cats;
    	let $status;
    	validate_store(cats, 'cats');
    	component_subscribe($$self, cats, $$value => $$invalidate(0, $cats = $$value));
    	validate_store(status, 'status');
    	component_subscribe($$self, status, $$value => $$invalidate(1, $status = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	getHistory();

    	setInterval(
    		() => {
    			getHistory(); // every one minute
    		},
    		60 * 1000
    	); // every one minute

    	function addCategory() {
    		let c = 0;

    		while (c in $cats) {
    			c++;
    		}

    		set_store_value(cats, $cats[c] = {}, $cats);
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tabs,
    		TabList,
    		TabPanel,
    		Tab,
    		Category,
    		ColorSelector,
    		Hour,
    		Minute,
    		HourStat,
    		DayStat,
    		EventList,
    		LogoutComponent,
    		cats,
    		getHistory,
    		status,
    		addCategory,
    		$cats,
    		$status
    	});

    	return [$cats, $status, addCategory];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Components/AfterLogin.svelte generated by Svelte v3.49.0 */

    function create_fragment$2(ctx) {
    	let main;
    	let current;
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AfterLogin', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AfterLogin> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Main });
    	return [];
    }

    class AfterLogin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AfterLogin",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Components/LoginComponent.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/Components/LoginComponent.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let button;
    	let t7;
    	let div2;
    	let small;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t7 = space();
    			div2 = element("div");
    			small = element("small");
    			t8 = text(/*error*/ ctx[2]);
    			attr_dev(label0, "for", "username");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$1, 29, 2, 675);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "autocomplete", "username");
    			add_location(input0, file$1, 31, 2, 826);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$1, 28, 1, 654);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "form-label");
    			add_location(label1, file$1, 35, 2, 959);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "password");
    			add_location(input1, file$1, 36, 2, 1019);
    			attr_dev(div1, "class", "mb-3");
    			add_location(div1, file$1, 34, 1, 938);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 39, 1, 1112);
    			add_location(small, file$1, 41, 2, 1222);
    			attr_dev(div2, "id", "error_message");
    			attr_dev(div2, "class", "text-danger");
    			add_location(div2, file$1, 40, 1, 1175);
    			attr_dev(form, "class", "flex mx-auto col-6 svelte-1pe6clv");
    			add_location(form, file$1, 26, 0, 585);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, button);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, small);
    			append_dev(small, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*login*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (dirty & /*error*/ 4) set_data_dev(t8, /*error*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoginComponent', slots, []);
    	let username = '';
    	let password = '';
    	let error = '';

    	async function login() {

    		getToken(username, password).then(tok => {
    			if (tok) {
    				if (error) $$invalidate(2, error = '');
    			} else {
    				$$invalidate(2, error = 'Incorrect username and password.');
    				console.log("Incorrect username and password.");
    			}
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<LoginComponent> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		token,
    		getToken,
    		get: get_store_value,
    		username,
    		password,
    		error,
    		login
    	});

    	$$self.$inject_state = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [username, password, error, login, input0_input_handler, input1_input_handler];
    }

    class LoginComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginComponent",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (18:0) {:else }
    function create_else_block(ctx) {
    	let logincomponent;
    	let current;
    	logincomponent = new LoginComponent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(logincomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(logincomponent, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logincomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logincomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(logincomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:0) {:else }",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if $token != "" }
    function create_if_block(ctx) {
    	let afterlogin;
    	let current;
    	afterlogin = new AfterLogin({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(afterlogin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(afterlogin, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(afterlogin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(afterlogin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(afterlogin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if $token != \\\"\\\" }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let meta;
    	let html;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$token*/ ctx[0] != "") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			html = element("html");
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			document.title = "TimeAccount 2022";
    			attr_dev(meta, "name", "robots");
    			attr_dev(meta, "content", "noindex nofollow");
    			add_location(meta, file, 10, 1, 273);
    			attr_dev(html, "lang", "en");
    			add_location(html, file, 11, 1, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta);
    			append_dev(document.head, html);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			detach_dev(html);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $token;
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(0, $token = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AfterLogin,
    		token,
    		LoginComponent,
    		$token
    	});

    	return [$token];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
