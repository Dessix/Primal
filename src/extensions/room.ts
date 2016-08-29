interface RoomWithSlowFind extends Room {
    slowFind<T>(type: number, opts?: { filter: Object | Function | string }): T[];
}

let slowFind = Room.prototype.find;

//TODO: check if even useful, as find supposedly caches base results
function fastFind<T>(this: RoomWithSlowFind, type: number, opts?: { filter: Object | Function | string }): T[] {
    const volatile = global.volatile;

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
        volatileRoomFind[type] = cached = this.slowFind<T>(type);
    }
    
    if (opts) {
        return _.filter<Function | Object | string, T>(cached, opts.filter);
    } else {
        return cached;
    }
}

(<{ slowFind?: any }>Room.prototype).slowFind = slowFind;
Room.prototype.find = fastFind;
