interface IRoomProc extends IProcess {
  readonly spawnerProcess: ISpawnerProcess;
}

interface IColonizer extends IProcess {
  createRoomProc(room: Room,rmem: RoomMemory): IRoomProc;
}
