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

interface RoomPosition {
    getRangeToSqr(this: RoomPosition, other: RoomPosition): number;
    getClosest<T extends { pos: RoomPosition }>(this: RoomPosition, targets: T[]): T | undefined;
}
