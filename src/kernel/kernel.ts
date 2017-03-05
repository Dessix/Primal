import { ScreepsColorToHex,StaticLogger } from "../util/logger";
import { ProcessRegistry } from "./processRegistry";

interface KernelRecord {
  heat: number;
  service: boolean;
  processCtor: ProcessConstructor;
  process: IProcess;
}

export class Kernel implements IKernel {
  private processTable: (Map<ProcessId,KernelRecord>);
  private lastPidRun: ProcessId = <ProcessId><any>-1;
  private readonly getKmem: () => KernelMemory;

  //TODO: extract to BaseLogger in a utils file, keep here for process use.
  public log(logLevel: LogLevel, message: string, color?: COLOR, highlight?: boolean): void {
    return StaticLogger.log(logLevel, message, color, highlight);
  }

  public get mem(): KernelMemory { return this.getKmem(); }

  public constructor(fetchKmem: () => KernelMemory) {
    this.processTable = new Map<ProcessId,KernelRecord>();
    this.getKmem = fetchKmem;
  }

  private loadProcessEntry(entry: SerializedProcess): KernelRecord | null {
    const pctor = ProcessRegistry.fetch(entry.ex);
    if(pctor === undefined) {
      console.log(`Error: No constructor found for executable "${entry.ex}"!`);
      return null;
    }
    return {
      process: new pctor(this,entry.id,entry.pa),
      processCtor: pctor,
      heat: entry.he,
      service: entry.se,
    };
  }

  public loadProcessTable(): void {
    const mem = this.getKmem();
    let proc = mem.proc;
    if(proc == null) {
      this.log(LogLevel.Info,"\u1F53B Spawning new process table")
      mem.proc = proc = [];
    }
    this.processTable.clear();
    for(let i = 0,n = proc.length;i < n;++i) {
      const entry = proc[i];
      const record = this.loadProcessEntry(entry);
      if(record !== null) {
        this.processTable.set(entry.id,record);
      }
    }
  }

  public saveProcessTable(): void {
    const processes = Array.from(this.processTable.values());
    const table: SerializedProcessTable = new Array<SerializedProcess>(processes.length);
    for(let i = processes.length;i-- > 0;) {
      const record = processes[i];
      switch(record.process.status) {
        case ProcessStatus.EXIT:
        case ProcessStatus.TERM:
          table.splice(i);//Remove spare from presized array
          continue;
      }
      const produced: SerializedProcess = {
        id: record.process.pid,
        pa: record.process.parentPid,
        ex: record.process.className,
        he: record.heat,
        se: record.service,
      };
    }
    this.getKmem().proc = table;
  }

  public getFreePid(): ProcessId {
    const currentPids = Array.from(this.processTable.keys()).sort();
    for(let i = 0;i < currentPids.length;++i) {
      if(currentPids[i] !== <ProcessId><any>i) {
        return <ProcessId><any>i;
      }
    }
    return <ProcessId><any>currentPids.length;
  }

  public reboot(): void {
    this.processTable = new Map<ProcessId,KernelRecord>();
    this.getKmem().pmem = {};
  }

  public getProcessCount(): number {
    return this.processTable.size;
  }

  public getProcessMemory(processId: ProcessId): ProcessMemory {
    const mem = this.getKmem();
    let pmem = mem.pmem;
    if(pmem === undefined) { mem.pmem = pmem = {}; }
    let pmemi = pmem[<number><any>processId];
    if(pmemi === undefined || pmemi === null) { pmem[<number><any>processId] = pmemi = {}; }
    return pmemi;
  }

  public setProcessMemory(pid: ProcessId,memory: ProcessMemory): void {
    const mem = this.getKmem();
    let pmem = mem.pmem;
    if(pmem === undefined) { mem.pmem = pmem = {}; }
    pmem[<number><any>pid] = memory;
  }

  public deleteProcessMemory(pid: ProcessId): void {
    const mem = this.getKmem();
    if(mem.pmem !== undefined) {
      delete mem.pmem[<number><any>pid];
    }
  }

  public spawnProcessByClassName(processName: string, parentPid?: ProcessId): IProcess | undefined {
    if(parentPid === undefined) { parentPid = <ProcessId><any>0; }
    const processCtor = ProcessRegistry.fetch(processName);
    if(processCtor === undefined) {
      console.log("\u1F53B ClassName not defined");
      return;
    }
    return this.spawnProcess(processCtor,parentPid);
  }

