import { Process, ProcessStatus } from "../kernel/process";

export class PBootstrap extends Process {
    public static className: string = "Bootstrap";
    public get className(): string { return PBootstrap.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(_pmem: ProcessMemory | undefined): ProcessMemory | undefined {
        console.log("Bootstrap");
        
        return;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
    }
}
