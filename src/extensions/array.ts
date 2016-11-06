import { safeExtendPrototype, safeExtendRaw } from "../util/reflection";
function fastReduce<T, O>(list: Array<T>, fn: (acc: O, current: T, currentIndex: number, array: T[]) => O, init: O): O {
	return list.reduce(fn, init);//TODO: Implement
}

function __fmaItr<T, O>(this: void, _acc: Array<O>, __fn: ((value: T, index: number, array: T[]) => O[]), _e: T, i: number, _lst: Array<T>) {
	_acc.push(...__fn.call(_lst, _e, _lst));
	return _acc;
}
function __fmaMakeItr<T, O>(_fn: ((value: T, index: number, array: T[]) => O[])): (acc: O[], current: T, currentIndex: number, array: T[]) => O[] {
	return function(_acc: O[], _current: T, _currentIndex: number, _array: T[]): O[] {
		return __fmaItr(_acc, _fn, _current, _currentIndex, _array);
	};
}
function fastFlatMapArray<T, O>(list: Array<T>, fn: (value: T, index: number, array: T[]) => O[]) {
  return fastReduce(list, __fmaMakeItr(fn), <O[]>[]);
}

class ArrayX<T> {
	public flatMap<O>(this: Array<T>, predicate: ((value: T)=>O[])): O[] {
		return fastFlatMapArray(this, predicate);
	}
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
