import { Kernel } from "./kernel";
import { ProcessRegistry } from "./processRegistry";

export abstract class Process<TLaunchArgs extends Array<any>, TMemory extends ProcessMemory> implements ITypedProcess<TLaunchArgs, TMemory> {
    constructor(kernel: IKernel, pid: TypedProcessId<Process<TLaunchArgs, TMemory>>, parentPid: ProcessId) {
        this.kernel = kernel;
        this.pid = pid;
        this.parentPid = parentPid;
        this.status = ProcessStatus.RUN;
    }

	public static get className(): string { return this.name; }

    public get className(this: Process<TLaunchArgs, TMemory>): string {
        return (<{ constructor: TypedProcessConstructor<Process<TLaunchArgs, TMemory>>; }><any>this).constructor.className;
    }
    
    public readonly pid: TypedProcessId<Process<TLaunchArgs, TMemory>>;
    public readonly parentPid: ProcessId;
    public readonly kernel: IKernel;
    public get memory(): TMemory {
        //Cache memory for one tick, flushing if reset? What if kernel resets it instead?
        return this.kernel.getProcessMemory<TMemory>(this.pid);
    }
    public readonly baseHeat: number = 10;
    public readonly service: boolean = false;

    public spawnChildProcess<TCLaunchArgs extends Array<any>, TCMemory extends ProcessMemory>(processCtor: TypedProcessConstructor<ITypedProcess<TCLaunchArgs, TCMemory>>, args: TCLaunchArgs): TypedProcessId<ITypedProcess<TCLaunchArgs, TCMemory>> {
        return this.kernel.spawnProcess(processCtor, this.pid);
    }

    public spawnIndependentProcess<TCLaunchArgs extends Array<any>, TCMemory extends ProcessMemory>(processCtor: TypedProcessConstructor<ITypedProcess<TCLaunchArgs, TCMemory>>, args: TCLaunchArgs): TypedProcessId<ITypedProcess<TCLaunchArgs, TCMemory>> {
        return this.kernel.spawnProcess(processCtor, 0);
    }

    public static Register(this: ProcessConstructor): void {
        ProcessRegistry.register(this.className, this);
    }
    
    public status: ProcessStatus;

    public launch(args: TLaunchArgs): void { }

    public abstract run(): void;
}
