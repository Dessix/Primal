
export abstract class BaseRole {
    public readonly creep: Creep;
    constructor(creep: Creep) {
        this.creep = creep;
    }
    public get cmem(): CreepMemory {
        return <CreepMemory>this.creep.memory;
    }
    public set cmem(value: CreepMemory) {
        this.creep.memory = value;
    }
    public abstract run(): void;
}
