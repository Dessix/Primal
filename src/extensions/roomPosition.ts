import { safeExtendPrototype } from "../util/reflection";

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
}

safeExtendPrototype(RoomPosition, RoomPositionX, true);