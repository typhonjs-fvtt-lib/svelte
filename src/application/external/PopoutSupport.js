import { SvelteApplication } from '../SvelteApplication.js';

/**
 * Handle `PopOut!` module hooks to allow applications to popout to their own browser window.
 */
export class PopoutSupport
{
   static initialize()
   {
      Hooks.on('PopOut:loading', (app, popout) =>
      {
         if (app instanceof SvelteApplication)
         {
            app.position.enabled = false;
            app.state.save({
               name: '#beforePopout',
               headerButtonNoClose: app.reactive.headerButtonNoClose
            });
            app.reactive.headerButtonNoClose = true;
            app.reactive.updateHeaderButtons();
            app.$window = popout;
         }
      });

      Hooks.on('PopOut:popin', (app) => this.#handleRejoin(app));
      Hooks.on('PopOut:close', (app) => this.#handleRejoin(app));
   }

   static #handleRejoin(app)
   {
      if (app instanceof SvelteApplication)
      {
         app.position.enabled = true;

         const beforeData = app.state.remove({ name: '#beforePopout' });
         if (beforeData)
         {
            app.reactive.headerButtonNoClose = beforeData.headerButtonNoClose;
            app.reactive.updateHeaderButtons();
         }

         delete app.$window;
      }
   }
}
