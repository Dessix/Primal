import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

export enum ProcessStatus {
    TERM = -2,
    EXIT = -1,
    RUN = 0,
}

export interface ProcessConstructor {
    new (_pid: ProcessId, _parentPid: ProcessId): IProcess;
    readonly className: string;
    Register(this: ProcessConstructor): void;
};

export interface IProcess {
    readonly className: string;
    pid: ProcessId;
    parentPid: ProcessId;
    kernel: Kernel | null;
    readonly baseHeat: number;
    status: ProcessStatus;
    readonly service: boolean;

    run?(pmem: ProcessMemory): void;
    reloadFromMemory?(pmem: ProcessMemory): void;
}

export abstract class Process<TMemory extends ProcessMemory> implements IProcess {
    public get className(this: Process<TMemory>): string {
        return (<{ constructor: ProcessConstructor; }><any>this).constructor.className;
    }
    public pid: ProcessId;
    public parentPid: ProcessId;
    public kernel: Kernel | null;
    public status: ProcessStatus = ProcessStatus.RUN;
    public readonly baseHeat: number = 10;
    public readonly service: boolean = false;

    public get kernelOrThrow(): Kernel {
        if (this.kernel === null) {
            throw new Error("Kernel not available!");
        }
        return this.kernel;
    }
    
    public spawnChildProcess(processCtor: ProcessConstructor) {
        const childPid = this.kernelOrThrow.spawnProcess(processCtor, this.pid);
        return childPid;
    }

    public static Register(this: ProcessConstructor): void {
        ProcessRegistry.register(this.className, this);
    }

    constructor(pid: ProcessId, parentPid: ProcessId) {
        this.pid = pid;
        this.parentPid = parentPid;
    }

    public run?(pmem: TMemory): void;

    public reloadFromMemory?(pmem: TMemory): void;
}
