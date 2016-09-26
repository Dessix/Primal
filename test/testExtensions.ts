import "./res/mockRoomPosition";

import "../src/extensions/object";
import "../src/extensions/roomPosition";

import * as _ from "lodash";
import { assert, expect } from "chai";

describe("Extensions", () => {
  describe("Object", () => {
    it("Should provide the Values function", () => {
      assert.sameMembers(Object.values({ x: 1, y: 2, 3: 5 }), [1, 2, 5], "All values are fetched");
      assert.deepEqual(Object.values({ x: 1, y: 2, 3: 2, 4: 2 }).sort(), [1, 2, 2, 2], "Duplicates are included");
    });
  });

  describe("RoomPosition", () => {
    describe("Intersection", () => {
      it("Should provide intersection between two points", () => {
        const output = RoomPosition.intersect({ x: 1, y: 1 }, 1, { x: 3, y: 3 }, 1);
        assert.deepEqual(output, [{ x: 2, y: 2 }]);
      });
      it("Should provide nothing when no points can exist", () => {
        const output = RoomPosition.intersect({ x: 1, y: 1 }, 1, { x: 5, y: 5 }, 2);
        assert.lengthOf(output, 0);
      });
      it("Should provide intersection between multiple points", () => {
        const output = RoomPosition.intersect({ x: 1, y: 1 }, 1, { x: 3, y: 3 }, 1, { x: 1, y: 3 }, 1);
        assert.deepEqual(output, [{ x: 2, y: 2 }]);
      });
    });

    describe("IntersectionArrayed", () => {
      it("Should provide intersection between two points", () => {
        const output = RoomPosition.intersectAll([[{ x: 1, y: 1 }, 1], [{ x: 3, y: 3 }, 1]]);
        assert.deepEqual(output, [{ x: 2, y: 2 }]);
      });
      it("Should provide nothing when no points can exist", () => {
        const output = RoomPosition.intersectAll([[{ x: 1, y: 1 }, 1], [{ x: 5, y: 5 }, 2]]);
        assert.lengthOf(output, 0);
        const outputRoomPos = RoomPosition.intersectAllRoomPos("TestChamber", [[{ x: 1, y: 1 }, 1], [{ x: 5, y: 5 }, 2]]);
        assert.lengthOf(output, 0);
      });
    });
  });
});
