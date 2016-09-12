import { Wayfarer } from "../src/util/Wayfarer";
import "../src/extensions/string";

function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error("Assertion failed" + (message && (" " + message) || ""));
  }
}

//Mock roomPosition
class RoomPosition {
  public readonly x: number;
  public readonly y: number;
  public readonly roomName: string;
  constructor(x: number, y: number, roomName: string) {
    this.x = x;
    this.y = y;
    this.roomName = roomName;
  }
}

declare const global: any;

global.RoomPosition = RoomPosition;

const testPath = new Array<RoomPosition>(
  new RoomPosition(46, 49, "E0N0"),//START at bottom right
  new RoomPosition(47, 49, "E0N0"),//RIGHT
  new RoomPosition(47, 0, "E0S0"),//BOTTOM
  new RoomPosition(47, 1, "E0S0"),//BOTTOM
  new RoomPosition(46, 1, "E0S0"),//LEFT
  new RoomPosition(46, 0, "E0S0"),//TOP
  new RoomPosition(46, 49, "E0N0")//TOP
);

const serialized = Wayfarer.serializePath(<any>testPath);
console.log(JSON.stringify(serialized));
assert(serialized.length === 3);
assert(serialized[0].substr(0, Wayfarer.RoomTagLength).trim() === "E0N0");
assert(serialized[1].substr(0, Wayfarer.RoomTagLength).trim() === "E0S0");
assert(serialized[2].substr(0, Wayfarer.RoomTagLength).trim() === "E0N0");
assert(serialized[0].length === (Wayfarer.RoomTagLength + 2));
assert(serialized[1].length === (Wayfarer.RoomTagLength + 4));
assert(serialized[2].length === (Wayfarer.RoomTagLength + 1));

const deserialized = <RoomPosition[]><{}[]>Wayfarer.deserializePath(serialized);

assert(testPath.length === deserialized.length);
for (let i = 0, n = testPath.length; i < n; ++i) {
  const desPos = deserialized[i];
  assert(desPos !== undefined);
  const origPos = testPath[i];
  assert(desPos.roomName === origPos.roomName, "Room name did not match!");
  assert(desPos.x === origPos.x, "X did not match!");
  assert(desPos.y === origPos.y, "Y did not match!");
}

assert(Wayfarer.getPathLength(serialized) === testPath.length);

console.log("Paths equal!");
