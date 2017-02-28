import { safeExtendPrototype } from "../util/reflection";
import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

//type getRes<TFunc extends ((...args: any[]) => TReturn), TReturn> = TReturn;
//type Return<T extends new (k: Kernel, pid: ProcessId, par: ProcessId) => S, S = any> = S;

export abstract class Process<TMemory extends ProcessMemory> implements IProcess<TMemory> {
    constructor(kernel: IKernel, pid: ProcessId<Process<TMemory>>, parentPid: ProcessId) {
        this.kernel = kernel;
        this.pid = pid;
        this.parentPid = parentPid;
        this.status = ProcessStatus.RUN;
    }

    public static get className(): string { return this.name; }

    public get className(this: Process<TMemory>): string {
        return (<{ constructor: ProcessConstructor<Process<TMemory>>; }><any>this).constructor.className;
    }
    
    public readonly pid: ProcessId<Process<TMemory>>;
    public readonly parentPid: ProcessId;
    public readonly kernel: IKernel;
    public get memory(): TMemory {
        //Cache memory for one tick, flushing if reset? What if kernel resets it instead?
        return this.kernel.getProcessMemory<TMemory>(this.pid);
    }
    public readonly baseHeat: number = 10;
    public readonly service: boolean = false;

    public spawnChildProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): TPROCESS {
        return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, this.pid);
    }

    public spawnIndependentProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>): TPROCESS {
        return this.kernel.spawnProcess<TCPROC, TCPROC>(processCtor, 0);
    }

    public static Register(this: ProcessConstructor<IProcess>): void {
        ProcessRegistry.register(this.className, this);
    }
    
    public status: ProcessStatus;

    public abstract run(): void;
}
