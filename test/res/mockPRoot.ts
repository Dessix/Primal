import { Process } from "../../src/kernel/process";

interface MockRootMemory extends ProcessMemory {
}

export class MockPRoot extends Process<MockRootMemory> {
  public static className: string = "Root";
  private pmem: MockRootMemory;
  public readonly baseHeat: number = 1000;
  public readonly service: boolean = true;

  public run(): MockRootMemory | undefined {
    return;
  }
}
