
interface StructureMemory { }

interface TravelProfile {
  time: number;
  pathStep: number;
  pathLength: number;
  path: Array<string>;
}

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

interface CreepDefaultMoveMemory { }

type CreepName = typeof Creep.name & (keyof (typeof Game.creeps));

interface ICreepProcess extends IProcess {
  creepName: CreepName;
  readonly creep?: Creep;
}

interface CreepProcessMemory extends ProcessMemory {
    c: CreepName;
    t?: TravelProfile;
}

interface CreepProcessMemoryOld {
  spawnName: string;
  homeRoomName: string;
  role: string | null | undefined;//Obsolete, defined more by process type

  t?: TravelProfile;
  d?: boolean;//Dead-ness? Obsolete with process model.
}

interface CreepMemory {
  s: ProcessId<ISpawnRequestingProcess>;
  c: ProcessId<ICreepProcess>;

  /**@deprecated*/
  _move?: CreepDefaultMoveMemory;
}

interface TravelToOpts {
}

interface Creep {
  memory: CreepMemory;
  role: string | null | undefined;

  spawn: Spawn;

  //Custom MoveTo
  travelTo(target: RoomPosition | RoomObject, opts?: TravelToOpts): number;

  readonly homeRoomName: string;

  /**
   * Home room of the creep.
   * Unavailable if fog of war is occluding access.
   */
  readonly homeRoom?: Room;
  recycle(): void;
}

interface LookForInBoxTerrainResult extends LookAtResultWithPos {
  type: LOOK_TERRAIN;
  x: number;
  y: number;
  terrain: TERRAIN;

  constructionSite: undefined;
  creep: undefined;
  energy: undefined;
  exit: undefined;
  flag: undefined;
  source: undefined;
  structure: undefined;
  mineral: undefined;
  resource: undefined;
}

interface RoomPositionConstructor {
  toUnicode(this: void, pos: PointLike): string;
  fromUnicode(this: void, character: string, roomName: string): RoomPosition;
  fromUnicodeFast(this: void, character: string): PointLike;

  intersect(p: PointLike, rad: number): Array<PointLike>;
  intersect(p: PointLike, rad: number, p2: PointLike, rad2: number): Array<PointLike>;
  intersect(p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number): Array<PointLike>;
  intersect(p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number, p4: PointLike, rad4: number): Array<PointLike>;
  intersect(p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number, p4: PointLike, rad4: number, p5: PointLike, rad5: number): Array<PointLike>;

  intersectRoomPos(roomName: string, p: PointLike, rad: number): Array<RoomPosition>;
  intersectRoomPos(roomName: string, p: PointLike, rad: number, p2: PointLike, rad2: number): Array<RoomPosition>;
  intersectRoomPos(roomName: string, p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number): Array<RoomPosition>;
  intersectRoomPos(roomName: string, p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number, p4: PointLike, rad4: number): Array<RoomPosition>;
  intersectRoomPos(roomName: string, p: PointLike, rad: number, p2: PointLike, rad2: number, p3: PointLike, rad3: number, p4: PointLike, rad4: number, p5: PointLike, rad5: number): Array<RoomPosition>;

  intersectAll(points: Array<[PointLike, number]>): Array<PointLike>;
  intersectAllRoomPos(roomName: string, points: Array<[PointLike, number]>): Array<RoomPosition>;
}

interface RoomPosition {
  getRangeToLinearSqr(this: RoomPosition, other: RoomPosition): number;
  getClosest<T extends RoomObject | { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
  getClosestLinear<T extends RoomObject | { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
  lookForStructure<TSTRUCTURE extends STRUCTURE>(this: RoomPosition, structureType: TSTRUCTURE): STRUCTURE_TARGET<TSTRUCTURE> | undefined;
  lookForInBox<TLOOK extends LOOK>(this: RoomPosition, lookType: TLOOK, radius: number): LOOK_TARGET<TLOOK>[];
  //lookTerrainInBox(this: RoomPosition, radius: number): LookForInBoxTerrainResult[];

  toUnicode(this: RoomPosition): string;
}

interface Room {
  findFirstStructureOfType<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE> | undefined;
  findStructuresOfType<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE>[];

  findFirstStructureOfTypeMatching<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE> | undefined;
  findFirstStructureOfTypeMatching<TReturn extends STRUCTURE_TARGET<TSTRUCTURE>, TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): TReturn | undefined;

  findStructuresOfTypeMatching<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE>[];
  findStructuresOfTypeMatching<TReturn extends STRUCTURE_TARGET<TSTRUCTURE>, TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): TReturn[];
}

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

interface PointLike {
  x: number;
  y: number;
}

interface RoomPositionLike extends PointLike {
  roomName: string;
}

/**
 * (y<<8)+x; x = v&255, y = v>>8
 */
type Point16 = number;
