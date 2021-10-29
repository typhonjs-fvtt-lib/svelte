import { writable }  from 'svelte-persistent-store/session';
import { get }       from 'svelte/store';

export default class SessionStorage
{
   constructor()
   {
      this._stores = new Map();
   }

   getItem(itemId, defaultValue)
   {
      const store = s_GET_STORE(this, itemId, defaultValue);
      return store.get();
   }

   getStore(itemId)
   {
      return s_GET_STORE(this, itemId);
   }

   setItem(itemId, value)
   {
      const store = s_GET_STORE(this, itemId);
      store.set(value);
   }

   swapItemBoolean(itemId)
   {
      const store = s_GET_STORE(this, itemId);
      const value = store.get();
      const newValue = typeof value === 'boolean' ? !value : false;

      store.set(newValue);
      return newValue;
   }
}

function s_GET_STORE(storage, itemId, defaultValue = void 0)
{
   let store = storage._stores.get(itemId);
   if (store === void 0)
   {
      store = s_CREATE_STORE(itemId, defaultValue);
      storage._stores.set(itemId, store);
   }

   return store;
}

function s_CREATE_STORE(storage, itemId, defaultValue = void 0)
{
   try
   {
      if (sessionStorage.getItem(itemId))
      {
         defaultValue = JSON.parse(sessionStorage.getItem(itemId));
      }
   }
   catch (err) { /**/ }

   const store = writable(itemId, defaultValue);
   store.get = () => get(store);

   return store;
}