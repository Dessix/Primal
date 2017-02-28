import { Process } from "../kernel/process";

interface RoomProcMemory extends ProcessMemory {
  r: string;//RoomName;
}

export class RoomProc extends Process<RoomProcMemory> implements IRoomProc {
  public init(room: Room): RoomProc {
    this.memory.r = room.name;
    console.log("Spawned process for room %s",room.name);
    return this;
  }

  public run() {
    //TODO!

    //Spawner? Use BodyBuilder if possible
    //Moria - mining management
    //Tower Defense - Spawns a process per tower in the room if not present
    //Upgraders - Outputs rally at a point, and fetch material from a central location chosen by the process- which may change over time
    //Builders - Same about material source, doubly so for target to build
    //Repairers - Builders do this. No more kidding around.
    //FlowerChildren - Extension Manager ("Garden") is spawned here. It spawns flower managers per-flower. They spawn flowerchildren.
    //Crane Enable - Process finds crane-spots, and requests cranes to be spawned as needed to refill each.
    //Couriers - Moria will require access to the courier process in order to queue up courier missions, but will not control these individually.
  }
}
