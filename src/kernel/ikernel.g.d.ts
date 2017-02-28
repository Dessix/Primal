interface __TypedProcessId<TPROCESS extends IProcess> extends Number { }
type TypedProcessId<TPROCESS extends IProcess> = __TypedProcessId<TPROCESS> & number;
type ProcessId = TypedProcessId<IProcess>;

declare const enum ProcessStatus {
  TERM = -2,
  EXIT = -1,
  RUN = 0,
}

interface ITypedProcess<TMemory extends ProcessMemory> {
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

type IProcess = ITypedProcess<ProcessMemory>;

interface TypedMemoryProcess<TMEMORY extends ProcessMemory> extends ITypedProcess<TMEMORY> { }

type TypedProcessConstructor<TPROCESS extends IProcess> = {
  new (kernel: IKernel, pid: TypedProcessId<TPROCESS>, parentPid: ProcessId): TPROCESS;
  Register(this: TypedProcessConstructor<TPROCESS>): void;
  readonly className: string;
};

type ProcessConstructor = TypedProcessConstructor<IProcess>;

type __MetaProcessCtor<TPROC> = new (k: IKernel, pid: ProcessId, parentPid: ProcessId) => TPROC;
type MetaProcessCtor<TPROCESS, TCPROC extends TPROCESS & IProcess> = __MetaProcessCtor<TPROCESS> & TypedProcessConstructor<TCPROC>;

interface ITaskManager {
  spawnProcess<TPROCESS, TCPROC extends TPROCESS & IProcess>(processCtor: MetaProcessCtor<TPROCESS, TCPROC>, parentPid: ProcessId): TPROCESS;
  spawnProcessByClassName(processName: string, parentPid?: ProcessId): IProcess | undefined;
  addProcess<TPROCESS extends IProcess>(process: TPROCESS): TPROCESS;
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
