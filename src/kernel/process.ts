import { registerClass } from "../../lib/screeps-profiler";
import { ProcessRegistry } from "./processRegistry";

//type getRes<TFunc extends ((...args: any[]) => TReturn), TReturn> = TReturn;
//type Return<T extends new (k: Kernel, pid: ProcessId, par: ProcessId) => S, S = any> = S;

export function registerProc<TPROCESS,_TCPROC extends IProcess & TPROCESS>(ctor: MetaProcessCtor<TPROCESS,_TCPROC>) {
  ProcessRegistry.register(ctor);
  //registerClass(ctor, ctor.className); this might slow shit waaay down; allow configuring it at the start of MAIN.
}

export abstract class Process<TMemory extends ProcessMemory = ProcessMemory> implements IProcess<TMemory> {
  constructor(kernel: IKernel,pid: ProcessId<Process<TMemory>>,parentPid: ProcessId) {
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

  public spawnChildProcess<TPROCESS,TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS,TCPROC>): TPROCESS {
    return this.kernel.spawnProcess<TCPROC,TCPROC>(processCtor,this.pid);
  }

  public spawnIndependentProcess<TPROCESS,TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS,TCPROC>): TPROCESS {
    return this.kernel.spawnProcess<TCPROC,TCPROC>(processCtor,0);
  }

  public assertParentProcess(): void {
    this.kernel.getProcessByIdOrThrow(this.parentPid);
  }

  public status: ProcessStatus;

  public abstract run(): void;
}
