import { TowerProc } from "./towerProc";
import { Process, registerProc } from "../kernel/process";

interface RoomProcMemory extends ProcessMemory {
  r: string;//RoomName;
  t?: ProcessId<TowerProc>;
}

@registerProc
export class RoomProc extends Process<RoomProcMemory> implements IRoomProc {
  public init(room: Room): RoomProc {
    this.memory.r = room.name;
    console.log("Spawned process for room %s",room.name);
    return this;
  }

  //TODO: @fromMemoryGet(undefined, (mem: typeof RoomProcMemory) => mem)
  public get room(): Room | undefined {
    return Game.rooms[this.memory.r];
  }

  public run() {
    const room = this.room;
    if(!room || !room.controller || !room.controller.my) { this.status = ProcessStatus.EXIT; return; }//Room either no longer visible or no longer owned
    const memory = this.memory, controller = room.controller;

    //Tower Defense - Spawns a process per tower in the room if not present
    {
      const towerProc = memory.t && this.kernel.getProcessById(memory.t);
      if(CONTROLLER_STRUCTURES[<STRUCTURE>STRUCTURE_TOWER][controller.level] <= 0) {
        if(memory.t !== undefined) {
          if(towerProc !== undefined) {
            this.kernel.killProcess(towerProc.pid);
          }
          delete memory.t;
        }
      } else if(towerProc === undefined) {
        memory.t = this.spawnChildProcess(TowerProc).init(room).pid;
      }
    }

    //TODO:
    //Spawner? Use BodyBuilder if possible
    //Moria - mining management
    //Upgraders - Outputs rally at a point, and fetch material from a central location chosen by the process- which may change over time
    //Builders - Same about material source, doubly so for target to build
    //Repairers - Builders do this. No more kidding around.
    //FlowerChildren - Extension Manager ("Garden") is spawned here. It spawns flower managers per-flower. They spawn flowerchildren.
    //Crane Enable - Process finds crane-spots, and requests cranes to be spawned as needed to refill each.
    //Couriers - Moria will require access to the courier process in order to queue up courier missions, but will not control these individually.
  }
}
