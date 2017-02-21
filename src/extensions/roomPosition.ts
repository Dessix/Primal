import * as Reflect from "../util/reflection";

class RoomPositionConstructorX {
  public static toUnicode(this: void, pos: PointLike): string {
    return String.fromCharCode((pos.x << 8) + pos.y);
  }

  public static fromUnicode(this: void, character: string, roomName: string): RoomPosition {
    const integer = character.charCodeAt(0);
    return new RoomPosition(
      (integer >> 8),
      (integer & 255),
      roomName
    );
  }

  public static roomPosFromUnicodeFast(this: void, character: string): PointLike {
    const integer = character.charCodeAt(0);
    return { x: (integer >> 8), y: (integer & 255) };
  }

  public static intersectPoint16(...args: Array<PointLike | number>): Array<Point16> {
    if (args.length === 0) { return []; }
    if (args.length % 2 !== 0) { throw new RangeError("Must be given an array of even length"); }
    let tx = 0, ty = 0, bx = 49, by = 49;
    for (let i = 0, n = args.length; i < n; i = i + 2) {
      const p = <PointLike>args[i];
      const r = <number>args[i+1];
      tx = Math.max(tx, p.x - r);
      ty = Math.max(ty, p.y - r);
      bx = Math.min(bx, p.x + r);
      by = Math.min(by, p.y + r);
    }
    const rowLength = bx - tx;
    if (rowLength < 0) { return []; }
    const output = new Array<Point16>((rowLength + 1) * (by - ty + 1));
    for (let y = ty, rowStart = 0; y <= by; ++y, rowStart = rowStart + rowLength) {
      const yShift = (ty << 8);
      for (let x = 0; x <= rowLength; ++x) {
        output[rowStart + x] = tx + x + yShift;
      }
    }
    return output;
  }

  public static intersect(...args: Array<PointLike | number>): Array<PointLike> {
    const vals: Array<Point16 | PointLike> = this.intersectPoint16(...args);
    for (let i = 0, n = vals.length, v = <Point16>vals[0]; i < n; ++i, v = <Point16>vals[i]) {
      vals[i] = { x: v & 255, y: v >> 8 };
    }
    return <PointLike[]>vals;
  }

  public static intersectRoomPos(roomName: string, ...args: Array<PointLike | number>): Array<RoomPosition> {
    const vals: Array<Point16 | PointLike> = this.intersectPoint16(...args);
    for (let i = 0, n = vals.length, v = <Point16>vals[0]; i < n; ++i, v = <Point16>vals[i]) {
      vals[i] = new RoomPosition(v & 255, v >> 8, roomName);
    }
    return <RoomPosition[]>vals;
  }

  public static intersectAllPoint16(points: Array<[PointLike, number]>): Array<Point16> {
    if (points.length === 0) { return []; }
    const flatPoints = new Array<PointLike | Point16>(points.length * 2);
    for (let i = 0, n = points.length; i < n; ++i) {
      const p = points[i];
      flatPoints[i * 2] = p[0];
      flatPoints[i * 2 + 1] = p[1];
    }
    return this.intersectPoint16(...<Point16[]>flatPoints);
  }

  public static intersectAll(points: Array<[PointLike, number]>): Array<PointLike> {
    const vals: Array<Point16 | PointLike> = this.intersectAllPoint16(points);
    for (let i = 0, n = vals.length, v = <Point16>vals[0]; i < n; ++i, v = <Point16>vals[i]) {
      vals[i] = { x: v & 255, y: v >> 8 };
    }
    return <PointLike[]>vals;
  }

  public static intersectAllRoomPos(roomName: string, points: Array<[PointLike, number]>): Array<RoomPosition> {
    const vals: Array<Point16 | RoomPosition> = this.intersectAllPoint16(points);
    for (let i = 0, n = vals.length, v = <Point16>vals[0]; i < n; ++i, v = <Point16>vals[i]) {
      vals[i] = new RoomPosition(v & 255, v >> 8, roomName);
    }
    return <RoomPosition[]>vals;
  }
}

Reflect.safeExtendRaw(RoomPosition, RoomPositionConstructorX);

class RoomPositionX extends RoomPosition {
  public getRangeToLinearSqr(this: RoomPosition, other: RoomPosition): number {
    const dxl = other.x - this.x;
    const dxy = other.y - this.y;
    return (dxl * dxl) + (dxy * dxy);
  }

  public getClosest<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined {
    if (targets.length === 0) {
      return undefined;
    }
    let closest: T | undefined = undefined;
    let closestDistanceManhattan = Number.MAX_SAFE_INTEGER;
    for (let i = targets.length; i-- > 0;) {
      const rangeSqr = this.getRangeTo(targets[i].pos);
      if (rangeSqr < closestDistanceManhattan) {
        closestDistanceManhattan = rangeSqr;
        closest = targets[i];
      }
    }
    return closest;
  }

