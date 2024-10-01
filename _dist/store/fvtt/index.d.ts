import * as svelte_store from 'svelte/store';

/**
 * Provides a Svelte store wrapping the Foundry `game` global variable. It is initialized on the `ready` hook. You may
 * use this store to access the global game state from a Svelte template. It is a read only store and will receive no
 * reactive updates during runtime.
 *
 * @type {import('svelte/store').Readable<object>}
 */
declare const gameState: svelte_store.Readable<object>;

export { gameState };
