import { safeExtendPrototype, safeExtendRaw } from "../util/reflection";

class ArrayX<T> {
  public padRight(this: Array<T>, value: T, length: number): Array<T> {
    if (length <= this.length) { return this; }
    return this.concat(Array.repeat(value, length - this.length));
  }

  public padLeft(this: Array<T>, value: T, length: number): Array<T> {
    if (length <= this.length) { return this; }
    return Array.repeat(value, length - this.length).concat(this);
  }

  public count(this: Array<T>, value: T | ((value: T) => boolean)): number {
    if (this.length === 0) { return 0; }
    let c = 0, i = 0, n = this.length;
    if (value instanceof Function) {
      for (; i < n; ++i) {
        if (value(this[i])) {
          ++c;
        }
      }
    } else {
      for (; i < n; ++i) {
        if (this[i] === value) {
          ++c;
        }
      }
    }
    return c;
  }

  public countExcept(this: Array<T>, exclusion: T | ((value: T) => boolean)): number {
    return this.length === 0 ? 0 : this.length - this.count(exclusion);
  }
}

safeExtendPrototype(Array, ArrayX, false);

class ArrayStaticX {
  public static repeat<T>(this: void, value: T, count: number): Array<T> {
    if (count === 0) { return []; }
    return new Array<T>(count).fill(value);
  }
}

safeExtendRaw(Array, ArrayStaticX, false);
