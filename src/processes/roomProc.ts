import { Process } from "../kernel/process";

interface RoomProcMemory extends ProcessMemory {
  r: string;//RoomName;
}

export class RoomProc extends Process<[Room],RoomProcMemory> implements IRoomProc {
  public launch(args: [Room]): void {
    const [room] = args;
    this.memory.r = room.name;
    console.log("Spawned process for room %s",room.name);
  }

  public run() {
    //TODO!
  }
}
