import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

export abstract class Process<TMemory extends ProcessMemory> implements IProcess {
    public get className(this: Process<TMemory>): string {
        return (<{ constructor: ProcessConstructor; }><any>this).constructor.className;
    }
    public pid: ProcessId;
    public parentPid: ProcessId;
    public kernel: IKernel;
    public status: ProcessStatus = ProcessStatus.RUN;
    public readonly baseHeat: number = 10;
    public readonly service: boolean = false;

    bind(kernel: IKernel, pid: ProcessId, parentPid: ProcessId): void {
        this.kernel = kernel;
        this.pid = pid;
        this.parentPid = parentPid;
    }

    public spawnChildProcess(processCtor: ProcessConstructor) {
        const childPid = this.kernel.spawnProcess(processCtor, this.pid);
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
