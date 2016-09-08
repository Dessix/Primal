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

    public moveOffBorder(creep: Creep): boolean {
        if (creep.pos.x === 0) {
            creep.move(RIGHT);
        } else if (creep.pos.y === 0) {
            creep.move(BOTTOM);
        } else if (creep.pos.x === 49) {
            creep.move(LEFT);
        } else if (creep.pos.y === 49) {
            creep.move(TOP);
        } else {
            return false;
        }
        return true;
    }
}
