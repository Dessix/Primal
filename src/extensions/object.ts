import * as Reflect from "../util/reflection";

class ObjectConstructorX {
  public static values<T>(obj: { [key: string]: T;[key: number]: T; }): T[] {
    const keysToRet = <(string | number | T)[]>Object.keys(obj);
    for (let x = keysToRet.length; x-- > 0;) {
      keysToRet[x] = obj[(<string[]>keysToRet)[x]];
    }
    return <T[]>keysToRet;
  };
}

Reflect.safeExtendRaw(Object, ObjectConstructorX);
