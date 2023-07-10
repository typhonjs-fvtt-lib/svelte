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
