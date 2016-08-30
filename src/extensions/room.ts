
interface RoomWithSlowFind extends Room {
    slowFind<T>(type: number, opts?: { filter: Object | Function | string }): T[];
    fastFindObject: { filter: Object | Function | string };
}

const slowfindroom = (<RoomWithSlowFind>Room.prototype);
if (slowfindroom.slowFind === undefined) {


    const slowFind = Room.prototype.find;
    const fastFindObject = <{ filter: Object | Function | string }>{};//Default to this for perf bonus

    //TODO: check if even useful, as find supposedly caches base results
    function fastFind<T>(this: RoomWithSlowFind, type: number, opts?: { filter: Object | Function | string }): T[] {
        const volatile = global.tickVolatile;

        //cache for finds
        let volatileFind = volatile["find"];
        if (volatileFind === undefined) { volatile["find"] = volatileFind = {}; }

        //cache for this room
        let volatileRoomFind = volatileFind[Room.name];
        if (volatileRoomFind === undefined) { volatileFind["find"] = volatileRoomFind = {}; }

        //cache for type
        let cached = volatileRoomFind[type];
        if (cached) {
            return cached;
        } else {
            volatileRoomFind[type] = cached = this.slowFind<T>(type, this.fastFindObject);
        }

        if (opts) {
            return _.filter<Function | Object | string, T>(cached, opts.filter);
        } else {
            return cached;
        }
    }

    slowfindroom.fastFindObject = fastFindObject;
    slowfindroom.slowFind = slowFind;
    Room.prototype.find = fastFind;
}
