
export function safeExtendPrototype(extended: any, extender: any, overwrite: boolean = false) {
    let properties: string[] = Object.getOwnPropertyNames(extender.prototype);
    for (let i = properties.length; i-- > 0;) {
        const property = properties[i];
        if (overwrite || !extended.prototype.hasOwnProperty(property)) {
            Object.defineProperty(
                extended.prototype,
                property,
                Object.getOwnPropertyDescriptor(extender.prototype, property));
        }
    }
}
