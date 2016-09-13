
export function safeExtendPrototype(base: any, extension: any, overwrite: boolean = false) {
    safeExtendRaw(base.prototype, extension.prototype, overwrite);
}

export function safeExtendRaw(base: any, extension: any, overwrite: boolean = false) {
    let properties: string[] = Object.getOwnPropertyNames(extension);
    for (let i = properties.length; i-- > 0;) {
        const property = properties[i];
        if (overwrite || !base.hasOwnProperty(property)) {
            Object.defineProperty(
                base,
                property,
                Object.getOwnPropertyDescriptor(extension, property));
        }
    }
}
