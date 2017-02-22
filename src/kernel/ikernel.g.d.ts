
type ProcessId = number;

declare const enum ProcessStatus {
  TERM = -2,
  EXIT = -1,
  RUN = 0,
}

interface KernelMemory {
  proc?: SerializedProcessTable | null;
  pmem?: { [pid: number /*ProcessId*/]: ProcessMemory | null | undefined } | undefined;
}

interface IProcess {
  readonly className: string;
  pid: ProcessId;
  parentPid: ProcessId;
  kernel: IKernel;
  readonly baseHeat: number;
  status: ProcessStatus;
  readonly service: boolean;

  bind(kernel: IKernel, pid: ProcessId, parentPid: ProcessId): void;
  run?(pmem: ProcessMemory): void;
  reloadFromMemory?(pmem: ProcessMemory): void;
}

interface ProcessConstructor {
  new (_pid: ProcessId, _parentPid: ProcessId): IProcess;
  readonly className: string;
  Register(this: ProcessConstructor): void;
}

interface TypedProcessConstructor<PTYPE extends IProcess> extends ProcessConstructor {
  new (pid: ProcessId, parentPid: ProcessId): PTYPE;
  Register(this: TypedProcessConstructor<PTYPE>): void;
}

interface ITaskManager {
  spawnProcess(processCtor: ProcessConstructor, parentPid: number): ProcessId;
  spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
  addProcess(process: IProcess): ProcessId;
  killProcess(pid: number): void;

  getProcessById(pid: ProcessId): IProcess | undefined;
  getTypedProcessById<T extends IProcess>(pid: ProcessId): T | undefined;
  getTypedProcessByIdOrThrow<T extends IProcess>(pid: ProcessId): T;
  getChildProcesses(parentPid: ProcessId): ProcessId[];
  getProcessesByClass<T extends IProcess>(constructor: TypedProcessConstructor<T>): T[];
  getProcessesByClassName<T>(className: string): IProcess[];
}

interface IKernel extends ITaskManager {
  readonly mem: KernelMemory;

  loadProcessTable(): void;
  saveProcessTable(): void;
  reboot(): void;

  getProcessMemory(pid: ProcessId): ProcessMemory
  setProcessMemory(pid: ProcessId, memory: ProcessMemory): void;
  deleteProcessMemory(pid: ProcessId): void;

  run(maxCpu: number): void;
}