  public getClosestLinear<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined {
    if (targets.length === 0) {
      return undefined;
    }
    let closest: T | undefined = undefined;
    let closestDistanceSqr = Number.MAX_SAFE_INTEGER;
    for (let i = targets.length; i-- > 0;) {
      const rangeSqr = this.getRangeToLinearSqr(targets[i].pos);
      if (rangeSqr < closestDistanceSqr) {
        closestDistanceSqr = rangeSqr;
        closest = targets[i];
      }
    }
    return closest;
  }

  private room_name_to_coords(pos: RoomPosition) {
    const tokenizedName = <RegExpMatchArray>pos.roomName.match(/[WNSE]|\d+/g);
    // 0 = W-/E+, 1 = x, 2 = N-/S+, 3 = y
    const roomX = <number>(tokenizedName[0] === "W" ? -tokenizedName[1] : tokenizedName[1] + 1);
    const roomY = <number>(tokenizedName[2] === "N" ? -tokenizedName[3] : tokenizedName[3] + 1);
    const x = (50 * roomX) + pos.x;
    const y = (50 * roomY) + pos.y;
    return { x: x, y: y };
  }

  public dist(this: RoomPositionX, other: RoomPosition) {
    const thisCoordinate = this.room_name_to_coords(this);
    const otherCoordinate = this.room_name_to_coords(other);
    const dist = Math.max(Math.abs(otherCoordinate.x - thisCoordinate.x), Math.abs(otherCoordinate.y - thisCoordinate.y));
    return dist;
  }

  public findClosestByRange<TFIND extends FIND>(this: RoomPosition, type: TFIND | Array<FIND_TARGET<TFIND> | RoomPosition>, opts?: FindOpts<FIND_TARGET<TFIND>>): FIND_TARGET<TFIND> | RoomPosition | null {

    let objects: Array<FIND_TARGET<TFIND> | RoomPosition>;

    if (Array.isArray(type)) {
      objects = (opts !== undefined && opts.filter !== undefined) ? _.filter(type, opts.filter) : type;
    } else {
      const room = Game.rooms[this.roomName];

      if (room === undefined) {
        throw new Error(`Could not access room ${this.roomName}`);
      }
      
      objects = room.find(type, opts);
    }

    let closest: FIND_TARGET<TFIND> | RoomPosition | undefined;
    let minRange = Infinity;
    for (let i = objects.length; i-- > 0;) {
      const object = objects[i];
      const range = this.getRangeTo(object);
      if (range < minRange) {
        if (range === 0) {
          closest = object;
          break;
        }
        minRange = range;
        closest = object;
      }
    }

    if (closest !== undefined) {
      return closest;
    } else {
      return null;
    }
  }

  public lookForStructure<T extends Structure>(this: RoomPosition, structureType: STRUCTURE): T | undefined {
    const looked = this.lookFor(LOOK_STRUCTURES);
    let s;
    for (let i = looked.length; i-- > 0;) {
      s = looked[i];
      if (s.structureType === structureType) {
        return <T>s;
      }
    }
    return;
  }

  public offset(this: RoomPosition, x: number, y: number): RoomPosition {
    return new RoomPosition(this.x + x, this.y + y, this.roomName);
  }

  public offsetByPoint(this: RoomPosition, offset: PointLike): RoomPosition {
    return new RoomPosition(this.x + offset.x, this.y + offset.y, this.roomName);
  }

  // public lookTerrainInBox(this: RoomPosition, radius: number): LookForInBoxTerrainResult[] {
  //   return this.lookForInBox(LOOK_TERRAIN, radius);
  // }

  public lookForInBox<TLOOK extends LOOK>(this: RoomPosition, lookType: LOOK, radius: number): LOOK_TARGET<TLOOK>[] {
    type T = LOOK_TARGET<TLOOK>;
    if (radius < 0) { throw new Error("Radius was less than 0"); }
    if (radius === 0) { return this.lookFor(lookType); }
    const res = <LookAtResultWithPos[]>Game.rooms[this.roomName]
      .lookForAtArea(<any>lookType,
      Math.max(this.y - radius, 0), Math.max(this.x - radius, 0),
      Math.min(this.y + radius, 49), Math.min(this.x + radius, 49),
      true);
    if (lookType === LOOK_TERRAIN) {
      for (radius = res.length; radius-- > 0;) { (<T[]><{}[]>res)[radius] = <T><{}><LookForInBoxTerrainResult><LookAtResultWithPos & { terrain: string }>res[radius]; }
    } else {
      for (radius = res.length; radius-- > 0;) { (<T[]><{}[]>res)[radius] = (<{ [lookType: string]: T }><{}>res[radius])[<string>lookType]; }
    }
    return <T[]><{}[]>res;
  }

  public toUnicode(this: RoomPosition) {
    return String.fromCharCode((this.x << 8) + this.y);
  }
}

Reflect.safeExtendPrototype(RoomPosition, RoomPositionX, true);
