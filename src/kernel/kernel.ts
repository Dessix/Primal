import { ProcessRegistry } from "./processRegistry";
import { Process } from "./process";

const enum ProcessRunState {
	CPU_OVERLOAD = -1,
	CONTINUE = 0,
}

interface KernelRecord {
	heat: number;
	service: boolean;
	processCtor: ProcessConstructor;
	process: IProcess;
}

export class Kernel implements IKernel {
	private processTable: (Map<ProcessId, KernelRecord>);
	private lastPidRun: ProcessId = -1;
	private readonly getKmem: () => KernelMemory;

	public get mem(): KernelMemory {
		return this.getKmem();
	}

	public constructor(fetchKmem: () => KernelMemory) {
		this.processTable = new Map<ProcessId, KernelRecord>();
		this.getKmem = fetchKmem;
	}

	public loadProcessTable(): void {
		const mem = this.getKmem();
		let proc = mem.proc;
		if(proc == null) {
			console.log("Ω Spawning new process table");
			const procInst: SerializedProcess = {
				className: "Root",
				pid: 0,
				parentPid: 0,
				heat: 1000,
				service: true,
			};
			mem.proc = proc = [procInst];
		}
		this.processTable.clear();
		for(let i = proc.length; i-- > 0;) {
			const entry = proc[i];
			if(entry == null) { continue; }
			const processConstructor = ProcessRegistry.fetch(entry.className);
			if(processConstructor === undefined) {
				console.log(`Error: No constructor found for process class "${entry.className}"!`);
				continue;
			}
			const newEntry: KernelRecord = {
				heat: entry.heat,
				processCtor: processConstructor,
				service: entry.service,
				process: new processConstructor(entry.pid, entry.parentPid),
			};
			this.processTable.set(entry.pid, newEntry);
		}
	}

	public saveProcessTable(): void {
		const processes = Array.from(this.processTable.values());
		const table: SerializedProcessTable = new Array<SerializedProcess>(processes.length);
		for(let i = processes.length; i-- > 0;) {
			const record = processes[i];
			switch(record.process.status) {
				case ProcessStatus.EXIT:
				case ProcessStatus.TERM:
					table.splice(i);//Remove spare from presized array
					continue;
			}
			const produced: SerializedProcess = {
				pid: record.process.pid,
				parentPid: record.process.parentPid,
				className: record.process.className,
				heat: record.heat,
				service: record.service,
			};
		}
		this.getKmem().proc = table;
	}

	public getFreePid(): ProcessId {
		const currentPids = Array.from(this.processTable.keys()).sort();
		for(let i = 0; i < currentPids.length; ++i) {
			if(currentPids[i] !== i) {
				return i;
			}
		}
		return currentPids.length;
	}

	public reboot(): void {
		this.processTable = new Map<ProcessId, KernelRecord>();
		this.getKmem().pmem = {};
	}

	public getProcessCount(): number {
		return this.processTable.size;
	}

	public getProcessMemory(pid: ProcessId): ProcessMemory {
		const mem = this.getKmem();
		let pmem = mem.pmem;
		if(pmem === undefined) { mem.pmem = pmem = {}; }
		let pmemi = mem.pmem;
		if(pmemi === undefined) { pmem[pid] = pmemi = {}; }
		return pmemi;
	}

	public setProcessMemory(pid: ProcessId, memory: ProcessMemory): void {
		const mem = this.getKmem();
		let pmem = mem.pmem;
		if(pmem === undefined) {
			mem.pmem = pmem = {};
		}
		pmem[pid] = memory;
	}

	public deleteProcessMemory(pid: ProcessId): void {
		const mem = this.getKmem();
		if(mem.pmem !== undefined) {
			delete mem.pmem[pid];
		}
	}

	public spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined {
		if(parentPid === undefined) { parentPid = 0; }
		const processCtor = ProcessRegistry.fetch(processName);
		if(processCtor === undefined) {
			console.log("Ω ClassName not defined");
			return;
		}
		return this.spawnProcess(processCtor, parentPid);
	}

	public spawnProcess(processCtor: ProcessConstructor, parentPid: number): ProcessId {
		const pid = this.getFreePid();
		const process = new processCtor(pid, parentPid);
		const record: KernelRecord = {
			process: process,
			heat: process.baseHeat,
			service: process.service,
			processCtor: processCtor,
		};
		process.pid = pid;
		this.processTable.set(process.pid, record);
		return pid;
	}

	public addProcess(process: IProcess): ProcessId {
		this.processTable.set(process.pid, <KernelRecord>{
			heat: process.baseHeat,
			process: process,
			processCtor: ProcessRegistry.fetch(process.className),
			service: process.service,
		});

		return process.pid;
	}

	public getChildProcesses(parentPid: ProcessId): ProcessId[] {
		const childPids: ProcessId[] = [];
		for(let record of this.processTable.values()) {
			if(record.process.parentPid === parentPid) {
				childPids.push(record.process.pid);
			}
		}
		return childPids;
	}

	public getProcessesByClass<T>(constructor: ProcessConstructor): IProcess[] {
		const processes: IProcess[] = [];
		for(let record of this.processTable.values()) {
			if(<IProcess>record.process instanceof constructor) {
				processes.push(record.process);
			}
		}
		return processes;
	}

