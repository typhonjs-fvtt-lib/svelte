import { babel }     from '@rollup/plugin-babel';        // Babel is used for private class fields for browser usage.
import resolve       from '@rollup/plugin-node-resolve';
import sourcemaps    from 'rollup-plugin-sourcemaps';
import svelte        from 'rollup-plugin-svelte';
import preprocess    from 'svelte-preprocess';
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
      input: 'src/modules/index.js',
      output: {
         file: 'dist/modules/index.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         svelte({
            emitCss: false,
            preprocess: preprocess(),
            onwarn: (warning, handler) =>
            {
               // Suppress `a11y-missing-attribute` for missing href in <a> links.
               if (warning.message.includes(`<a> element should have an href attribute`)) { return; }

               // Let Rollup handle all other warnings normally.
               handler(warning);
            }
         }),
         resolve(),
         sourcemaps(),
         babel({
            babelHelpers: 'bundled',
            presets: [
               ['@babel/preset-env', {
                  bugfixes: true,
                  shippedProposals: true,
                  targets: { esmodules: true }
               }]
            ]
         })
      ]
   },
   {
      input: 'src/modules/gsap/index.js',
      external: [                                  // Suppresses the warning and excludes ansi-colors from the
         `foundry-gsap`
      ],
      output: {
         file: 'dist/modules/gsap.js',
         format: 'es',
         paths: {
            gsap: '/scripts/greensock/esm/all.js'
         },
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/modules/helpers/index.js',
      output: {
         file: 'dist/modules/helpers.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/modules/store/index.js',
      output: {
         file: 'dist/modules/store.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         resolve(),
         sourcemaps()
      ]
   },
   {
      input: 'src/plugins/data/index.js',
      output: {
         file: 'dist/plugins/data.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/plugins/system/index.js',
      output: {
         file: 'dist/plugins/system.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         resolve(),
         sourcemaps()
      ]
   }];
};