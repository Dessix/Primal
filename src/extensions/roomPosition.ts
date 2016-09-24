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

  public static __intersectTwoWithDisclusion(
    point: PointLike,
    radius: number,
    discludeOrigin: boolean,
    point2: PointLike,
    radius2: number,
    discludeOrigin2: boolean
  ): Array<PointLike> {
    const topLeft = {
      x: Math.max(point.x - radius, point2.x - radius2),
      y: Math.max(point.y - radius, point2.y - radius2),
    };
    const bottomRight = {
      x: Math.min(point.x + radius, point2.x + radius2),
      y: Math.min(point.y + radius, point2.y + radius2),
    };
    if (discludeOrigin && discludeOrigin2) {
      return this.rectFromPointRange(topLeft, bottomRight, [((point.y << 8) + point.x), ((point2.y << 8) + point2.x)]);
    } else if (discludeOrigin || discludeOrigin2) {
      return this.rectFromPointRange(
        topLeft,
        bottomRight,
        [discludeOrigin ? ((point.y << 8) + point.x) : ((point2.y << 8) + point2.x)]
      );
    } else {
      return this.rectFromPointRange(topLeft, bottomRight);
    }
  }

  private static toPos16(point: PointLike): Pos16 {
    return (point.y << 8) + point.x;
  }

  public static __rectFromPointRange(topLeft: PointLike, bottomRight: PointLike, discludes?: Pos16[]): Array<PointLike> {
    const maxX = bottomRight.x - topLeft.x, maxY = bottomRight.y - topLeft.y;
    const output = new Array<PointLike>(maxX * maxY);
    if (discludes !== undefined && discludes.length > 0) {
      const disHash: { [numPosShifted: number]: boolean } = {};
      for (let i = discludes.length; i-- > 0;) {
        disHash[discludes[i]] = true;
      }
      for (let y = 0; y < maxY; ++y) {
        for (let x = 0; x < maxX; ++x) {
          if (((y << 8) + x).toString() in disHash) { continue; }
          output.push({ x: x + topLeft.x, y: y + topLeft.y });
        }
      }
    } else {
      for (let y = 0; y < maxY; ++y) {
        for (let x = 0; x < maxX; ++x) {
          output.push({ x: x + topLeft.x, y: y + topLeft.y });
        }
      }
    }
    return output;
  }

  public static intersectPoint16(...args: Array<PointLike | number>): Array<Pos16> {
    if (args.length === 0) { return []; }
    let tx = 0, ty = 0, bx = 0, by = 0;
    for (let i = 0, n = args.length; i < n; i += 2) {
      const p = <PointLike>args[i];
      const r = <number>args[i+1];
      tx = Math.max(tx, p.x - r);
      ty = Math.max(ty, p.y - r);
      bx = Math.min(bx, p.x + r);
      by = Math.min(by, p.y + r);
    }
    const rowLength = bx - tx;
    const output = new Array<Pos16>(rowLength * (by - ty));
    for (let y = ty, rowStart = 0; y < by; ++y, rowStart += rowLength) {
      const yShift = (ty << 8);
      for (let x = 0; x < rowLength; ++x) {
        output[rowStart + x] = tx + x + yShift;
      }
    }
    return output;
  }

  public static intersect(...args: Array<PointLike | number>): Array<PointLike> {
    const vals: Array<Pos16 | PointLike> = this.intersectPoint16(...args);
    for (let i = 0, n = vals.length, v = <Pos16>vals[0]; i < n; ++i, v = <Pos16>vals[i]) {
      vals[i] = { x: v & 255, y: v >> 8 };
    }
    return <PointLike[]>vals;
  }

  public static intersectRoomPos(roomName: string, ...args: Array<PointLike | number>): Array<RoomPosition> {
    const vals: Array<Pos16 | PointLike> = this.intersectPoint16(...args);
    for (let i = 0, n = vals.length, v = <Pos16>vals[0]; i < n; ++i, v = <Pos16>vals[i]) {
      vals[i] = new RoomPosition(v & 255, v >> 8, roomName);
    }
    return <RoomPosition[]>vals;
  }

  public static intersectAll(points: Array<[PointLike, number]>): Array<PointLike> {
    if (points.length === 0) { return []; }
    if (points.length % 2 !== 0) { throw new RangeError("Must be given an array of even length"); }
    let tx = 0, ty = 0, bx = 0, by = 0;
    for (let i = 0, n = points.length; i < n; ++i) {
      const [p, r] = points[i];
      tx = Math.max(tx, p.x - r);
      ty = Math.max(ty, p.y - r);
      bx = Math.min(bx, p.x + r);
      by = Math.min(by, p.y + r);
    }
    const rowLength = bx - tx;
    const output = new Array<PointLike>(rowLength * (by - ty));
    for (let y = ty, rowStart = 0; y < by; ++y, rowStart += rowLength) {
      for (let x = 0; x < rowLength; ++x) {
        output[rowStart + x] = { x: tx + x, y: ty };
      }
    }
    return output;
  }

  public static intersectAllRoomPos(roomName: string, points: Array<[PointLike, number]>): Array<RoomPosition> {
    const vals = this.intersectAll(points);
    for (let i = 0, n = vals.length, v = vals[0]; i < n; ++i, v = vals[i]) {
      vals[i] = new RoomPosition(v.x, v.y, roomName);
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
    const dist = Math.abs(otherCoordinate.x - thisCoordinate.x) + Math.abs(otherCoordinate.y - thisCoordinate.y);
    return dist;
  }

  public findClosestByRange<T extends RoomObject>(this: RoomPosition, type: number | Array<T | RoomPosition>, opts?: { filter: Object | Function | string }): T | RoomPosition | null {
    const room = Game.rooms[this.roomName];

    if (room === undefined) {
      throw new Error(`Could not access room ${this.roomName}`);
    }

    let objects: Array<T | RoomPosition>;

    if (Array.isArray(type)) {
      objects = (opts !== undefined && opts.filter !== undefined) ? _.filter(type, opts.filter) : type;
    } else {
      objects = room.find<T>(type, opts);
    }

    let closest: T | RoomPosition | undefined;
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

  public lookForStructure<T extends Structure>(this: RoomPosition, structureType: string): T | undefined {
    const looked = this.lookFor<Structure>(LOOK_STRUCTURES);
    for (let i = looked.length; i-- > 0;) {
      if (looked[i].structureType === structureType) {
        return <T>looked[i];
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

  public lookTerrainInBox(this: RoomPosition, radius: number): LookForInBoxTerrainResult[] {
    return this.lookForInBox<LookForInBoxTerrainResult>(LOOK_TERRAIN, radius);
  }

  public lookForInBox<T extends Creep | Flag | Structure | Resource | Source | ConstructionSite | LookForInBoxTerrainResult>(this: RoomPosition, lookType: string, radius: number): T[] {
    if (radius < 0) { throw new Error("Radius was less than 0"); }
    if (radius === 0) { return this.lookFor<T>(lookType); }
    const res = <LookAtResultWithPos[]>Game.rooms[this.roomName]
      .lookForAtArea(lookType,
      Math.max(this.y - radius, 0), Math.max(this.x - radius, 0),
      Math.min(this.y + radius, 49), Math.min(this.x + radius, 49),
      true);
    if (lookType === LOOK_TERRAIN) {
      for (radius = res.length; radius-- > 0;) { (<T[]><{}[]>res)[radius] = <T><{}><LookForInBoxTerrainResult><LookAtResultWithPos & { terrain: string }>res[radius]; }
    } else {
      for (radius = res.length; radius-- > 0;) { (<T[]><{}[]>res)[radius] = (<{ [lookType: string]: T }><{}>res[radius])[lookType]; }
    }
    return <T[]><{}[]>res;
  }

  public toUnicode(this: RoomPosition) {
    return String.fromCharCode((this.x << 8) + this.y);
  }
}

Reflect.safeExtendPrototype(RoomPosition, RoomPositionX, true);