	public getProcessesByClassName<T>(className: string): IProcess[] {
		const processCtor = ProcessRegistry.fetch(className);
		if(processCtor === undefined) {
			console.log("Ω ClassName not defined");
			return [];
		}
		return this.getProcessesByClass(processCtor);
	}

	public killProcess(pid: number): void {
		const process = this.getProcessById(pid);
		if(process === undefined) { return; }
		this.processTable.delete(pid);
		process.kernel = null;
		this.deleteProcessMemory(pid);

		let childPids = this.getChildProcesses(pid);
		for(let childPid of childPids) {
			this.killProcess(childPid);
		}
	}

	public getProcessById(pid: ProcessId): IProcess | undefined {
		const record = this.processTable.get(pid);
		if(record !== undefined) {
			return record.process;
		} else {
			return;
		}
	}

	public getTypedProcessById<T extends IProcess>(pid: ProcessId): T | undefined {
		return <T | undefined>this.getProcessById(pid);
	}

	public getTypedProcessByIdOrThrow<T extends IProcess>(pid: ProcessId): T {
		const record = this.processTable.get(pid);
		if(record === undefined) {
			throw new Error("Process not found!");
		}
		return <T>record.process;
	}

	private sortKernelRecordsByHeat(a: KernelRecord, b: KernelRecord): number {
		return b.heat - a.heat;
	}

	public run(maxCpu: number): void {
		const lastPidRun = this.lastPidRun;
		//TODO: Optimize into two process tables, and differentiate service from process
		const services = new Array<KernelRecord>();
		const processes = new Array<KernelRecord>();
		for(let entry of this.processTable.values()) {
			if(entry.service) {
				services.push(entry);
			} else {
				processes.push(entry);
			}
		}

		//Services don't use heat mapping
		services.sort(this.sortKernelRecordsByHeat);
		for(let i = 0, n = services.length; i < n; ++i) {
			const process = services[i].process;
			process.kernel = this;//Services may access the kernel during initialization
			if(process.reloadFromMemory !== undefined) {
				try {
					process.reloadFromMemory(this.getProcessMemory(process.pid));
				} catch(e) {
					console.log(`Ω Failed to load service memory ${process.pid}:${process.className}: ${e}`);
					const stackTrace = e.stack;
					if(stackTrace) {
						console.log("Stack Trace:\n" + stackTrace.toString());
					}
					services.splice(i);
					--i;
					continue;
				}
				if(process.status !== ProcessStatus.RUN) {
					this.killProcess(process.pid);
					services.splice(i);
					--i;
					console.log(`Ω Process ${process.pid}:${process.className} exited with status ${process.status}.`);
					continue;
				}
			}
		}


		processes.sort(this.sortKernelRecordsByHeat);

		{
			let overheat: boolean = false;
			let i: number = 0;
			let n = processes.length;

			for(; i < n; ++i) {
				//TODO: Add reload warmup period
				//TODO: Add moving-average estimation for process duration
				if(Game.cpu.getUsed() >= maxCpu) {
					overheat = true;
					break;
				}
				const record = processes[i];
				const process = record.process;
				record.heat = process.baseHeat;

				const pmem = this.getProcessMemory(process.pid);

				if(process.reloadFromMemory !== undefined) {
					try {
						process.reloadFromMemory(pmem);
					} catch(e) {
						console.log(`Ω Failed to load process memory ${process.pid}:${process.className}: ${e}`);
						const stackTrace = e.stack;
						if(stackTrace) {
							console.log("Stack Trace:\n" + stackTrace.toString());
						}
						continue;
					}

					//Initial check for exit preconditions
					if(process.status !== ProcessStatus.RUN) {
						this.killProcess(process.pid);
						console.log(`Ω Process ${process.pid}:${process.className} exited with status ${process.status}.`);
						continue;
					}
				}

				if(process.run !== undefined) {
					process.kernel = this;//Kernel access is unavailable during initialization of processes

					try {
						process.run(pmem);
					} catch(e) {
						console.log(`Ω Failed to run service ${process.pid}:${process.className}: ${e}`);
						const stackTrace = e.stack;
						if(stackTrace) {
							console.log("Stack Trace:\n" + stackTrace.toString());
						}
					}

					//Post-check for process exit. Early-out before wasting memory storage over a tick.
					if(process.status !== ProcessStatus.RUN) {
						this.killProcess(process.pid);
						console.log(`Ω Process ${process.pid}:${process.className} exited with status ${process.status}.`);
						continue;
					}
				}
			}
			if(overheat) {
				for(; i < n; ++i) {
					const record = processes[i];
					record.heat += record.process.baseHeat;
				}
			}
		}

		//Services are called regardless of CPU- they are required to do their job each tick, so they do not use heat
		for(let i = 0, n = services.length; i < n; ++i) {
			const process = services[i].process;
			if(process.run !== undefined) {
				try {
					process.run(this.getProcessMemory(process.pid));
				} catch(e) {
					console.log(`Ω Failed to run service ${process.pid}:${process.className}: ${e}`);
					const stackTrace = e.stack;
					if(stackTrace) {
						console.log("Stack Trace:\n" + stackTrace.toString());
					}
				}

				//Post-check for process exit. Early-out before wasting memory storage over a tick.
				if(process.status !== ProcessStatus.RUN) {
					this.killProcess(process.pid);
					console.log(`Ω Service ${process.pid}:${process.className} exited with status ${process.status}.`);
					continue;
				}
			}
		}

	}
}





