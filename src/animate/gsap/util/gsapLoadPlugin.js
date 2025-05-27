import { getRoutePrefix } from '#runtime/util/path';

/**
 * @param {string}   name - Name of GSAP plugin to load.
 *
 * @returns {Promise<*>} The loaded plugin.
 * @ignore
 */
export async function gsapLoadPlugin(name)
{
   /**
    * Note usage of `globalThis.location.origin` as this is the origin of the importing location which is necessary for
    * connecting to the Foundry server when the package is located on a CDN.
    *
    * @type {string}
    */
   const modulePath = `${globalThis.location.origin}${getRoutePrefix(`/scripts/greensock/esm/${name}.js`)}`;

   try
   {
      const module = await import(/* @vite-ignore */modulePath);
      return module.default;
   }
   catch (err)
   {
      console.error(`TyphonJS Runtime Library error; Could not load ${name} plugin from: '${modulePath}'`);
      console.error(err);
   }
}

