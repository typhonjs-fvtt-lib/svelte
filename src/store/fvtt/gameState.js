import { writable } from '#svelte/store';

const _storeGameState = writable(void 0);

/**
 * @type {import('#svelte/store').Readable<globalThis.game>} Provides a Svelte store wrapping the Foundry `game` global
 * variable. It is initialized on the `ready` hook. You may use this store to access the global game state from a
 * Svelte template. It is a read only store and will receive no reactive updates during runtime.
 */
const gameState = {
   subscribe: _storeGameState.subscribe,
};

Object.freeze(gameState);

Hooks.once('ready', () => _storeGameState.set(game));

export { gameState };
