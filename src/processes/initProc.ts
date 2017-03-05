import { CleanMemoryProc } from "./cleanMemoryProc";
import { RoomProc } from "./roomProc";
import { Process,registerProc } from "../kernel/process";
import { RecycleProc } from "./roleRecycle";

interface InitProcMemory extends ProcessMemory {
  mc?: ProcessId<CleanMemoryProc>;
}

@registerProc
export class InitProc extends Process<InitProcMemory> implements IColonizer {
  createRoomProc(room: Room,rmem: Readonly<RoomMemory>): IRoomProc {
    return this.spawnIndependentProcess(RoomProc).init(room);
  }

  public readonly baseHeat: number = 1000;

  public run() {
    const kernel = this.kernel;

    {//Init memory cleaner
      if (this.memory.mc === undefined || this.kernel.getProcessById(this.memory.mc) === undefined) {
        this.memory.mc = this.spawnChildProcess(CleanMemoryProc).pid;
      }
    }

    {//Init rooms
      const rooms = Object.values(Game.rooms);
      const rlen = rooms.length;
      for(let r = 0;r < rlen;++r) {
        const room = rooms[r];
        const controller = room.controller;
        if(controller == null || !controller.my) { continue; }
        let rmem = room.memory;
        if(rmem === undefined) { Memory.rooms[room.name] = rmem = {}; }
        const roomProcId = rmem.r;//room process
        if((roomProcId && kernel.getProcessById(roomProcId)) === undefined) {
          let colonizer: IColonizer | undefined = rmem.p && kernel.getProcessById(rmem.p);
          if(colonizer === undefined) {
            colonizer = this,rmem.p = this.pid;//TODO: Report as bug with generics if convariant is derped where T[B <: A] somehow equates to T[C <: A] without adequate definition
          }
          rmem.r = colonizer.createRoomProc(room,rmem).pid;
        }
      }
    }

    {//Init creeps
      const creeps = Object.values(Game.creeps),clen = creeps.length;
      for(let c = 0;c < clen;++c) {
        const creep = creeps[c],cmem = creep.memory;
        const creepProcessId = cmem.c;
        if((creepProcessId && kernel.getProcessById(creepProcessId)) === undefined) {
          const spawner = kernel.getProcessById(cmem.s);
          if(spawner !== undefined) {
            cmem.c = spawner.createProcessForCreep(creep,cmem).pid;
          } else {
            cmem.c = this.spawnChildProcess(RecycleProc).init(creep).pid;
          }
        }
      }
    }
  }
}
