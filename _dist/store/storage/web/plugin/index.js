import { TJSLocalStorage, TJSSessionStorage } from '@typhonjs-fvtt/svelte/store/storage/web';

class TJSPLocalStorage
{
   #storage = new TJSLocalStorage();

   onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:local:item:get`, this.#storage.getItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:boolean:swap`, this.#storage.swapItemBoolean, this.#storage,
       { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:set`, this.#storage.setItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:store:get`, this.#storage.getStore, this.#storage, { guard: true });
   }
}

class TJSPSessionStorage
{
   #storage = new TJSSessionStorage();

   onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:session:item:get`, this.#storage.getItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:boolean:swap`, this.#storage.swapItemBoolean, this.#storage,
       { guard: true });
      ev.eventbus.on(`${prepend}storage:session:item:set`, this.#storage.setItem, this.#storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:session:store:get`, this.#storage.getStore, this.#storage, { guard: true });
   }
}

export { TJSPLocalStorage, TJSPSessionStorage };
//# sourceMappingURL=index.js.map
