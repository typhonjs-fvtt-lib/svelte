import resolve                   from '@rollup/plugin-node-resolve';
import { generateDTS }           from '@typhonjs-build-test/esm-d-ts';
import { jsdocRemoveNodeByTags } from '@typhonjs-build-test/esm-d-ts/transformer';
import fs                        from 'fs-extra';
import { rollup }                from 'rollup';
import upath                     from 'upath';

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

const rollupConfigs = [
   {
      input: {
         input: 'src/action/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/action`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/action/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/animate/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/animate`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/animate/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/gsap/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/gsap`] })
         ]
      },
      output: {
         file: '_dist/gsap/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/handler/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/handler`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/handler/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/helper/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/helper`] })
         ]
      },
      output: {
         file: '_dist/helper/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/math/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/math`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/math/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/store/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/store`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/store/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/transition/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/transition`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/transition/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/util/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/util`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/util/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/plugin/data/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/plugin/data`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/plugin/data/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   },
   {
      input: {
         input: 'src/plugin/system/index.js',
         plugins: [
            typhonjsRuntime({ exclude: [`@typhonjs-svelte/lib/plugin/system`] }),
            resolve(s_RESOLVE_CONFIG)
         ]
      },
      output: {
         file: '_dist/plugin/system/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         paths: externalPathsNPM,
         plugins: outputPlugins,
         sourcemap,
         // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativePath, `.`)
      }
   }
];

for (const config of rollupConfigs)
{
   console.log(`Generating bundle: ${config.input.input}`);

   const bundle = await rollup(config.input);
   await bundle.write(config.output);

   // closes the bundle
   await bundle.close();

   console.log(`Generating TS Declaration: ${config.input.input}`);

   await generateDTS({
      main: config.input.input,
      output: upath.changeExt(config.output.file, '.d.ts'),
      bundlePackageExports: true
   });

   fs.writeJSONSync(`${upath.dirname(config.output.file)}/package.json`, {
      main: './index.js',
      module: './index.js',
      type: 'module',
      types: './index.d.ts'
   });
}

// Handle application & application/legacy by copying the source.
fs.emptyDirSync('./_dist/application');
fs.copySync('./src/application', './_dist/application');

fs.writeJSONSync(`./_dist/application/package.json`, {
   main: './index.js',
   module: './index.js',
   type: 'module'
});

fs.writeJSONSync(`./_dist/application/dialog/package.json`, {
   main: './index.js',
   module: './index.js',
   type: 'module'
});

fs.writeJSONSync(`./_dist/application/legacy/package.json`, {
   main: './index.js',
   module: './index.js',
   type: 'module'
});

// Copy component core / dialog

fs.emptyDirSync('./_dist/component');
fs.copySync('./src/component', './_dist/component');

fs.writeJSONSync(`./_dist/component/core/package.json`, {
   main: './index.js',
   module: './index.js',
   type: 'module'
});

fs.writeJSONSync(`./_dist/component/dialog/package.json`, {
   main: './index.js',
   module: './index.js',
   type: 'module'
});

// GSAP plugin loading code is also bespoke and must be copied over.

fs.emptyDirSync('./_dist/gsap/plugin');
fs.copySync('./src/gsap/plugin', './_dist/gsap/plugin');

await generateDTS({
   main: './_dist/application/index.js',
   output: './_types/application/index.d.mts',
   prependGen: ['./_dist/application/typedefs.js'],
   transformers: [jsdocRemoveNodeByTags('internal')]
});

await generateDTS({
   main: './_dist/application/dialog/index.js',
   output: './_types/application/dialog/index.d.mts',
   // prependGen: ['./_dist/application/typedefs.js'],
   transformers: [jsdocRemoveNodeByTags('internal')]
});

await generateDTS({
   main: './_dist/application/legacy/index.js',
   output: './_types/application/legacy/index.d.mts',
   // prependGen: ['./_dist/application/typedefs.js'],
   transformers: [jsdocRemoveNodeByTags('internal')]
});
