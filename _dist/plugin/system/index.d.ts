declare class LocalStorage {
    onPluginLoad(ev: any): void;
    #private;
}

declare class SessionStorage {
    onPluginLoad(ev: any): void;
    #private;
}

export { LocalStorage, SessionStorage };
