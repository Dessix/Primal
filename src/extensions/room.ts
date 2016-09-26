import * as Reflect from "../util/reflection";

interface RoomWithSlowFind extends Room {
    slowFind<T>(type: number, opts?: { filter: Object | Function | string }): T[];
    fastFindObject: { filter: Object | Function | string };
}


{
    const slowfindroom = <RoomWithSlowFind>Room.prototype;
    if (slowfindroom.slowFind === undefined) {


        const slowFind = Room.prototype.find;
        const fastFindObject = <{ filter: Object | Function | string }>{};//Default to this for perf bonus

        //TODO: check if even useful, as find supposedly caches base results
        function fastFind<T>(this: RoomWithSlowFind, type: number, opts?: { filter: ((object: T) => boolean) | Object | string }): T[] {
            const volatile = global.TickVolatile;

            //cache for finds
            let volatileFind = volatile["find"];
            if (volatileFind === undefined) { volatile["find"] = volatileFind = {}; }

            //cache for this room
            let volatileRoomFind = volatileFind[Room.name];
            if (volatileRoomFind === undefined) { volatileFind["find"] = volatileRoomFind = {}; }

            //cache for type
            let cached = <T[]>volatileRoomFind[type];
            if (cached) {
                return cached;
            } else {
                volatileRoomFind[type] = cached = this.slowFind<T>(type, this.fastFindObject);
            }

            if (opts && opts.filter) {
                if (typeof opts.filter === "function") {
                    return cached.filter(opts.filter);
                } else {
                    return _.filter<Object | string, T>(cached, opts.filter);
                }
            } else {
                return cached;
            }
        }

        slowfindroom.fastFindObject = fastFindObject;
        slowfindroom.slowFind = slowFind;
        Room.prototype.find = fastFind;
    }
}

interface RoomWithSlowFindExitTo extends Room {
    slowFindExitTo(room: string | Room): number;
}

{
    const roomWithSlowFindExit = <RoomWithSlowFindExitTo>Room.prototype;
    if (roomWithSlowFindExit.slowFindExitTo === undefined) {
        const slowFind = Room.prototype.findExitTo;
        const fastFindObject = <{ filter: Object | Function | string }>{};//Default to this for perf bonus

        function fastFindExitTo(room: string | Room): number {
            const involatile = Memory.Involatile;
            let exitDirs = involatile["exitDirs"];
            if (exitDirs === undefined) {
                Memory["exitDirs"] = exitDirs = {};
            }
            let roomEntry = exitDirs[this.name];
            if (roomEntry === undefined) {
                exitDirs[this.name] = roomEntry = {};
            }
            const target = room instanceof Room ? room.name : room;
            let targetRoomEntry = roomEntry[target];
            if (targetRoomEntry === undefined) {
                roomEntry[target] = targetRoomEntry = roomWithSlowFindExit.slowFindExitTo(room);
            }
            return targetRoomEntry;
        }

        roomWithSlowFindExit.slowFindExitTo = slowFind;
        Room.prototype.findExitTo = fastFindExitTo;
    }
}

class RoomX extends Room {
    public findFirstStructureOfType<T extends Structure>(this: Room, structureType: string, onlyMine: boolean = true): T | undefined {
        if (onlyMine && (structureType === STRUCTURE_WALL || structureType === STRUCTURE_ROAD || structureType === STRUCTURE_CONTAINER)) {
            onlyMine = false;
        }
        return <T | undefined>this.find<Structure>(onlyMine ? FIND_MY_STRUCTURES : FIND_STRUCTURES).find(x => x.structureType === structureType);
    }

    public findStructuresOfType<T extends Structure>(this: Room, structureType: string, onlyMine: boolean = true): T[] {
        if (onlyMine && (structureType === STRUCTURE_WALL || structureType === STRUCTURE_ROAD || structureType === STRUCTURE_CONTAINER)) {
            onlyMine = false;
        }
        return <T[]>this.find<Structure>(onlyMine ? FIND_MY_STRUCTURES : FIND_STRUCTURES).filter(x => x.structureType === structureType);
    }


    public findFirstStructureOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback) => boolean, onlyMine: boolean = true): TReturn | undefined {
        if (onlyMine && (structureType === STRUCTURE_WALL || structureType === STRUCTURE_ROAD || structureType === STRUCTURE_CONTAINER)) {
            onlyMine = false;
        }
        return <TReturn | undefined>this.find<TCallback>(onlyMine ? FIND_MY_STRUCTURES : FIND_STRUCTURES).find(x => x.structureType === structureType && condition(<TCallback>x));
    }

    public findStructuresOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback) => boolean, onlyMine: boolean = true): TReturn[] {
        if (onlyMine && (structureType === STRUCTURE_WALL || structureType === STRUCTURE_ROAD || structureType === STRUCTURE_CONTAINER)) {
            onlyMine = false;
        }
        return <TReturn[]>this.find<Structure>(onlyMine ? FIND_MY_STRUCTURES : FIND_STRUCTURES).filter(x => x.structureType === structureType && condition(<TCallback>x));
    }
}

Reflect.safeExtendPrototype(Room, RoomX, true);
