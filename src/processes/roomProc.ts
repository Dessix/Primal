import { fromMemory,idFromMemory,processFromIdInMemory } from "../util/fromMemory";
import { SpawnProc } from "./spawnProc";
import { MoriaProc,MoriaProcMemory } from "./moria/moriaProc";
import { TowerProc } from "./towerProc";
import { Process,registerProc } from "../kernel/process";

export interface RoomProcMemory extends ProcessMemory {
  r: string;//RoomName;
  t?: ProcessId<TowerProc>;
  m?: ProcessId<MoriaProc>;
  s?: ProcessId<ISpawnerProcess>;
}

@registerProc
export class RoomProc extends Process<RoomProcMemory> implements IRoomProc {
  public init(room: Room): RoomProc {
    this.room = room;
    this.kernel.log(LogLevel.Info,`Spawned control process for room ${room.name}`);
    return this;
  }

  @processFromIdInMemory("s")
  private spawner?: ISpawnerProcess;

  public get spawnerProcess(): ISpawnerProcess {
    const spawner = this.spawner;
    if(spawner === undefined) {
      return (this.spawner = this.spawnChildProcess(SpawnProc).init(this.room));
      //TODO: Consider proxy-spawner type which redirects to another room's spawner using a roomproc reference?
    }
    return spawner;
  }

  @fromMemory({ key: "r",get: (r?: typeof Room.name) => r ? Game.rooms[r] : undefined,set: (r?: Room) => r ? r.name : undefined })
  public room: Room;//Must always be defined.

  public run() {
    const room = this.room;
    if(!room || !room.controller || !room.controller.my) { this.status = ProcessStatus.EXIT; return; }//Room either no longer visible or no longer owned
    const memory = this.memory,controller = room.controller;

    {//Tower Defense - Spawns a process per tower in the room if not present
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

    {//Moria - mining management
      const moria = memory.m && this.kernel.getProcessById(memory.m);
      if(moria === undefined) {
        memory.m = this.spawnChildProcess(MoriaProc).init(room).pid;
      }
    }

    {//Spawner - simply spawn a single-room spawn manager here
      this.spawnerProcess;//Automatically creates if unavailable
    }

    //TODO:
    //Upgraders - Outputs rally at a point, and fetch material from a central location chosen by the process- which may change over time
    //Builders - Same about material source, doubly so for target to build
    //Repairers - Builders do this. No more kidding around.
    //FlowerChildren - Extension Manager ("Garden") is spawned here. It spawns flower managers per-flower. They spawn flowerchildren.
    //Crane Enable - Process finds crane-spots, and requests cranes to be spawned as needed to refill each.
    //Couriers - Moria will control its own couriers, which will be managed by a subproces that performs coordination and spawning; moria plans routes.
    //Clink - Manages links. Accessed by Moria in order to identify mining links. Accesses Garden to identify flower links.
  }
}
