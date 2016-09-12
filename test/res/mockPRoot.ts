import { Process } from "../../src/kernel/process";

interface MockRootMemory extends ProcessMemory {
}

export class MockPRoot extends Process {
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
