import resolve                   from '@rollup/plugin-node-resolve';
import { generateDTS }           from '@typhonjs-build-test/esm-d-ts';
import { importsExternal }       from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import { getFileList }           from '@typhonjs-utils/file-util';
import fs                        from 'fs-extra';
import { rollup }                from 'rollup';

import { typhonjsRuntime } from './.rollup/local/index.js';

import { externalPathsNPM } from './.rollup/local/externalPathsNPM.js';

// Defines the node-resolve config.
const s_RESOLVE_CONFIG = {
   browser: true,
   dedupe: ['svelte', '@typhonjs-svelte/lib']
};

// Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
// minified / mangled.
const outputPlugins = [];

const external = [/@typhonjs-svelte\/runtime-base\/*/, /@typhonjs-fvtt\/svelte\/*/];

// Defines whether source maps are generated / loaded from the .env file.
const sourcemap = true;

// GenerateDTS options -----------------------------------------------------------------------------------------------

// Provides naive search / replace of bundled declaration file rewriting the re-bundled definitions from
// @typhonjs-svelte/lib. This will alter the JSDoc comments and import symbols.
const dtsReplace = {
   _svelte_lib_: '_typhonjs_fvtt_svelte_',
   _svelte_fvtt_: '_typhonjs_fvtt_svelte_',
   '#svelte-fvtt/': '@typhonjs-fvtt/svelte/',
   '#svelte-lib/': '@typhonjs-fvtt/svelte/',
   '/\\/\\/ <reference.*\\/>': ''   // Svelte v4 types currently add triple slash references.
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

// // We don't care about external warning messages for `@typhonjs-svelte/lib` imports.
// const ignorePattern = /^@typhonjs-svelte\/lib/;
//
// const onwarn = (warning, warn) =>
// {
//    if (warning.code === 'UNRESOLVED_IMPORT' && ignorePattern.test(warning.exporter)) { return; }
//    warn(warning);
// };

// Rollup plugin options for generateDTS.
// const dtsPluginOptions = { bundlePackageExports: true, filterDiagnostic, onwarn, dtsReplace };
const dtsPluginOptions = { bundlePackageExports: true, filterDiagnostic, dtsReplace };

// -------------------------------------------------------------------------------------------------------------------

const rollupConfigs = [
   {
      input: {
         input: 'src/gsap/index.js',
         external,
         plugins: [
            importsExternal(),
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
         input: 'src/store/fvtt/index.js',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin({ ...dtsPluginOptions, tsFileWalk: false })
         ]
      },
      output: {
         file: '_dist/store/fvtt/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/fvtt/document/index.js',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/fvtt/document/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/fvtt/settings/index.js',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/fvtt/settings/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/fvtt/settings/world/index.js',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/fvtt/settings/world/index.js',
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

const appFiles = await getFileList({ dir: './_dist/application', resolve: true, walk: true });
for (const appFile of appFiles)
{
   let fileData = fs.readFileSync(appFile, 'utf-8').toString();

   fileData = fileData.replaceAll('#runtime/', '@typhonjs-svelte/runtime-base/');
   fileData = fileData.replaceAll('#svelte-fvtt/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('#svelte-lib/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('\'#svelte', '\'svelte');

   // For types
   // fileData = fileData.replaceAll('_typhonjs_fvtt_svelte_', '_typhonjs_fvtt_runtime_svelte_');

   fs.writeFileSync(appFile, fileData);
}


// Copy component core / dialog

fs.emptyDirSync('./_dist/component');
fs.copySync('./src/component', './_dist/component');

const compFiles = await getFileList({ dir: './_dist/component', resolve: true, walk: true });
for (const compFile of compFiles)
{
   let fileData = fs.readFileSync(compFile, 'utf-8').toString();

   fileData = fileData.replaceAll('@typhonjs-svelte/lib/', '@typhonjs-fvtt/svelte/');

   fileData = fileData.replaceAll('#runtime/', '@typhonjs-svelte/runtime-base/');
   fileData = fileData.replaceAll('#svelte-fvtt/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('#svelte-lib/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('\'#svelte', '\'svelte');

   // For types
   // fileData = fileData.replaceAll('_typhonjs_fvtt_svelte_', '_typhonjs_fvtt_runtime_svelte_');

   fs.writeFileSync(compFile, fileData);
}

// GSAP plugin loading code is also bespoke and must be copied over.

fs.emptyDirSync('./_dist/gsap/plugin');
fs.copySync('./src/gsap/plugin', './_dist/gsap/plugin');

const gsapFiles = await getFileList({ dir: './_dist/gsap/plugin', resolve: true, walk: true });
for (const gsapFile of gsapFiles)
{
   let fileData = fs.readFileSync(gsapFile, 'utf-8').toString();

   fileData = fileData.replaceAll('@typhonjs-svelte/lib/', '@typhonjs-fvtt/svelte/');

   fileData = fileData.replaceAll('#runtime/', '@typhonjs-svelte/runtime-base/');
   fileData = fileData.replaceAll('#svelte-fvtt/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('#svelte-lib/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('\'#svelte', '\'svelte');

   // For types
   // fileData = fileData.replaceAll('_typhonjs_fvtt_svelte_', '_typhonjs_fvtt_runtime_svelte_');

   fs.writeFileSync(gsapFile, fileData);
}

/**
 *  Adds a getter for position after `get elementTarget()`. This is necessary to perform as a DTS replacement as
 *  Foundry defines a `position` property on Application.
 *
 * @type {string}
 */
const dtsReplacePositionGetter = `    get elementTarget(): HTMLElement;

    /**
     * Returns the TJSPosition instance.
     *
     * @returns {import('@typhonjs-svelte/runtime-base/svelte/store/position').TJSPosition} The TJSPosition instance.
     */
    get position(): TJSPosition;
`;

// Common application generateDTS options.
const applicationDTSOptions = {
   filterDiagnostic,
   dtsReplace: {
      ...dtsReplace,
      'get elementTarget\\(\\): HTMLElement;': dtsReplacePositionGetter
   },
   rollupExternal: external
};

console.log('Generating TS Declaration: ./_dist/application/index.js');

await generateDTS({
   input: './_dist/application/index.js',
   output: './_dist/application/index.d.ts',
   ...applicationDTSOptions,
});

console.log('Generating TS Declaration: ./_dist/component/application/index.js');

await generateDTS({ input: './_dist/component/application/index.js' });

console.log('Generating TS Declaration: ./_dist/component/internal/index.js');

await generateDTS({ input: './_dist/component/internal/index.js' });
