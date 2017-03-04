import * as Reflector from "../util/reflection";

class ObjectConstructorX {
  public static *iterateObject(obj: { [key: string]: any }): IterableIterator<any> {
    const keys = Object.keys(obj);
    for(let i = 0,n = keys.length;i < n;++i) {
      yield obj[keys[i]];
    }
  }
  public static values<T>(obj: { [key: string]: T;[key: number]: T; }): T[] {
    const keysToRet = <(string | number | T)[]>Object.keys(obj);
    for(let x = keysToRet.length;x-- > 0;) {
      keysToRet[x] = obj[(<string[]>keysToRet)[x]];
    }
    return <T[]>keysToRet;
  };
}

Reflector.safeExtendRaw(Object,ObjectConstructorX);

// class ObjectX implements Iterable<any> {
//   public [Symbol.iterator]() {
//     const itr: IterableIterator<any> = ObjectConstructorX.iterateObject(<{ [key: string]: any }>this);
//     return itr;
//   }
// }

//Reflect.safeExtendPrototype(Object, ObjectX);
