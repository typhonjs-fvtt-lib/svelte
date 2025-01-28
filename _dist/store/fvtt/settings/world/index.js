import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';

/**
 * @typeParam S - Store type.
 */
class WorldSettingArrayStore extends CrudArrayObjectStore {
    /**
     */
    #key;
    /**
     */
    #namespace;
    /**
     * @param options - WorldSettingArrayStore Options.
     *
     * @param options.namespace - Game setting 'namespace' field.
     *
     * @param options.key - Game setting 'key' field.
     *
     * @param [options.defaultData] - When an instance of TJSGameSettings is defined and automatic game setting
     *        registered you may provide default data for the Foundry game setting.
     *
     * @param [options.gameSettings] - An instance of TJSGameSettings. If provided a world game setting will be
     *        automatically registered for the given `namespace` and `key` with this instance as the associated game
     *        setting store.
     *
     * @param options.rest - Rest of {@link CrudArrayObjectStoreParams} / {@link ArrayObjectStoreParams} parameters.
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

export { WorldSettingArrayStore };
//# sourceMappingURL=index.js.map
