import resolve                   from '@rollup/plugin-node-resolve';
import typescript                from '@rollup/plugin-typescript';
import { generateDTS }           from '@typhonjs-build-test/esm-d-ts';
import { importsExternal }       from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import { getFileList }           from '@typhonjs-utils/file-util';
import fs                        from 'fs-extra';
import { rollup }                from 'rollup';

import { externalPathsNPM }      from './.rollup/local/externalPathsNPM.js';
import { typhonjsRuntime }       from './.rollup/local/index.js';

// Defines the node-resolve config.
const s_RESOLVE_CONFIG = {
   browser: true,
   dedupe: ['svelte', '@typhonjs-svelte/runtime-base']
};

// Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
// minified / mangled.
const outputPlugins = [];

const external = [/^svelte/, /@typhonjs-svelte\/runtime-base\/*/, /@typhonjs-fvtt\/svelte\/*/];

// Defines whether source maps are generated / loaded from the .env file.
const sourcemap = true;

// GenerateDTS options -----------------------------------------------------------------------------------------------

// Provides naive search / replace of bundled declaration file rewriting the re-bundled definitions. This will alter
// the JSDoc comments and import symbols.
const dtsReplace = {
   _svelte_fvtt_: '_typhonjs_fvtt_svelte_',
   '#svelte-fvtt/': '@typhonjs-fvtt/svelte/',
   '/\\/\\/ <reference.*\\/>': ''   // Svelte v4 types currently add triple slash references.
};

// Rollup plugin options for generateDTS.
const dtsPluginOptions = {
   bundlePackageExports: true,
   dtsReplace,
   tsDiagnosticFilter: ({ message }) => message.includes(`Cannot find namespace 'fvtt'`)
};

// -------------------------------------------------------------------------------------------------------------------

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

// Application generateDTS options.
const applicationDTSOptions = {
   dtsReplace: {
      ...dtsReplace,
      'get elementTarget\\(\\): HTMLElement;': dtsReplacePositionGetter,

      // Handle the case of removing all generics from the extension of SvelteApp by TJSDialog as it internally defines the loaded component.
      'TJSDialog extends SvelteApplication<SvelteApp.Options<svelte.SvelteComponent<any, any, any>, SvelteApp.Context.AbstractExternal>>': 'TJSDialog extends SvelteApplication',

      // The following replacements handle cases where JSDoc can't properly define generic extends clauses.
      'declare class SvelteApp': 'declare class SvelteApp<Options extends SvelteApp.Options = SvelteApp.Options> extends foundry.appv1.api.Application<Options>',

      // Make the base SvelteApp.OptionsCore extend the global Foundry ApplicationOptions.
      'interface OptionsCore': 'interface OptionsCore extends Partial<fvtt.ApplicationOptions>',

      // Remove unused barrel import of `svelte`.
      [`import \\* as svelte from 'svelte';`]: ''
   },
   rollupExternal: external
};

// -------------------------------------------------------------------------------------------------------------------

