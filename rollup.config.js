import { babel }     from '@rollup/plugin-babel';        // Babel is used for private class fields for browser usage.
import postcss       from 'rollup-plugin-postcss';       // Process Sass / CSS w/ PostCSS
import resolve       from '@rollup/plugin-node-resolve';
import sourcemaps    from 'rollup-plugin-sourcemaps';
import svelte        from 'rollup-plugin-svelte';
import { terser }    from 'rollup-plugin-terser';
import virtual       from '@rollup/plugin-virtual';

import postcssConfig from './postcss.config.mjs';
import terserConfig  from './terser.config.js';

const postcssMain = postcssConfig('styles/main.css');
const postcssAppShell = postcssConfig('dist/styles/application-shell.css');

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
      external: [
         '#stylesAppShell',
         '#stylesIndex'
      ],
      output: {
         file: 'dist/modules/index.js',
         format: 'es',
         paths: {
            '#stylesAppShell': './dist/styles/application-shell.css',
            '#stylesIndex': './dist/modules/styles/index.css'
         },
         plugins: outputPlugins,
         preferConst: true,
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
         postcss(postcssMain),
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
      input: 'pack',
      output: {
         format: 'es',
         file: 'empty.js',
         plugins: outputPlugins,
         sourcemap,
      },
      plugins: [
         virtual({
            pack: `import './styles/application-shell.scss';`
         }),
         postcss(postcssAppShell),                            // Engages PostCSS for Sass / CSS processing
      ]
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