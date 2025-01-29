import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a world game setting. WorldArrayObjectStore is automatically associated as the store receiving updates with the
 * associated game setting.
 *
 * @typeParam S - Store type.
 */
class WorldArrayObjectStore extends CrudArrayObjectStore {
    /**
     * Game setting 'key' field.
     */
    #key;
    /**
     * Game setting 'namespace' field.
     */
    #namespace;
    /**
     * @param options - WorldArrayObjectStore Options.
     */
    constructor({ namespace, key, defaultData = [], gameSettings, ...rest }) {
        super({
            ...rest,
            extraData: { namespace, key }
        });
        if (typeof key !== 'string') {
            throw new TypeError(`'key' is not a string.`);
        }
        if (typeof namespace !== 'string') {
            throw new TypeError(`'namespace' is not a string.`);
        }
        this.#namespace = namespace;
        this.#key = key;
        if (!Array.isArray(defaultData)) {
            throw new TypeError(`'defaultData' is not an array.`);
        }
        // Define default `id` if not provided in `defaultData` then create a random `UUIDv4` value.
        for (const entry of defaultData) {
            if (typeof entry.id !== 'string') {
                entry.id = Hashing.uuidv4();
            }
        }
        if (gameSettings) {
            gameSettings.register({
                namespace,
                key,
                store: this,
                options: {
                    scope: 'world',
                    config: false,
                    default: Array.isArray(defaultData) ? defaultData : [],
                    type: Array,
                    name: key
                }
            });
        }
    }
    /**
     * @returns The Foundry game setting key.
     */
    get key() { return this.#key; }
    /**
     * @returns The Foundry game setting namespace.
     */
    get namespace() { return this.#namespace; }
}

export { WorldArrayObjectStore };
//# sourceMappingURL=index.js.map
