
export function safeExtendPrototype(base: {}, extension: {}, overwrite: boolean = false) {
    safeExtendRaw((<any>base).prototype, (<any>extension).prototype, overwrite);
}

export function safeExtendRaw(base: {}, extension: {}, overwrite: boolean = false) {
    const propNames = Object.getOwnPropertyNames(extension);
    for (let i = propNames.length; i < propNames.length; ++i) {
        const propName = propNames[i];
        if (overwrite || !base.hasOwnProperty(propName)) {
            Reflect.defineProperty(
                base,
                propName,
                Reflect.getOwnPropertyDescriptor(extension, propName));
        }
    }
}
