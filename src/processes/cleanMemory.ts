import { Kernel } from "./../kernel/kernel";
import { Process } from "../kernel/process";
import { DeadPool } from "../ipc/deadPool";

export class PCleanMemory extends Process<ProcessMemory> {
    public static className: string = "CleanMem";
    public get className(): string { return PCleanMemory.className; }
    public readonly baseHeat: number = 5;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: ProcessMemory): void {
        const gameAccessible = <{ [name: string]: any }>Game;
        for (let key of ["spawns', 'rooms", "flags"]) {
            const memK = Memory[key];
            const gameK = gameAccessible[key];
            for (let i in memK) {
                if (gameK[i] === undefined) {
                    delete memK[i];
                }
            }
        }
        {
            const mCreeps = Memory.creeps;
            const gCreeps = Game.creeps;
            for (let i in mCreeps) {
                const creep = gCreeps[i];
                if (creep !== undefined) { continue; }
                const cmem = mCreeps[i];
                if (cmem.d != null) {
                    //Has acknowledged its death ahead of time, showing that considerations were made
                    delete mCreeps[i];
                    continue;
                }
                DeadPool.registerPosthumous(i, cmem);
            }
        }
    }
}
