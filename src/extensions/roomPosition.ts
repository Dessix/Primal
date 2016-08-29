import { safeExtendPrototype } from "../util/reflection";

class RoomPositionX extends RoomPosition {
    public getRangeToSqr(this: RoomPosition, other: RoomPosition): number {
        const dxl = other.x - this.x;
        const dxy = other.y - this.y;
        return (dxl * dxl) + (dxy * dxy);
    }
    
    public getClosest<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined {
        if (targets.length === 0) {
            return undefined;
        }
        let closest: T | undefined = undefined;
        let closestDistanceSqr = Number.MAX_SAFE_INTEGER;
        for (let i = targets.length; i-- > 0;) {
            const rangeSqr = this.getRangeToSqr(targets[i].pos);
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
}

safeExtendPrototype(RoomPosition, RoomPositionX);
