import "../src/extensions/object";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

describe("Extensions", () => {
  it("Should extend Object with Values function", () => {
    assert.sameMembers(ObjectX.values({ x: 1, y: 2, 3: 5 }), [1, 2, 5], "All values are fetched");
    assert.deepEqual(ObjectX.values({ x: 1, y: 2, 3: 2, 4: 2 }).sort(), [1, 2, 2, 2], "Duplicates are included");
  });
});
