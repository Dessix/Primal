import "../src/extensions/object";

class MockRoomPosition {
}

(<any>global).RoomPosition = MockRoomPosition;

import "../src/extensions/roomPosition";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

describe("Extensions", () => {
  it("Should extend Object with Values function", () => {
    assert.sameMembers(Object.values({ x: 1, y: 2, 3: 5 }), [1, 2, 5], "All values are fetched");
    assert.deepEqual(Object.values({ x: 1, y: 2, 3: 2, 4: 2 }).sort(), [1, 2, 2, 2], "Duplicates are included");
  });
  it("Should provide intersection between two points", () => { 
    const output = RoomPosition.intersect({x: 1, y: 1}, 1, false, {x: 3, y: 3}, 1, false);
    assert.sameDeepMembers(output, [{x: 2, y: 2}, {x: 3, y: 2}]);
  });
  it("Should provide intersection between multiple points", () => {
    //assert(false);
  });
  it("Should provide intersection between two points with origin exemptions", () => {
    let output = RoomPosition.intersect({x: 1, y: 1}, 0, true, {x: 2, y: 2}, 1, false);
    assert.lengthOf(output, 0);
    output = RoomPosition.intersect({x: 1, y: 1}, 0, false, {x: 2, y: 2}, 1, false);
    assert.sameDeepMembers(output, [{x: 1, y: 1}]);
  });
  it("Should provide intersection between multiple points with origin exemptions", () => {
    //assert(false);
  });
});
