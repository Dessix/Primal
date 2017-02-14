
interface Memory {
  structures: { [structureId: string]: Object | undefined };
  containers?: ContainerMemoryList;
}

interface ContainerMemoryList { [id: string]: ContainerMemory; }

interface ContainerMemory {
  reservations?: { [reserverId: string ]: number };
}

interface StructureStorage {
  memory: ContainerMemory;
  readonly capacityAvailable: number;
  getCapacityReservation(this: StructureStorage, reserverId?: string): number;
  removeCapacityReservation(this: StructureStorage, reserverId: string): boolean;
  reserveCapacity(this: StructureStorage, reserverId: string, quantity: number): void
}

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

declare const enum TravelCondition {
  road,
  plain,
  swamp,
}

declare type DIRECTION = typeof TOP | typeof TOP_RIGHT | typeof RIGHT | typeof BOTTOM_RIGHT | typeof BOTTOM | typeof BOTTOM_LEFT | typeof LEFT | typeof TOP_LEFT;

declare type DICT<V> = { [k: string]: V; [k: number]: V; };

interface CreepMemory {
  spawnName: string;
  homeRoomName: string;
  role: string | null | undefined;
  [key: string]: any;

  t?: TravelProfile;
  _move?: {};
  d?: boolean;
}

interface TravelToOpts {
}

interface Creep {
  memory: CreepMemory;
  role: string | null | undefined;

  spawn: Spawn;

  //Custom MoveTo
  travelTo(
    target: RoomPosition | RoomObject
    , opts?: TravelToOpts
  ): number;

  readonly homeRoomName: string;

  /**
   * Home room of the creep.
   * Unavailable if fog of war is occluding access.
   */
  readonly homeRoom?: Room;
  recycle(): void;
}

interface Flag {
  id: string;
  lookForStructureAtPosition<T extends Structure>(this: Flag, structureType: string): T | undefined;
}

interface LookForInBoxTerrainResult {
  x: number;
  y: number;
  terrain: string;
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
  lookForStructure<T extends Structure>(this: RoomPosition, structureType: string): T | undefined;
  lookForInBox<T extends Creep | Flag | Structure | Resource | Source | ConstructionSite | LookForInBoxTerrainResult>(this: RoomPosition, structureType: string, radius: number): T[];
  lookTerrainInBox(this: RoomPosition, radius: number): LookForInBoxTerrainResult[];

  toUnicode(this: RoomPosition): string;
}

interface Room {
  findFirstStructureOfType<T extends Structure>(this: Room, structureType: string, onlyMine?: Boolean): T | undefined;
  findStructuresOfType<T extends Structure>(this: Room, structureType: string, onlyMine?: Boolean): T[];

  findFirstStructureOfTypeMatching<T extends Structure>(this: Room, structureType: string, condition: (structure: T) => boolean, onlyMine?: Boolean): T | undefined;
  findFirstStructureOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback) => boolean, onlyMine?: Boolean): TReturn | undefined;

  findStructuresOfTypeMatching<T extends Structure>(this: Room, structureType: string, condition: (structure: T) => boolean, onlyMine?: Boolean): T[];
  findStructuresOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback) => boolean, onlyMine?: Boolean): TReturn[];
}

interface Global {
  fromId<T>(id: string | null | undefined): T | undefined;
}

declare function fromId<T>(id: string | null | undefined): T | undefined;

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
