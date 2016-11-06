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
		for(let key of ["spawns', 'rooms", "flags"]) {
			const memK = Memory[key];
			const gameK = gameAccessible[key];
			const memIKeys = Object.keys(memK);
			for(let i = 0, n = memIKeys.length; i < n; ++i) {
				if(gameK[i] === undefined) {
					delete memK[i];
				}
				const memIKey = memIKeys[i];
				if(gameK[memIKey] === undefined) {
					delete memK[memIKey];
				}
			}
		}
		{
			const mCreeps = Memory.creeps;
			const gCreeps = Game.creeps;
			const creepNames = Object.keys(mCreeps);
			for (let i = 0, n = creepNames.length; i < n; ++i) {
				const creepName = creepNames[i];
				const creep = gCreeps[creepName];
				if(creep !== undefined) { continue; }
				const cmem = mCreeps[creepName];
				if(cmem.d != null) {
					//Has acknowledged its death ahead of time, showing that considerations were made
					delete mCreeps[creepName];
					continue;
				}
				DeadPool.registerPosthumous(creepName, cmem);
			}
		}
	}
}
