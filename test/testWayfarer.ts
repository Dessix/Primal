declare const global: any;

import "./res/mockRoomPosition";
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
    let serialized = Wayfarer.serializePath(<RoomPosition[]>testPath);
    serialized = serialized.concat(serialized.slice().reverse());
    assert.lengthOf(serialized, 6);
    assert.strictEqual(serialized[0].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
    assert.strictEqual(serialized[1].substr(0, Wayfarer.RoomTagLength).trim(), "E0S0");
    assert.strictEqual(serialized[2].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
    assert.strictEqual(serialized[3].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
    assert.strictEqual(serialized[4].substr(0, Wayfarer.RoomTagLength).trim(), "E0S0");
    assert.strictEqual(serialized[5].substr(0, Wayfarer.RoomTagLength).trim(), "E0N0");
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
  it("Should be able to mix steps between two adjacent chunks in the same room", () => {
    const serialized = Wayfarer.serializePath(<RoomPosition[]>testPath);
    const multichunk = serialized.concat(serialized.slice().reverse());
    assert.deepEqual(Wayfarer.deserializePathStep(multichunk, testPath.length - 1), testPath[testPath.length - 1]);
    assert.deepEqual(Wayfarer.deserializePathStep(multichunk, testPath.length), testPath[testPath.length - 1]);
    assert.deepEqual(Wayfarer.deserializePathStep(multichunk, testPath.length - 1), Wayfarer.deserializePathStep(multichunk, testPath.length - 1));
  });
  it("Should be able to mix linkages between pseudo paths", () => {
    const serialized = testPath.map(p => Wayfarer.serializePath([p])).reduce((p, c) => (p.push(...c), p), new Array<string>());
    for (let i = 0, n = testPath.length; i < n; ++i) {
      assert.deepEqual(Wayfarer.deserializePathStep(serialized, i), testPath[i]);
    }
    assert.equal(Wayfarer.getPathLength(serialized), testPath.length);
  });
});
