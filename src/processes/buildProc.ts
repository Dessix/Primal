import { RoleBuilder } from "../roles/roleBuilder";
import { CreepProcess } from "../kernel/creepProcess";
import { registerProc } from "../kernel/process";

export interface BuilderMemory extends CreepProcessMemory {
  bild_building?: boolean;
  spawnName: typeof StructureSpawn.name;
}

@registerProc
export class BuildProc extends CreepProcess<BuilderMemory> {
  public init(creep: Creep) {
    this.creepName = creep.name;
    this.memory.spawnName = creep.room.find(FIND_MY_SPAWNS)[0].name;//HACK: Dirty find, may be invalid, if the creep is in another room.
  }

  public static readonly BodySpec: BODYPART[];

  public run(): void {
    const creep = this.creep;
    if(creep === undefined) {
      this.status = ProcessStatus.EXIT;
      return;
    }
    RoleBuilder.Instance.run(creep,this.memory);
  }
}
