import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

// Combines slide & fade transitions into a single transition.
function slideFade(node, options)
{
   const slideTrans = slide(node, options);

   return {
      easing: options.easing || quintOut,
      duration: options.duration || 500,
      css: (t) => `
				${slideTrans.css(t)}
				opacity: ${t};
			`
   };
}

export { slideFade };
//# sourceMappingURL=transition.js.map
