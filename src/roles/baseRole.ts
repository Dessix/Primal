export interface IRole {
    run(creep: Creep): void;
}

export interface RoleConstructor {
    new (): IRole;
    readonly prototype: IRole;
    readonly RoleTag: string;
}

export abstract class BaseRole<TMemory extends CreepMemory> implements IRole {
    public run(this: BaseRole<TMemory>, creep: Creep): void {
        this.onRun(creep, <TMemory>creep.memory);
    }

    protected abstract onRun(creep: Creep, cmem: TMemory): void;

    public static generateName(roleCtor: RoleConstructor, cmem: CreepMemory) {
        return `${roleCtor.RoleTag}_${cmem.homeRoomName}_${Game.time}`;
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
