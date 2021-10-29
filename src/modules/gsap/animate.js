import { gsap } from 'gsap';

export function animate(node, { type, ...args })
{
   const method = gsap[type];
   return method(node, args);
}