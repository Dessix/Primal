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
}

safeExtendPrototype(RoomPosition, RoomPositionX);
