// type PseudoGetterFor<TMemory extends 
//function WrappedGetter(this: )

// export function fromMemoryGet<TMemory extends ProcessMemory,T = T>(
//   def: T,
//   getter?: (mem: TMemory) => T,
//   setter?: (mem: TMemory, value: T) => void
// ) {
//   return function(ctor: Function,propName: string,propDesc: PropertyDescriptor) {
//     propDesc.value = def;
//     propDesc.get = getter;
//     propDesc.set = setter;
//   }

// }

