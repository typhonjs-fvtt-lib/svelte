import { writable } from 'svelte/store';

const storeState = writable(void 0);

/**
 * @type {GameState} Provides a Svelte store wrapping the Foundry runtime / global game state.
 */
const gameState = {
   subscribe: storeState.subscribe,
   get: () => game
};

Object.freeze(gameState);

Hooks.once('ready', () => storeState.set(game));

export { gameState };

/**
 * @typedef {import('svelte/store').Readable} GameState - Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized
 * on the `ready` hook. You may use this store to access the global game state from a Svelte template. It is a read only
 * store and will receive no reactive updates during runtime.
 *
 * @property {import('svelte/store').Readable.subscribe} subscribe - Provides the Svelte store subscribe function.
 *
 * @property {Function} get - Provides a mechanism to directly access the Foundry game state without subscribing.
 */
