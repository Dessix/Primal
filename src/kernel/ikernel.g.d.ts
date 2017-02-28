interface __TypedProcessId<TPROCESS extends IProcess> extends Number { }
type TypedProcessId<TPROCESS extends IProcess> = __TypedProcessId<TPROCESS> & number;
type ProcessId = TypedProcessId<IProcess>;

declare const enum ProcessStatus {
  TERM = -2,
  EXIT = -1,
  RUN = 0,
}

interface ITypedProcess<TLaunchArgs extends Array<any>, TMemory extends ProcessMemory> {
  readonly className: string;
  readonly pid: ProcessId;
  readonly parentPid: ProcessId;
  readonly kernel: IKernel;
  readonly baseHeat: number;
  readonly service: boolean;
  readonly memory: TMemory;

  status: ProcessStatus;
  
  /**
   * Called to create new processes
   * Calling this should only occur on processes that were not loaded from existing memory
   */
  launch: (args: TLaunchArgs) => void;

  run(): void;
}

type IProcess = ITypedProcess<Array<any>, ProcessMemory>;

interface TypedMemoryProcess<TMEMORY extends ProcessMemory> extends ITypedProcess<Array<any>, TMEMORY> { }

interface TypedProcessConstructor<TPROCESS extends IProcess> {
  new (kernel: IKernel, pid: TypedProcessId<TPROCESS>, parentPid: ProcessId): TPROCESS;
  Register(this: TypedProcessConstructor<TPROCESS>): void;
  readonly className: string;
}

type ProcessConstructor = TypedProcessConstructor<IProcess>;

interface ITaskManager {
  spawnProcess<TLaunchArgs extends Array<any>, TProcessMemory extends ProcessMemory>(processCtor: TypedProcessConstructor<ITypedProcess<TLaunchArgs, TProcessMemory>>, parentPid: ProcessId): TypedProcessId<ITypedProcess<TLaunchArgs, TProcessMemory>>;
  spawnProcessByClassName(processName: string, args: Array<any>, parentPid?: ProcessId): ProcessId | undefined;
  addProcess<TPROCESS extends IProcess>(process: TPROCESS): TypedProcessId<TPROCESS>;
  killProcess(processId: ProcessId): void;

  getProcessById<TPROCESS extends IProcess>(pid: TypedProcessId<TPROCESS>): TPROCESS | undefined;
  getProcessByIdOrThrow<TPROCESS extends IProcess>(pid: TypedProcessId<TPROCESS>): TPROCESS;
  getChildProcesses(parentPid: ProcessId): ProcessId[];
  getProcessesByClass<TPROCESS extends IProcess>(constructor: TypedProcessConstructor<TPROCESS>): TPROCESS[];
  getProcessesByClassName<TPROCESS extends IProcess>(className: string): TPROCESS[];

  run(maxCpu: number): void;
}

interface IMemoryManager {
  getProcessMemory<TMEMORY extends ProcessMemory>(pid: TypedProcessId<TypedMemoryProcess<TMEMORY>>): TMEMORY;
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
