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

/**
 * (y<<8)+x; x = v&255, y = v>>8
 */
type Point16 = number;
