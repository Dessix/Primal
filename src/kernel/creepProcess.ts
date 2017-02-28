import { Process } from "./process";

export abstract class CreepProcess<TMEMORY extends CreepProcessMemory = CreepProcessMemory> extends Process<TMEMORY> implements ICreepProcess {
  public get creepName(): CreepName { return this.memory.c; }
  public set creepName(name: CreepName) { this.memory.c = name; }
  public get creep(): Creep | undefined { return Game.creeps[this.creepName]; }

  public travelTo(target: RoomPosition | RoomObject,opts?: TravelToOpts): number {
    const creep = this.creep;
    if(creep === undefined) { throw new TypeError(); }
    //if(!creep.my) { return ERR_NOT_OWNER; }
    if(creep.spawning) { return ERR_BUSY; }
    if(creep.fatigue > 0) { return ERR_TIRED; }
    if(creep.getActiveBodyparts(MOVE) === 0) { return ERR_NO_BODYPART; }

    if(target instanceof RoomObject) { target = target.pos; }

    const pos = creep.pos;
    if(pos.x === target.x && pos.y === target.y && pos.roomName === target.roomName) {
      return OK;
    }

    const memory = this.memory;
    if(opts !== undefined && this.memory.t != null) {
      const tr = this.memory.t;
    }

    throw new Error("Not Implemented");
  }
}
