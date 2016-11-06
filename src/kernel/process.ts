import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

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
				this.kernel = null;
    }

    public run?(pmem: TMemory): void;

    public reloadFromMemory?(pmem: TMemory): void;
}
