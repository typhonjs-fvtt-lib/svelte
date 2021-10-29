import { gsap } from '/scripts/greensock/esm/all.js';

function animate(node, { type, ...args })
{
   const method = gsap[type];
   return method(node, args);
}

export { animate };
//# sourceMappingURL=gsap.js.map
