import { KernelSerializer } from "../src/kernel/kernelSerializer";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

describe("KernelSerializer", () => {

  it("Should spawn, serialize and deserialize to the original values", () => {
    const spawned = KernelSerializer.spawnNewProcessTable();
    const deserialized = KernelSerializer.deserializeProcessTable(spawned);
    const reserialized = KernelSerializer.serializeProcessTable(deserialized);
    assert.deepEqual(reserialized, spawned);
  });

});
