export interface IRole {
  run(creep: Creep,memory: CreepProcessMemory): void;
}

export interface RoleConstructor {
  new (): IRole;
  readonly prototype: IRole;
  readonly RoleTag: string;
}

export abstract class BaseRole<TMemory extends CreepProcessMemory> implements IRole {
  public run(this: BaseRole<TMemory>,creep: Creep,memory: CreepProcessMemory): void {
    this.onRun(creep,<TMemory>memory);
  }

  protected abstract onRun(creep: Creep,cmem: TMemory): void;

  public static generateName(roleCtor: RoleConstructor,cmem: CreepProcessMemory) {
    return `${roleCtor.RoleTag}_${Game.time}`;
  }

  public moveOffBorder(creep: Creep): boolean {
    if(creep.pos.x === 0) {
      creep.move(RIGHT);
    } else if(creep.pos.y === 0) {
      creep.move(BOTTOM);
    } else if(creep.pos.x === 49) {
      creep.move(LEFT);
    } else if(creep.pos.y === 49) {
      creep.move(TOP);
    } else {
      return false;
    }
    return true;
  }
}
