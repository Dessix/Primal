import { Process } from "./process";

export abstract class CreepProcess<TLaunchArgs extends Array<any>,TMEMORY extends CreepProcessMemory> extends Process<TLaunchArgs,TMEMORY> implements ICreepProcess {
    public get creepName(): CreepName { return this.memory.c; }
    public set creepName(name: CreepName) { this.memory.c = name; }
    public get creep(): Creep | undefined { return Game.creeps[this.creepName]; }
}
