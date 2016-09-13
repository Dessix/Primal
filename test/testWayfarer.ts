//Mock roomPosition
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

declare const global: any;
global.RoomPosition = <RoomPositionConstructor>MockRoomPosition;

import { Wayfarer } from "../src/util/Wayfarer";
import "../src/extensions/string";
import "../src/extensions/roomPosition";
import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

const testPath = new Array<RoomPosition>(
  new RoomPosition(46, 49, "E0N0"),//START at bottom right
  new RoomPosition(47, 49, "E0N0"),//RIGHT
  new RoomPosition(47, 0, "E0S0"),//BOTTOM
  new RoomPosition(47, 1, "E0S0"),//BOTTOM
  new RoomPosition(46, 1, "E0S0"),//LEFT
  new RoomPosition(46, 0, "E0S0"),//TOP
  new RoomPosition(46, 49, "E0N0")//TOP
);

describe("Wayfarer", () => {
  it("Should have the correct room tags and length", () => {
    const serialized = Wayfarer.serializePath(<RoomPosition[]>testPath);
    assert.lengthOf(serialized, 3);
    assert.strictEqual(serialized[0].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
    assert.strictEqual(serialized[1].substr(0, Wayfarer.RoomTagLength).trim(), "E0S0");
    assert.strictEqual(serialized[2].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
  });
  it("Should be able to serialize and deserialize back the original path", () => {
    const serialized = Wayfarer.serializePath(testPath);
    const deserialized = Wayfarer.deserializePath(serialized);
    assert.deepEqual(testPath, deserialized);
  });
  it("Should be able to determine the length of a serialized path", () => {
    const serialized = Wayfarer.serializePath(testPath);
    Wayfarer.getPathLength(serialized);
  });
  it("Should determine 0 length from an empty path", () => {
    const serialized = Wayfarer.serializePath([]);
    Wayfarer.getPathLength(serialized);
  });
  it("Should be able to determine the length of a serialized path without edits", () => {
    const serialized = Wayfarer.serializePath(testPath);
    const toMeasure = _.cloneDeep(serialized);
    Wayfarer.getPathLength(toMeasure);
    assert.deepEqual(toMeasure, serialized);
  });
  it("Should be able to deserialize single steps", () => {
    const serialized = Wayfarer.serializePath(testPath);
    for (let i = 0, n = testPath.length; i < n; ++i) {
      assert.deepEqual(Wayfarer.deserializePathStep(serialized, i), testPath[i]);
    }
  });
  it("Should return undefined if past the last step", () => {
    const serialized = Wayfarer.serializePath(testPath);
    assert.strictEqual(Wayfarer.deserializePathStep(serialized, testPath.length), undefined);
  });
  it("Should throw if before the first step", () => {
    const serialized = Wayfarer.serializePath(testPath);
    assert.throws(() => Wayfarer.deserializePathStep(serialized, -1), RangeError);
  });
});
