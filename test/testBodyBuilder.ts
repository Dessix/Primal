import "../src/extensions/array";
import { BodyBuilder } from "../src/tools/bodyBuilder";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

let g: any = global;
g.BODYPARTS_ALL = [g.WORK, g.MOVE, g.CARRY, g.ATTACK, g.TOUGH] = ["work", "move", "carry", "attack", "tough" ];
g.BODYPART_COST = {
  [MOVE]: 50,
  [CARRY]: 50,
  [WORK]: 100,
  [ATTACK]: 80,
  [TOUGH]: 10,
};

function assertDefined<T>(val: T | undefined): T { assert.isDefined(val); return <T>val; }

describe("BodyBuilder", () => {
  it("Should measure creep part costs", () => {
    assert.equal(BodyBuilder.bodyCost([]), 0, "empty bodies should be free");
    assert.isAtLeast(BodyBuilder.MaxParts, 30);
    for (let part of BODYPARTS_ALL) {
      for (let i = 1; i <= BodyBuilder.MaxParts; ++i) {
        assert.equal(BodyBuilder.bodyCost(Array.repeat(part, i)), BODYPART_COST[part] * i);
      }
    }
    assert.equal(BodyBuilder.bodyCost([WORK, CARRY]), 150);
    assert.isBelow(BodyBuilder.bodyCost([WORK]), BodyBuilder.bodyCost([WORK, WORK]));
  });
  it("Should create the base creep with all its parts", () => {
    const body = assertDefined(BodyBuilder.buildCreepBody(200, [WORK, CARRY], [], { travel: TravelCondition.road }));
    assert.lengthOf(body, 3);
    assert.sameMembers(body, [WORK, CARRY, MOVE], "All parts included");
    for (let part of body) { assert.oneOf(part, BODYPARTS_ALL); }
  });
  it("Should grow proportionately", () => {
    for (let maxCost of [2, 4, 6, 8].map(x => x * 100)) {
      const body = assertDefined(BodyBuilder.buildCreepBody(maxCost, [WORK, CARRY], [WORK, CARRY], { travel: TravelCondition.road }));
      assert.lengthOf(body, maxCost / 200 * 3);
      assert.sameMembers(body, [WORK, CARRY, MOVE], "All parts included");
      assert.lengthOf(body.filter(m => m === WORK), maxCost / 200);
      assert.lengthOf(body.filter(m => m === MOVE), maxCost / 200);
      assert.lengthOf(body.filter(m => m === CARRY), maxCost / 200);
      for (let part of body) { assert.oneOf(part, BODYPARTS_ALL); }
    }
  });
});
