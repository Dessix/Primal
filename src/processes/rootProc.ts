import { RoomProc } from "./roomProc";
import { PRecycle } from "../roles";
import { Process } from "../kernel/process";

interface RootProcMemory extends ProcessMemory {
};

export class RootProc extends Process<RootProcMemory> {
  public readonly baseHeat: number = 1000;
  public run() {
    const kernel = this.kernel;
    {//Init rooms
      const rooms = Object.values(Game.rooms);
      const rlen = rooms.length;
      for(let r = 0;r < rlen;++r) {
        const room = rooms[r];
        const controller = room.controller;
        if (controller == null || !controller.my) { continue; }
        let rmem = room.memory;
        if (rmem === undefined) { Memory.rooms[room.name] = rmem = {}; }
        const roomProcId = rmem.r;//room process
        if((roomProcId && kernel.getProcessById(roomProcId)) === undefined) {
          const colonizer = rmem.p && kernel.getProcessById(rmem.p);
          if(colonizer !== undefined) {
            rmem.r = colonizer.createRoomProc(room,rmem);
          } else {
            rmem.r = this.spawnIndependentProcess(RoomProc).init(room).pid;
          }
        }
      }
    }

    {//Init creeps
      const creeps = Object.values(Game.creeps);
      const clen = creeps.length;
      for(let c = 0;c < clen;++c) {
        const creep = creeps[c];
        const creepProcId = creep.memory.c;//creep process
        if((creepProcId && kernel.getProcessById(creepProcId)) === undefined) {
          const spawner = kernel.getProcessById(creep.memory.s);
          if(spawner !== undefined) {
            creep.memory.c = spawner.createProcessForCreep(creep,creep.memory);
          } else {
            creep.memory.c = this.spawnChildProcess(PRecycle).init(creep).pid;
          }
        }
      }
    }
  }
}
