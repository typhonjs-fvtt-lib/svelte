/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 */
export async function gsapLoadPlugin(name)
{
   const modulePath = foundry.utils.getRoute(`/scripts/greensock/esm/${name}.js`);

// TODO REMOVE
console.log(`! loading gsap plugin, ${name} from: `, modulePath);

   try
   {
      const module = await import(modulePath);
      return module.default;
   }
   catch (err)
   {
      console.error(`TyphonJS Runtime Library error; Could not load ${name} plugin from: '${modulePath}'`);
      console.error(err);
   }
}