const rollupConfigs = [
   {
      input: {
         input: 'src/animate/gsap/index.js',
         external,
         plugins: [
            importsExternal(),
            typhonjsRuntime({ exclude: [`@typhonjs-fvtt/svelte/animate/gsap`] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/animate/gsap/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/application/index.js',
         external,
         plugins: [
            importsExternal(),
            typhonjsRuntime({ exclude: [`@typhonjs-fvtt/svelte/application`] }),
            generateDTS.plugin(applicationDTSOptions)
         ]
      },
      output: {
         file: '_dist/application/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap
      }
   },
   {
      input: {
         input: 'src/store/fvtt/document/index.ts',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            typescript({ tsconfig: './src/store/fvtt/document/tsconfig.json' }),
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
         input: 'src/store/fvtt/settings/index.ts',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            typescript({ tsconfig: './src/store/fvtt/settings/tsconfig.json' }),
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
         input: 'src/store/fvtt/settings/array-object/index.ts',
         external,
         plugins: [
            importsExternal(),
            resolve(s_RESOLVE_CONFIG),
            typescript({ tsconfig: './src/store/fvtt/settings/array-object/tsconfig.json' }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      output: {
         file: '_dist/store/fvtt/settings/array-object/index.js',
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

// Application rewriting types / exports -----------------------------------------------------------------------------

// The manipulation below is to rewrite `SvelteApplication` as `SvelteApp` to be able to merge with the namespace
// `SvelteApp`. `SvelteApp` is then reexported as `SvelteApplication` in both the sub-path JS bundle and declarations.
{
   // JS Bundle mods --------------
   let applicationIndexJS = fs.readFileSync('./_dist/application/index.js', 'utf-8');

   applicationIndexJS = applicationIndexJS.replaceAll('TJSDialogNS', 'TJSDialog');
   applicationIndexJS = applicationIndexJS.replaceAll('SvelteAppNS', 'SvelteApp');

   fs.writeFileSync('./_dist/application/index.js', applicationIndexJS);

   // DTS Bundle mods -------------
   let applicationIndexDTS = fs.readFileSync('./_dist/application/index.d.ts', 'utf-8');

   // Remove merged class / namespace exports.
   applicationIndexDTS = applicationIndexDTS.replace(
      'export { FoundryStyles, SvelteApp, SvelteAppNS, SvelteApp as SvelteApplication, TJSDialog, TJSDialogNS };',
      'export { FoundryStyles, SvelteApp, SvelteApp as SvelteApplication, TJSDialog };'
   );

   applicationIndexDTS = applicationIndexDTS.replaceAll('TJSDialogNS', 'TJSDialog');
   applicationIndexDTS = applicationIndexDTS.replaceAll('SvelteAppNS', 'SvelteApp');

   fs.writeFileSync('./_dist/application/index.d.ts', applicationIndexDTS);
}

// Copy components to dist -------------------------------------------------------------------------------------------

fs.emptyDirSync('./_dist/component');
fs.copySync('./src/component', './_dist/component');

const compFiles = await getFileList({ dir: './_dist/component', resolve: true, walk: true });
for (const compFile of compFiles)
{
   let fileData = fs.readFileSync(compFile, 'utf-8').toString();

   // Ignore any `{@link #runtime...}` enclosed references.
   fileData = fileData.replaceAll(/(?<!\{@link\s*)#runtime\//g, '@typhonjs-svelte/runtime-base/');

   fileData = fileData.replaceAll('#svelte-fvtt/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('\'#svelte', '\'svelte');

   // For types
   // fileData = fileData.replaceAll('_typhonjs_fvtt_svelte_', '_typhonjs_fvtt_runtime_svelte_');

   fs.writeFileSync(compFile, fileData);
}

// GSAP plugin loading code is also bespoke and must be copied over.

fs.emptyDirSync('./_dist/animate/gsap/plugin');
fs.copySync('./src/animate/gsap/plugin', './_dist/animate/gsap/plugin');

const gsapFiles = await getFileList({ dir: './_dist/animate/gsap/plugin', resolve: true, walk: true });
for (const gsapFile of gsapFiles)
{
   let fileData = fs.readFileSync(gsapFile, 'utf-8').toString();

   // Ignore any `{@link #runtime...}` enclosed references.
   fileData = fileData.replaceAll(/(?<!\{@link\s*)#runtime\//g, '@typhonjs-svelte/runtime-base/');

   fileData = fileData.replaceAll('#svelte-fvtt/', '@typhonjs-fvtt/svelte/');
   fileData = fileData.replaceAll('\'#svelte', '\'svelte');

   // For types
   // fileData = fileData.replaceAll('_typhonjs_fvtt_svelte_', '_typhonjs_fvtt_runtime_svelte_');

   fs.writeFileSync(gsapFile, fileData);
}

// Svelte components
await generateDTS({ input: './_dist/component/application/index.js' });
await generateDTS({ input: './_dist/component/internal/index.js' });
