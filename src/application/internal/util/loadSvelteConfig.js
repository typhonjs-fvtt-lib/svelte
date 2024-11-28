import { TJSSvelteConfigUtil }   from '#runtime/svelte/util';
import { CrossWindow }           from '#runtime/util/browser';
import { isObject }              from '#runtime/util/object';

import { isApplicationShell }    from './isApplicationShell.js';

/**
 * Instantiates and attaches a Svelte component to the main inserted HTML.
 *
 * @param {object}            [opts] - Optional parameters.
 *
 * @param {object}            [opts.app] - The target application
 *
 * @param {import('#runtime/svelte/util').TJSSvelteConfig}  [opts.config] - Svelte component options
 *
 * @param {Function}          [opts.elementRootUpdate] - A callback to assign to the external context.
 *
 * @returns {import('#svelte-fvtt/application').SvelteData} The config + instantiated Svelte component.
 */
export function loadSvelteConfig({ app, config, elementRootUpdate } = {})
{
   let target;

   // A specific HTMLElement to append Svelte component.
   if (CrossWindow.isHTMLElement(config.target))
   {
      target = config.target;
   }
   else if (typeof config.target === 'string')
   {
      // Attempt to find target from query selector string.
      const activeWindow = app?.reactive?.activeWindow;
      target = activeWindow?.document?.querySelector(config.target);
   }

   if (!CrossWindow.isHTMLElement(target))
   {
      console.log(
       `%c[TRL] loadSvelteConfig error - Could not find target, '${config.target}', for config:\n`,
        'background: rgb(57,34,34)', config);

      throw new Error();
   }

   const NewSvelteComponent = config.class;

   const svelteConfig = TJSSvelteConfigUtil.parseConfig({ ...config, target }, app);

   const externalContext = svelteConfig.context.get('#external');

   // Inject the Foundry application instance and `elementRootUpdate` to the external context.
   externalContext.application = app;
   externalContext.elementRootUpdate = elementRootUpdate;
   externalContext.sessionStorage = app.reactive.sessionStorage;

   let eventbus;

   // Potentially inject any TyphonJS eventbus and track the proxy in the SvelteData instance.
   if (isObject(app._eventbus) && typeof app._eventbus.createProxy === 'function')
   {
      eventbus = app._eventbus.createProxy();
      externalContext.eventbus = eventbus;
   }

   // Seal external context so that it can't be extended.
   Object.seal(externalContext);

   // Create the Svelte component.
   /**
    * @type {import('svelte').SvelteComponent}
    */
   const component = new NewSvelteComponent(svelteConfig);

   // Set any eventbus to the config.
   svelteConfig.eventbus = eventbus;

   /**
    * @type {HTMLElement}
    */
   let element;

   // We can directly get the root element from components which follow the application store contract.
   if (isApplicationShell(component))
   {
      element = component.elementRoot;
   }

   if (!CrossWindow.isHTMLElement(element))
   {
      console.log(
       `%c[TRL] loadSvelteConfig error - No application shell contract found. Did you bind and export a HTMLElement ` +
        `as 'elementRoot' and include '<svelte:options accessors={true}/>'?\n` +
         `\nOffending config:\n`, 'background: rgb(57,34,34)', config);

      throw new Error();
   }

   return { config: svelteConfig, component, element };
}
