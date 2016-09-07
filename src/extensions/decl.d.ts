interface Memory {
    structures: { [structureId: string]: Object | undefined };
}

interface CreepMemory {
    spawnName: string;
    homeRoomName: string;
    role: string | null | undefined;
    [key: string]: any;
}

interface Creep {
    cmem: CreepMemory;
    role: string | null | undefined;

    spawn: Spawn;

    /**
     * Home room of the creep.
     * Unavailable if fog of war is occluding access.
     */
    homeRoom?: Room;
    homeRoomName: string;
    recycle(): void;
}


interface Flag {
    id: string;
    lookForStructureAtPosition<T extends Structure>(this: Flag, structureType: string): T | undefined;
}

interface RoomPosition {
    getRangeToLinearSqr(this: RoomPosition, other: RoomPosition): number;
    getClosest<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
    getClosestLinear<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
    lookForStructure<T extends Structure>(this: RoomPosition, structureType: string): T | undefined;
}

interface Room {
    findFirstStructureOfType<T extends Structure>(this: Room, structureType: string, onlyMine?: Boolean): T | undefined;
    findStructuresOfType<T extends Structure>(this: Room, structureType: string, onlyMine?: Boolean): T[];
    
    findFirstStructureOfTypeMatching<T extends Structure>(this: Room, structureType: string, condition: (structure: T)=>boolean, onlyMine?: Boolean): T | undefined;
    findFirstStructureOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback)=>boolean, onlyMine?: Boolean): TReturn | undefined;

    findStructuresOfTypeMatching<T extends Structure>(this: Room, structureType: string, condition: (structure: T)=>boolean, onlyMine?: Boolean): T[];
    findStructuresOfTypeMatching<TReturn extends TCallback, TCallback extends Structure>(this: Room, structureType: string, condition: (structure: TCallback)=>boolean, onlyMine?: Boolean): TReturn[];
}

interface Global {
    byId<T>(id: string | null | undefined): T | null;
}
