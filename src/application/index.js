import { ThemeObserver }   from '#runtime/util/dom/theme';

import {
   FoundryHMRSupport,
   FoundryStyles,
   PopoutSupport }         from './external/index.js';

import { SvelteAppData }   from './internal/static-global/index.js';

import { SvelteApp }       from './SvelteApp.js';

export { SvelteApp, SvelteApp as SvelteApplication };

export * from './TJSDialog.js';

export {
   FoundryStyles,
};

// Initialize global tracking data for SvelteApp.
SvelteAppData.initialize();

// Initialize core theme observation / changes.
ThemeObserver.initialize();

// Handle `hotReload` Foundry hook when running the Vite dev server.
if (import.meta.hot) { FoundryHMRSupport.initialize(); }

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
PopoutSupport.initialize();
