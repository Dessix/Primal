import { Process, ProcessStatus } from "../kernel/process";

export class PHello extends Process {
    public static className: string = "HelloWorld";
    public get className(): string { return PHello.className; }
    private pmem: number;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(_pmem: ProcessMemory | undefined): ProcessMemory | undefined {
        let pmem = this.pmem;
        console.log(`Hello world!${pmem > 0 ? ` ${pmem}` : ""}`);
        ++pmem;
        return this.pmem = pmem;
    }
    
    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        if (pmem === undefined) {
            pmem = 0;
        }
        this.pmem = <number>pmem;

        if (this.pmem > 10) {
            this.status = ProcessStatus.EXIT;
        }
    }
}
