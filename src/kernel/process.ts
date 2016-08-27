import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

export type ProcessConstructor = (new (_pid: ProcessId, _parentPid: ProcessId) => Process);
export enum ProcessStatus {
    TERM = -2,
    EXIT = -1,
    RUN = 0,
}

export abstract class Process {

    public abstract readonly className: string;
    public pid: ProcessId;
    public parentPid: ProcessId;
    public kernel: Kernel | null;
    public get kernelOrThrow(): Kernel {
        if (this.kernel === null) {
            throw new Error("Kernel not available!");
        }
        return this.kernel;
    }
    public status: ProcessStatus = ProcessStatus.RUN;

    public static Register(className: string, processCtor: ProcessConstructor): void {
        ProcessRegistry.register(className, processCtor);
    }

    constructor(pid: ProcessId, parentPid: ProcessId) {
        this.pid = pid;
        this.parentPid = parentPid;
    }

    public abstract run(): ProcessMemory | undefined;

    public abstract reloadFromMemory(processMemory: ProcessMemory | undefined): void;
}
