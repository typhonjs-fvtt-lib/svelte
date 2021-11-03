function run(fn) {
    return fn();
}
function run_all(fns) {
    fns.forEach(run);
}
Promise.resolve();
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

/**
 * Runs outro transition then destroys Svelte component.
 *
 * Workaround for https://github.com/sveltejs/svelte/issues/4056
 *
 * @param {SvelteComponent}   instance - A Svelte component.
 */
function outroAndDestroy(instance)
{
   if (instance.$$.fragment && instance.$$.fragment.o)
   {
      group_outros();
      transition_out(instance.$$.fragment, 0, 0, () =>
      {
         instance.$destroy();
      });
      check_outros();
   }
   else
   {
      instance.$destroy();
   }
}

export { outroAndDestroy };
//# sourceMappingURL=util.js.map
