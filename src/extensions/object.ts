
const anyGlobal = (<any>global);

if (!anyGlobal.ObjectX || !anyGlobal.ObjectX.values) {
  anyGlobal.ObjectX = Object;
  function ObjectKeys<T>(obj: { [key: string]: T;[key: number]: T; }): T[] {
    const keysToRet = <(string | number | T)[]>Object.keys(obj);
    for (let x = keysToRet.length; x-- > 0;) {
      keysToRet[x] = obj[(<string[]>keysToRet)[x]];
    }
    return <T[]>keysToRet;
  };
  Object.defineProperty(Object, "values", { value: ObjectKeys });
  Object.defineProperty(ObjectX, "values", { value: ObjectKeys });
}
