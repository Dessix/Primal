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
}


interface Flag {
    id: string;
    lookForStructureAtPosition<T extends Structure>(this: Flag, structureType: string): T | undefined;
}

interface RoomPosition {
    getRangeToSqr(this: RoomPosition, other: RoomPosition): number;
    getClosest<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
    lookForStructure<T extends Structure>(this: RoomPosition, structureType: string): T | undefined;
}

interface Global {
    getObjectOrFlagById<T>(id: string): T | null;
}
