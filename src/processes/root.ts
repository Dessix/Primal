import { Kernel } from "./../kernel/kernel";
import { Process, ProcessStatus } from "../kernel/process";

export class PRoot extends Process {
    public static className: string = "Root";
    public get className(): string { return PRoot.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(_pmem: ProcessMemory | undefined): ProcessMemory | undefined {
        const kernel = <Kernel>this.kernel;
        if (kernel.getProcessCount() <= 1) {
            console.log("Processes empty!");
        }
        return;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
    }
}
