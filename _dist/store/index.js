import { derived, get, writable } from 'svelte/store';

/**
 * Provides a basic test for a given variable to test if it has the shape of a readable store by having a `subscribe`
 * function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isReadableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function';
   }

   return false;
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * function and an `update` function.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ a `subscribe` function.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isUpdatableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function' && typeof store.update === 'function';
   }

   return false;
}

/**
 * Provides a basic test for a given variable to test if it has the shape of a writable store by having a `subscribe`
 * `set`, and `update` functions.
 *
 * Note: functions are also objects, so test that the variable might be a function w/ `subscribe` & `set` functions.
 *
 * @param {*}  store - variable to test that might be a store.
 *
 * @returns {boolean} Whether the variable tested has the shape of a store.
 */
function isWritableStore(store)
{
   if (store === null || store === void 0) { return false; }

   switch (typeof store)
   {
      case 'function':
      case 'object':
         return typeof store.subscribe === 'function' && typeof store.set === 'function';
   }

   return false;
}

/**
 * Wraps a writable stores set method invoking a callback after the store is set. This allows hard coupled parent /
 * child relationships between stores to update directly without having to subscribe to the child store. This is a
 * particular powerful pattern when the `setCallback` is a debounced function that syncs a parent store and / or
 * serializes data.
 *
 * Note: Do consider carefully if this is an optimum solution; this is a quick implementation helper, but a better
 * solution is properly managing store relationships through subscription.
 *
 * @template T
 *
 * @param {import('#svelte/store').Writable<T>} store - A store to wrap.
 *
 * @param {(store?: import('#svelte/store').Writable<T>, value?: T) => void} setCallback - A callback to invoke after
 *        store set.
 *
 * @returns {import('#svelte/store').Writable<T>} Wrapped store.
 */
function storeCallback(store, setCallback)
{
   if (!isWritableStore(store)) { throw new TypeError(`'store' is not a writable store.`); }
   if (typeof setCallback !== 'function') { throw new TypeError(`'setCallback' is not a function.`); }

   /** @type {import('#svelte/store').Writable<T>} */
   return {
      set: (value) =>
      {
         store.set(value);
         setCallback(store, value);
      },

      subscribe: store.subscribe,

      update: typeof store.update === 'function' ? store.update : void 0
   };
}

/**
 * Subscribes to the given store with the update function provided and ignores the first automatic
 * update. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} update - function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
function subscribeIgnoreFirst(store, update)
{
   let firedFirst = false;

   return store.subscribe((value) =>
   {
      if (!firedFirst)
      {
         firedFirst = true;
      }
      else
      {
         update(value);
      }
   });
}

/**
 * Subscribes to the given store with two update functions provided. The first function is invoked on the initial
 * subscription. All future updates are dispatched to the update function.
 *
 * @param {import('#svelte/store').Readable | import('#svelte/store').Writable} store -
 *  Store to subscribe to...
 *
 * @param {import('#svelte/store').Updater} first - Function to receive first update.
 *
 * @param {import('#svelte/store').Updater} update - Function to receive future updates.
 *
 * @returns {import('#svelte/store').Unsubscriber} Store unsubscribe function.
 */
function subscribeFirstRest(store, first, update)
{
   let firedFirst = false;

   return store.subscribe((value) =>
   {
      if (!firedFirst)
      {
         firedFirst = true;
         first(value);
      }
      else
      {
         update(value);
      }
   });
}

/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract)
 */

/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#run-time-svelte-store-writable),
 * but which has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 * 
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 2nd parameter.
 * @param {!Function} reflect Called when the derived store gets a new value via its `set` or
 * `update` methods, and determines new values for the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#run-time-svelte-store-writable)'s 3rd parameter.
 * 
 * @returns {Store} A writable store.
 */
function writableDerived(origins, derive, reflect, initial) {
	var childDerivedSetter, originValues, blockNextDerive = false;
	var reflectOldValues = reflect.length >= 2;
	var wrappedDerive = (got, set) => {
		childDerivedSetter = set;
		if (reflectOldValues) {
			originValues = got;
		}
		if (!blockNextDerive) {
			let returned = derive(got, set);
			if (derive.length < 2) {
				set(returned);
			} else {
				return returned;
			}
		}
		blockNextDerive = false;
	};
	var childDerived = derived(origins, wrappedDerive, initial);
	
	var singleOrigin = !Array.isArray(origins);
	function doReflect(reflecting) {
		var setWith = reflect(reflecting, originValues);
		if (singleOrigin) {
			blockNextDerive = true;
			origins.set(setWith);
		} else {
			setWith.forEach( (value, i) => {
				blockNextDerive = true;
				origins[i].set(value);
			} );
		}
		blockNextDerive = false;
	}
	
	var tryingSet = false;
	function update(fn) {
		var isUpdated, mutatedBySubscriptions, oldValue, newValue;
		if (tryingSet) {
			newValue = fn( get(childDerived) );
			childDerivedSetter(newValue);
			return;
		}
		var unsubscribe = childDerived.subscribe( (value) => {
			if (!tryingSet) {
				oldValue = value;
			} else if (!isUpdated) {
				isUpdated = true;
			} else {
				mutatedBySubscriptions = true;
			}
		} );
		newValue = fn(oldValue);
		tryingSet = true;
		childDerivedSetter(newValue);
		unsubscribe();
		tryingSet = false;
		if (mutatedBySubscriptions) {
			newValue = get(childDerived);
		}
		if (isUpdated) {
			doReflect(newValue);
		}
	}
	return {
		subscribe: childDerived.subscribe,
		set(value) { update( () => value ); },
		update,
	};
}

/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 * 
 * @param {Store} origin The store containing the object to get/set from.
 * @param {string|number|symbol|Array<string|number|symbol>} propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns {Store} A writable store.
 */
function propertyStore(origin, propName) {
	if (!Array.isArray(propName)) {
		return writableDerived(
			origin,
			(object) => object[propName],
			(reflecting, object) => {
				object[propName] = reflecting;
				return object;
			},
		);
	} else {
		let props = propName.concat();
		return writableDerived(
			origin,
			(value) => {
				for (let i = 0; i < props.length; ++i) {
					value = value[ props[i] ];
				}
				return value;
			},
			(reflecting, object) => {
				let target = object;
				for (let i = 0; i < props.length - 1; ++i) {
					target = target[ props[i] ];
				}
				target[ props[props.length - 1] ] = reflecting;
				return object;
			},
		);
	}
}

const _storeGameState = writable(void 0);

/**
 * @type {import('svelte/store').Readable<globalThis.game>} Provides a Svelte store wrapping the Foundry `game` global
 * variable. It is initialized on the `ready` hook. You may use this store to access the global game state from a
 * Svelte template. It is a read only store and will receive no reactive updates during runtime.
 */
const gameState = {
   subscribe: _storeGameState.subscribe,
};

Object.freeze(gameState);

Hooks.once('ready', () => _storeGameState.set(game));

export { gameState, isReadableStore, isUpdatableStore, isWritableStore, propertyStore, storeCallback, subscribeFirstRest, subscribeIgnoreFirst, writableDerived };
//# sourceMappingURL=index.js.map
