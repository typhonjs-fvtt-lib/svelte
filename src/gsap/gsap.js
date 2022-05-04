let gsap = void 0;

const modulePath = foundry.utils.getRoute('/scripts/greensock/esm/all.js');

try
{
   const module = await import(modulePath);
   gsap = module.gsap;
}
catch (error)
{
   console.error(`TyphonJS Runtime Library error; Could not load GSAP module from: '${modulePath}'`);
   console.error(error);
}

export { gsap };
