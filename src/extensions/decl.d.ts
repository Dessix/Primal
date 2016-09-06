interface Memory {
    structures: { [structureId: string]: Object | undefined };
}

interface CreepMemory {
    spawnName: string;
    role?: string;
    [key: string]: any;
}

interface Creep {
    cmem: CreepMemory;
    role?: string;

    spawn: Spawn;
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
    findStructuresOfTypeMatching<T extends Structure>(this: Room, structureType: string, condition: (structure: T)=>boolean, onlyMine?: Boolean): T[];
}

interface Global {
    getObjectOrFlagById<T>(id: string): T | null;
}
