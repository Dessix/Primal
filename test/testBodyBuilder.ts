import { BodyBuilder } from "../src/tools/bodyBuilder";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

let g: any = global;
g.WORK = "work";
g.MOVE = "move";
g.CARRY = "carry";
g.ATTACK = "attack";
g.TOUGH = "tough";

g.BODYPARTS_ALL = [WORK, MOVE, CARRY, ATTACK, TOUGH];
g.BODYPART_COST = {
  MOVE: 50,
  CARRY: 50,
  WORK: 100,
  ATTACK: 80,
  TOUGH: 10,
};

describe("BodyBuilder", () => {
  it("Should create the base creep with all its parts", () => {
    const body = BodyBuilder.buildCreepBody(200, [WORK, CARRY], [], { travel: TravelCondition.road });
    assert.lengthOf(body, 3);
    assert.sameMembers(body, [WORK, CARRY, MOVE], "All parts included");
    for (let part of body) { assert.oneOf(part, BODYPARTS_ALL); }
  });
  it("Should grow proportionately", () => {
    const body = BodyBuilder.buildCreepBody(400, [WORK, CARRY], [WORK, CARRY], { travel: TravelCondition.road });
    assert.lengthOf(body, 6);
    assert.sameMembers(body, [WORK, CARRY, MOVE], "All parts included");
    assert.lengthOf(body.filter(m => m === WORK), 2);
    assert.lengthOf(body.filter(m => m === MOVE), 2);
    assert.lengthOf(body.filter(m => m === CARRY), 2);
    for (let part of body) { assert.oneOf(part, BODYPARTS_ALL); }
  });
});
