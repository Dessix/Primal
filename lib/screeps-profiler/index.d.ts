
export declare function wrap<T>(callback: () => T): T;
export declare function enable(): void;
export declare function output(numResults: number): string;
export declare function registerObject<T>(object: T, label: string): T;
export declare function registerFN<T extends Function>(fn: T, functionName: string): T;
export declare function registerClass<T>(object: T, label: string): T;
