export interface IRole {
    run(creep: Creep): void;
}

export abstract class BaseRole<TMemory extends CreepMemory> implements IRole {
    public run(creep: Creep): void {
        this.onRun(creep, <TMemory>creep.cmem);
    }
    protected abstract onRun(creep: Creep, cmem: TMemory): void;
    public static generateName(roleCtor: { RoleTag: string }) {
        return roleCtor.RoleTag + Game.time.toString(36).slice(-2);
    }
}
