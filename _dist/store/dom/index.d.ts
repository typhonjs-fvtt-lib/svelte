import * as svelte_action from 'svelte/action';

/**
 * Provides a readable store to track keys actively pressed. KeyStore is designed to be used with the {@link keyforward}
 * action.
 */
declare class KeyStore {
    /**
     * @param {Iterable<string>}  [keyNames] -
     *
     * @param {KeyStoreOptions}   [options] - Optional parameters
     */
    constructor(keyNames?: Iterable<string>, options?: KeyStoreOptions);
    /**
     * Add given key to the tracking key set.
     *
     * @param {string}   key - Key to add.
     */
    addKey(key: string): void;
    /**
     * @returns {boolean} True if any keys in the key set are pressed.
     */
    /**
     * Returns true if any of given keys are pressed. If `keys` is undefined then the result is true if any keys being
     * tracked are pressed.
     *
     * @param {string|Iterable<string>|undefined} keys - Zero or more key strings or list to verify if any pressed.
     *
     * @returns {boolean} True if any keys set are pressed.
     */
    anyPressed(keys: string | Iterable<string> | undefined): boolean;
    /**
     * Is the given key in the tracking key set.
     *
     * @param {string}   key - Key to check.
     */
    hasKey(key: string): void;
    /**
     * Returns true if all given keys are pressed.
     *
     * @param {string|Iterable<string>} keys - One or more key strings to verify if pressed.
     *
     * @returns {boolean} Are all keys pressed.
     */
    isPressed(keys: string | Iterable<string>): boolean;
    /**
     * Handle keydown event adding any key from the tracked key set.
     *
     * @param {KeyboardEvent}  event - KeyboardEvent.
     */
    keydown(event: KeyboardEvent): void;
    /**
     * @returns {IterableIterator<string>} Returns current pressed keys iterator.
     */
    keysPressed(): IterableIterator<string>;
    /**
     * @returns {IterableIterator<string>} Returns currently tracked keys iterator.
     */
    keysTracked(): IterableIterator<string>;
    /**
     * Handle keyup event removing any key from the tracked key set.
     *
     * @param {KeyboardEvent}  event - KeyboardEvent.
     */
    keyup(event: KeyboardEvent): void;
    /**
     * Remove the given key from the tracking key set.
     *
     * @param {string}   key - Key to remove.
     */
    removeKey(key: string): void;
    /**
     * Update options.
     *
     * @param {KeyStoreOptions}   options - Options to set.
     */
    setOptions(options: KeyStoreOptions): void;
    /**
     * @param {string}   key - key or key code to lookup.
     *
     * @returns {number} 1 if currently pressed and 0 if not pressed.
     */
    value(key: string): number;
    /**
     * @param {function(KeyStore): void} handler - Callback function that is invoked on update / changes.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: KeyStore) => void): (() => void);
    /**
     * Updates subscribers.
     *
     * @protected
     */
    protected _updateSubscribers(): void;
    #private;
}
type KeyStoreOptions = {
    /**
     * - Invoke `preventDefault` on key events.
     */
    preventDefault?: boolean;
    /**
     * - When true use `event.code` otherwise use `event.key` to get active key.
     */
    useCode?: boolean;
    /**
     * - Invoke `stopPropagation` on key events.
     */
    stopPropagation?: boolean;
};

/**
 * Provides an action to forward on key down & up events. This can be any object that has associated `keydown` and
 * `keyup` methods. See {@link KeyStore} for a store implementation.
 *
 * @param {HTMLElement} node - Target element.
 *
 * @param {import('..').KeyStore}   keyStore - KeyStore to forward events key down / up events to...
 *
 * @returns {import('svelte/action').ActionReturn<import('..').KeyStore>} Action lifecycle methods.
 */
declare function keyforward(node: HTMLElement, keyStore: KeyStore): svelte_action.ActionReturn<KeyStore>;

export { KeyStore, KeyStoreOptions, keyforward };
