interface DefaultMoveProfile {
  time: number;
  path: string | Array<PathStep>;
}

//TODO: Convert to strings, update bodybuilder to understand
declare const enum TravelCondition {
  road = 0,
  plain = 1,
  swamp = 2,
}

declare type DICT<V> = { [k: string]: V; [k: number]: V; };

interface ArrayConstructor {
  repeat<T>(this: void, value: T, count: number): Array<T>;
}

interface Array<T> {
	flatMap<O>(this: Array<T>, predicate: ((value: T)=>O[])): O[];
  padLeft(this: Array<T>, value: T, length: number): Array<T>;
  padRight(this: Array<T>, value: T, length: number): Array<T>;
  count(this: Array<T>, predicate: T | ((value: T)=>boolean)): number;
  countExcept(this: Array<T>, exclusionPredicate: T | ((value: T)=>boolean)): number;
}

interface String {
  padRight(this: string, length: number): string;
  padRight(this: string, length: number, character: string): string;
  padLeft(this: string, length: number): string;
  padLeft(this: string, length: number, character: string): string;
}

interface ObjectConstructor {
  values<T>(object: { [key: string]: T;[key: number]: T; }): T[];
}

// interface Object extends Iterable<any> {
//   // [Symbol.iterator](): Iterator<any>; // Disabled due to VM Deopt of iterations
// }
