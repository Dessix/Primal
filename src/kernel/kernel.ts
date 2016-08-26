import { Process } from "./process";

export class Kernel {
    private processTable: Map<ProcessId, Process>;

    public constructor() {
        this.processTable = new Map<ProcessId, Process>();
    }

    public loadProcessTable(processTable: Process[]): void {
        this.processTable.clear();
        for (let process of processTable) {
            this.processTable.set(process.pid, process);
            try {
                process.reloadFromMemory(this.getProcessMemory(process.pid));
            } catch (e) {
                console.log(`Failed to load process memory ${process.pid}:${process.className}: ${e}`);
            }
        }
    }

    public getProcessTable(): Process[] {
        return Array.from(this.processTable.values());
    }

    public getProcessMemory(pid: ProcessId): ProcessMemory {
        return Memory.procmem[pid];
    }

    public setProcessMemory(pid: ProcessId, memory: ProcessMemory): void {
        Memory.procmem[pid] = memory;
    }

    public deleteProcessMemory(pid: ProcessId): void {
        delete Memory.procmem[pid];
    }

    public run(maxCpu: number): void {
        for (let [pid, process] of this.processTable) {
            if (/*process.status !== ProcessStatus.DEAD*/true) {
                const memory = this.getProcessMemory(pid);
                try {
                    const newMemory = process.run(memory);
                    if (newMemory !== undefined) {
                        this.setProcessMemory(process.pid, newMemory);
                    }
                } catch (e) {
                    console.log(`Failed to run process ${pid}:${process.className}: ${e}`);
                }
            }
        }
    }
}





