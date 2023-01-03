declare class TJSLocalStorage {
    onPluginLoad(ev: any): void;
    #private;
}

declare class TJSSessionStorage {
    onPluginLoad(ev: any): void;
    #private;
}

export { TJSLocalStorage, TJSSessionStorage };
