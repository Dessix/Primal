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
  }
}
