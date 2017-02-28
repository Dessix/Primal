interface IRoomProc extends IProcess { }

interface IColonizer extends IProcess {
  createRoomProc(room: Room, rmem: RoomMemory): TypedProcessId<IRoomProc>;
}
