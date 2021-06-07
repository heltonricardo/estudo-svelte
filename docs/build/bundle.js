
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
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
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
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

    /* src\Basic\ContactCard.svelte generated by Svelte v3.38.2 */

    const file$d = "src\\Basic\\ContactCard.svelte";

    function create_fragment$e(ctx) {
    	let div3;
    	let header;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let h2;
    	let t3;
    	let t4;
    	let div2;
    	let p;
    	let t5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(/*userName*/ ctx[0]);
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(/*jobTitle*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			p = element("p");
    			t5 = text(/*description*/ ctx[2]);
    			if (img.src !== (img_src_value = /*userImage*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*userName*/ ctx[0]);
    			attr_dev(img, "class", "svelte-p7z0xn");
    			add_location(img, file$d, 10, 6, 221);
    			attr_dev(div0, "class", "thumb svelte-p7z0xn");
    			toggle_class(div0, "thumb-placeholder", !/*userImage*/ ctx[3]);
    			add_location(div0, file$d, 9, 4, 158);
    			attr_dev(h1, "class", "svelte-p7z0xn");
    			add_location(h1, file$d, 13, 6, 305);
    			attr_dev(h2, "class", "svelte-p7z0xn");
    			add_location(h2, file$d, 14, 6, 331);
    			attr_dev(div1, "class", "user-data svelte-p7z0xn");
    			add_location(div1, file$d, 12, 4, 275);
    			attr_dev(header, "class", "svelte-p7z0xn");
    			add_location(header, file$d, 8, 2, 145);
    			add_location(p, file$d, 18, 4, 406);
    			attr_dev(div2, "class", "description svelte-p7z0xn");
    			add_location(div2, file$d, 17, 2, 376);
    			attr_dev(div3, "class", "contact-card svelte-p7z0xn");
    			add_location(div3, file$d, 7, 0, 116);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
    			append_dev(header, div0);
    			append_dev(div0, img);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(h2, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userImage*/ 8 && img.src !== (img_src_value = /*userImage*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*userName*/ 1) {
    				attr_dev(img, "alt", /*userName*/ ctx[0]);
    			}

    			if (dirty & /*userImage*/ 8) {
    				toggle_class(div0, "thumb-placeholder", !/*userImage*/ ctx[3]);
    			}

    			if (dirty & /*userName*/ 1) set_data_dev(t1, /*userName*/ ctx[0]);
    			if (dirty & /*jobTitle*/ 2) set_data_dev(t3, /*jobTitle*/ ctx[1]);
    			if (dirty & /*description*/ 4) set_data_dev(t5, /*description*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactCard", slots, []);
    	let { userName } = $$props;
    	let { jobTitle } = $$props;
    	let { description } = $$props;
    	let { userImage } = $$props;
    	const writable_props = ["userName", "jobTitle", "description", "userImage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("jobTitle" in $$props) $$invalidate(1, jobTitle = $$props.jobTitle);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("userImage" in $$props) $$invalidate(3, userImage = $$props.userImage);
    	};

    	$$self.$capture_state = () => ({
    		userName,
    		jobTitle,
    		description,
    		userImage
    	});

    	$$self.$inject_state = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("jobTitle" in $$props) $$invalidate(1, jobTitle = $$props.jobTitle);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("userImage" in $$props) $$invalidate(3, userImage = $$props.userImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [userName, jobTitle, description, userImage];
    }

    class ContactCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			userName: 0,
    			jobTitle: 1,
    			description: 2,
    			userImage: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactCard",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*userName*/ ctx[0] === undefined && !("userName" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'userName'");
    		}

    		if (/*jobTitle*/ ctx[1] === undefined && !("jobTitle" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'jobTitle'");
    		}

    		if (/*description*/ ctx[2] === undefined && !("description" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'description'");
    		}

    		if (/*userImage*/ ctx[3] === undefined && !("userImage" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'userImage'");
    		}
    	}

    	get userName() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userName(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jobTitle() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobTitle(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userImage() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userImage(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Basic\Basic.svelte generated by Svelte v3.38.2 */
    const file$c = "src\\Basic\\Basic.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (73:0) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please enter some data and hit the button!";
    			add_location(p, file$c, 73, 2, 1760);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(73:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:0) {#if formState === "invalid"}
    function create_if_block$5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Invalid input.";
    			add_location(p, file$c, 71, 2, 1726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(71:0) {#if formState === \\\"invalid\\\"}",
    		ctx
    	});

    	return block;
    }

    // (86:0) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please start adding some contacts, we found none!";
    			add_location(p, file$c, 86, 2, 2077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(86:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:0) {#each createdContacts as contact, i (contact.id)}
    function create_each_block$3(key_1, ctx) {
    	let h2;
    	let t0;
    	let t1_value = /*i*/ ctx[15] + 1 + "";
    	let t1;
    	let t2;
    	let contactcard;
    	let current;

    	contactcard = new ContactCard({
    			props: {
    				userName: /*contact*/ ctx[13].name,
    				jobTitle: /*contact*/ ctx[13].jobTitle,
    				description: /*contact*/ ctx[13].desc,
    				userImage: /*contact*/ ctx[13].imageURL
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("# ");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(contactcard.$$.fragment);
    			add_location(h2, file$c, 78, 2, 1896);
    			this.first = h2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*createdContacts*/ 32) && t1_value !== (t1_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t1, t1_value);
    			const contactcard_changes = {};
    			if (dirty & /*createdContacts*/ 32) contactcard_changes.userName = /*contact*/ ctx[13].name;
    			if (dirty & /*createdContacts*/ 32) contactcard_changes.jobTitle = /*contact*/ ctx[13].jobTitle;
    			if (dirty & /*createdContacts*/ 32) contactcard_changes.description = /*contact*/ ctx[13].desc;
    			if (dirty & /*createdContacts*/ 32) contactcard_changes.userImage = /*contact*/ ctx[13].imageURL;
    			contactcard.$set(contactcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t2);
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(78:0) {#each createdContacts as contact, i (contact.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
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
    	let div2;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div3;
    	let label3;
    	let t10;
    	let textarea;
    	let t11;
    	let button0;
    	let t13;
    	let button1;
    	let t15;
    	let button2;
    	let t17;
    	let t18;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*formState*/ ctx[4] === "invalid") return create_if_block$5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*createdContacts*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*contact*/ ctx[13].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "User Name";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Job Title";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Image URL";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Description";
    			t10 = space();
    			textarea = element("textarea");
    			t11 = space();
    			button0 = element("button");
    			button0.textContent = "Add Contact Card";
    			t13 = space();
    			button1 = element("button");
    			button1.textContent = "Delete first";
    			t15 = space();
    			button2 = element("button");
    			button2.textContent = "Delete last";
    			t17 = space();
    			if_block.c();
    			t18 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(label0, "for", "userName");
    			add_location(label0, file$c, 48, 4, 937);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "userName");
    			add_location(input0, file$c, 49, 4, 982);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$c, 47, 2, 905);
    			attr_dev(label1, "for", "jobTitle");
    			add_location(label1, file$c, 52, 4, 1081);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "jobTitle");
    			add_location(input1, file$c, 53, 4, 1126);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$c, 51, 2, 1049);
    			attr_dev(label2, "for", "image");
    			add_location(label2, file$c, 56, 4, 1226);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "image");
    			add_location(input2, file$c, 57, 4, 1268);
    			attr_dev(div2, "class", "form-control");
    			add_location(div2, file$c, 55, 2, 1194);
    			attr_dev(label3, "for", "desc");
    			add_location(label3, file$c, 60, 4, 1365);
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "id", "desc");
    			add_location(textarea, file$c, 61, 4, 1408);
    			attr_dev(div3, "class", "form-control");
    			add_location(div3, file$c, 59, 2, 1333);
    			add_location(button0, file$c, 64, 2, 1502);
    			attr_dev(form, "id", "form");
    			attr_dev(form, "class", "svelte-wr3rg0");
    			add_location(form, file$c, 46, 0, 885);
    			add_location(button1, file$c, 67, 0, 1585);
    			add_location(button2, file$c, 68, 0, 1639);
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
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*title*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t7);
    			append_dev(div2, input2);
    			set_input_value(input2, /*image*/ ctx[2]);
    			append_dev(form, t8);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t10);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*description*/ ctx[3]);
    			append_dev(form, t11);
    			append_dev(form, button0);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t17, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t18, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12]),
    					listen_dev(button0, "click", prevent_default(/*addContact*/ ctx[6]), false, true, false),
    					listen_dev(button1, "click", /*deleteFirst*/ ctx[7], false, false, false),
    					listen_dev(button2, "click", /*deleteLast*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*title*/ 2 && input1.value !== /*title*/ ctx[1]) {
    				set_input_value(input1, /*title*/ ctx[1]);
    			}

    			if (dirty & /*image*/ 4 && input2.value !== /*image*/ ctx[2]) {
    				set_input_value(input2, /*image*/ ctx[2]);
    			}

    			if (dirty & /*description*/ 8) {
    				set_input_value(textarea, /*description*/ ctx[3]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t18.parentNode, t18);
    				}
    			}

    			if (dirty & /*createdContacts*/ 32) {
    				each_value = /*createdContacts*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t17);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t18);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Basic", slots, []);
    	let name = "";
    	let title = "";
    	let image = "";
    	let description = "";
    	let formState = "empty";
    	let createdContacts = [];

    	function addContact() {
    		if (name.trim().length == 0 || title.trim().length == 0 || image.trim().length == 0 || description.trim().length == 0) {
    			$$invalidate(4, formState = "invalid");
    			return;
    		}

    		// Anotação 01
    		$$invalidate(5, createdContacts = [
    			...createdContacts,
    			{
    				id: Math.random(),
    				name,
    				jobTitle: title,
    				imageURL: image,
    				desc: description
    			}
    		]);

    		$$invalidate(4, formState = "done");
    	}

    	function deleteFirst() {
    		$$invalidate(5, createdContacts = createdContacts.slice(1));
    	}

    	function deleteLast() {
    		$$invalidate(5, createdContacts = createdContacts.slice(0, -1));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Basic> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		title = this.value;
    		$$invalidate(1, title);
    	}

    	function input2_input_handler() {
    		image = this.value;
    		$$invalidate(2, image);
    	}

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(3, description);
    	}

    	$$self.$capture_state = () => ({
    		ContactCard,
    		name,
    		title,
    		image,
    		description,
    		formState,
    		createdContacts,
    		addContact,
    		deleteFirst,
    		deleteLast
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("formState" in $$props) $$invalidate(4, formState = $$props.formState);
    		if ("createdContacts" in $$props) $$invalidate(5, createdContacts = $$props.createdContacts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		title,
    		image,
    		description,
    		formState,
    		createdContacts,
    		addContact,
    		deleteFirst,
    		deleteLast,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class Basic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Basic",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\ComponentEvents\Modal.svelte generated by Svelte v3.38.2 */

    const { console: console_1$3 } = globals;

    const file$b = "src\\ComponentEvents\\Modal.svelte";
    const get_footer_slot_changes = dirty => ({ didAgree: dirty & /*agreed*/ 1 });
    const get_footer_slot_context = ctx => ({ didAgree: /*agreed*/ ctx[0] });
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (90:42)         
    function fallback_block(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Close");
    			button.disabled = button_disabled_value = !/*agreed*/ ctx[0];
    			add_location(button, file$b, 90, 6, 1831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*agreed*/ 1 && button_disabled_value !== (button_disabled_value = !/*agreed*/ ctx[0])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(90:42)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let header;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let p;
    	let t4;
    	let button;
    	let t6;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*#slots*/ ctx[3].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[2], get_header_slot_context);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	const footer_slot_template = /*#slots*/ ctx[3].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[2], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			header = element("header");
    			if (header_slot) header_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Before you close, you need to agree to our terms!";
    			t4 = space();
    			button = element("button");
    			button.textContent = "Agree";
    			t6 = space();
    			footer = element("footer");
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    			attr_dev(div0, "class", "backdrop svelte-1bqcya2");
    			add_location(div0, file$b, 72, 0, 1391);
    			attr_dev(header, "class", "svelte-1bqcya2");
    			add_location(header, file$b, 75, 2, 1478);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file$b, 80, 2, 1559);
    			add_location(p, file$b, 85, 4, 1640);
    			add_location(button, file$b, 86, 4, 1702);
    			attr_dev(div2, "class", "disclaimer");
    			add_location(div2, file$b, 84, 2, 1610);
    			add_location(footer, file$b, 88, 2, 1771);
    			attr_dev(div3, "class", "modal svelte-1bqcya2");
    			add_location(div3, file$b, 74, 0, 1455);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);

    			if (header_slot) {
    				header_slot.m(header, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(div2, t4);
    			append_dev(div2, button);
    			append_dev(div3, t6);
    			append_dev(div3, footer);

    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(footer, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope, agreed*/ 5)) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			} else {
    				if (footer_slot_or_fallback && footer_slot_or_fallback.p && dirty & /*agreed*/ 1) {
    					footer_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(default_slot, local);
    			transition_in(footer_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(default_slot, local);
    			transition_out(footer_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (header_slot) header_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
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
    	validate_slots("Modal", slots, ['header','default','footer']);
    	const dispatch = createEventDispatcher();
    	let agreed = false;
    	let autoscroll = false;

    	// Anotação 01 -----------------
    	onMount(() => {
    		console.log("onMount!");
    	});

    	onDestroy(() => {
    		console.log("onDestroy!");
    	});

    	console.log("Script executed!");

    	// -----------------------------
    	// Anotação 02 ------------------------------------
    	beforeUpdate(() => {
    		console.log("beforeUpdate!");
    		autoscroll = agreed;
    	});

    	afterUpdate(() => {
    		console.log("afterUpdate!");

    		if (autoscroll) {
    			const modal = document.querySelector(".modal");
    			modal.scrollTo(0, modal.scrollHeight);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("cancel");
    	const click_handler_1 = () => $$invalidate(0, agreed = true);
    	const click_handler_2 = () => dispatch("close");

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		beforeUpdate,
    		afterUpdate,
    		dispatch,
    		agreed,
    		autoscroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("agreed" in $$props) $$invalidate(0, agreed = $$props.agreed);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		agreed,
    		dispatch,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\ComponentEvents\Product.svelte generated by Svelte v3.38.2 */
    const file$a = "src\\ComponentEvents\\Product.svelte";

    // (21:2) {#if bestseller}
    function create_if_block$4(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "BESTSELLER";
    			add_location(h3, file$a, 21, 4, 432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(21:2) {#if bestseller}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let article;
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let button0;
    	let t7;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*bestseller*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("R$ ");
    			t3 = text(/*price*/ ctx[1]);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			button0 = element("button");
    			button0.textContent = "Add to Cart";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Delete";
    			add_location(h1, file$a, 18, 2, 367);
    			add_location(h2, file$a, 19, 2, 387);
    			add_location(button0, file$a, 25, 2, 490);
    			add_location(button1, file$a, 26, 2, 543);
    			add_location(article, file$a, 17, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, h1);
    			append_dev(h1, t0);
    			append_dev(article, t1);
    			append_dev(article, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(article, t4);
    			if (if_block) if_block.m(article, null);
    			append_dev(article, t5);
    			append_dev(article, button0);
    			append_dev(article, t7);
    			append_dev(article, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addToCart*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(article, "dblclick", /*dblclick_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*price*/ 2) set_data_dev(t3, /*price*/ ctx[1]);

    			if (/*bestseller*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(article, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
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

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Product", slots, []);
    	const dispatch = createEventDispatcher();
    	let { title } = $$props;
    	let { price } = $$props;
    	let { bestseller = false } = $$props;

    	function addToCart() {
    		// Anotação 02
    		dispatch("add-to-cart", { id: "p1" });
    	}

    	const writable_props = ["title", "price", "bestseller"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Product> was created with unknown prop '${key}'`);
    	});

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler = () => dispatch("delete", "p1");

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("bestseller" in $$props) $$invalidate(2, bestseller = $$props.bestseller);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		title,
    		price,
    		bestseller,
    		addToCart
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("bestseller" in $$props) $$invalidate(2, bestseller = $$props.bestseller);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, price, bestseller, dispatch, addToCart, dblclick_handler, click_handler];
    }

    class Product$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { title: 0, price: 1, bestseller: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Product",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Product> was created without expected prop 'title'");
    		}

    		if (/*price*/ ctx[1] === undefined && !("price" in props)) {
    			console.warn("<Product> was created without expected prop 'price'");
    		}
    	}

    	get title() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bestseller() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bestseller(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ComponentEvents\ComponentEvents.svelte generated by Svelte v3.38.2 */

    const { console: console_1$2 } = globals;
    const file$9 = "src\\ComponentEvents\\ComponentEvents.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (52:0) {#each products as product}
    function create_each_block$2(ctx) {
    	let product;
    	let current;
    	const product_spread_levels = [/*product*/ ctx[10]];
    	let product_props = {};

    	for (let i = 0; i < product_spread_levels.length; i += 1) {
    		product_props = assign(product_props, product_spread_levels[i]);
    	}

    	product = new Product$1({ props: product_props, $$inline: true });
    	product.$on("dblclick", /*dblclick_handler*/ ctx[4]);
    	product.$on("add-to-cart", addToCart);
    	product.$on("delete", deleteProduct);

    	const block = {
    		c: function create() {
    			create_component(product.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(product, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const product_changes = (dirty & /*products*/ 4)
    			? get_spread_update(product_spread_levels, [get_spread_object(/*product*/ ctx[10])])
    			: {};

    			product.$set(product_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(product.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(product.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(product, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:0) {#each products as product}",
    		ctx
    	});

    	return block;
    }

    // (64:0) {#if showModal}
    function create_if_block$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: {
    					footer: [
    						create_footer_slot,
    						({ didAgree: closeable }) => ({ 9: closeable }),
    						({ didAgree: closeable }) => closeable ? 512 : 0
    					],
    					header: [
    						create_header_slot,
    						({ didAgree: closeable }) => ({ 9: closeable }),
    						({ didAgree: closeable }) => closeable ? 512 : 0
    					],
    					default: [
    						create_default_slot$3,
    						({ didAgree: closeable }) => ({ 9: closeable }),
    						({ didAgree: closeable }) => closeable ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("cancel", /*cancel_handler*/ ctx[7]);
    	modal.$on("close", /*close_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, closeable, showModal*/ 8706) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(64:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (66:2) <Modal      on:cancel={() => (showModal = false)}      on:close={() => (showModal = false)}      let:didAgree={closeable}    >
    function create_default_slot$3(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "This works!";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "This works!";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "This works!";
    			add_location(p0, file$9, 72, 4, 1724);
    			add_location(p1, file$9, 73, 4, 1748);
    			add_location(p2, file$9, 79, 4, 1902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(66:2) <Modal      on:cancel={() => (showModal = false)}      on:close={() => (showModal = false)}      let:didAgree={closeable}    >",
    		ctx
    	});

    	return block;
    }

    // (72:4) 
    function create_header_slot(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Hi!";
    			attr_dev(h1, "slot", "header");
    			add_location(h1, file$9, 71, 4, 1692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(72:4) ",
    		ctx
    	});

    	return block;
    }

    // (75:4) 
    function create_footer_slot(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Confirm");
    			attr_dev(button, "slot", "footer");
    			button.disabled = button_disabled_value = !/*closeable*/ ctx[9];
    			add_location(button, file$9, 74, 4, 1772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*closeable*/ 512 && button_disabled_value !== (button_disabled_value = !/*closeable*/ ctx[9])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(75:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let button;
    	let t3;
    	let t4;
    	let textarea;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*products*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*showModal*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element("br");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Show Modal";
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			textarea = element("textarea");
    			add_location(br, file$9, 60, 0, 1416);
    			add_location(button, file$9, 61, 0, 1424);
    			attr_dev(textarea, "rows", "5");
    			textarea.value = /*text*/ ctx[0];
    			add_location(textarea, file$9, 84, 0, 1965);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, textarea, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(textarea, "keydown", /*transform*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*products, alert, addToCart, deleteProduct*/ 4) {
    				each_value = /*products*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t4.parentNode, t4);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*text*/ 1) {
    				prop_dev(textarea, "value", /*text*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			run_all(dispose);
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

    function addToCart(event) {
    	console.log(event.detail);
    }

    function deleteProduct(event) {
    	console.log(event.detail);
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ComponentEvents", slots, []);
    	let text = "This is some dummy text!";
    	let products = [{ id: "p1", title: "A Book", price: 9.99 }];
    	let showModal = false;

    	function transform(event) {
    		if (event.keyCode !== 9) {
    			// TAB ASCII code: 9
    			return;
    		}

    		event.preventDefault(); // Impede o comportameto padrão "próximo elemento"
    		const selectionStart = event.target.selectionStart;
    		const selectionEnd = event.target.selectionEnd;
    		const value = event.target.value;
    		$$invalidate(0, text = value.slice(0, selectionStart) + value.slice(selectionStart, selectionEnd).toUpperCase() + value.slice(selectionEnd));

    		// Anotação 03
    		// event.target.selectionStart = selectionStart;
    		// event.target.selectionEnd = selectionEnd;
    		tick().then(() => {
    			event.target.selectionStart = selectionStart;
    			event.target.selectionEnd = selectionEnd;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<ComponentEvents> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = () => alert("Duplo clique!");
    	const click_handler = () => $$invalidate(1, showModal = true);
    	const click_handler_1 = () => $$invalidate(1, showModal = false);
    	const cancel_handler = () => $$invalidate(1, showModal = false);
    	const close_handler = () => $$invalidate(1, showModal = false);

    	$$self.$capture_state = () => ({
    		Modal,
    		Product: Product$1,
    		tick,
    		text,
    		products,
    		showModal,
    		addToCart,
    		deleteProduct,
    		transform
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("products" in $$props) $$invalidate(2, products = $$props.products);
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		showModal,
    		products,
    		transform,
    		dblclick_handler,
    		click_handler,
    		click_handler_1,
    		cancel_handler,
    		close_handler
    	];
    }

    class ComponentEvents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ComponentEvents",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\BindingsAndForms\CustomInput.svelte generated by Svelte v3.38.2 */

    const file$8 = "src\\BindingsAndForms\\CustomInput.svelte";

    function create_fragment$9(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file$8, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*componenteValue*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*componenteValue*/ 1 && input.value !== /*componenteValue*/ ctx[0]) {
    				set_input_value(input, /*componenteValue*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CustomInput", slots, []);
    	let { componenteValue } = $$props;
    	const writable_props = ["componenteValue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CustomInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		componenteValue = this.value;
    		$$invalidate(0, componenteValue);
    	}

    	$$self.$$set = $$props => {
    		if ("componenteValue" in $$props) $$invalidate(0, componenteValue = $$props.componenteValue);
    	};

    	$$self.$capture_state = () => ({ componenteValue });

    	$$self.$inject_state = $$props => {
    		if ("componenteValue" in $$props) $$invalidate(0, componenteValue = $$props.componenteValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [componenteValue, input_input_handler];
    }

    class CustomInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { componenteValue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomInput",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*componenteValue*/ ctx[0] === undefined && !("componenteValue" in props)) {
    			console.warn("<CustomInput> was created without expected prop 'componenteValue'");
    		}
    	}

    	get componenteValue() {
    		throw new Error("<CustomInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set componenteValue(value) {
    		throw new Error("<CustomInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\BindingsAndForms\Toggle.svelte generated by Svelte v3.38.2 */

    const file$7 = "src\\BindingsAndForms\\Toggle.svelte";

    function create_fragment$8(ctx) {
    	let button0;
    	let t0;
    	let button0_disabled_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_disabled_value;
    	let t3;
    	let button2;
    	let t4;
    	let button2_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = text("Option 1");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Option 2");
    			t3 = space();
    			button2 = element("button");
    			t4 = text("Option 3");
    			button0.disabled = button0_disabled_value = /*chosenOption*/ ctx[0] === 1;
    			add_location(button0, file$7, 4, 0, 55);
    			button1.disabled = button1_disabled_value = /*chosenOption*/ ctx[0] === 2;
    			add_location(button1, file$7, 7, 0, 154);
    			button2.disabled = button2_disabled_value = /*chosenOption*/ ctx[0] === 3;
    			add_location(button2, file$7, 10, 0, 253);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			append_dev(button2, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chosenOption*/ 1 && button0_disabled_value !== (button0_disabled_value = /*chosenOption*/ ctx[0] === 1)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*chosenOption*/ 1 && button1_disabled_value !== (button1_disabled_value = /*chosenOption*/ ctx[0] === 2)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (dirty & /*chosenOption*/ 1 && button2_disabled_value !== (button2_disabled_value = /*chosenOption*/ ctx[0] === 3)) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Toggle", slots, []);
    	let { chosenOption = 1 } = $$props;
    	const writable_props = ["chosenOption"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, chosenOption = 1);
    	const click_handler_1 = () => $$invalidate(0, chosenOption = 2);
    	const click_handler_2 = () => $$invalidate(0, chosenOption = 3);

    	$$self.$$set = $$props => {
    		if ("chosenOption" in $$props) $$invalidate(0, chosenOption = $$props.chosenOption);
    	};

    	$$self.$capture_state = () => ({ chosenOption });

    	$$self.$inject_state = $$props => {
    		if ("chosenOption" in $$props) $$invalidate(0, chosenOption = $$props.chosenOption);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chosenOption, click_handler, click_handler_1, click_handler_2];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { chosenOption: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get chosenOption() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chosenOption(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isValidEmail(val) {
      return val.includes("@");
    }

    /* src\BindingsAndForms\BindingsAndForms.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$6 = "src\\BindingsAndForms\\BindingsAndForms.svelte";

    function create_fragment$7(ctx) {
    	let br0;
    	let br1;
    	let br2;
    	let t0;
    	let custominput;
    	let updating_componenteValue;
    	let t1;
    	let toggle;
    	let updating_chosenOption;
    	let t2;
    	let input0;
    	let t3;
    	let label0;
    	let input1;
    	let t4;
    	let t5;
    	let h10;
    	let t7;
    	let label1;
    	let input2;
    	let t8;
    	let t9;
    	let label2;
    	let input3;
    	let t10;
    	let t11;
    	let label3;
    	let input4;
    	let t12;
    	let t13;
    	let h11;
    	let t15;
    	let label4;
    	let input5;
    	let t16;
    	let t17;
    	let label5;
    	let input6;
    	let t18;
    	let t19;
    	let label6;
    	let input7;
    	let t20;
    	let t21;
    	let h12;
    	let t23;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t27;
    	let hr0;
    	let t28;
    	let input8;
    	let t29;
    	let button0;
    	let t31;
    	let hr1;
    	let t32;
    	let form;
    	let input9;
    	let input9_class_value;
    	let t33;
    	let button1;
    	let t34;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;

    	function custominput_componenteValue_binding(value) {
    		/*custominput_componenteValue_binding*/ ctx[12](value);
    	}

    	let custominput_props = {};

    	if (/*appValue*/ ctx[0] !== void 0) {
    		custominput_props.componenteValue = /*appValue*/ ctx[0];
    	}

    	custominput = new CustomInput({ props: custominput_props, $$inline: true });
    	binding_callbacks.push(() => bind(custominput, "componenteValue", custominput_componenteValue_binding));

    	function toggle_chosenOption_binding(value) {
    		/*toggle_chosenOption_binding*/ ctx[13](value);
    	}

    	let toggle_props = {};

    	if (/*option*/ ctx[1] !== void 0) {
    		toggle_props.chosenOption = /*option*/ ctx[1];
    	}

    	toggle = new Toggle({ props: toggle_props, $$inline: true });
    	binding_callbacks.push(() => bind(toggle, "chosenOption", toggle_chosenOption_binding));

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			t0 = space();
    			create_component(custominput.$$.fragment);
    			t1 = space();
    			create_component(toggle.$$.fragment);
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			label0 = element("label");
    			input1 = element("input");
    			t4 = text("\r\n  Agree to terms?");
    			t5 = space();
    			h10 = element("h1");
    			h10.textContent = "Favorite Color?";
    			t7 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t8 = text("\r\n  Red");
    			t9 = space();
    			label2 = element("label");
    			input3 = element("input");
    			t10 = text("\r\n  Green");
    			t11 = space();
    			label3 = element("label");
    			input4 = element("input");
    			t12 = text("\r\n  Blue");
    			t13 = space();
    			h11 = element("h1");
    			h11.textContent = "Favorite Color(s)?";
    			t15 = space();
    			label4 = element("label");
    			input5 = element("input");
    			t16 = text("\r\n  Red");
    			t17 = space();
    			label5 = element("label");
    			input6 = element("input");
    			t18 = text("\r\n  Green");
    			t19 = space();
    			label6 = element("label");
    			input7 = element("input");
    			t20 = text("\r\n  Blue");
    			t21 = space();
    			h12 = element("h1");
    			h12.textContent = "Favorite Color?";
    			t23 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Red";
    			option1 = element("option");
    			option1.textContent = "Green";
    			option2 = element("option");
    			option2.textContent = "Blue";
    			t27 = space();
    			hr0 = element("hr");
    			t28 = space();
    			input8 = element("input");
    			t29 = space();
    			button0 = element("button");
    			button0.textContent = "Save";
    			t31 = space();
    			hr1 = element("hr");
    			t32 = space();
    			form = element("form");
    			input9 = element("input");
    			t33 = space();
    			button1 = element("button");
    			t34 = text("Save");
    			add_location(br0, file$6, 43, 0, 1040);
    			add_location(br1, file$6, 43, 6, 1046);
    			add_location(br2, file$6, 43, 12, 1052);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$6, 50, 0, 1196);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$6, 53, 2, 1253);
    			add_location(label0, file$6, 52, 0, 1242);
    			add_location(h10, file$6, 57, 0, 1333);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "colors");
    			input2.__value = "red";
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[17][1].push(input2);
    			add_location(input2, file$6, 59, 2, 1370);
    			add_location(label1, file$6, 58, 0, 1359);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "name", "colors");
    			input3.__value = "green";
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[17][1].push(input3);
    			add_location(input3, file$6, 63, 2, 1472);
    			add_location(label2, file$6, 62, 0, 1461);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "name", "colors");
    			input4.__value = "blue";
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[17][1].push(input4);
    			add_location(input4, file$6, 67, 2, 1578);
    			add_location(label3, file$6, 66, 0, 1567);
    			add_location(h11, file$6, 71, 0, 1673);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "name", "colors");
    			input5.__value = "red";
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[17][0].push(input5);
    			add_location(input5, file$6, 73, 2, 1713);
    			add_location(label4, file$6, 72, 0, 1702);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "name", "colors");
    			input6.__value = "green";
    			input6.value = input6.__value;
    			/*$$binding_groups*/ ctx[17][0].push(input6);
    			add_location(input6, file$6, 77, 2, 1819);
    			add_location(label5, file$6, 76, 0, 1808);
    			attr_dev(input7, "type", "checkbox");
    			attr_dev(input7, "name", "colors");
    			input7.__value = "blue";
    			input7.value = input7.__value;
    			/*$$binding_groups*/ ctx[17][0].push(input7);
    			add_location(input7, file$6, 81, 2, 1929);
    			add_location(label6, file$6, 80, 0, 1918);
    			add_location(h12, file$6, 85, 0, 2028);
    			option0.__value = "red";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 87, 2, 2091);
    			option1.__value = "green";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 88, 2, 2127);
    			option2.__value = "blue";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 89, 2, 2167);
    			if (/*selectColor*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[23].call(select));
    			add_location(select, file$6, 86, 0, 2054);
    			add_location(hr0, file$6, 92, 0, 2216);
    			attr_dev(input8, "type", "text");
    			add_location(input8, file$6, 96, 0, 2294);
    			add_location(button0, file$6, 97, 0, 2343);
    			add_location(hr1, file$6, 99, 0, 2388);
    			attr_dev(input9, "type", "email");
    			attr_dev(input9, "class", input9_class_value = "" + (null_to_empty(isValidEmail(/*enteredEmail*/ ctx[7]) ? "" : "invalid") + " svelte-1kxh740"));
    			add_location(input9, file$6, 102, 2, 2433);
    			attr_dev(button1, "type", "submit");
    			button1.disabled = button1_disabled_value = !/*formIsValid*/ ctx[9];
    			add_location(button1, file$6, 107, 2, 2555);
    			add_location(form, file$6, 101, 0, 2398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(custominput, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*price*/ ctx[2]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, label0, anchor);
    			append_dev(label0, input1);
    			input1.checked = /*agreed*/ ctx[3];
    			append_dev(label0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, input2);
    			input2.checked = input2.__value === /*checkColor*/ ctx[4];
    			append_dev(label1, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, input3);
    			input3.checked = input3.__value === /*checkColor*/ ctx[4];
    			append_dev(label2, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, input4);
    			input4.checked = input4.__value === /*checkColor*/ ctx[4];
    			append_dev(label3, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, label4, anchor);
    			append_dev(label4, input5);
    			input5.checked = ~/*radioColors*/ ctx[5].indexOf(input5.__value);
    			append_dev(label4, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, label5, anchor);
    			append_dev(label5, input6);
    			input6.checked = ~/*radioColors*/ ctx[5].indexOf(input6.__value);
    			append_dev(label5, t18);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, label6, anchor);
    			append_dev(label6, input7);
    			input7.checked = ~/*radioColors*/ ctx[5].indexOf(input7.__value);
    			append_dev(label6, t20);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, h12, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*selectColor*/ ctx[6]);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, input8, anchor);
    			/*input8_binding*/ ctx[24](input8);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input9);
    			set_input_value(input9, /*enteredEmail*/ ctx[7]);
    			append_dev(form, t33);
    			append_dev(form, button1);
    			append_dev(button1, t34);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[15]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[16]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[18]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[19]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[20]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[21]),
    					listen_dev(input7, "change", /*input7_change_handler*/ ctx[22]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[23]),
    					listen_dev(button0, "click", /*saveData*/ ctx[10], false, false, false),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[25]),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const custominput_changes = {};

    			if (!updating_componenteValue && dirty & /*appValue*/ 1) {
    				updating_componenteValue = true;
    				custominput_changes.componenteValue = /*appValue*/ ctx[0];
    				add_flush_callback(() => updating_componenteValue = false);
    			}

    			custominput.$set(custominput_changes);
    			const toggle_changes = {};

    			if (!updating_chosenOption && dirty & /*option*/ 2) {
    				updating_chosenOption = true;
    				toggle_changes.chosenOption = /*option*/ ctx[1];
    				add_flush_callback(() => updating_chosenOption = false);
    			}

    			toggle.$set(toggle_changes);

    			if (dirty & /*price*/ 4 && to_number(input0.value) !== /*price*/ ctx[2]) {
    				set_input_value(input0, /*price*/ ctx[2]);
    			}

    			if (dirty & /*agreed*/ 8) {
    				input1.checked = /*agreed*/ ctx[3];
    			}

    			if (dirty & /*checkColor*/ 16) {
    				input2.checked = input2.__value === /*checkColor*/ ctx[4];
    			}

    			if (dirty & /*checkColor*/ 16) {
    				input3.checked = input3.__value === /*checkColor*/ ctx[4];
    			}

    			if (dirty & /*checkColor*/ 16) {
    				input4.checked = input4.__value === /*checkColor*/ ctx[4];
    			}

    			if (dirty & /*radioColors*/ 32) {
    				input5.checked = ~/*radioColors*/ ctx[5].indexOf(input5.__value);
    			}

    			if (dirty & /*radioColors*/ 32) {
    				input6.checked = ~/*radioColors*/ ctx[5].indexOf(input6.__value);
    			}

    			if (dirty & /*radioColors*/ 32) {
    				input7.checked = ~/*radioColors*/ ctx[5].indexOf(input7.__value);
    			}

    			if (dirty & /*selectColor*/ 64) {
    				select_option(select, /*selectColor*/ ctx[6]);
    			}

    			if (!current || dirty & /*enteredEmail*/ 128 && input9_class_value !== (input9_class_value = "" + (null_to_empty(isValidEmail(/*enteredEmail*/ ctx[7]) ? "" : "invalid") + " svelte-1kxh740"))) {
    				attr_dev(input9, "class", input9_class_value);
    			}

    			if (dirty & /*enteredEmail*/ 128 && input9.value !== /*enteredEmail*/ ctx[7]) {
    				set_input_value(input9, /*enteredEmail*/ ctx[7]);
    			}

    			if (!current || dirty & /*formIsValid*/ 512 && button1_disabled_value !== (button1_disabled_value = !/*formIsValid*/ ctx[9])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(custominput.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(custominput.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t0);
    			destroy_component(custominput, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(label1);
    			/*$$binding_groups*/ ctx[17][1].splice(/*$$binding_groups*/ ctx[17][1].indexOf(input2), 1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(label2);
    			/*$$binding_groups*/ ctx[17][1].splice(/*$$binding_groups*/ ctx[17][1].indexOf(input3), 1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(label3);
    			/*$$binding_groups*/ ctx[17][1].splice(/*$$binding_groups*/ ctx[17][1].indexOf(input4), 1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(label4);
    			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input5), 1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(label5);
    			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input6), 1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(label6);
    			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input7), 1);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(h12);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(select);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(input8);
    			/*input8_binding*/ ctx[24](null);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BindingsAndForms", slots, []);
    	let appValue = "Test";
    	let option = 2;
    	let price = 0;
    	let agreed = false;
    	let checkColor = "blue";
    	let radioColors = ["red", "green"];
    	let selectColor = "green";
    	let usernameInput;
    	let enteredEmail = "";
    	let formIsValid;

    	function saveData() {
    		//console.log(document.querySelector("#username").value);
    		console.log(usernameInput);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<BindingsAndForms> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], []];

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function custominput_componenteValue_binding(value) {
    		appValue = value;
    		$$invalidate(0, appValue);
    	}

    	function toggle_chosenOption_binding(value) {
    		option = value;
    		$$invalidate(1, option);
    	}

    	function input0_input_handler() {
    		price = to_number(this.value);
    		$$invalidate(2, price);
    	}

    	function input1_change_handler() {
    		agreed = this.checked;
    		$$invalidate(3, agreed);
    	}

    	function input2_change_handler() {
    		checkColor = this.__value;
    		$$invalidate(4, checkColor);
    	}

    	function input3_change_handler() {
    		checkColor = this.__value;
    		$$invalidate(4, checkColor);
    	}

    	function input4_change_handler() {
    		checkColor = this.__value;
    		$$invalidate(4, checkColor);
    	}

    	function input5_change_handler() {
    		radioColors = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(5, radioColors);
    	}

    	function input6_change_handler() {
    		radioColors = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(5, radioColors);
    	}

    	function input7_change_handler() {
    		radioColors = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(5, radioColors);
    	}

    	function select_change_handler() {
    		selectColor = select_value(this);
    		$$invalidate(6, selectColor);
    	}

    	function input8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			usernameInput = $$value;
    			$$invalidate(8, usernameInput);
    		});
    	}

    	function input9_input_handler() {
    		enteredEmail = this.value;
    		$$invalidate(7, enteredEmail);
    	}

    	$$self.$capture_state = () => ({
    		CustomInput,
    		Toggle,
    		isValidEmail,
    		appValue,
    		option,
    		price,
    		agreed,
    		checkColor,
    		radioColors,
    		selectColor,
    		usernameInput,
    		enteredEmail,
    		formIsValid,
    		saveData
    	});

    	$$self.$inject_state = $$props => {
    		if ("appValue" in $$props) $$invalidate(0, appValue = $$props.appValue);
    		if ("option" in $$props) $$invalidate(1, option = $$props.option);
    		if ("price" in $$props) $$invalidate(2, price = $$props.price);
    		if ("agreed" in $$props) $$invalidate(3, agreed = $$props.agreed);
    		if ("checkColor" in $$props) $$invalidate(4, checkColor = $$props.checkColor);
    		if ("radioColors" in $$props) $$invalidate(5, radioColors = $$props.radioColors);
    		if ("selectColor" in $$props) $$invalidate(6, selectColor = $$props.selectColor);
    		if ("usernameInput" in $$props) $$invalidate(8, usernameInput = $$props.usernameInput);
    		if ("enteredEmail" in $$props) $$invalidate(7, enteredEmail = $$props.enteredEmail);
    		if ("formIsValid" in $$props) $$invalidate(9, formIsValid = $$props.formIsValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*appValue*/ 1) {
    			console.log(`appValue: ${appValue}`);
    		}

    		if ($$self.$$.dirty & /*option*/ 2) {
    			console.log(`option: ${option}`);
    		}

    		if ($$self.$$.dirty & /*price*/ 4) {
    			console.log(`price: ${price}`);
    		}

    		if ($$self.$$.dirty & /*agreed*/ 8) {
    			console.log(`agreed: ${agreed}`);
    		}

    		if ($$self.$$.dirty & /*checkColor*/ 16) {
    			console.log(`checkColor: ${checkColor}`);
    		}

    		if ($$self.$$.dirty & /*radioColors*/ 32) {
    			console.log(`radioColors: ${radioColors}`);
    		}

    		if ($$self.$$.dirty & /*selectColor*/ 64) {
    			console.log(`selectColor: ${selectColor}`);
    		}

    		if ($$self.$$.dirty & /*enteredEmail*/ 128) {
    			if (isValidEmail(enteredEmail)) {
    				$$invalidate(9, formIsValid = true);
    			} else {
    				$$invalidate(9, formIsValid = false);
    			}
    		}
    	};

    	return [
    		appValue,
    		option,
    		price,
    		agreed,
    		checkColor,
    		radioColors,
    		selectColor,
    		enteredEmail,
    		usernameInput,
    		formIsValid,
    		saveData,
    		submit_handler,
    		custominput_componenteValue_binding,
    		toggle_chosenOption_binding,
    		input0_input_handler,
    		input1_change_handler,
    		input2_change_handler,
    		$$binding_groups,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler,
    		input7_change_handler,
    		select_change_handler,
    		input8_binding,
    		input9_input_handler
    	];
    }

    class BindingsAndForms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BindingsAndForms",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\DataStore\UI\Button.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\DataStore\\UI\\Button.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*mode*/ ctx[0]) + " svelte-1fitnls"));
    			attr_dev(button, "type", "button");
    			add_location(button, file$5, 58, 0, 992);
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
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*mode*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*mode*/ ctx[0]) + " svelte-1fitnls"))) {
    				attr_dev(button, "class", button_class_value);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { mode } = $$props;
    	const writable_props = ["mode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ mode });

    	$$self.$inject_state = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mode, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { mode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mode*/ ctx[0] === undefined && !("mode" in props)) {
    			console.warn("<Button> was created without expected prop 'mode'");
    		}
    	}

    	get mode() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DataStore\Cart\CartItem.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$4 = "src\\DataStore\\Cart\\CartItem.svelte";

    // (44:2) <Button mode="outline" on:click={displayDescription}>
    function create_default_slot_1(ctx) {
    	let t_value = (/*showDescription*/ ctx[2]
    	? "Hide Description"
    	: "Show Description") + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showDescription*/ 4 && t_value !== (t_value = (/*showDescription*/ ctx[2]
    			? "Hide Description"
    			: "Show Description") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(44:2) <Button mode=\\\"outline\\\" on:click={displayDescription}>",
    		ctx
    	});

    	return block;
    }

    // (47:2) <Button on:click={removeFromCart}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Remove from Cart");
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(47:2) <Button on:click={removeFromCart}>",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if showDescription}
    function create_if_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Not available :(";
    			add_location(p, file$4, 48, 4, 849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(48:2) {#if showDescription}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let li;
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let button0;
    	let t4;
    	let button1;
    	let t5;
    	let current;

    	button0 = new Button({
    			props: {
    				mode: "outline",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*displayDescription*/ ctx[3]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", removeFromCart);
    	let if_block = /*showDescription*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*price*/ ctx[1]);
    			t3 = space();
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-1td7xux");
    			add_location(h1, file$4, 41, 2, 591);
    			attr_dev(h2, "class", "svelte-1td7xux");
    			add_location(h2, file$4, 42, 2, 610);
    			attr_dev(li, "class", "svelte-1td7xux");
    			add_location(li, file$4, 40, 0, 584);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h1);
    			append_dev(h1, t0);
    			append_dev(li, t1);
    			append_dev(li, h2);
    			append_dev(h2, t2);
    			append_dev(li, t3);
    			mount_component(button0, li, null);
    			append_dev(li, t4);
    			mount_component(button1, li, null);
    			append_dev(li, t5);
    			if (if_block) if_block.m(li, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (!current || dirty & /*price*/ 2) set_data_dev(t2, /*price*/ ctx[1]);
    			const button0_changes = {};

    			if (dirty & /*$$scope, showDescription*/ 36) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (/*showDescription*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(li, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (if_block) if_block.d();
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

    function removeFromCart() {
    	// ...
    	console.log("Removing...");
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CartItem", slots, []);
    	let { title } = $$props;
    	let { price } = $$props;
    	let { id } = $$props;
    	let showDescription = false;

    	function displayDescription() {
    		$$invalidate(2, showDescription = !showDescription);
    	}

    	const writable_props = ["title", "price", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CartItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		title,
    		price,
    		id,
    		showDescription,
    		displayDescription,
    		removeFromCart
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("showDescription" in $$props) $$invalidate(2, showDescription = $$props.showDescription);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, price, showDescription, displayDescription, id];
    }

    class CartItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0, price: 1, id: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CartItem",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console_1.warn("<CartItem> was created without expected prop 'title'");
    		}

    		if (/*price*/ ctx[1] === undefined && !("price" in props)) {
    			console_1.warn("<CartItem> was created without expected prop 'price'");
    		}

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console_1.warn("<CartItem> was created without expected prop 'id'");
    		}
    	}

    	get title() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cart = writable([
      {
        id: "p3",
        title: "Test",
        price: 9.99,
      },
      {
        id: "p4",
        title: "Test",
        price: 9.99,
      },
    ]);

    /* src\DataStore\Cart\Cart.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\DataStore\\Cart\\Cart.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (37:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No items in cart yet!";
    			add_location(p, file$3, 37, 6, 679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(37:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#each items as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let cartitem;
    	let current;

    	cartitem = new CartItem({
    			props: {
    				id: /*item*/ ctx[2].id,
    				title: /*item*/ ctx[2].title,
    				price: /*item*/ ctx[2].price
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(cartitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(cartitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cartitem_changes = {};
    			if (dirty & /*items*/ 1) cartitem_changes.id = /*item*/ ctx[2].id;
    			if (dirty & /*items*/ 1) cartitem_changes.title = /*item*/ ctx[2].title;
    			if (dirty & /*items*/ 1) cartitem_changes.price = /*item*/ ctx[2].price;
    			cartitem.$set(cartitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cartitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cartitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(cartitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(35:4) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Cart";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(h1, file$3, 32, 2, 534);
    			attr_dev(ul, "class", "svelte-1c2znv1");
    			add_location(ul, file$3, 33, 2, 550);
    			attr_dev(section, "class", "svelte-1c2znv1");
    			add_location(section, file$3, 31, 0, 522);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(ul, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
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
    	validate_slots("Cart", slots, []);
    	let items;

    	// Anotação 01
    	const unsubscribe = cart.subscribe(store => $$invalidate(0, items = store));

    	onDestroy(() => {
    		if (unsubscribe) {
    			unsubscribe();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CartItem,
    		cartItems: cart,
    		onDestroy,
    		items,
    		unsubscribe
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\DataStore\Products\Product.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\DataStore\\Products\\Product.svelte";

    // (52:4) <Button on:click={addToCart}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add to Cart");
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(52:4) <Button on:click={addToCart}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let div1;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*addToCart*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(/*price*/ ctx[1]);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*description*/ ctx[2]);
    			t5 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(h1, "class", "svelte-9ht2za");
    			add_location(h1, file$2, 46, 4, 752);
    			attr_dev(h2, "class", "svelte-9ht2za");
    			add_location(h2, file$2, 47, 4, 773);
    			attr_dev(p, "class", "svelte-9ht2za");
    			add_location(p, file$2, 48, 4, 794);
    			add_location(div0, file$2, 45, 2, 742);
    			add_location(div1, file$2, 50, 2, 826);
    			attr_dev(div2, "class", "product svelte-9ht2za");
    			add_location(div2, file$2, 44, 0, 718);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(h2, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(p, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (!current || dirty & /*price*/ 2) set_data_dev(t2, /*price*/ ctx[1]);
    			if (!current || dirty & /*description*/ 4) set_data_dev(t4, /*description*/ ctx[2]);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(button);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Product", slots, []);
    	let { id } = $$props;
    	let { title } = $$props;
    	let { price } = $$props;
    	let { description } = $$props;

    	function addToCart() {
    		cart.update(items => {
    			return [...items, { id, title, price }];
    		});
    	}

    	const writable_props = ["id", "title", "price", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Product> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		cartItems: cart,
    		id,
    		title,
    		price,
    		description,
    		addToCart
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("price" in $$props) $$invalidate(1, price = $$props.price);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, price, description, addToCart, id];
    }

    class Product extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			id: 4,
    			title: 0,
    			price: 1,
    			description: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Product",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console.warn("<Product> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Product> was created without expected prop 'title'");
    		}

    		if (/*price*/ ctx[1] === undefined && !("price" in props)) {
    			console.warn("<Product> was created without expected prop 'price'");
    		}

    		if (/*description*/ ctx[2] === undefined && !("description" in props)) {
    			console.warn("<Product> was created without expected prop 'description'");
    		}
    	}

    	get id() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DataStore\Products\Products.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\DataStore\\Products\\Products.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (30:2) {#each products as product (product.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let product;
    	let current;

    	product = new Product({
    			props: {
    				id: /*product*/ ctx[1].id,
    				title: /*product*/ ctx[1].title,
    				price: /*product*/ ctx[1].price,
    				description: /*product*/ ctx[1].description
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(product.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(product, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(product.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(product.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(product, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:2) {#each products as product (product.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*products*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*product*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Products";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$1, 28, 2, 419);
    			attr_dev(section, "class", "svelte-o8blwk");
    			add_location(section, file$1, 27, 0, 407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*products*/ 1) {
    				each_value = /*products*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	validate_slots("Products", slots, []);

    	let products = [
    		{
    			id: "p1",
    			title: "A Book",
    			price: 9.99,
    			description: "A great book!"
    		},
    		{
    			id: "p2",
    			title: "A Carpet",
    			price: 99.99,
    			description: "Red and green."
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Product, products });

    	$$self.$inject_state = $$props => {
    		if ("products" in $$props) $$invalidate(0, products = $$props.products);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [products];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\DataStore\DataStore.svelte generated by Svelte v3.38.2 */

    // (9:0) <Button on:click={() => (showCart = !showCart)}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Toggle Cart");
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <Button on:click={() => (showCart = !showCart)}>",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#if showCart}
    function create_if_block$1(ctx) {
    	let cart;
    	let current;
    	cart = new Cart({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cart, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(10:0) {#if showCart}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let products;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[1]);
    	let if_block = /*showCart*/ ctx[0] && create_if_block$1(ctx);
    	products = new Products({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(products.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(products, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*showCart*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*showCart*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
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
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(products.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(products.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(products, detaching);
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
    	validate_slots("DataStore", slots, []);
    	let showCart = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataStore> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showCart = !showCart);
    	$$self.$capture_state = () => ({ Cart, Products, Button, showCart });

    	$$self.$inject_state = $$props => {
    		if ("showCart" in $$props) $$invalidate(0, showCart = $$props.showCart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showCart, click_handler];
    }

    class DataStore extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataStore",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (24:22) 
    function create_if_block_3(ctx) {
    	let datastore;
    	let current;
    	datastore = new DataStore({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(datastore.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(datastore, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datastore.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datastore.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(datastore, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(24:22) ",
    		ctx
    	});

    	return block;
    }

    // (22:22) 
    function create_if_block_2(ctx) {
    	let bindingsandforms;
    	let current;
    	bindingsandforms = new BindingsAndForms({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bindingsandforms.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bindingsandforms, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bindingsandforms.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bindingsandforms.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bindingsandforms, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(22:22) ",
    		ctx
    	});

    	return block;
    }

    // (20:22) 
    function create_if_block_1(ctx) {
    	let componentevents;
    	let current;
    	componentevents = new ComponentEvents({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(componentevents.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(componentevents, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(componentevents.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(componentevents.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(componentevents, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:22) ",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if option == 1}
    function create_if_block(ctx) {
    	let basic;
    	let current;
    	basic = new Basic({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(basic.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(basic, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basic.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basic.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(basic, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:0) {#if option == 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let p;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t5;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[0] == 1) return 0;
    		if (/*option*/ ctx[0] == 2) return 1;
    		if (/*option*/ ctx[0] == 3) return 2;
    		if (/*option*/ ctx[0] == 4) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Select the module: \r\n  ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Basic";
    			option1 = element("option");
    			option1.textContent = "Component Events";
    			option2 = element("option");
    			option2.textContent = "Binding and Forms";
    			option3 = element("option");
    			option3.textContent = "Data Store";
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			option0.__value = "1";
    			option0.value = option0.__value;
    			add_location(option0, file, 11, 4, 361);
    			option1.__value = "2";
    			option1.value = option1.__value;
    			add_location(option1, file, 12, 4, 397);
    			option2.__value = "3";
    			option2.value = option2.__value;
    			add_location(option2, file, 13, 4, 444);
    			option3.__value = "4";
    			option3.value = option3.__value;
    			add_location(option3, file, 14, 4, 492);
    			if (/*option*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file, 10, 2, 327);
    			add_location(p, file, 8, 0, 297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*option*/ ctx[0]);
    			insert_dev(target, t5, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*option*/ 1) {
    				select_option(select, /*option*/ ctx[0]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let option = 1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		option = select_value(this);
    		$$invalidate(0, option);
    	}

    	$$self.$capture_state = () => ({
    		Basic,
    		ComponentEvents,
    		BindingsAndForms,
    		DataStore,
    		option
    	});

    	$$self.$inject_state = $$props => {
    		if ("option" in $$props) $$invalidate(0, option = $$props.option);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [option, select_change_handler];
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
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
