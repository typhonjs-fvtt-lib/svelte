import {
   FoundryHMRSupport,
   PopoutSupport }   from './external/index.js';

import { SvelteApp } from './SvelteApp.js';

export { SvelteApp, SvelteApp as SvelteApplication };

export * from './TJSDialog.js';

// Handle `hotReload` Foundry hook when running the Vite dev server.
if (import.meta.hot) { FoundryHMRSupport.initialize(); }

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
PopoutSupport.initialize();
