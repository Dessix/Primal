import { Process } from "./process";

export abstract class CreepProcess<TMEMORY extends CreepProcessMemory> extends Process<TMEMORY> implements ICreepProcess {
    public get creepName(): CreepName { return this.memory.c; }
    public set creepName(name: CreepName) { this.memory.c = name; }
    public get creep(): Creep | undefined { return Game.creeps[this.creepName]; }
}
