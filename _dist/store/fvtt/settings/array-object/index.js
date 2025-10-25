import { CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';
import { isObject } from '@typhonjs-svelte/runtime-base/util/object';

/**
 * Defines a {@link CrudArrayObjectStore} with streamlined configuration through {@link TJSGameSettings} to register
 * a `world` or `user` game setting. `GameSettingArrayObject` is automatically associated as the store receiving
 * updates with the associated game setting.
 *
 * @typeParam S - Store type.
 */
class GameSettingArrayObject extends CrudArrayObjectStore {
    /**
     * Game setting `key` field.
     */
    #key;
    /**
     * Game setting `namespace` field.
     */
    #namespace;
    /**
     * Game setting `scope` field.
     */
    #scope;
    /**
     * @param options - GameSettingArrayObject Options.
     */
    constructor({ namespace, key, scope, defaultData = [], gameSettings, ...rest }) {
        super({
            ...rest,
            extraData: { namespace, key, scope }
        });
        if (typeof key !== 'string') {
            throw new TypeError(`'key' is not a string.`);
        }
        if (typeof namespace !== 'string') {
            throw new TypeError(`'namespace' is not a string.`);
        }
        if (typeof scope !== 'string') {
            throw new TypeError(`'scope' is not a string.`);
        }
        if (scope !== 'world' && scope !== 'user') {
            throw new Error(`'scope' must be 'world' or 'user'.`);
        }
        this.#namespace = namespace;
        this.#key = key;
        this.#scope = scope;
        if (!Array.isArray(defaultData)) {
            throw new TypeError(`'defaultData' is not an array.`);
        }
        // Define default `id` if not provided in `defaultData` then create a random `UUIDv4` value.
        for (const entry of defaultData) {
            if (!isObject(entry)) {
                throw new TypeError(`'entry' in 'defaultData' is not an object.`);
            }
            if (!Hashing.isUuidv4(entry.id)) {
                entry.id = Hashing.uuidv4();
            }
        }
        if (gameSettings) {
            gameSettings.register({
                namespace,
                key,
                store: this,
                options: {
                    scope,
                    config: false,
                    default: Array.isArray(defaultData) ? defaultData : [],
                    type: Array,
                    name: key
                }
            });
        }
    }
    /**
     * @returns The Foundry game setting `key`.
     */
    get key() { return this.#key; }
    /**
     * @returns The Foundry game setting `namespace`.
     */
    get namespace() { return this.#namespace; }
    /**
     * @returns The Foundry game setting `scope`.
     */
    get scope() { return this.#scope; }
}

export { GameSettingArrayObject };
//# sourceMappingURL=index.js.map
