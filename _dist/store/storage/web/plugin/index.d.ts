declare class TJSPLocalStorage {
    onPluginLoad(ev: any): void;
    #private;
}

declare class TJSPSessionStorage {
    onPluginLoad(ev: any): void;
    #private;
}

export { TJSPLocalStorage, TJSPSessionStorage };
