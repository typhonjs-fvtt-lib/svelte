/**
 * Provides legacy support for Handlebars rendering while still gaining aspects of reactivity with a Svelte powered
 * application shell. You may use the resources in this package in a similar manner as the core Foundry
 * {@link Application} / {@link FormApplication} classes. This should only be an interim or stepwise solution as you
 * convert your package over to fully using TRL & Svelte.
 *
 * @module
 */
import { HandlebarsApplication }       from './HandlebarsApplication.js';
import { HandlebarsFormApplication }   from './HandlebarsFormApplication.js';
import { SvelteFormApplication }       from './SvelteFormApplication.js';

export * from './HandlebarsApplication.js';
export * from './HandlebarsFormApplication.js';
export * from './SvelteFormApplication.js';

// Handle `PopOut!` module hooks to allow applications to popout to their own browser window -------------------------

Hooks.on('PopOut:loading', (app) =>
{
   if (app instanceof HandlebarsApplication || app instanceof HandlebarsFormApplication ||
    app instanceof SvelteFormApplication)
   {
      app.position.enabled = false;
   }
});

Hooks.on('PopOut:popin', (app) =>
{
   if (app instanceof HandlebarsApplication || app instanceof HandlebarsFormApplication ||
    app instanceof SvelteFormApplication)
   {
      app.position.enabled = true;
   }
});

Hooks.on('PopOut:close', (app) =>
{
   if (app instanceof HandlebarsApplication || app instanceof HandlebarsFormApplication ||
    app instanceof SvelteFormApplication)
   {
      app.position.enabled = true;
   }
});
