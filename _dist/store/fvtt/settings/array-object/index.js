import { ObjectEntryStore, CrudArrayObjectStore } from '@typhonjs-svelte/runtime-base/svelte/store/reducer/array-object';
import { Hashing } from '@typhonjs-svelte/runtime-base/util';
import { isObject } from '@typhonjs-svelte/runtime-base/util/object';

/**
 * Provides an extension to {@link #runtime/svelte/store/reducer/array-object!ObjectEntryStore} adding the
 * {@link FVTTObjectEntryStore.canUserModify} accessor which when paired with {@link GameSettingArrayObject} forwards on
 * whether the current Foundry user can edit / save to the Foundry DB.
 *
 * This is the base {@link ObjectEntryStore} available from a direct import or through
 * {@link GameSettingArrayObject.EntryStore} accessor.
 */
class FVTTObjectEntryStore extends ObjectEntryStore {
    #canUserModify;
    /**
     * @param data - Initial entry data.
     *
     * @param [gameSettingArrayObject] - Associated backing array object store. Automatically passed on entry creation
     *        by {@link #runtime/svelte/store/reducer/array-object!ArrayObjectStore}.
     */
    constructor(data, gameSettingArrayObject) {
        super(data);
        this.#canUserModify = gameSettingArrayObject?.canUserModify ?? true;
    }
    /**
     * Can the current user edit / save this instance to the Foundry DB.
     */
    get canUserModify() {
        return this.#canUserModify;
    }
}

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
     * @returns The default object entry store constructor that can facilitate the creation of the required
     *          {@link GameSettingArrayObject.Options.Config.StoreClass} and generic `T` type parameter.
     */
    static get EntryStore() { return FVTTObjectEntryStore; }
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
     * Can the current user edit / save this instance to the Foundry DB.
     */
    get canUserModify() {
        let canUserModify = false;
        switch (this.#scope) {
            case 'user':
                canUserModify = true;
                break;
            case 'world':
                // @ts-ignore - No Foundry types associated in build.
                canUserModify = globalThis.game.user.isGM;
                break;
        }
        return canUserModify;
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

export { FVTTObjectEntryStore, GameSettingArrayObject };
//# sourceMappingURL=index.js.map
