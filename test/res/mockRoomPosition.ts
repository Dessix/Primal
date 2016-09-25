const g: any = global;
if (g.RoomPosition == null) {
  class MockRoomPosition implements RoomPositionLike {
    public readonly x: number;
    public readonly y: number;
    public readonly roomName: string;
    constructor(x: number, y: number, roomName: string) {
      this.x = x;
      this.y = y;
      this.roomName = roomName;
    }
  }
  g.RoomPosition = MockRoomPosition;
}
