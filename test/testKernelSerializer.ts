import { KernelSerializer } from "../src/kernel/kernelSerializer";
import { MockPRoot } from "./res/mockPRoot";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

MockPRoot.Register();

describe("KernelSerializer", () => {

  it("Should be able to create a blank process table", () => {
    const blank = KernelSerializer.createBlankProcessTable();
    assert.lengthOf(KernelSerializer.deserializeProcessTable(blank), 0);
  });

  it("Should be able to spawn a root-only process table", () => {
    const spawned = KernelSerializer.spawnNewProcessTable();
    assert.lengthOf(spawned, 1);
    assert.deepPropertyVal(spawned, "[0].className", "Root");
  });

  it("Should register processes as their constructors", () => {
    const spawned = KernelSerializer.spawnNewProcessTable();
    const deserialized = KernelSerializer.deserializeProcessTable(spawned);
    assert.strictEqual(deserialized[0].processCtor, MockPRoot);
  });

  it("Should spawn, serialize and deserialize to the original values", () => {
    const spawned = KernelSerializer.spawnNewProcessTable();
    const deserialized = KernelSerializer.deserializeProcessTable(spawned);
    const reserialized = KernelSerializer.serializeProcessTable(deserialized);
    assert.deepEqual(reserialized, spawned);
  });

});
