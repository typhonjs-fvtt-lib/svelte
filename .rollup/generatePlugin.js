export function generatePlugin({ externalPaths = {}, externalRegex = [], exclude = [] })
{
   return {
      name: 'typhonjs-fvtt-runtime-lib',
      options(opts)
      {
         // Create a list of keys from the paths provided and filter by exclude list and add to `external`.
         const externalOpts = Object.keys(externalPaths).filter((entry) => !exclude.includes(entry))

         opts.external = Array.isArray(opts.external) ? [...externalRegex, ...externalOpts, ...opts.external] :
          [...externalRegex, externalOpts];
      },
      outputOptions(opts)
      {
         if (Array.isArray(opts))
         {
            for (const outputOpts of opts)
            {
               outputOpts.paths = typeof outputOpts.paths === 'object' ? { ...outputOpts.paths, ...externalPaths } :
                externalPaths;
            }
         }
         else if (typeof opts === 'object')
         {
            opts.paths = typeof opts.paths === 'object' ? { ...opts.paths, ...externalPaths } : externalPaths;
         }
      }
   };
}
