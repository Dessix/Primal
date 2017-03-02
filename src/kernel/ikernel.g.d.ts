interface __ProcessId<TPROCESS extends IProcess = IProcess> extends Number, TypeTag<__ProcessId<TPROCESS>, TPROCESS> { }
declare type ProcessId<TPROCESS extends IProcess = IProcess> = __ProcessId<TPROCESS> & number;

declare const enum ProcessStatus {
  TERM = -2,
  EXIT = -1,
  RUN = 0,
}

interface IProcess<TMemory extends ProcessMemory = ProcessMemory> {
  readonly className: string;
  readonly pid: ProcessId;
  readonly parentPid: ProcessId;
  readonly kernel: IKernel;
  readonly baseHeat: number;
  readonly service: boolean;
  readonly memory: TMemory;

  status: ProcessStatus;

  run(): void;
}

interface Initialized<T> { }

interface INeedInitialized<T> {
    init(...args: any[]): T & Initialized<T>;
}

type ProcessConstructor<TPROCESS extends IProcess = IProcess> = {
  new (kernel: IKernel, pid: ProcessId<TPROCESS>, parentPid: ProcessId): TPROCESS;
  readonly className: string;
};

type MetaProcessCtor<TPROCESS, TCPROC extends TPROCESS & IProcess> = (new (k: IKernel, pid: ProcessId, parentPid: ProcessId) => TPROCESS) & ProcessConstructor<TCPROC>;

interface ITaskManager {
  spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): TPROCESS;
  spawnProcessByClassName(processName: string, parentPid?: ProcessId): IProcess | undefined;
  addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS;
  killProcess(processId: ProcessId): void;

  getProcessById<TPROCESS extends IProcess>(pid: ProcessId<TPROCESS>): TPROCESS | undefined;
  getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: ProcessId<TPROCESS>): TPROCESS;
  getChildProcesses(parentPid: ProcessId): ProcessId[];
  getProcessesByClass<TPROCESS extends IProcess>(constructor: ProcessConstructor<TPROCESS>): TPROCESS[];
  getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[];

  run(maxCpu: number): void;
}

interface IMemoryManager {
  getProcessMemory<TMEMORY extends ProcessMemory>(pid: ProcessId<IProcess<TMEMORY>>): TMEMORY;
  getProcessMemory(pid: ProcessId): ProcessMemory;
  setProcessMemory(pid: ProcessId, memory: ProcessMemory): void;
  deleteProcessMemory(pid: ProcessId): void;
}

interface KernelMemory {
  proc?: SerializedProcessTable | null;
  pmem?: { [pid: number/** {ProcessId} */]: ProcessMemory | null | undefined };
}

interface IKernel extends ITaskManager, IMemoryManager {
  readonly mem: KernelMemory;

  loadProcessTable(): void;
  saveProcessTable(): void;
  reboot(): void;
}
