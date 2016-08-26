import { ProcessRegistry } from "./processRegistry";

export abstract class Process {

    public abstract readonly className: string;
    public readonly pid: ProcessId;
    public readonly parentPid: ProcessId;

    public static Register(className: string, builder: (pid: ProcessId, parentPid: ProcessId) => Process): void {
        ProcessRegistry.register(className, builder);
    }

    constructor(pid: ProcessId, parentPid: ProcessId) {
        this.pid = pid;
        this.parentPid = parentPid;
    }

    public abstract run(processMemory: ProcessMemory): ProcessMemory | undefined;

    public abstract reloadFromMemory(processMemory: ProcessMemory): void;
}
