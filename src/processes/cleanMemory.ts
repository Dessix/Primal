import { Kernel } from "./../kernel/kernel";
import { Process } from "../kernel/process";

export class PCleanMemory extends Process {
    public static className: string = "CleanMem";
    public get className(): string { return PCleanMemory.className; }
    public readonly baseHeat: number = 5;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        this.cleanMemory();
        return;
    }

    public cleanMemory(): void {
        const gameAccessible = <{ [name: string]: any }>Game;
        for (let key of ["creeps", "spawns', 'rooms", "flags"]) {
            const memK = Memory[key];
            const gameK = gameAccessible[key];
            for (let i in memK) {
                if (gameK[i] === undefined) {
                    delete memK[i];
                }
            }
        }
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        this.cleanMemory();
    }
}
