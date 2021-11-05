import { babel }     from '@rollup/plugin-babel';        // Babel is used for private class fields for browser usage.
import resolve       from '@rollup/plugin-node-resolve';
import sourcemaps    from 'rollup-plugin-sourcemaps';
import svelte        from 'rollup-plugin-svelte';
import { terser }    from 'rollup-plugin-terser';

import terserConfig  from './terser.config.js';

const s_COMPRESS = false;
const s_SOURCEMAPS = true;

// Defines Svelte and all local exports as external.
const s_LOCAL_EXTERNAL = [
   'svelte', 'svelte/easing', 'svelte/internal', 'svelte/motion', 'svelte/store', 'svelte/transition',
   'svelte/types',

   '@typhonjs-fvtt/svelte/component', '@typhonjs-fvtt/svelte/gsap', '@typhonjs-fvtt/svelte/handler',
   '@typhonjs-fvtt/svelte/helper', '@typhonjs-fvtt/svelte/store', '@typhonjs-fvtt/svelte/transition',
   '@typhonjs-fvtt/svelte/util', '@typhonjs-fvtt/svelte/plugins/data', '@typhonjs-fvtt/svelte/plugins/system',

   `foundry-gsap`  // Replaced by consumer for Foundry GSAP path.
]

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

   return [
   {
      input: 'src/modules/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/index.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
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
      input: 'src/modules/component/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/component.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      },
      plugins: [
         svelte({
            emitCss: false,
            onwarn: (warning, handler) =>
            {
               // Suppress `a11y-missing-attribute` for missing href in <a> links.
               if (warning.message.includes(`<a> element should have an href attribute`)) { return; }

               // Let Rollup handle all other warnings normally.
               handler(warning);
            }
         }),
         resolve()
      ]
   },
   {
      input: 'src/modules/gsap/index.js',
      external: s_LOCAL_EXTERNAL,
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
      input: 'src/modules/handler/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/handler.js',
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
      input: 'src/modules/helper/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/helper.js',
         format: 'es',
         plugins: outputPlugins,
         preferConst: true,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: 'src/modules/store/index.js',
      external: s_LOCAL_EXTERNAL,
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
      input: 'src/modules/transition/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/transition.js',
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
      input: 'src/modules/util/index.js',
      external: s_LOCAL_EXTERNAL,
      output: {
         file: 'dist/modules/util.js',
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
      external: s_LOCAL_EXTERNAL,
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
      external: s_LOCAL_EXTERNAL,
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