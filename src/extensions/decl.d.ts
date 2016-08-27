interface Memory {
    structures: { [structureId: string]: Object | undefined };
}

interface CreepMemory {
    role: string;
    [key: string]: any;
}

interface Creep {
    cmem: CreepMemory,
    role: string | undefined;
}
