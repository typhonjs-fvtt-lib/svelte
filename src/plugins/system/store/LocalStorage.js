import LocalStorage from '../../../modules/store/LocalStorage.js';

const storage = new LocalStorage();

export default class LocalStoragePlugin
{
   static onPluginLoad(ev)
   {
      const prepend = typeof ev?.pluginOptions?.eventPrepend === 'string' ? `${ev.pluginOptions.eventPrepend}:` : '';

      ev.eventbus.on(`${prepend}storage:local:item:get`, storage.getItem, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:boolean:swap`, storage.swapItemBoolean, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:item:set`, storage.setItem, storage, { guard: true });
      ev.eventbus.on(`${prepend}storage:local:store:get`, storage.getStore, storage, { guard: true });
   }
}
