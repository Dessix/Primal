import { Processes } from './processes';
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

	private spawnNewProcessTable(): SerializedProcessTable {
		console.log("Ω Spawning new process table");
		const procInst: SerializedProcess = {
			className: "Root",
			pid: 0,
			parentPid: 0,
			heat: 1000,
			service: true,
		};
		return [procInst];
	}

	private loadProcessEntry(entry: SerializedProcess): KernelRecord | null {
		const processConstructor = ProcessRegistry.fetch(entry.className);
		if(processConstructor === undefined) {
			console.log(`Error: No constructor found for process class "${entry.className}"!`);
			return null;
		}
		return {
			process: new processConstructor(entry.pid, entry.parentPid),
			processCtor: processConstructor,
			heat: entry.heat,
			service: entry.service,
		};
	}

	public loadProcessTable(): void {
		const mem = this.getKmem();
		let proc = mem.proc;
		if(proc == null) {
			mem.proc = proc = this.spawnNewProcessTable();
		}
		this.processTable.clear();
		for(let i = 0, n = proc.length; i < n; ++i) {
			const entry = proc[i];
			const record = this.loadProcessEntry(entry);
			if(record !== null) {
				this.processTable.set(entry.pid, record);
			}
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
		let pmemi = pmem[pid];
		if(pmemi === undefined || pmemi === null) { pmem[pid] = pmemi = {}; }
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
		const records = Array.from(this.processTable.values());
		for(let i = 0, n = records.length; i < n; ++i) {
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
		for(let i = 0, n = records.length; i < n; ++i) {
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

		const childPids = this.getChildProcesses(pid);
		for(let i = 0, n = childPids.length; i < n; ++i) {
			const childPid = childPids[i];
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

	private runService(services: Array<KernelRecord>, process: IProcess, initial: boolean): number {
		const pmem = this.getProcessMemory(process.pid);
		return this.tryRunProc(process, pmem, true, initial);
	}

	private tryRunProc(process: IProcess, processMemory: ProcessMemory, isService: boolean, isInitial: boolean): number {
		const procToCall = (isInitial ? process.reloadFromMemory : process.run);
		if(procToCall == null) {
			return 0;
		}
		try {
			procToCall.call(process, processMemory);
		} catch(e) {
			console.log(`Ω Failed to run service ${process.pid}:${process.className}: ${e}`);
			const stackTrace = e.stack;
			if(stackTrace) {
				console.log("Stack Trace:\n" + stackTrace.toString());
			}
			return -1;
		}
		if(process.status !== ProcessStatus.RUN) {
			return -2;//Exit code
		}
		return 0;
	}

	private runAllServices(services: KernelRecord[], initial: boolean): void {
		for(let i = 0, n = services.length; i < n; ++i) {
			const process = services[i].process;
			const returnCode = this.runService(services, process, initial);
			if(returnCode !== 0) {
				services.splice(i);
				--i;
				if(returnCode === -2) {
					this.killProcess(process.pid);
					console.log(`Ω Service ${process.pid}:${process.className} exited with status ${process.status}.`);
				}
			}
		}
	}

	private runAllProcesses(processes: KernelRecord[], maxCpu: number, lastPidRun: number): void {
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
			const record = processes[i], process = record.process;
			record.heat = process.baseHeat;

			const pmem = this.getProcessMemory(process.pid);
			{
				const pStatus = this.tryRunProc(process, pmem, false, true);
				if(pStatus !== 0) {
					//Initial check for exit preconditions
					if(pStatus !== ProcessStatus.RUN) {
						this.killProcess(process.pid);
						console.log(`Ω Process ${process.pid}:${process.className} exited with status ${process.status}.`);
					}
					continue;
				}
			}

			//Post-check for process exit. Early-out before wasting memory storage over a tick.
			if(this.tryRunProc(process, pmem, false, false) === -2) {
				this.killProcess(process.pid);
				console.log(`Ω Process ${process.pid}:${process.className} exited with status ${process.status}.`);
				continue;
			}
		}
		if(overheat) {
			for(; i < n; ++i) {
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
		for(let i = 0, n = records.length; i < n; ++i) {
			const record = records[i];
			if(record.service) {
				services.push(record);
			} else {
				processes.push(record);
			}
			record.process.kernel = this;
		}

		//Services don't use heat mapping
		this.runAllServices(services, true);

		processes.sort(this.sortKernelRecordsByHeat);

		this.runAllProcesses(processes, maxCpu, lastPidRun);

		this.runAllServices(services, false);

	}
}





