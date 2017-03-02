//TODO: Configuration based on a debug flag at the MAIN level. Enable/Disable based on build type.
export var __ELLIDE_ENABLED = false;

function __ELLIDE_NOOP(): undefined { return; }

export function ellidableMethod(ctorOrProto: {}, methodName: string, propertyDescriptor: PropertyDescriptor) {
  if(__ELLIDE_ENABLED) { propertyDescriptor.set = undefined; propertyDescriptor.value = __ELLIDE_NOOP; }
}
