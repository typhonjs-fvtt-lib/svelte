import resolve                   from '@rollup/plugin-node-resolve';
import { generateDTS }           from '@typhonjs-build-test/esm-d-ts';
import { jsdocRemoveNodeByTags } from '@typhonjs-build-test/esm-d-ts/transformer';
import fs                        from 'fs-extra';
import { rollup }                from 'rollup';

import { typhonjsRuntime } from './.rollup/local/index.js';

import { externalPathsNPM } from './.rollup/local/externalPathsNPM.js';

const s_SOURCEMAPS = true;

// Defines the node-resolve config.
const s_RESOLVE_CONFIG = {
   browser: true,
   dedupe: ['svelte', '@typhonjs-svelte/lib']
};

// Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
// minified / mangled.
const outputPlugins = [];

// Defines whether source maps are generated / loaded from the .env file.
const sourcemap = s_SOURCEMAPS;

// GenerateDTS options -----------------------------------------------------------------------------------------------

// Provides naive search / replace of bundled declaration file rewriting the re-bundled definitions from
// @typhonjs-svelte/lib. This will alter the JSDoc comments and import symbols.
const replace = {
   _typhonjs_svelte_lib_: '_typhonjs_fvtt_svelte_',
   '@typhonjs-svelte/lib/': '@typhonjs-fvtt/svelte/'
};

/**
 * Filter out "Duplicate identifier 'DOMRect'" messages.
 *
 * TODO: NOTE - The filtering of 2300 is unwanted churn, but 1014 can be a valid error though currently there is no
 * great way to describe destructuring rest parameters as a function argument with JSDoc that Typescript agrees with.
 * See this issue:
 *
 * @param {import('typescript').Diagnostic} diagnostic -
 *
 * @param {string} message -
 *
 * @returns {boolean} Return true to filter message.
 */
const filterDiagnostic = (diagnostic, message) =>
 (diagnostic.code === 2300 && message === `Duplicate identifier 'DOMRect'.`) ||
  (diagnostic.code === 1014 && message === `A rest parameter must be last in a parameter list.`);

// We don't care about external warning messages for `@typhonjs-svelte/lib` imports.
const ignorePattern = /^@typhonjs-svelte\/lib/;

const onwarn = (warning, warn) =>
{
   if (warning.code === 'UNRESOLVED_IMPORT' && ignorePattern.test(warning.exporter)) { return; }
   warn(warning);
};

// Rollup plugin options for generateDTS.
const dtsPluginOptions = { bundlePackageExports: true, filterDiagnostic, onwarn, replace };

// -------------------------------------------------------------------------------------------------------------------

const rollupConfigs = [
   {
      input: {
         input: 'src/action/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/action`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/action/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/animate/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/animate`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/animate/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/animate/action/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/animate/action`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/animate/action/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/gsap/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/gsap`] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/gsap/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/handler/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/handler`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/handler/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/helper/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/helper`] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/helper/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/math/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/math`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/math/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/store`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/position/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/store/position`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/position/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/transition/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/transition`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/transition/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/util/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/util`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/util/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/plugin/data/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/plugin/data`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/plugin/data/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/plugin/system/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/plugin/system`] }),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/plugin/system/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   }
];

for (const config of rollupConfigs)
{
   console.log(`Generating bundle: ${config.input.input}`);

   const bundle = await rollup(config.input);
   await bundle.write(config.output);
   await bundle.close();
}

// Handle application & application/legacy by copying the source.
fs.emptyDirSync('./_dist/application');
fs.copySync('./src/application', './_dist/application');

// Copy component core / dialog

fs.emptyDirSync('./_dist/component');
fs.copySync('./src/component', './_dist/component');

// GSAP plugin loading code is also bespoke and must be copied over.

fs.emptyDirSync('./_dist/gsap/plugin');
fs.copySync('./src/gsap/plugin', './_dist/gsap/plugin');

// Common application generateDTS options.
const applicationDTSOptions = { filterDiagnostic, onwarn, replace, transformers: [jsdocRemoveNodeByTags('internal')] };

await generateDTS({
   input: './_dist/application/index.js',
   output: './_types/application/index.d.mts',
   prependGen: ['./_dist/application/typedefs.js'],
   ...applicationDTSOptions
});

await generateDTS({
   input: './_dist/application/dialog/index.js',
   output: './_types/application/dialog/index.d.mts',
   // prependGen: ['./_dist/application/typedefs.js'],
   ...applicationDTSOptions
});

await generateDTS({
   input: './_dist/application/legacy/index.js',
   output: './_types/application/legacy/index.d.mts',
   prependGen: ['./_dist/application/typedefs.js'],
   ...applicationDTSOptions
});
