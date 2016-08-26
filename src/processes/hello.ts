import { Process } from "../kernel/process";

export class PHello extends Process {
    public static className: string = "HelloWorld";
    public get className(): string { return PHello.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(processMemory: ProcessMemory): void {
        console.log("Hello world!");
    }
    
    public reloadFromMemory(processMemory: ProcessMemory): void {
    }
}
