import { PCleanMemory } from "./cleanMemory";
import { PBootstrap } from "./bootstrap";
import { Kernel } from "./../kernel/kernel";
import { Process, ProcessStatus } from "../kernel/process";

type RootMemory = {
    bootstrapped?: boolean,
    memoryCleanerPid?: ProcessId,
};

export class PRoot extends Process<RootMemory> {
    public static className: string = "Root";
    public get className(): string { return PRoot.className; }
    public readonly baseHeat: number = 1000; 
    public readonly service: boolean = true;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: RootMemory) {
        const kernel = <Kernel>this.kernel;
        if (!pmem.bootstrapped && kernel.getProcessCount() <= 1) {
            console.log("Processes empty! Bootstrapping!");
            this.spawnChildProcess(PBootstrap);
            pmem.bootstrapped = true;
        }
        if (pmem.memoryCleanerPid === undefined) {
            pmem.memoryCleanerPid = this.spawnChildProcess(PCleanMemory);
        }
        return pmem;
    }
}
