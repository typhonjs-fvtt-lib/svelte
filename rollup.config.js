import svelte        from 'rollup-plugin-svelte';
import resolve       from '@rollup/plugin-node-resolve';
import sourcemaps    from 'rollup-plugin-sourcemaps';
import { terser }    from 'rollup-plugin-terser';

import terserConfig  from './terser.config.js';

const s_COMPRESS = false;
const s_SOURCEMAPS = true;

export default () =>
{
   // Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
   // minified / mangled.
   const outputPlugins = [];
   if (s_COMPRESS)
   {
      outputPlugins.push(terser(terserConfig));
   }

   // Defines whether source maps are generated / loaded from the .env file.
   const sourcemap = s_SOURCEMAPS;

   return [{
      input: 'src/index.js',
      output: {
         file: 'dist/index.js',
         format: 'es',
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         svelte({
            onwarn: (warning, handler) =>
            {
               // Suppress `a11y-missing-attribute` for missing href in <a> links.
               if (warning.message.includes(`<a> element should have an href attribute`)) { return; }

               // Let Rollup handle all other warnings normally.
               handler(warning);
            }
         }),
         resolve(),
         sourcemaps()
      ]
   },
   {
      input: 'src/gsap/index.js',
      external: [                                  // Suppresses the warning and excludes ansi-colors from the
         `gsap`
      ],
      output: {
         file: 'dist/gsap.js',
         format: 'es',
         paths: {
            gsap: '/scripts/greensock/esm/all.js'
         },
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/helpers/index.js',
      output: {
         file: 'dist/helpers.js',
         format: 'es',
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/store/index.js',
      output: {
         file: 'dist/store.js',
         format: 'es',
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         resolve(),
         sourcemaps()
      ]
   }]
};