  public spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): TPROCESS {
    const pid = this.getFreePid();
    const process = <TCPROC>(new processCtor(this,pid,parentPid));
    const record: KernelRecord = {
      process: process,
      heat: process.baseHeat,
      service: process.service,
      processCtor: processCtor,
    };
    this.processTable.set(pid,record);//TODO: Replace with js object
    return process;
  }

  public addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS {
    this.processTable.set(process.pid,<KernelRecord>{
      heat: process.baseHeat,
      process: process,
      processCtor: ProcessRegistry.fetch(process.className),//TODO: ".constructor"?
      service: process.service,
    });
    return process;
  }

  //TODO: Child tracking
  public getChildProcesses(parentPid: ProcessId): ProcessId[] {
    const childPids: ProcessId[] = [];
    const records = Array.from(this.processTable.values());
    for(let i = 0,n = records.length;i < n;++i) {
      const record = records[i];
      if(record.process.parentPid === parentPid) {
        childPids.push(record.process.pid);
      }
    }
    return childPids;
  }

  public getProcessesByClass<T>(constructor: ProcessConstructor): IProcess[] {
    const processes: IProcess[] = [];
    const records = Array.from(this.processTable.values());
    for(let i = 0,n = records.length;i < n;++i) {
      const record = records[i];
      if(record.process instanceof constructor) {
        processes.push(record.process);
      }
    }
    return processes;
  }

  public getProcessesByClassName<T>(className: string): IProcess[] {
    const processCtor = ProcessRegistry.fetch(className);
    if(processCtor === undefined) {
      console.log(`\u1F53B ClassName ${className} not defined`);
      return [];
    }
    return this.getProcessesByClass(processCtor);
  }

  public killProcess(processId: ProcessId): void {
    const process = this.getProcessById(processId);
    if(process === undefined) { return; }
    this.processTable.delete(processId);
    this.deleteProcessMemory(processId);

    const childPids = this.getChildProcesses(processId);
    for(let i = 0,n = childPids.length;i < n;++i) {
      const childPid = childPids[i];
      this.killProcess(childPid);
    }
  }

  public getProcessById<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS | undefined {
    const record = this.processTable.get(pid);
    if(record !== undefined) {
      return <TPROCESS>record.process;
    } else {
      return;
    }
  }

  public getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId): TPROCESS {
    const record = this.processTable.get(pid);
    if(record === undefined) { throw new Error("Process not found!"); }
    return <TPROCESS>record.process;
  }

  private sortKernelRecordsByHeat(a: KernelRecord,b: KernelRecord): number {
    return b.heat - a.heat;
  }

  private runService(services: Array<KernelRecord>,process: IProcess): number {
    return this.tryRunProc(process);//TODO: Services should never need error handling.
  }

  private tryCallProc(proc: IProcess): Error | undefined {
    try { proc.run(); return; } catch(er) { return er; }
  }

  private tryRunProc(process: IProcess): number {
    const e = this.tryCallProc(process);
    if(e !== undefined) {
      console.log(`\u1F53B Failed to run service ${process.pid}:${process.className}: ${e}`);
      const stackTrace = e.stack;
      if(stackTrace) { console.log("Stack Trace:\n" + stackTrace.toString()); }
      return -1;
    }
    if(process.status !== ProcessStatus.RUN) {
      return -2;//Exit code
    }
    return 0;
  }

  private runAllServices(services: KernelRecord[]): void {
    for(let i = 0,n = services.length;i < n;++i) {
      const process = services[i].process;
      const returnCode = this.runService(services,process);
      if(returnCode !== 0) {
        services.splice(i);
        --i;
        if(returnCode === -2) {
          this.killProcess(process.pid);
          console.log(`\u1F53B Service ${process.pid}:${process.className} exited with status ${process.status}.`);
        }
      }
    }
  }

  private runAllProcesses(processes: KernelRecord[],maxCpu: number,lastPidRun: ProcessId): void {
    let overheat: boolean = false;
    let i: number = 0;
    let n = processes.length;

    for(;i < n;++i) {
      //TODO: Add reload warmup period
      //TODO: Add moving-average estimation for process duration
      if(Game.cpu.getUsed() >= maxCpu) {
        overheat = true;
        break;
      }
      const record = processes[i],process = record.process;
      record.heat = process.baseHeat;

      if(this.tryRunProc(process) === -2) {
        this.killProcess(process.pid);
        console.log(`\u1F53B Process ${process.pid}:${process.className} exited with status ${process.status}.`);
        continue;
      }
    }
    if(overheat) {
      for(;i < n;++i) {
        const record = processes[i];
        record.heat = record.heat + record.process.baseHeat;
      }
    }
  }

  public run(maxCpu: number): void {
    const lastPidRun = this.lastPidRun;
    //TODO: Optimize into two process tables, and differentiate service from process
    const services = new Array<KernelRecord>();
    const processes = new Array<KernelRecord>();
    const records = Array.from(this.processTable.values());
    for(let i = 0,n = records.length;i < n;++i) {
      const record = records[i];
      if(record.service) {
        services.push(record);
      } else {
        processes.push(record);
      }
    }

    //Services don't use heat mapping or cpu limiting
    this.runAllServices(services);

    processes.sort(this.sortKernelRecordsByHeat);

    this.runAllProcesses(processes,maxCpu,lastPidRun);

  }
}





