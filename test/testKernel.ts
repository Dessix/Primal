import { ProcessRegistry } from "../src/kernel/processRegistry";
import { Process } from "../src/kernel/process";
import { KernelSerializer } from "../src/kernel/kernelSerializer";
import { Kernel } from "../src/kernel/kernel";

import * as _ from "lodash";
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

declare const global: any;
global.Memory = {};

interface MockRootMemory extends ProcessMemory {
}

class MockPRoot extends Process {
  public static className: string = "Root";
  public get className(): string { return MockPRoot.className; }
  private pmem: MockRootMemory;
  public readonly baseHeat: number = 1000;
  public readonly service: boolean = true;

  public constructor(pid: ProcessId, parentPid: ProcessId) {
    super(pid, parentPid);
  }

  public run(): MockRootMemory | undefined {
    return;
  }
}

ProcessRegistry.register(MockPRoot.className, MockPRoot);

describe("Kernel", () => {

  it("Should have no processes at startup, before loading a table", () => {
    const k = new Kernel();
    assert.equal(k.getProcessCount(), 0);
  });

  it("Should initialize from blank with a root process", () => {
    const k = new Kernel();
    k.loadProcessTable(KernelSerializer.deserializeProcessTable(KernelSerializer.spawnNewProcessTable()));
    const maybeRootProc = k.getProcessById(0);
    assert.isDefined(maybeRootProc);
    const rootProc = <Process>maybeRootProc;
    expect(rootProc).to.have.property("className", "Root");
  });

  it("Should be able to spawn a process", () => {
    const k = new Kernel();
    k.spawnProcessByClassName("Root");
    const maybeRootProc = k.getProcessById(0);
    assert.isDefined(maybeRootProc);
    const rootProc = <Process>maybeRootProc;
    expect(rootProc).to.have.property("className", "Root");
  });

  it("Should be able to kill a process", () => {
    const k = new Kernel();
    const pid = <number>k.spawnProcessByClassName("Root");
    assert.equal(k.getProcessCount(), 1);
    k.killProcess(pid);
    assert.equal(k.getProcessCount(), 0);
  });

  it("Should reload to the same values", () => {
    const k = new Kernel();
    k.spawnProcessByClassName("Root");
    const kproc = k.getProcessTable();

    const k2 = new Kernel();
    k2.loadProcessTable(kproc);

    const k2proc = k2.getProcessTable();
    assert.deepEqual(k2proc, kproc);
  });
});
